<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Http\Resources\ReviewResource;
use App\Models\Book;
use App\Models\BookUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Listado de libros con filtros, búsqueda y paginación.
     * Replica la lógica completa de BookController@index original.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Book::with('authors');

        // ── Búsqueda por título, autor o ISBN ──
        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }
        if ($request->filled('author')) {
            $query->whereHas('authors', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->author . '%');
            });
        }
        if ($request->filled('isbn')) {
            $query->where('isbn', 'like', '%' . $request->isbn . '%');
        }

        // ── Filtros del sidebar ──
        if ($request->filled('genre')) {
            $query->where('genre_id', $request->genre);
        }
        if ($request->filled('language')) {
            $query->whereHas('language', function ($q) use ($request) {
                $q->where('code', $request->language);
            });
        }
        if ($request->filled('country')) {
            $query->whereHas('authors', function ($q) use ($request) {
                $q->where('country_id', $request->country);
            });
        }
        if ($request->filled('pages_from')) {
            $query->where('number_of_pages', '>=', $request->pages_from);
        }
        if ($request->filled('pages_to')) {
            $query->where('number_of_pages', '<=', $request->pages_to);
        }
        if ($request->filled('year_from')) {
            $query->where('publication_year', '>=', $request->year_from);
        }
        if ($request->filled('year_to')) {
            $query->where('publication_year', '<=', $request->year_to);
        }

        // Valoración media precalculada
        $query->withAvg('users as average_rating', 'book_user.rating');
        $query->withCount('reviews');

        // Filtrado por valoración mínima
        if ($request->filled('rating')) {
            $query->where(function ($subquery) {
                $subquery->selectRaw('avg(rating)')
                    ->from('book_user')
                    ->whereColumn('book_isbn', 'books.isbn');
            }, '>=', $request->rating);
        }

        // ── Ordenación ──
        switch ($request->input('sort')) {
            case 'newest':
                $query->orderBy('publication_year', 'desc');
                break;
            case 'oldest':
                $query->orderBy('publication_year', 'asc');
                break;
            case 'title_asc':
                $query->orderBy('title', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('title', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        $perPage = min((int) $request->input('per_page', 12), 48);
        $books = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => BookResource::collection($books),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    /**
     * Detalle de un libro con autores, género, idioma y reseñas paginadas.
     */
    public function show(Request $request, Book $book): JsonResponse
    {
        $book->load(['authors', 'genre', 'language', 'purchases']);
        $book->loadAvg('users as average_rating', 'book_user.rating');
        $book->loadCount('reviews');

        // Reseñas paginadas con likes
        $reviews = $book->reviews()
            ->with(['user', 'likes'])
            ->withCount('likes')
            ->orderByDesc('likes_count')
            ->paginate(5);

        \App\Models\Review::preloadRatingRecords($reviews);

        // Estado del usuario autenticado respecto a este libro
        $userBook = null;
        if ($request->user()) {
            $bookUser = BookUser::where('user_id', $request->user()->id)
                ->where('book_isbn', $book->isbn)
                ->first();

            if ($bookUser) {
                $userBook = [
                    'status' => $bookUser->status,
                    'rating' => $bookUser->rating,
                    'started_at' => $bookUser->started_at?->toISOString(),
                    'finished_at' => $bookUser->finished_at?->toISOString(),
                ];
            }
        }

        // Añadimos el estado del usuario al recurso
        $book->user_book_status = $userBook;

        // Autores y libros relacionados del mismo género
        $relatedAuthors = collect();
        $relatedBooks = collect();
        if ($book->genre_id) {
            $authorIds = $book->authors->pluck('id');
            $relatedAuthors = \App\Models\Author::whereHas('books', function ($q) use ($book) {
                $q->where('genre_id', $book->genre_id);
            })
            ->whereNotIn('id', $authorIds)
            ->inRandomOrder()
            ->take(3)
            ->get();

            $relatedBooks = \App\Models\Book::with('authors')
                ->where('genre_id', $book->genre_id)
                ->where('isbn', '!=', $book->isbn)
                ->inRandomOrder()
                ->take(4)
                ->get();
        }

        return response()->json([
            'data' => new BookResource($book),
            'reviews' => [
                'data' => ReviewResource::collection($reviews),
                'meta' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                ],
            ],
            'related_authors' => \App\Http\Resources\AuthorResource::collection($relatedAuthors),
            'related_books' => BookResource::collection($relatedBooks),
        ]);
    }

    /**
     * Actualiza el estado de lectura del usuario autenticado para un libro.
     */
    public function updateStatus(Request $request, Book $book): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,reading,read',
        ]);

        $status = $request->status;

        BookUser::updateOrCreate(
            [
                'user_id'   => $request->user()->id,
                'book_isbn' => $book->isbn,
            ],
            [
                'status'     => $status,
                'started_at' => $status === 'reading' ? now() : null,
                'finished_at'=> $status === 'read'    ? now() : null,
            ]
        );

        return response()->json([
            'message' => 'Estado de lectura actualizado correctamente.',
            'user_book' => [
                'status' => $status,
                'started_at' => $status === 'reading' ? now()->toISOString() : null,
                'finished_at' => $status === 'read' ? now()->toISOString() : null,
            ],
        ]);
    }
}
