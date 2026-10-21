<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Customer::query()
            ->when($request->search, fn ($query, $search) => $query->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%"))
            ->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(Customer::create($request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
        ])), 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer->load('orders'));
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
        ]));

        return response()->json($customer->fresh());
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(['message' => 'Customer deleted.']);
    }
}
