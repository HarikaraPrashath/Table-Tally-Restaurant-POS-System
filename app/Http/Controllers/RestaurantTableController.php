<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantTableController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(RestaurantTable::where('is_active', true)->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(RestaurantTable::create($request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:restaurant_tables,name'],
        ])), 201);
    }

    public function update(Request $request, RestaurantTable $restaurantTable): JsonResponse
    {
        $restaurantTable->update($request->validate([
            'name' => ['sometimes', 'string', 'max:50', 'unique:restaurant_tables,name,'.$restaurantTable->id],
            'status' => ['sometimes', 'in:AVAILABLE,OCCUPIED'],
            'is_active' => ['sometimes', 'boolean'],
        ]));

        return response()->json($restaurantTable->fresh());
    }

    public function destroy(RestaurantTable $restaurantTable): JsonResponse
    {
        $restaurantTable->delete();

        return response()->json(['message' => 'Table deleted.']);
    }
}
