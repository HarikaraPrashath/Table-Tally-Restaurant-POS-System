<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::with('category')->where('is_available', true)
            ->when($request->search, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($request->category_id, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->orderBy('name')->get();

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $product = Product::create($request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'gt:0'],
            'image' => ['nullable', 'string'],
            'is_available' => ['boolean'],
        ]));

        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load('category', 'inventory'));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $product->update($request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'gt:0'],
            'image' => ['nullable', 'string'],
            'is_available' => ['sometimes', 'boolean'],
        ]));

        return response()->json($product->fresh()->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }
}
