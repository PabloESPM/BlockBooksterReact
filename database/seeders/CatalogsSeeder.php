<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\Language;
use App\Models\Genre;

class CatalogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Pobla los datos base estáticos (países, idiomas y géneros literarios) requeridos en cualquier entorno.
     */
    public function run(): void
    {
        // 1. Creación de países (datos estáticos deterministas para producción)
        if (Country::count() === 0) {
            collect([
                ['name' => 'España', 'phone_code' => '34', 'iso_code' => 'ESP', 'currency' => 'EUR', 'continent' => 'Europe', 'timezone' => 'Europe/Madrid'],
                ['name' => 'Estados Unidos', 'phone_code' => '1', 'iso_code' => 'USA', 'currency' => 'USD', 'continent' => 'North America', 'timezone' => 'America/New_York'],
                ['name' => 'Francia', 'phone_code' => '33', 'iso_code' => 'FRA', 'currency' => 'EUR', 'continent' => 'Europe', 'timezone' => 'Europe/Paris'],
                ['name' => 'Reino Unido', 'phone_code' => '44', 'iso_code' => 'GBR', 'currency' => 'GBP', 'continent' => 'Europe', 'timezone' => 'Europe/London'],
                ['name' => 'Alemania', 'phone_code' => '49', 'iso_code' => 'DEU', 'currency' => 'EUR', 'continent' => 'Europe', 'timezone' => 'Europe/Berlin'],
                ['name' => 'Italia', 'phone_code' => '39', 'iso_code' => 'ITA', 'currency' => 'EUR', 'continent' => 'Europe', 'timezone' => 'Europe/Rome'],
                ['name' => 'Portugal', 'phone_code' => '351', 'iso_code' => 'PRT', 'currency' => 'EUR', 'continent' => 'Europe', 'timezone' => 'Europe/Lisbon'],
                ['name' => 'Japón', 'phone_code' => '81', 'iso_code' => 'JPN', 'currency' => 'JPY', 'continent' => 'Asia', 'timezone' => 'Asia/Tokyo'],
                ['name' => 'China', 'phone_code' => '86', 'iso_code' => 'CHN', 'currency' => 'CNY', 'continent' => 'Asia', 'timezone' => 'Asia/Shanghai'],
                ['name' => 'México', 'phone_code' => '52', 'iso_code' => 'MEX', 'currency' => 'MXN', 'continent' => 'North America', 'timezone' => 'America/Mexico_City']
            ])->each(fn ($c) => Country::create($c));
        }

        // 2. Creación de idiomas
        if (Language::count() === 0) {
            collect([
                ['code' => 'es', 'name' => 'Español'],
                ['code' => 'en', 'name' => 'Inglés'],
                ['code' => 'fr', 'name' => 'Francés'],
                ['code' => 'de', 'name' => 'Alemán'],
                ['code' => 'it', 'name' => 'Italiano'],
                ['code' => 'pt', 'name' => 'Portugués'],
                ['code' => 'ca', 'name' => 'Catalán'],
                ['code' => 'zh', 'name' => 'Chino'],
                ['code' => 'ja', 'name' => 'Japonés'],
                ['code' => 'ot', 'name' => 'Otros'],
            ])->each(fn ($l) => Language::create($l));
        }

        // 3. Creación de géneros literarios
        if (Genre::count() === 0) {
            collect([
                'Ficción', 'No Ficción', 'Misterio', 'Thriller', 'Romance',
                'Fantasía', 'Ciencia Ficción', 'Terror', 'Biografía',
                'Historia', 'Poesía', 'Ensayo', 'Infantil', 'Juvenil', 'Autoayuda'
            ])->each(fn ($g) => Genre::create(['name' => $g]));
        }
    }
}
