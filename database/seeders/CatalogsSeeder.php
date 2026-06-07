<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\Language;
use App\Models\Genre;

class CatalogsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Países — 249 países reales desde mledoze/countries
        if (Country::count() === 0) {
            $json     = file_get_contents(database_path('data/countries.json'));
            $countries = json_decode($json, true);

            foreach ($countries as $country) {
                // Nombre en español con fallback al inglés
                $name = $country['translations']['spa']['common']
                    ?? $country['name']['common']
                    ?? null;

                if (!$name) continue;

                // Prefijo telefónico: root + sufijo si es un único carácter
                $phoneCode = null;
                if (!empty($country['idd']['root'])) {
                    $root    = ltrim($country['idd']['root'], '+');
                    $suffix  = $country['idd']['suffixes'][0] ?? '';
                    $phoneCode = (count($country['idd']['suffixes']) === 1 && strlen($suffix) === 1)
                        ? $root . $suffix
                        : $root;
                }

                // Primera moneda disponible
                $currency = !empty($country['currencies'])
                    ? array_key_first($country['currencies'])
                    : null;

                try {
                    Country::create([
                        'name'       => $name,
                        'alpha2'     => $country['cca2']          ?: null,
                        'iso_code'   => $country['cca3']          ?: null,
                        'phone_code' => $phoneCode,
                        'currency'   => $currency,
                        'continent'  => $country['continents'][0] ?? null,
                        'timezone'   => $country['timezones'][0]  ?? null,
                        'emoji'      => $country['flag']          ?? null,
                    ]);
                } catch (\Exception $e) {
                    // Salta duplicados o territorios sin código estándar
                    continue;
                }
            }
        }

        // 2. Idiomas
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

        // 3. Géneros literarios
        if (Genre::count() === 0) {
            collect([
                'Ficción', 'No Ficción', 'Misterio', 'Thriller', 'Romance',
                'Fantasía', 'Ciencia Ficción', 'Terror', 'Biografía',
                'Historia', 'Poesía', 'Ensayo', 'Infantil', 'Juvenil', 'Autoayuda'
            ])->each(fn ($g) => Genre::create(['name' => $g]));
        }
    }
}
