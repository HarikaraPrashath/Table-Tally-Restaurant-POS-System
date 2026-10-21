<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->startOfDay();
        $orders = Order::where('created_at', '>=', $today)->where('status', 'COMPLETED');
        $expenses = Expense::whereDate('expense_date', today())
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderBy('category')
            ->get()
            ->map(fn (Expense $expense) => [
                'category' => $expense->category,
                'total' => (float) $expense->total,
            ])
            ->values();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'sales' => (float) (clone $orders)->sum('total'),
                'orders' => (clone $orders)->count(),
                'cash' => (float) Payment::where('payment_method', 'CASH')->where('created_at', '>=', $today)->sum('amount'),
                'card' => (float) Payment::where('payment_method', 'CARD')->where('created_at', '>=', $today)->sum('amount'),
                'lankaqr' => (float) Payment::where('payment_method', 'LANKAQR')->where('created_at', '>=', $today)->sum('amount'),
                'expenses' => $expenses,
            ],
        ]);
    }
}
