<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'role' => ['required', 'in:ADMIN,CASHIER'],
        ]);

        $role = $credentials['role'];
        unset($credentials['role']);

        if (! Auth::attempt($credentials + ['role' => $role, 'is_active' => true])) {
            return back()->withErrors(['email' => 'The credentials or selected role are incorrect.']);
        }

        $request->session()->regenerate();

        return redirect()->intended($role === 'ADMIN' ? route('dashboard') : route('pos'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
