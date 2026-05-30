<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Http\Resources\FavListResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\GenreResource;
use App\Models\Book;
use App\Models\FavList;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    /**
     * Datos del home: novedades, mejor valorados, por género, listas destacadas, usuarios destacados.
     * Agrupa todas las consultas necesarias para la página principal.
     */
    public function index(): JsonResponse
    {
        // Últimas novedades (últimos libros añadidos)
        $latest = Book::with('authors')
            ->withAvg('users as average_rating', 'book_user.rating')
            ->latest()
            ->take(8)
            ->get();

        // Libros mejor valorados
        $topRated = Book::with('authors')
            ->whereHas('users', fn ($q) => $q->whereNotNull('book_user.rating'))
            ->withAvg('users as average_rating', 'book_user.rating')
            ->orderByDesc('average_rating')
            ->take(8)
            ->get();

        // Libros más reseñados
        $mostReviewed = Book::with('authors')
            ->withCount('reviews')
            ->withAvg('users as average_rating', 'book_user.rating')
            ->orderByDesc('reviews_count')
            ->take(8)
            ->get();

        // Géneros con al menos un libro
        $genres = Genre::whereHas('books')
            ->withCount('books')
            ->orderByDesc('books_count')
            ->take(8)
            ->get();

        // Listas destacadas (públicas, más likes)
        $featuredLists = FavList::where('visibility', 'public')
            ->with(['user', 'books' => fn ($q) => $q->take(4)])
            ->withCount(['books', 'likes'])
            ->orderByDesc('likes_count')
            ->take(4)
            ->get();

        // Usuarios destacados (más seguidores)
        $featuredUsers = User::withCount('followers')
            ->orderByDesc('followers_count')
            ->take(5)
            ->get();

        $viewer = auth('sanctum')->user();
        if ($viewer) {
            foreach ($featuredUsers as $user) {
                $user->is_following = $user->id === $viewer->id ? false : $viewer->isFollowing($user);
            }
        }

        return response()->json([
            'latest' => BookResource::collection($latest),
            'top_rated' => BookResource::collection($topRated),
            'most_reviewed' => BookResource::collection($mostReviewed),
            'genres' => GenreResource::collection($genres),
            'featured_lists' => FavListResource::collection($featuredLists),
            'featured_users' => UserResource::collection($featuredUsers),
        ]);
    }
}
