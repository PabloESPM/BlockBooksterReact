<?php

namespace Tests\Feature;

use App\Models\Country;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function crearUser(): User
    {
        $country = Country::first() ?? Country::factory()->create();
        return User::factory()->create([
            'country_id' => $country->id,
        ]);
    }

    /**
     * Prueba que un usuario autenticado pueda cerrar sesión con éxito a través de Sanctum.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = $this->crearUser();

        $response = $this->actingAs($user, 'web')
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Sesión cerrada correctamente.',
        ]);

        $this->assertFalse(auth('web')->check());
    }

    /**
     * Prueba que un usuario autenticado pueda eliminar su cuenta.
     */
    public function test_authenticated_user_can_delete_account(): void
    {
        $user = $this->crearUser();

        $response = $this->actingAs($user, 'web')
            ->deleteJson('/api/dashboard/account', [
                'current_password' => 'password',
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Tu cuenta ha sido eliminada permanentemente.',
        ]);

        $this->assertNull(User::find($user->id));
        $this->assertFalse(auth('web')->check());
    }
}
