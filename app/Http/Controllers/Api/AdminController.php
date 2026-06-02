<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\FavListResource;
use App\Models\Book;
use App\Models\Author;
use App\Models\User;
use App\Models\Review;
use App\Models\FavList;
use App\Models\Genre;
use App\Models\Language;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Dashboard: estadísticas generales del panel de administración.
     */
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_books' => Book::count(),
                'total_users' => User::count(),
                'total_reviews' => Review::count(),
                'total_lists' => FavList::count(),
                'total_authors' => Author::count(),
            ],
        ]);
    }

    /* ──────────────────────────────────────────────────────────
     *  LIBROS — CRUD
     * ────────────────────────────────────────────────────────── */

    /**
     * Listado de libros para admin con búsqueda, filtro por género y paginación.
     */
    public function books(Request $request): JsonResponse
    {
        $query = Book::with(['authors', 'genre']);

        // Búsqueda por título, ISBN o autor
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('isbn', 'ILIKE', "%{$search}%")
                  ->orWhereHas('authors', function ($aq) use ($search) {
                      $aq->where('name', 'ILIKE', "%{$search}%")
                         ->orWhere('surname', 'ILIKE', "%{$search}%");
                  });
            });
        }

        // Filtro por género
        if ($request->filled('genre_id')) {
            $query->where('genre_id', $request->genre_id);
        }

        // Ordenación
        $sortColumn = $request->input('sort', 'created_at');
        $sortDir = $request->input('direction', 'desc');
        $query->orderBy($sortColumn, $sortDir);

        $books = $query->paginate(15);

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
     * Obtener datos de un libro para edición.
     */
    public function bookShow(Book $book): JsonResponse
    {
        $book->load(['authors', 'genre', 'language']);

        // Datos del formulario de edición
        $author = $book->authors->first();

        return response()->json([
            'data' => new BookResource($book),
            'form' => [
                'isbn' => $book->isbn,
                'title' => $book->title,
                'description' => $book->description,
                'genre_id' => $book->genre_id,
                'language_id' => $book->language_id,
                'publisher' => $book->publisher,
                'publication_year' => $book->publication_year,
                'number_of_pages' => $book->number_of_pages,
                'cover_path' => $book->cover_path,
                'author_id' => $author?->id,
                'author_name' => $author ? trim($author->name . ' ' . $author->surname) : '',
            ],
            'genres' => Genre::orderBy('name')->get(['id', 'name']),
            'languages' => Language::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Crear o actualizar un libro.
     */
    public function bookSave(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'isbn' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'genre_id' => 'nullable|exists:genres,id',
            'language_id' => 'nullable|exists:languages,id',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer',
            'number_of_pages' => 'nullable|integer',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'author_id' => 'nullable|integer',
            'author_name' => 'nullable|string|max:255',
        ]);

        $book = Book::find($validated['isbn']);
        $isNew = !$book;

        if ($isNew) {
            $book = new Book();
            $book->isbn = $validated['isbn'];
        }

        $book->title = $validated['title'];
        $book->description = $validated['description'] ?? null;
        $book->genre_id = $validated['genre_id'] ?? null;
        $book->language_id = $validated['language_id'] ?? null;
        $book->publisher = $validated['publisher'] ?? null;
        $book->publication_year = $validated['publication_year'] ?? null;
        $book->number_of_pages = $validated['number_of_pages'] ?? null;

        // Procesar portada
        if ($request->hasFile('cover')) {
            // Limpiar portada anterior si existe
            if ($book->cover_path) {
                Storage::disk('public')->delete($book->cover_path);
            }

            $cleanTitle = mb_strtolower($validated['title']);
            $cleanTitle = preg_replace('/[^\w\s\-]/u', '', $cleanTitle);
            $cleanTitle = preg_replace('/[\s\-]+/', '_', $cleanTitle);
            $cleanTitle = trim($cleanTitle, '_');

            $ext = $request->file('cover')->getClientOriginalExtension();
            $path = "covers/{$cleanTitle}/{$cleanTitle}.{$ext}";
            $request->file('cover')->storeAs("covers/{$cleanTitle}", "{$cleanTitle}.{$ext}", 'public');
            $book->cover_path = $path;
        }

        $book->save();

        // Gestionar autor
        if (!empty($validated['author_name'])) {
            $authorId = $validated['author_id'] ?? null;

            // Buscar o crear autor si no se seleccionó uno existente
            if (!$authorId) {
                $parts = explode(' ', trim($validated['author_name']), 2);
                $name = $parts[0];
                $surname = $parts[1] ?? null;
                $slug = \Illuminate\Support\Str::slug(trim($name . ' ' . ($surname ?? '')));

                $author = Author::firstOrCreate(
                    ['slug' => $slug],
                    [
                        'name' => $name,
                        'surname' => $surname,
                    ]
                );
                $authorId = $author->id;
            }

            $book->authors()->sync([
                $authorId => ['role' => 'author', 'author_order' => 1],
            ]);
        }

        return response()->json([
            'data' => new BookResource($book->fresh(['authors', 'genre'])),
            'message' => $isNew ? '¡Libro creado exitosamente!' : '¡Libro actualizado exitosamente!',
        ], $isNew ? 201 : 200);
    }

    /**
     * Eliminar un libro y su portada.
     */
    public function bookDelete(Book $book): JsonResponse
    {
        // La eliminación de la portada y su directorio se maneja
        // automáticamente en el evento 'deleting' del modelo Book.
        $book->delete();

        return response()->json([
            'message' => '¡Libro eliminado exitosamente!',
        ]);
    }

    /* ──────────────────────────────────────────────────────────
     *  AUTORES — CRUD
     * ────────────────────────────────────────────────────────── */

    public function authors(Request $request): JsonResponse
    {
        $query = Author::withCount('books');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('surname', 'ILIKE', "%{$search}%");
            });
        }

        $authors = $query->orderBy('name')->paginate(15);

        return response()->json([
            'data' => AuthorResource::collection($authors),
            'meta' => [
                'current_page' => $authors->currentPage(),
                'last_page' => $authors->lastPage(),
                'per_page' => $authors->perPage(),
                'total' => $authors->total(),
            ],
        ]);
    }

    public function authorShow(Author $author): JsonResponse
    {
        $author->load('country');
        return response()->json([
            'data' => new AuthorResource($author),
            'countries' => \App\Models\Country::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function authorSave(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:authors,id',
            'name' => 'required|string|max:255',
            'surname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'biography' => 'nullable|string',
            'country_id' => 'nullable|exists:countries,id',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $author = isset($validated['id']) ? Author::find($validated['id']) : new Author();

        $author->name = $validated['name'];
        $author->surname = $validated['surname'] ?? null;
        $author->birth_date = $validated['birth_date'] ?? null;
        $author->biography = $validated['biography'] ?? null;
        $author->country_id = $validated['country_id'] ?? null;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('authors', 'public');
            $author->photo_url = $path;
        }

        $author->save();

        return response()->json([
            'data' => new AuthorResource($author),
            'message' => '¡Autor guardado exitosamente!',
        ]);
    }

    public function authorDelete(Author $author): JsonResponse
    {
        $author->delete();
        return response()->json(['message' => '¡Autor eliminado exitosamente!']);
    }

    /* ──────────────────────────────────────────────────────────
     *  USUARIOS — Gestión
     * ────────────────────────────────────────────────────────── */

    public function users(Request $request): JsonResponse
    {
        $query = User::withCount(['reviews', 'lists', 'followers']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function userShow(User $user): JsonResponse
    {
        $user->loadCount(['reviews', 'lists', 'followers', 'following']);
        return response()->json(['data' => new UserResource($user)]);
    }

    public function userToggleBlock(User $user): JsonResponse
    {
        $user->is_blocked = !$user->is_blocked;
        $user->save();

        return response()->json([
            'is_blocked' => $user->is_blocked,
            'message' => $user->is_blocked
                ? 'Usuario bloqueado correctamente.'
                : 'Usuario desbloqueado correctamente.',
        ]);
    }

    public function userChangeRole(Request $request, User $user): JsonResponse
    {
        $request->validate(['type' => 'required|in:user,worker,admin']);
        $user->type = $request->type;
        $user->save();

        return response()->json([
            'type' => $user->type,
            'message' => "Rol cambiado a '{$user->type}' correctamente.",
        ]);
    }

    /* ──────────────────────────────────────────────────────────
     *  RESEÑAS — Moderación
     * ────────────────────────────────────────────────────────── */

    public function reviews(Request $request): JsonResponse
    {
        $reviews = Review::with(['user', 'book'])
            ->withCount('likes')
            ->latest()
            ->paginate(15);

        \App\Models\Review::preloadRatingRecords($reviews);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function reviewDelete(Review $review): JsonResponse
    {
        $review->delete();
        return response()->json(['message' => '¡Reseña eliminada por moderación!']);
    }

    /* ──────────────────────────────────────────────────────────
     *  LISTAS — Moderación
     * ────────────────────────────────────────────────────────── */

    public function lists(Request $request): JsonResponse
    {
        $query = FavList::with(['user'])->withCount(['books', 'likes']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'ILIKE', "%{$search}%")
                         ->orWhere('email', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $lists = $query->latest()->paginate(15);

        return response()->json([
            'data' => FavListResource::collection($lists),
            'meta' => [
                'current_page' => $lists->currentPage(),
                'last_page' => $lists->lastPage(),
                'per_page' => $lists->perPage(),
                'total' => $lists->total(),
            ],
        ]);
    }

    public function listDelete(FavList $list): JsonResponse
    {
        $list->delete();
        return response()->json(['message' => '¡Lista eliminada por moderación!']);
    }

    /* ──────────────────────────────────────────────────────────
     *  AUTOCOMPLETADO de autores (para el formulario de libros)
     * ────────────────────────────────────────────────────────── */

    public function authorSearch(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        // Búsqueda insensible a mayúsculas y acentos usando macros personalizadas
        $authors = Author::whereLikeAccentInsensitive('name', $query)
            ->orWhereLikeAccentInsensitive('surname', $query)
            ->limit(8)
            ->get(['id', 'name', 'surname'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'label' => trim("{$a->name} {$a->surname}"),
            ]);

        return response()->json(['data' => $authors]);
    }
}
