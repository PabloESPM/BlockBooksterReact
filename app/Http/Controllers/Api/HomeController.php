<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Http\Resources\FavListResource;
use App\Http\Resources\GenreResource;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\ReviewResource;
use App\Models\Book;
use App\Models\FavList;
use App\Models\Genre;
use App\Models\Author;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    /**
     * Datos del home: novedades, mejor valorados, por género, listas destacadas, opiniones, autores emergentes.
     *
     * HAL-PERF-01: Los datos estáticos se cachean 5 minutos (300s) para eliminar las ~15 queries
     * por visita. Los datos personalizados (is_followed) se añaden post-caché sin coste de BD.
     */
    public function index(): JsonResponse
    {
        $viewer = auth('sanctum')->user();

        // ── HAL-PERF-01: Cache de la sección estática del home (5 minutos) ──────
        $homeData = Cache::remember('home_data', 300, function () {
            // 1. Últimas novedades (últimos 6 libros añadidos)
            $latest = Book::with('authors')
                ->withAvg('users as average_rating', 'book_user.rating')
                ->latest()
                ->take(6)
                ->get();

            // 2. Libros mejor valorados (Top 5)
            $topRated = Book::with('authors')
                ->withAvg('users as average_rating', 'book_user.rating')
                ->orderByDesc('average_rating')
                ->take(5)
                ->get();

            // 3. Autores emergentes (Top 7 por seguidores en los últimos 30 días)
            $risingStars = Author::withCount([
                'followers' => fn ($q) => $q->where('author_followers.created_at', '>=', now()->subDays(30)),
            ])
                ->withCount('books')
                ->orderByDesc('followers_count')
                ->take(7)
                ->get();

            // Fallback si no hay autores con seguidores recientes
            if ($risingStars->filter(fn ($a) => $a->followers_count > 0)->isEmpty()) {
                $risingStars = Author::withCount('followers')
                    ->withCount('books')
                    ->orderByDesc('followers_count')
                    ->orderByDesc('books_count')
                    ->take(7)
                    ->get();
            }

            // 4. Listas destacadas (públicas, más likes en los últimos 30 días, Top 4)
            $featuredLists = FavList::select('fav_lists.*')
                ->where('visibility', 'public')
                ->with(['user', 'likes', 'books' => fn ($q) => $q->take(5)])
                ->withCount(['books', 'likes'])
                ->leftJoin('list_likes', function ($join) {
                    $join->on('fav_lists.id', '=', 'list_likes.list_id')
                        ->where('list_likes.created_at', '>=', now()->subDays(30));
                })
                ->groupBy('fav_lists.id')
                ->orderByDesc(DB::raw('COUNT(list_likes.id)'))
                ->take(4)
                ->get();

            if ($featuredLists->isEmpty()) {
                $featuredLists = FavList::where('visibility', 'public')
                    ->with(['user', 'likes', 'books' => fn ($q) => $q->take(5)])
                    ->withCount(['books', 'likes'])
                    ->orderByDesc('likes_count')
                    ->take(4)
                    ->get();
            }

            // 5. Opiniones brutales (Mejores 3 reseñas del mes por número de likes)
            $brutalOpinions = Review::with(['user', 'book', 'likes'])
                ->withCount('likes')
                ->where('created_at', '>=', now()->subMonth())
                ->orderByDesc('likes_count')
                ->take(3)
                ->get();

            if ($brutalOpinions->isEmpty()) {
                $brutalOpinions = Review::with(['user', 'book', 'likes'])
                    ->withCount('likes')
                    ->orderByDesc('likes_count')
                    ->take(3)
                    ->get();
            }

            // 6. Géneros principales (Top 6)
            $topGenres = Genre::select('genres.*')
                ->join('books', 'genres.id', '=', 'books.genre_id')
                ->join('reviews', 'books.isbn', '=', 'reviews.book_isbn')
                ->join('book_user', function ($join) {
                    $join->on('reviews.book_isbn', '=', 'book_user.book_isbn')
                        ->on('reviews.user_id', '=', 'book_user.user_id');
                })
                ->where('reviews.created_at', '>=', now()->subDays(30))
                ->groupBy('genres.id')
                ->orderByDesc(DB::raw('AVG(book_user.rating)'))
                ->take(6)
                ->get();

            if ($topGenres->isEmpty()) {
                $topGenres = Genre::whereHas('books')
                    ->withCount('books')
                    ->orderByDesc('books_count')
                    ->take(6)
                    ->get();

                foreach ($topGenres as $genre) {
                    $genre->top_books = Book::where('genre_id', $genre->id)
                        ->withAvg('users as reviews_avg_rating', 'book_user.rating')
                        ->orderByDesc('reviews_avg_rating')
                        ->take(5)
                        ->get();
                }
            } else {
                foreach ($topGenres as $genre) {
                    $genre->top_books = Book::where('genre_id', $genre->id)
                        ->select('books.*')
                        ->join('book_user', 'books.isbn', '=', 'book_user.book_isbn')
                        ->join('reviews', function ($join) {
                            $join->on('book_user.book_isbn', '=', 'reviews.book_isbn')
                                ->on('book_user.user_id', '=', 'reviews.user_id');
                        })
                        ->where('reviews.created_at', '>=', now()->subDays(30))
                        ->selectRaw('AVG(book_user.rating) as reviews_avg_rating')
                        ->groupBy('books.isbn')
                        ->orderByDesc('reviews_avg_rating')
                        ->take(5)
                        ->get();
                }
            }

            return compact('latest', 'topRated', 'risingStars', 'featuredLists', 'brutalOpinions', 'topGenres');
        });

        // ── HAL-PERF-02: Estado de seguimiento resuelto en memoria (sin N+1) ─────
        // El viewer se añade FUERA del cache para ser personal a cada usuario
        if ($viewer) {
            // Pre-cargar IDs de autores seguidos en una sola query
            $followedAuthorIds = $viewer->followedAuthors()->pluck('authors.id')->toArray();

            foreach ($homeData['risingStars'] as $author) {
                $author->is_followed = in_array($author->id, $followedAuthorIds);
            }
        }

        return response()->json([
            'latest'          => BookResource::collection($homeData['latest']),
            'top_rated'       => BookResource::collection($homeData['topRated']),
            'rising_stars'    => AuthorResource::collection($homeData['risingStars']),
            'featured_lists'  => FavListResource::collection($homeData['featuredLists']),
            'brutal_opinions' => ReviewResource::collection($homeData['brutalOpinions']),
            'top_genres'      => GenreResource::collection($homeData['topGenres']),
        ]);
    }
}
