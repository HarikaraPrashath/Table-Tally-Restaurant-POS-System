<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::select('id', 'name', 'email', 'role', 'is_active')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(User::create($request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:ADMIN,CASHIER'],
        ]))->only(['id', 'name', 'email', 'role', 'is_active']), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['sometimes', 'in:ADMIN,CASHIER'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);

        return response()->json($user->fresh()->only(['id', 'name', 'email', 'role', 'is_active']));
    }
}
