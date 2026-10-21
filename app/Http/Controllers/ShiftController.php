<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        return response()->json(Shift::where('cashier_id', $request->user()->id)->where('status', 'OPEN')->latest()->first());
    }

    public function store(Request $request): JsonResponse
    {
        if (Shift::where('cashier_id', $request->user()->id)->where('status', 'OPEN')->exists()) {
            return response()->json(['message' => 'You already have an open shift.'], 422);
        }

        return response()->json(Shift::create([
            'cashier_id' => $request->user()->id,
            'opening_cash' => $request->validate(['opening_cash' => ['required', 'numeric', 'min:0']])['opening_cash'],
            'opening_time' => now(),
            'status' => 'OPEN',
        ]), 201);
    }

    public function close(Request $request, Shift $shift): JsonResponse
    {
        abort_unless($shift->cashier_id === $request->user()->id && $shift->status === 'OPEN', 403);
        $shift->update([
            'closing_cash' => $request->validate(['closing_cash' => ['required', 'numeric', 'min:0']])['closing_cash'],
            'closing_time' => now(),
            'status' => 'CLOSED',
        ]);

        return response()->json($shift);
    }
}
