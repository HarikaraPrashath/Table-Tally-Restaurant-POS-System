<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'payment', 'table', 'cashier'])
            ->when($request->user()->isCashier(), fn ($query) => $query->where('cashier_id', $request->user()->id))
            ->latest()->paginate(25);

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_type' => ['required', 'in:DINE_IN,TAKEAWAY'],
            'table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
            'payment.method' => ['required', 'in:CASH,CARD,LANKAQR'],
            'payment.received_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($data['order_type'] === 'DINE_IN' && empty($data['table_id'])) {
            return response()->json(['message' => 'A table is required for dine-in orders.'], 422);
        }

        if ($request->user()->isCashier() && ! Shift::where('cashier_id', $request->user()->id)->where('status', 'OPEN')->exists()) {
            return response()->json(['message' => 'Open a shift before processing sales.'], 422);
        }

        $order = DB::transaction(function () use ($data, $request) {
            $productIds = collect($data['items'])->pluck('product_id');
            $products = Product::whereIn('id', $productIds)->where('is_available', true)->lockForUpdate()->get()->keyBy('id');
            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                abort_unless($product, 422, 'One or more products are unavailable.');
                $subtotal += (float) $product->price * $item['quantity'];
            }

            $discount = min((float) ($data['discount'] ?? 0), $subtotal);
            $total = $subtotal - $discount;
            $received = $data['payment']['received_amount'] ?? ($data['payment']['method'] === 'CASH' ? $total : null);

            if ($data['payment']['method'] === 'CASH' && $received < $total) {
                abort(422, 'Cash received must be at least the order total.');
            }

            $table = ! empty($data['table_id']) ? RestaurantTable::lockForUpdate()->find($data['table_id']) : null;
            if ($table && $table->status === 'OCCUPIED') {
                abort(422, 'That table is currently occupied.');
            }

            $order = Order::create([
                'order_number' => 'POS-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4)),
                'order_type' => $data['order_type'],
                'table_id' => $data['table_id'] ?? null,
                'cashier_id' => $request->user()->id,
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'status' => 'COMPLETED',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = $products->get($item['product_id']);
                $lineTotal = (float) $product->price * $item['quantity'];
                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'line_total' => $lineTotal,
                    'notes' => $item['notes'] ?? null,
                ]);

                if ($inventory = Inventory::where('product_id', $product->id)->lockForUpdate()->first()) {
                    if ($inventory->current_stock < $item['quantity']) {
                        abort(422, "Insufficient stock for {$product->name}.");
                    }
                    $inventory->decrement('current_stock', $item['quantity']);
                }
            }

            $order->payment()->create([
                'payment_method' => $data['payment']['method'],
                'amount' => $total,
                'received_amount' => $received,
                'change_amount' => max(0, (float) ($received ?? $total) - $total),
            ]);

            if ($table) {
                $table->update(['status' => 'AVAILABLE']);
            }

            return $order;
        });

        return response()->json($order->load(['items.product', 'payment', 'table', 'cashier']), 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($request->user()->isAdmin() || $order->cashier_id === $request->user()->id, 403);

        return response()->json($order->load(['items.product', 'payment', 'table', 'cashier', 'customer']));
    }
}
