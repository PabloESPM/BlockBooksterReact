<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    User,
    Author,
    Book,
    Purchase,
    Review,
    FavList,
    Recommendation,
    Follow,
    ListLike,
    ReviewLike,
    BookUser,
    Country
};

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Pobla la base de datos con datos de demostración y prueba ficticios (Faker).
     */
    public function run(): void
    {
        // Obtener países e idiomas para las relaciones
        $countries = Country::all();
        if ($countries->isEmpty()) {
            $countries = collect([Country::factory()->create()]);
        }
        $defaultCountry = $countries->first();

        // 1. Crear usuario Administrador de demostración configurable vía .env
        $admin = User::forceCreate([
            'name' => 'Demo Admin',
            'email' => env('ADMIN_DEMO_EMAIL', 'admin@demo.com'),
            'password' => \Illuminate\Support\Facades\Hash::make(env('ADMIN_DEMO_PASSWORD', 'demo1234')),
            'telephone' => '000000000',
            'date_of_birth' => '1985-01-01',
            'gender' => 'Other',
            'country_id' => $defaultCountry->id,
            'type' => 'admin',
            'profile_visibility' => 'public',
        ]);

        // 2. Generar 15 autores
        $authors = Author::factory(15)->create();
        $allBooks = collect();

        // 3. Generar libros y compras asociadas
        $authors->each(function ($author) use (&$allBooks, $countries) {
            // Cada autor publica entre 1 y 5 libros
            $books = Book::factory(rand(1, 5))->create();

            // Relación muchos a muchos autor / libro usando ISBN
            $author->books()->attach($books->pluck('isbn'));
            $allBooks = $allBooks->merge($books);

            $providers = ['Amazon', 'Fnac', 'Casa del Libro', 'El Corte Inglés'];
            $formats = ['paperback', 'hardcover', 'ebook', 'audiobook'];

            $books->each(function ($book) use ($providers, $formats, $countries) {
                collect($providers)
                    ->crossJoin($formats, $countries)
                    ->shuffle()
                    ->take(rand(2, 4))
                    ->each(function ($combo) use ($book) {
                        [$provider, $format, $country] = $combo;
                        Purchase::create([
                            'book_isbn' => $book->isbn,
                            'provider' => $provider,
                            'format' => $format,
                            'country_id' => $country->id,
                            'affiliate_url' => fake()->url(),
                            'active' => fake()->boolean(80),
                        ]);
                    });
            });
        });

        // 4. Generar 29 usuarios de demostración adicionales
        $users = User::factory(29)->create();

        // Promover 5 trabajadores de demostración de forma segura
        $users->take(5)->each(function ($u) {
            $u->type = 'worker';
            $u->save();
        });

        // Agrupar todos los usuarios (admin + workers + normal users)
        $allUsers = collect([$admin])->merge($users);

        // Hacer que los primeros 20 perfiles sean públicos
        $allUsers->take(20)->each(function ($u) {
            $u->profile_visibility = 'public';
            $u->save();
        });

        // 5. Generar lecturas, calificaciones y reseñas
        $allUsers->each(function (User $user) use ($allBooks, $allUsers) {
            // Cada usuario lee entre 1 y 5 libros
            $readBooks = $allBooks->random(rand(1, min(5, $allBooks->count())));

            foreach ($readBooks as $book) {
                BookUser::create([
                    'user_id' => $user->id,
                    'book_isbn' => $book->isbn,
                    'status' => 'read',
                    'started_at' => now()->subMonths(rand(1, 12)),
                    'finished_at' => now(),
                    'rating' => rand(1, 5),
                ]);
            }

            // Reseñas asociadas a los libros leídos
            $readBooks->each(fn ($book) =>
                Review::factory()->create([
                    'user_id' => $user->id,
                    'book_isbn' => $book->isbn,
                ])
            );

            // Listas favoritas (1 a 4 por usuario)
            $lists = FavList::factory(rand(1, 4))->create(['user_id' => $user->id]);

            $lists->each(fn ($list) =>
                $list->books()->attach(
                    $readBooks
                        ->random(rand(1, min(5, $readBooks->count())))
                        ->pluck('isbn')
                )
            );

            // Recomendaciones enviadas a perfiles públicos o seguidores
            $targets = $allUsers
                ->where('id', '!=', $user->id)
                ->whereIn('profile_visibility', ['public', 'followers']);

            if ($targets->isNotEmpty()) {
                $chosenTargets = $targets->random(rand(1, min(3, $targets->count())));
                foreach ($chosenTargets as $target) {
                    Recommendation::create([
                        'from_user_id' => $user->id,
                        'to_user_id' => $target->id,
                        'book_isbn' => $readBooks->random()->isbn,
                        'message' => 'Te recomiendo este libro 📚',
                    ]);
                }
            }
        });

        // 6. Sistema de seguimiento (Follow)
        $allUsers->each(function (User $user) use ($allUsers) {
            $candidates = $allUsers
                ->where('id', '!=', $user->id)
                ->whereIn('profile_visibility', ['public', 'followers']);

            if ($candidates->isNotEmpty()) {
                $followedList = $candidates->random(rand(1, min(4, $candidates->count())));
                foreach ($followedList as $other) {
                    Follow::firstOrCreate([
                        'follower_id' => $user->id,
                        'followed_id' => $other->id,
                    ]);

                    // 30% de probabilidad de follow mutuo
                    if (rand(1, 100) <= 30) {
                        Follow::firstOrCreate([
                            'follower_id' => $other->id,
                            'followed_id' => $user->id,
                        ]);
                    }
                }
            }
        });

        // 7. Likes en reseñas y listas
        Review::all()->each(function ($review) use ($allUsers) {
            $allUsers->random(rand(0, min(5, $allUsers->count())))->each(fn ($u) =>
                ReviewLike::firstOrCreate([
                    'user_id' => $u->id,
                    'review_id' => $review->id,
                ])
            );
        });

        FavList::all()->each(function ($list) use ($allUsers) {
            $allUsers->random(rand(0, min(5, $allUsers->count())))->each(fn ($u) =>
                ListLike::firstOrCreate([
                    'user_id' => $u->id,
                    'list_id' => $list->id,
                ])
            );
        });
    }
}
