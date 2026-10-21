<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_requires_the_selected_role_to_match_the_user(): void
    {
        User::factory()->create([
            'email' => 'cashier@example.com',
            'password' => 'password',
            'role' => 'CASHIER',
        ]);

        $response = $this->post('/login', [
            'email' => 'cashier@example.com',
            'password' => 'password',
            'role' => 'ADMIN',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_cashier_cannot_access_the_admin_dashboard(): void
    {
        $cashier = User::factory()->create(['role' => 'CASHIER']);

        $this->actingAs($cashier)->get('/dashboard')->assertForbidden();
    }
}
