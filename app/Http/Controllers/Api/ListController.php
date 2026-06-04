<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreListRequest;
use App\Http\Requests\UpdateListRequest;
use App\Http\Resources\FavListResource;
use App\Models\FavList;
use App\Models\ListLike;
use App\Traits\ChecksProfileVisibility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListController extends Controller
{
    // HAL-AUTH-02: Trait centralizado que elimina la duplicación de canViewUserProfile()
    use ChecksProfileVisibility;

    /**
     * Listado de listas públicas con paginación.
     */
    public function index(Request $request): JsonResponse
    {
        $lists = FavList::where('visibility', 'public')
            ->with([
                'user',
                'likes',
                'books' => fn($q) => $q->take(4),
            ])
            ->withCount(['books', 'likes'])
            ->latest()
            ->paginate(12);

        return response()->json([
            'data' => FavListResource::collection($lists),
            'meta' => [
                'current_page' => $lists->currentPage(),
                'last_page'    => $lists->lastPage(),
                'per_page'     => $lists->perPage(),
                'total'        => $lists->total(),
            ],
        ]);
    }

    /**
     * Detalle de una lista con todos sus libros.
     */
    public function show(Request $request, FavList $list): JsonResponse
    {
        $viewer = $request->user();
        $owner  = $list->user;

        // Verificar visibilidad del perfil del propietario (Trait centralizado)
        if (!$this->canViewUserProfile($owner, $viewer)) {
            abort(403, 'No tienes permiso para ver esta lista.');
        }

        $isOwner = $viewer && $viewer->id === $list->user_id;
        $canView = match ($list->visibility) {
            'public'  => true,
            'private' => $isOwner,
            'friends' => $isOwner || ($viewer && $viewer->isFriend($owner)),
            default   => false,
        };

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
     * HAL-QA-01: validación centralizada en StoreListRequest.
     */
    public function store(StoreListRequest $request): JsonResponse
    {
        $list = $request->user()->lists()->create($request->validated());

        return response()->json([
            'data'    => new FavListResource($list),
            'message' => '¡Lista creada correctamente!',
        ], 201);
    }

    /**
     * Actualizar una lista existente.
     * HAL-SEC-04: autorización via FavListPolicy.
     * HAL-QA-01: validación centralizada en UpdateListRequest.
     */
    public function update(UpdateListRequest $request, FavList $list): JsonResponse
    {
        // HAL-SEC-04: Policy centralizada
        $this->authorize('update', $list);

        $list->update($request->validated());

        return response()->json([
            'data'    => new FavListResource($list->fresh()),
            'message' => '¡Lista actualizada correctamente!',
        ]);
    }

    /**
     * Eliminar una lista.
     * HAL-SEC-04: autorización via FavListPolicy.
     */
    public function destroy(Request $request, FavList $list): JsonResponse
    {
        $this->authorize('delete', $list);

        $list->delete();

        return response()->json([
            'message' => '¡Lista eliminada correctamente!',
        ]);
    }

    /**
     * Añadir un libro a una lista.
     * HAL-SEC-04: autorización via FavListPolicy.
     */
    public function attachBook(Request $request, FavList $list): JsonResponse
    {
        $this->authorize('attachBook', $list);

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
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'visibility'  => ['required', 'in:public,private,friends'],
            'book_isbn'   => 'required|exists:books,isbn',
        ]);

        $list = $request->user()->lists()->create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'visibility'  => $validated['visibility'],
        ]);

        $list->books()->attach($validated['book_isbn'], ['added_at' => now()]);

        return response()->json([
            'data'    => new FavListResource($list),
            'message' => '¡Lista creada y libro añadido correctamente!',
        ], 201);
    }

    /**
     * Toggle like de una lista.
     * HAL-SEC-04: autorización via FavListPolicy.
     */
    public function toggleLike(Request $request, FavList $list): JsonResponse
    {
        $this->authorize('toggleLike', $list);

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
            'status'      => $status,
            'likes_count' => $list->likes()->count(),
        ]);
    }
}
