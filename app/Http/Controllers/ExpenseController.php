<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Expense::query()
            ->when($request->from, fn ($query, $from) => $query->whereDate('expense_date', '>=', $from))
            ->when($request->to, fn ($query, $to) => $query->whereDate('expense_date', '<=', $to))
            ->when($request->category, fn ($query, $category) => $query->where('category', $category))
            ->latest('expense_date')->paginate(25));
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(Expense::create($request->validate([
            'category' => ['required', 'string', 'max:80'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string'],
            'expense_date' => ['required', 'date'],
        ]) + ['user_id' => $request->user()->id]), 201);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $expense->update($request->validate([
            'category' => ['sometimes', 'string', 'max:80'],
            'amount' => ['sometimes', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string'],
            'expense_date' => ['sometimes', 'date'],
        ]));

        return response()->json($expense->fresh());
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json(['message' => 'Expense deleted.']);
    }
}
