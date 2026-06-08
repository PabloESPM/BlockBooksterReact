<?php

namespace Tests\Feature;

use App\Models\Country;
use App\Models\Language;
use App\Models\Genre;
use App\Models\User;
use Database\Seeders\CatalogsSeeder;
use Database\Seeders\DemoSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Prueba que CatalogsSeeder pueble las tablas estáticas pero ningún usuario.
     */
    public function test_catalogs_seeder_populates_only_static_tables(): void
    {
        $this->seed(CatalogsSeeder::class);

        $this->assertGreaterThan(0, Country::count());
        $this->assertGreaterThan(0, Language::count());
        $this->assertGreaterThan(0, Genre::count());
        $this->assertEquals(0, User::count());
    }

    /**
     * Prueba que DatabaseSeeder no ejecute DemoSeeder en el entorno de pruebas.
     */
    public function test_database_seeder_does_not_execute_demo_seeder_in_testing_env(): void
    {
        // Por defecto, PHPUnit se ejecuta en el entorno 'testing'.
        $this->assertEquals('testing', app()->environment());

        $this->seed(DatabaseSeeder::class);

        // En el entorno 'testing', DemoSeeder NO debería ejecutarse, por lo que el recuento de usuarios sigue siendo 0.
        $this->assertEquals(0, User::count());
        $this->assertGreaterThan(0, Country::count());
    }

    /**
     * Prueba que DemoSeeder ejecutado directamente pueble usuarios, administrador, autores, libros, etc.
     */
    public function test_demo_seeder_populates_fake_data_and_admin(): void
    {
        // Primero ejecutar catálogos para tener países/idiomas/géneros
        $this->seed(CatalogsSeeder::class);

        $this->seed(DemoSeeder::class);

        $this->assertGreaterThan(0, User::count());

        // Verificar que exista el usuario administrador por defecto
        $adminEmail = env('ADMIN_DEMO_EMAIL', 'admin@demo.com');
        $admin = User::where('email', $adminEmail)->first();

        $this->assertNotNull($admin);
        $this->assertEquals('admin', $admin->type);
        $this->assertEquals('public', $admin->profile_visibility);
    }
}
