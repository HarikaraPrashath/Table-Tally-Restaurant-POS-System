<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(): JsonResponse
    {
        $inventory = Inventory::with('product')->orderBy('current_stock')->get();

        return response()->json($inventory->map(fn (Inventory $item) => [
            ...$item->toArray(),
            'is_low_stock' => $item->current_stock <= $item->minimum_stock,
        ]));
    }

    public function update(Request $request, Inventory $inventory): JsonResponse
    {
        $data = $request->validate([
            'movement_type' => ['required', 'in:STOCK_IN,STOCK_OUT,ADJUSTMENT'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'minimum_stock' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['sometimes', 'in:kg,g,L,ml,pcs'],
            'reason' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data, $inventory, $request) {
            $inventory->refresh();
            $quantity = (float) $data['quantity'];
            $newStock = match ($data['movement_type']) {
                'STOCK_IN' => (float) $inventory->current_stock + $quantity,
                'STOCK_OUT' => (float) $inventory->current_stock - $quantity,
                'ADJUSTMENT' => $quantity,
            };

            abort_if($newStock < 0, 422, 'Stock cannot be negative.');
            $inventory->update(array_filter([
                'current_stock' => $newStock,
                'minimum_stock' => $data['minimum_stock'] ?? null,
                'unit' => $data['unit'] ?? null,
            ], fn ($value) => $value !== null));
            StockMovement::create([
                'inventory_id' => $inventory->id,
                'user_id' => $request->user()->id,
                'movement_type' => $data['movement_type'],
                'quantity' => $quantity,
                'reason' => $data['reason'] ?? null,
            ]);
        });

        $inventory = $inventory->fresh()->load('product');

        return response()->json([
            ...$inventory->toArray(),
            'is_low_stock' => $inventory->current_stock <= $inventory->minimum_stock,
        ]);
    }
}
