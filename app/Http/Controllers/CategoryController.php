<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Category::where('is_active', true)->withCount('products')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(Category::create($request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:categories,name'],
            'is_active' => ['boolean'],
        ])), 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json($category->load('products'));
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $category->update($request->validate([
            'name' => ['sometimes', 'string', 'max:80', 'unique:categories,name,'.$category->id],
            'is_active' => ['sometimes', 'boolean'],
        ]));

        return response()->json($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
