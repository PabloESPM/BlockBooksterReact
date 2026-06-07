<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\FavListResource;
use App\Http\Resources\GenreResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Búsqueda global a través de múltiples modelos.
     * Replica la lógica de SearchController@search original.
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->input('q'));

        if (empty($query)) {
            return response()->json([
                'error' => 'Por favor, ingresa un término de búsqueda.',
            ], 422);
        }

        // Buscar Libros (título, ISBN)
        $books = \App\Models\Book::where('title', 'ILIKE', "%{$query}%")
            ->orWhere('isbn', 'ILIKE', "%{$query}%")
            ->with('authors')
            ->withAvg('users as average_rating', 'book_user.rating')
            ->limit(10)
            ->get();

        // Buscar Autores
        $authors = \App\Models\Author::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('surname', 'ILIKE', "%{$query}%")
            ->withCount('books')
            ->limit(10)
            ->get();

        // Buscar Usuarios (todos los perfiles son descubribles)
        $users = \App\Models\User::where('name', 'ILIKE', "%{$query}%")
            ->withCount('followers')
            ->limit(10)
            ->get();

        // Buscar Listas (solo públicas)
        $lists = \App\Models\FavList::where('name', 'ILIKE', "%{$query}%")
            ->where('visibility', 'public')
            ->with('user')
            ->withCount('books')
            ->limit(10)
            ->get();

        // Buscar Géneros
        $genres = \App\Models\Genre::where('name', 'ILIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $totalResults = $books->count() + $authors->count() + $users->count() + $lists->count() + $genres->count();

        $viewer = auth('sanctum')->user();
        if ($viewer) {
            foreach ($users as $user) {
                $user->is_following = $user->id === $viewer->id ? false : $viewer->isFollowing($user);
            }
        }

        return response()->json([
            'query' => $query,
            'total_results' => $totalResults,
            'books' => BookResource::collection($books),
            'authors' => AuthorResource::collection($authors),
            'users' => UserResource::collection($users),
            'lists' => FavListResource::collection($lists),
            'genres' => GenreResource::collection($genres),
        ]);
    }
}
