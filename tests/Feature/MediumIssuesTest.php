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
        FavList::factory()->for($publicUser)->create(['name' => 'Public List', 'visibility' => 'public']);
        FavList::factory()->for($privateUser)->create(['name' => 'Private List', 'visibility' => 'public']);
        FavList::factory()->for($followersUser)->create(['name' => 'Followers List', 'visibility' => 'public']);
        FavList::factory()->for($friendsUser)->create(['name' => 'Friends List', 'visibility' => 'public']);

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
     * Test dashboard index endpoint returns the correct structure.
     */
    public function test_dashboard_index_returns_correct_structure(): void
    {
        $user = $this->crearUsuario();
        Sanctum::actingAs($user);

        $language = \App\Models\Language::create(['code' => 'es', 'name' => 'Spanish']);
        $genre = \App\Models\Genre::create(['name' => 'Ficción']);
        $book = Book::factory()->create([
            'language_id' => $language->id,
            'genre_id' => $genre->id,
        ]);

        BookUser::create([
            'user_id' => $user->id,
            'book_isbn' => $book->isbn,
            'status' => 'reading',
            'started_at' => now(),
        ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'stats' => [
                'read_books',
                'reading_books',
                'pending_books',
                'lists',
                'reviews',
                'followers',
                'following',
            ],
            'reading_books',
            'recent_activity',
            'pending_collection',
            'read_collection',
        ]);

        $this->assertCount(1, $response->json('reading_books'));
        $this->assertEquals($book->isbn, $response->json('reading_books.0.book.isbn'));
    }

    /**
     * Test dashboard social endpoint returns the correct structure.
     */
    public function test_dashboard_social_endpoint_returns_correct_structure(): void
    {
        $user = $this->crearUsuario();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/social?authors_limit=5&following_limit=5&followers_limit=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'followed_authors',
            'total_authors',
            'has_more_authors',
            'following',
            'following_count',
            'has_more_following',
            'followers',
            'followers_count',
            'has_more_followers',
        ]);

        $this->assertFalse($response->json('has_more_authors'));
        $this->assertFalse($response->json('has_more_following'));
        $this->assertFalse($response->json('has_more_followers'));
    }

    /**
     * Test dashboard social endpoint returns correct follow relationships (is_following).
     */
    public function test_dashboard_social_endpoint_returns_correct_follow_relationships(): void
    {
        $user = $this->crearUsuario();
        Sanctum::actingAs($user);

        // User A (authenticated) follows Author X
        $country = Country::first() ?? Country::factory()->create();
        $author = Author::factory()->create(['country_id' => $country->id]);
        $user->followAuthor($author);

        // User A (authenticated) follows User B
        $userB = $this->crearUsuario();
        $user->follow($userB);

        // User C follows User A, but User A does NOT follow User C back
        $userC = $this->crearUsuario();
        $userC->follow($user);

        // User D follows User A, and User A follows User D back (mutual follow)
        $userD = $this->crearUsuario();
        $userD->follow($user);
        $user->follow($userD);

        $response = $this->getJson('/api/dashboard/social');
        $response->assertStatus(200);

        // Check followed authors section
        $followedAuthors = $response->json('followed_authors');
        $this->assertNotEmpty($followedAuthors);
        $this->assertEquals($author->id, $followedAuthors[0]['id']);
        $this->assertTrue($followedAuthors[0]['is_followed']);

        // Check following section
        $following = $response->json('following');
        $this->assertNotEmpty($following);
        $this->assertEquals($userB->id, $following[0]['id']);
        $this->assertTrue($following[0]['is_following']);

        // Check followers section
        $followers = $response->json('followers');
        $this->assertCount(2, $followers);

        // Map followers by ID
        $followersMap = collect($followers)->keyBy('id')->toArray();

        // User C is a follower, but not followed back by User A
        $this->assertArrayHasKey($userC->id, $followersMap);
        $this->assertFalse($followersMap[$userC->id]['is_following']);

        // User D is a follower, and followed back by User A (mutual)
        $this->assertArrayHasKey($userD->id, $followersMap);
        $this->assertTrue($followersMap[$userD->id]['is_following']);
    }

    /**
     * Test dashboard lists endpoint returns the correct structure.
     */
    public function test_dashboard_lists_endpoint_returns_correct_structure(): void
    {
        $user = $this->crearUsuario();
        Sanctum::actingAs($user);

        // Create some lists
        FavList::factory()->for($user)->create(['name' => 'Lista 1', 'visibility' => 'public']);
        FavList::factory()->for($user)->create(['name' => 'Lista 2', 'visibility' => 'public']);

        $response = $this->getJson('/api/dashboard/lists?created_limit=5&followed_limit=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'created',
            'total_created',
            'has_more_created',
            'followed',
            'total_followed',
            'has_more_followed',
        ]);

        $this->assertEquals(2, $response->json('total_created'));
        $this->assertFalse($response->json('has_more_created'));
        $this->assertFalse($response->json('has_more_followed'));
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

    /**
     * Test for public user profile followed authors endpoint.
     */
    public function test_user_profile_followed_authors_endpoint(): void
    {
        $user = $this->crearUsuario();
        $profileUser = $this->crearUsuario();

        // Create country and author
        $country = Country::first() ?? Country::factory()->create();
        $author = \App\Models\Author::factory()->create(['country_id' => $country->id]);

        // Profile user follows author
        $profileUser->followAuthor($author);

        // Visitor (authenticated) checks followed authors of profile user
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/users/{$profileUser->id}/authors");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($author->id, $response->json('data.0.id'));
    }

    /**
     * Test for user profile lists endpoint with type parameter.
     */
    public function test_user_profile_lists_endpoint_with_type(): void
    {
        $user = $this->crearUsuario();
        $profileUser = $this->crearUsuario(['profile_visibility' => 'public']);

        // Create lists
        $createdList = FavList::factory()->for($profileUser)->create(['name' => 'Created List', 'visibility' => 'public']);

        $otherUser = $this->crearUsuario();
        $followedList = FavList::factory()->for($otherUser)->create(['name' => 'Followed List', 'visibility' => 'public']);
        $profileUser->followList($followedList);

        Sanctum::actingAs($user);

        // 1. Get created lists
        $responseCreated = $this->getJson("/api/users/{$profileUser->id}/lists?type=created");
        $responseCreated->assertStatus(200);
        $this->assertCount(1, $responseCreated->json('data'));
        $this->assertEquals($createdList->id, $responseCreated->json('data.0.id'));

        // 2. Get followed lists
        $responseFollowed = $this->getJson("/api/users/{$profileUser->id}/lists?type=followed");
        $responseFollowed->assertStatus(200);
        $this->assertCount(1, $responseFollowed->json('data'));
        $this->assertEquals($followedList->id, $responseFollowed->json('data.0.id'));
    }

    /**
     * Test de visibilidad y permiso de seguimiento (can_follow).
     */
    public function test_can_follow_property_based_on_profile_visibility(): void
    {
        $visitante = $this->crearUsuario();
        
        $publicUser = $this->crearUsuario(['profile_visibility' => 'public']);
        $followersUser = $this->crearUsuario(['profile_visibility' => 'followers']);
        $friendsUser = $this->crearUsuario(['profile_visibility' => 'friends']);
        $privateUser = $this->crearUsuario(['profile_visibility' => 'private']);

        Sanctum::actingAs($visitante);

        // 1. Perfil público -> can_follow = true
        $resPublic = $this->getJson("/api/users/{$publicUser->id}");
        $resPublic->assertStatus(200);
        $this->assertTrue($resPublic->json('data.can_follow'));

        // 2. Perfil followers -> can_follow = true
        $resFollowers = $this->getJson("/api/users/{$followersUser->id}");
        $resFollowers->assertStatus(200);
        $this->assertTrue($resFollowers->json('data.can_follow'));

        // 3. Perfil friends -> can_follow = true
        $resFriends = $this->getJson("/api/users/{$friendsUser->id}");
        $resFriends->assertStatus(200);
        $this->assertTrue($resFriends->json('data.can_follow'));

        // 4. Perfil privado -> can_follow = false
        $resPrivate = $this->getJson("/api/users/{$privateUser->id}");
        $resPrivate->assertStatus(200);
        $this->assertFalse($resPrivate->json('data.can_follow'));
    }
}
