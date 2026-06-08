<?php

namespace Tests\Feature;

use App\Models\Country;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LowIssuesTest extends TestCase
{
    use RefreshDatabase;

    private function crearCountry(): Country
    {
        return Country::first() ?? Country::factory()->create();
    }

    /**
     * Prueba para la Incidencia 1 (Baja): Vulnerabilidad Potencial de Mass Assignment en el Modelo User.
     * Verifica que 'type' y 'is_blocked' estén protegidos contra la asignación masiva.
     */
    public function test_user_type_and_is_blocked_are_guarded_from_mass_assignment(): void
    {
        $country = $this->crearCountry();

        // Intento de creación masiva con type=admin e is_blocked=true
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'telephone' => '123456789',
            'date_of_birth' => '1990-01-01',
            'gender' => 'Male',
            'country_id' => $country->id,
            'type' => 'admin',
            'is_blocked' => true,
        ]);

        $user->refresh();

        // Deben haber tomado sus valores por defecto (user y false) debido a que no son fillable
        $this->assertEquals('user', $user->type);
        $this->assertFalse($user->is_blocked);

        // Intento de actualización masiva
        $user->update([
            'type' => 'admin',
            'is_blocked' => true,
        ]);

        $user->refresh();

        // Siguen inalterados
        $this->assertEquals('user', $user->type);
        $this->assertFalse($user->is_blocked);
    }
}
