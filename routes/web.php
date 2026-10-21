<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Models\Category;
use App\Models\Product;
use App\Models\RestaurantTable;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::get('/pos', fn () => Inertia::render('POS/Index', [
        'categories' => Category::where('is_active', true)->orderBy('name')->get(),
        'products' => Product::with('category')->where('is_available', true)->orderBy('name')->get(),
        'tables' => RestaurantTable::where('is_active', true)->orderBy('name')->get(),
        'shift' => fn () => auth()->user()->shifts()->where('status', 'OPEN')->latest()->first(),
    ]))->name('pos');

    Route::middleware('role:CASHIER')->group(function () {
        Route::get('/cashier/{section}', fn (string $section) => Inertia::render('Cashier/Section', [
            'section' => $section,
        ]))->where('section', 'tables|orders|billing|payments|shift|receipts|customers')->name('cashier.section');
    });

    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/admin/{resource}', fn (string $resource) => Inertia::render('Admin/Management', [
            'resource' => $resource,
        ]))->where('resource', 'products|categories|tables|orders|inventory|expenses|reports|users')->name('admin.resource');
    });

    Route::get('/', fn () => redirect()->route(auth()->user()->isAdmin() ? 'dashboard' : 'pos'));
});
