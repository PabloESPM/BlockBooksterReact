<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\BookUser;
use App\Models\Country;
use App\Models\FavList;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediumIssuesTest extends TestCase
{
    use RefreshDatabase;

    private function crearUsuario(array $attrs = []): User
    {
        $country = Country::first() ?? Country::factory()->create();

        return User::factory()->create(array_merge([
            'country_id'         => $country->id,
            'profile_visibility' => 'public',
        ], $attrs));
    }

    /**
     * Test for Issue 5: Privacidad en Rankings de Comunidad.
     */
    public function test_community_rankings_only_include_public_profiles(): void
    {
        // Crear usuarios con diferentes visibilidades de perfil
        $publicUser = $this->crearUsuario(['profile_visibility' => 'public']);
        $privateUser = $this->crearUsuario(['profile_visibility' => 'private']);
        $followersUser = $this->crearUsuario(['profile_visibility' => 'followers']);
        $friendsUser = $this->crearUsuario(['profile_visibility' => 'friends']);

        // Agregar listas para hacerlos aparecer en curadores destacados
        FavList::create(['user_id' => $publicUser->id, 'name' => 'Public List', 'visibility' => 'public']);
        FavList::create(['user_id' => $privateUser->id, 'name' => 'Private List', 'visibility' => 'public']);
        FavList::create(['user_id' => $followersUser->id, 'name' => 'Followers List', 'visibility' => 'public']);
        FavList::create(['user_id' => $friendsUser->id, 'name' => 'Friends List', 'visibility' => 'public']);

        $response = $this->getJson('/api/community');

        $response->assertStatus(200);

        // Extraer IDs del JSON retornado
        $topCuratorsIds = collect($response->json('top_curators'))->pluck('id')->toArray();

        $this->assertContains($publicUser->id, $topCuratorsIds);
        $this->assertNotContains($privateUser->id, $topCuratorsIds);
        $this->assertNotContains($followersUser->id, $topCuratorsIds);
        $this->assertNotContains($friendsUser->id, $topCuratorsIds);
    }

    /**
     * Test for Issue 1: Eager Loading de ratingRecord en Reseñas.
     */
    public function test_reviews_load_rating_record_relation(): void
    {
        $user = $this->crearUsuario();
        
        $language = \App\Models\Language::create(['code' => 'es', 'name' => 'Spanish']);
        $genre = \App\Models\Genre::create(['name' => 'Ficción']);
        $book = Book::factory()->create([
            'language_id' => $language->id,
            'genre_id' => $genre->id,
        ]);

        // Crear registro en book_user con rating
        BookUser::create([
            'user_id' => $user->id,
            'book_isbn' => $book->isbn,
            'rating' => 4,
            'status' => 'read',
        ]);

        // Crear reseña
        Review::create([
            'user_id' => $user->id,
            'book_isbn' => $book->isbn,
            'title' => 'Excelente libro',
            'body' => 'Me gustó mucho la trama.',
        ]);

        $response = $this->getJson("/api/books/{$book->isbn}");

        $response->assertStatus(200);

        // Verificamos que las reseñas cargadas en la respuesta incluyan la información de rating
        $reviews = $response->json('reviews.data');
        $this->assertNotEmpty($reviews);
        $this->assertEquals(4, $reviews[0]['rating'] ?? null);
    }

    /**
     * Test for updating book status.
     */
    public function test_book_status_update(): void
    {
        $user = $this->crearUsuario();
        Sanctum::actingAs($user);

        $language = \App\Models\Language::create(['code' => 'es', 'name' => 'Spanish']);
        $genre = \App\Models\Genre::create(['name' => 'Ficción']);
        $book = Book::factory()->create([
            'language_id' => $language->id,
            'genre_id' => $genre->id,
        ]);

        $response = $this->postJson("/api/books/{$book->isbn}/status", [
            'status' => 'reading',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('book_user', [
            'user_id' => $user->id,
            'book_isbn' => $book->isbn,
            'status' => 'reading',
        ]);
    }

    /**
     * Test user profile books and stats.
     */
    public function test_user_profile_books_and_stats(): void
    {
        $user = $this->crearUsuario();
        Sanctum::actingAs($user);

        $language = \App\Models\Language::create(['code' => 'es', 'name' => 'Spanish']);
        $genre = \App\Models\Genre::create(['name' => 'Ficción']);
        $book = Book::factory()->create([
            'language_id' => $language->id,
            'genre_id' => $genre->id,
        ]);

        // Mark book as reading
        BookUser::create([
            'user_id' => $user->id,
            'book_isbn' => $book->isbn,
            'status' => 'reading',
        ]);

        // Get user profile stats
        $response = $this->getJson("/api/users/{$user->id}");
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('book_stats.reading'));
        $this->assertEquals(0, $response->json('book_stats.read'));

        // Get user books tab data
        $booksResponse = $this->getJson("/api/users/{$user->id}/books?status=reading");
        $booksResponse->assertStatus(200);
        $this->assertCount(1, $booksResponse->json('data'));
        $this->assertEquals($book->isbn, $booksResponse->json('data.0.isbn'));
    }

    /**
     * Test book average rating and reviews count calculation.
     */
    public function test_book_average_rating(): void
    {
        $user1 = $this->crearUsuario();
        $user2 = $this->crearUsuario();

        $language = \App\Models\Language::create(['code' => 'es', 'name' => 'Spanish']);
        $genre = \App\Models\Genre::create(['name' => 'Ficción']);
        $book = Book::factory()->create([
            'language_id' => $language->id,
            'genre_id' => $genre->id,
        ]);

        // Add ratings
        BookUser::create(['user_id' => $user1->id, 'book_isbn' => $book->isbn, 'rating' => 5, 'status' => 'read']);
        BookUser::create(['user_id' => $user2->id, 'book_isbn' => $book->isbn, 'rating' => 3, 'status' => 'read']);

        // Add reviews to match reviews_count
        Review::create(['user_id' => $user1->id, 'book_isbn' => $book->isbn, 'title' => 'Good', 'body' => 'Yes']);
        Review::create(['user_id' => $user2->id, 'book_isbn' => $book->isbn, 'title' => 'Average', 'body' => 'Ok']);

        $response = $this->getJson("/api/books/{$book->isbn}");
        $response->assertStatus(200);
        $this->assertEquals(4.0, $response->json('data.average_rating'));
        $this->assertEquals(2, $response->json('data.reviews_count'));
    }

    /**
     * Test for Issue 2: Guardar foto de autor en Admin actualiza photo_url.
     */
    public function test_admin_author_save_saves_photo_url_correctly(): void
    {
        Storage::fake('public');

        $admin = $this->crearUsuario(['type' => 'admin']);
        Sanctum::actingAs($admin);

        $country = Country::first() ?? Country::factory()->create();

        $file = UploadedFile::fake()->image('author.jpg');

        $response = $this->postJson('/api/admin/authors', [
            'name' => 'Gabriel',
            'surname' => 'García Márquez',
            'birth_date' => '1927-03-06',
            'biography' => 'Premio Nobel de Literatura.',
            'country_id' => $country->id,
            'photo' => $file,
        ]);

        $response->assertStatus(200);

        $author = Author::where('name', 'Gabriel')->first();
        $this->assertNotNull($author);
        $this->assertNotNull($author->photo_url);
        $this->assertStringStartsWith('authors/', $author->photo_url);

        // Verificar almacenamiento físico del archivo
        Storage::disk('public')->assertExists($author->photo_url);
    }
}
