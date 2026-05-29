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
     * Test that CatalogsSeeder populates static tables but no users.
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
     * Test that DatabaseSeeder does not execute DemoSeeder in testing environment.
     */
    public function test_database_seeder_does_not_execute_demo_seeder_in_testing_env(): void
    {
        // By default, PHPUnit runs in the 'testing' environment.
        $this->assertEquals('testing', app()->environment());

        $this->seed(DatabaseSeeder::class);

        // Under 'testing' environment, DemoSeeder should NOT run, so User count remains 0.
        $this->assertEquals(0, User::count());
        $this->assertGreaterThan(0, Country::count());
    }

    /**
     * Test that DemoSeeder directly executed populates users, admin, authors, books, etc.
     */
    public function test_demo_seeder_populates_fake_data_and_admin(): void
    {
        // First run catalogs to have countries/languages/genres
        $this->seed(CatalogsSeeder::class);

        $this->seed(DemoSeeder::class);

        $this->assertGreaterThan(0, User::count());

        // Assert default admin user exists
        $adminEmail = env('ADMIN_DEMO_EMAIL', 'admin@demo.com');
        $admin = User::where('email', $adminEmail)->first();

        $this->assertNotNull($admin);
        $this->assertEquals('admin', $admin->type);
        $this->assertEquals('public', $admin->profile_visibility);
    }
}
