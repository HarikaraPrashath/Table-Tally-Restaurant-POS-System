<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_reports_by_period(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        $response = $this->actingAs($admin)->getJson('/api/reports?period=month');

        $response->assertOk()
            ->assertJsonPath('period', 'month')
            ->assertJsonStructure(['rows', 'sales', 'orders', 'expenses']);
    }

    public function test_admin_can_filter_expenses_by_category(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        Expense::create([
            'user_id' => $admin->id,
            'category' => 'Gas',
            'amount' => 2000,
            'expense_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($admin)->getJson('/api/expenses?category=Gas');

        $response->assertOk()->assertJsonPath('data.0.category', 'Gas');
    }
}
