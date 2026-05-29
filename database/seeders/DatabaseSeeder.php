<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Coordina el sembrado de datos distinguiendo entre entorno base y demo.
     */
    public function run(): void
    {
        // Siempre: datos de catálogo base requeridos en cualquier entorno
        $this->call(CatalogsSeeder::class);

        // Solo en desarrollo o demo: datos simulados
        if (app()->environment(['local', 'development', 'demo'])) {
            $this->call(DemoSeeder::class);
        }
    }
}
