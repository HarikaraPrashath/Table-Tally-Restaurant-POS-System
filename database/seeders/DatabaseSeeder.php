<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@restaurant.com'], [
            'name' => 'Restaurant Admin',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
            'is_active' => true,
        ]);

        User::updateOrCreate(['email' => 'cashier@restaurant.com'], [
            'name' => 'Front Counter',
            'password' => Hash::make('password'),
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $categories = collect(['Rice', 'Kottu', 'Burgers', 'Drinks', 'Short Eats'])
            ->mapWithKeys(fn (string $name) => [$name => Category::updateOrCreate(['name' => $name], ['is_active' => true])]);

        $products = [
            ['name' => 'Chicken Kottu', 'category' => 'Kottu', 'price' => 850],
            ['name' => 'Cheese Kottu', 'category' => 'Kottu', 'price' => 1000],
            ['name' => 'Chicken Rice', 'category' => 'Rice', 'price' => 750],
            ['name' => 'Beef Burger', 'category' => 'Burgers', 'price' => 900],
            ['name' => 'Coke', 'category' => 'Drinks', 'price' => 200],
            ['name' => 'Fresh Lime', 'category' => 'Drinks', 'price' => 250],
            ['name' => 'Egg Roll', 'category' => 'Short Eats', 'price' => 150],
        ];

        foreach ($products as $productData) {
            $product = Product::updateOrCreate(['name' => $productData['name']], [
                'category_id' => $categories[$productData['category']]->id,
                'price' => $productData['price'],
                'is_available' => true,
            ]);

            Inventory::updateOrCreate(['product_id' => $product->id], [
                'current_stock' => 100,
                'minimum_stock' => 10,
                'unit' => 'pcs',
            ]);
        }

        foreach (range(1, 6) as $number) {
            RestaurantTable::updateOrCreate(['name' => sprintf('Table %02d', $number)], [
                'status' => 'AVAILABLE',
                'is_active' => true,
            ]);
        }
    }
}
