<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FavListResource;
use App\Http\Resources\BookResource;
use App\Models\FavList;
use App\Models\ListLike;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListController extends Controller
{
    /**
     * Listado de listas públicas con paginación.
     */
    public function index(Request $request): JsonResponse
    {
        $lists = FavList::where('visibility', 'public')
            ->with([
                'user',
                'likes',
                'books' => fn ($q) => $q->take(4), // Vista previa de portadas
            ])
            ->withCount(['books', 'likes'])
            ->latest()
            ->paginate(12);

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

    /**
     * Detalle de una lista con todos sus libros.
     */
    public function show(Request $request, FavList $list): JsonResponse
    {
        $viewer = $request->user();
        $owner = $list->user;

        // 1. Verificar si el creador de la lista tiene perfil privado y el visitante puede ver su perfil
        if (!$this->canViewUserProfile($owner, $viewer)) {
            abort(403, 'No tienes permiso para ver esta lista.');
        }

        // 2. Verificar la visibilidad de la propia lista
        $isOwner = $viewer && $viewer->id === $list->user_id;
        $canView = false;

        if ($list->visibility === 'public') {
            $canView = true;
        } elseif ($list->visibility === 'private') {
            $canView = $isOwner;
        } elseif ($list->visibility === 'friends') {
            $canView = $isOwner || ($viewer && $viewer->isFriend($owner));
        }

        if (!$canView) {
            abort(403, 'No tienes permiso para ver esta lista.');
        }

        $list->load(['user', 'books.authors', 'likes']);
        $list->loadCount(['books', 'likes']);

        return response()->json([
            'data' => new FavListResource($list),
        ]);
    }

    /**
     * Crear una nueva lista.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['required', 'in:public,private,friends'],
        ]);

        $list = $request->user()->lists()->create($validated);

        return response()->json([
            'data' => new FavListResource($list),
            'message' => '¡Lista creada correctamente!',
        ], 201);
    }

    /**
     * Actualizar una lista existente.
     */
    public function update(Request $request, FavList $list): JsonResponse
    {
        if ($list->user_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para editar esta lista.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['required', 'in:public,private,friends'],
        ]);

        $list->update($validated);

        return response()->json([
            'data' => new FavListResource($list->fresh()),
            'message' => '¡Lista actualizada correctamente!',
        ]);
    }

    /**
     * Eliminar una lista.
     */
    public function destroy(Request $request, FavList $list): JsonResponse
    {
        if ($list->user_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para eliminar esta lista.');
        }

        $list->delete();

        return response()->json([
            'message' => '¡Lista eliminada correctamente!',
        ]);
    }

    /**
     * Añadir un libro a una lista.
     */
    public function attachBook(Request $request, FavList $list): JsonResponse
    {
        if ($list->user_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para modificar esta lista.');
        }

        $request->validate([
            'book_isbn' => 'required|exists:books,isbn',
        ]);

        $bookIsbn = $request->input('book_isbn');

        if ($list->books()->where('book_isbn', $bookIsbn)->exists()) {
            return response()->json([
                'message' => 'El libro ya está en esta lista.',
            ], 409);
        }

        $list->books()->attach($bookIsbn, ['added_at' => now()]);

        return response()->json([
            'message' => '¡Libro añadido a la lista correctamente!',
        ]);
    }

    /**
     * Crear lista y añadir un libro inmediatamente.
     */
    public function storeAndAttach(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['required', 'in:public,private,friends'],
            'book_isbn' => 'required|exists:books,isbn',
        ]);

        $list = $request->user()->lists()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'],
        ]);

        $list->books()->attach($validated['book_isbn'], ['added_at' => now()]);

        return response()->json([
            'data' => new FavListResource($list),
            'message' => '¡Lista creada y libro añadido correctamente!',
        ], 201);
    }

    /**
     * Toggle like de una lista.
     */
    public function toggleLike(Request $request, FavList $list): JsonResponse
    {
        $user = $request->user();
        $like = ListLike::where('user_id', $user->id)
            ->where('list_id', $list->id)
            ->first();

        if ($like) {
            $like->delete();
            $status = 'unliked';
        } else {
            ListLike::create([
                'user_id' => $user->id,
                'list_id' => $list->id,
            ]);
            $status = 'liked';
        }

        return response()->json([
            'status' => $status,
            'likes_count' => $list->likes()->count(),
        ]);
    }

    /**
     * Comprueba si el visitante tiene permiso para ver el contenido del perfil de un usuario.
     */
    private function canViewUserProfile(User $user, ?User $viewer): bool
    {
        $isOwner = $viewer && $viewer->id === $user->id;

        return match ($user->profile_visibility) {
            'public' => true,
            'followers' => $isOwner || ($viewer && $viewer->isFollowing($user)),
            'friends' => $isOwner || ($viewer && $viewer->isFriend($user)),
            'private' => (bool)$isOwner,
            default => true,
        };
    }
}
