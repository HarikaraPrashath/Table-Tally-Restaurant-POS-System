<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->string('period', 'date')->toString();
        abort_unless(in_array($period, ['date', 'week', 'month', 'year'], true), 422, 'Invalid report period.');
        $from = $request->date('from')?->startOfDay() ?? ($period === 'month' ? now()->startOfMonth() : now()->subDays(30)->startOfDay());
        $to = $request->date('to')?->endOfDay() ?? now()->endOfDay();
        $orders = Order::whereBetween('created_at', [$from, $to])->where('status', 'COMPLETED');
        $orderPeriod = $this->periodExpression('created_at', $period);
        $expensePeriod = $this->periodExpression('expense_date', $period);
        $sales = (clone $orders)->selectRaw("{$orderPeriod} as period, COUNT(*) as orders, SUM(total) as sales")
            ->groupByRaw($orderPeriod)->get()->keyBy('period');
        $expenses = Expense::whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])
            ->selectRaw("{$expensePeriod} as period, SUM(amount) as expenses")
            ->groupByRaw($expensePeriod)->get()->keyBy('period');
        $periods = $sales->keys()->merge($expenses->keys())->unique()->sort()->values();

        return response()->json([
            'period' => $period,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'orders' => (clone $orders)->count(),
            'sales' => (float) (clone $orders)->sum('total'),
            'revenue' => (float) (clone $orders)->sum('total'),
            'expenses' => (float) Expense::whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])->sum('amount'),
            'profit' => (float) (clone $orders)->sum('total') - (float) Expense::whereBetween('expense_date', [$from->toDateString(), $to->toDateString()])->sum('amount'),
            'payments' => Payment::whereBetween('created_at', [$from, $to])->selectRaw('payment_method, SUM(amount) as total')->groupBy('payment_method')->pluck('total', 'payment_method'),
            'rows' => $periods->map(fn ($key) => [
                'period' => $key,
                'orders' => (int) ($sales[$key]->orders ?? 0),
                'sales' => (float) ($sales[$key]->sales ?? 0),
                'expenses' => (float) ($expenses[$key]->expenses ?? 0),
                'revenue' => (float) ($sales[$key]->sales ?? 0),
                'profit' => (float) ($sales[$key]->sales ?? 0) - (float) ($expenses[$key]->expenses ?? 0),
            ])->values(),
        ]);
    }

    private function periodExpression(string $column, string $period): string
    {
        return match ($period) {
            'week' => "strftime('%Y-W%W', {$column})",
            'month' => "strftime('%Y-%m', {$column})",
            'year' => "strftime('%Y', {$column})",
            default => "date({$column})",
        };
    }
}
