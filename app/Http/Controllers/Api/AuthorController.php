<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthorResource;
use App\Models\Author;
use App\Http\Resources\BookResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    /**
     * Listado de autores con varias secciones: populares, clásicos, más valorados, emergentes.
     * Replica la lógica de AuthorController@index original.
     */
    public function index(): JsonResponse
    {
        // Populares: autores con más libros
        $popular = Author::withCount('books')
            ->orderBy('books_count', 'desc')
            ->take(6)
            ->get();

        // Clásicos: primeros autores de la base de datos (aproximación)
        $classics = Author::take(3)->get();

        // Más valorados: autores aleatorios con libros
        $mostRated = Author::withCount('books')
            ->inRandomOrder()
            ->take(5)
            ->get();

        // Estrellas emergentes: últimos autores añadidos
        $newAuthors = Author::latest()->take(4)->get();

        return response()->json([
            'popular' => AuthorResource::collection($popular),
            'classics' => AuthorResource::collection($classics),
            'most_rated' => AuthorResource::collection($mostRated),
            'new' => AuthorResource::collection($newAuthors),
        ]);
    }

    /**
     * Perfil de un autor con sus libros paginados.
     */
    public function show(Request $request, Author $author): JsonResponse
    {
        $author->load('country');
        $author->loadCount(['books', 'followers']);

        // Verificar si el usuario autenticado sigue a este autor
        if ($request->user()) {
            $author->is_followed = $author->isFollowedBy($request->user());
        }

        $books = $author->books()
            ->with('reviews')
            ->withAvg('users as average_rating', 'book_user.rating')
            ->paginate(6);

        return response()->json([
            'data' => new AuthorResource($author),
            'books' => [
                'data' => BookResource::collection($books),
                'meta' => [
                    'current_page' => $books->currentPage(),
                    'last_page' => $books->lastPage(),
                    'per_page' => $books->perPage(),
                    'total' => $books->total(),
                ],
            ],
        ]);
    }
}
