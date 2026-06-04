<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DestroyAccountRequest;
use App\Http\Requests\UpdateSettingsRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\FavListResource;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\BookResource;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller
{
    /**
     * Estadísticas principales y colecciones del dashboard del usuario.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // HAL-PERF-03: Consolida 7 queries de conteo en una sola llamada loadCount
        $user->loadCount([
            'reviews',
            'lists',
            'followers',
            'following',
            'books as read_books_count'    => fn ($q) => $q->where('status', 'read'),
            'books as reading_books_count' => fn ($q) => $q->where('status', 'reading'),
            'books as pending_books_count' => fn ($q) => $q->where('status', 'pending'),
        ]);

        $stats = [
            'read_books'    => $user->read_books_count,
            'reading_books' => $user->reading_books_count,
            'pending_books' => $user->pending_books_count,
            'lists'         => $user->lists_count,
            'reviews'       => $user->reviews_count,
            'followers'     => $user->followers_count,
            'following'     => $user->following_count,
        ];

        // HAL-PERF-03: Una sola query por coleccion usando eager loading
        $librosEnLectura = $user->books()
            ->with(['book.authors'])
            ->where('status', 'reading')
            ->orderByDesc('started_at')
            ->orderByDesc('id')
            ->get();

        $actividadReciente = $user->books()
            ->with('book')
            ->whereIn('status', ['read', 'reading'])
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $librosParaLeerColeccion = $user->books()
            ->with('book.authors')
            ->where('status', 'pending')
            ->orderByDesc('id')
            ->limit(6)
            ->get();

        $librosLeidosColeccion = $user->books()
            ->with('book.authors')
            ->where('status', 'read')
            ->orderByDesc('finished_at')
            ->orderByDesc('id')
            ->limit(6)
            ->get();

        $formatBookUser = function ($item) {
            return [
                'id'          => $item->id,
                'status'      => $item->status,
                'started_at'  => $item->started_at?->toIso8601String(),
                'finished_at' => $item->finished_at?->toIso8601String(),
                'book'        => $item->book ? new BookResource($item->book) : null,
            ];
        };

        return response()->json([
            'stats'              => $stats,
            'reading_books'      => $librosEnLectura->map($formatBookUser),
            'recent_activity'    => $actividadReciente->map($formatBookUser),
            'pending_collection' => $librosParaLeerColeccion->map($formatBookUser),
            'read_collection'    => $librosLeidosColeccion->map($formatBookUser),
        ]);
    }

    /**
     * Datos del perfil del usuario para el formulario de edición.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('country');

        return response()->json([
            'data' => new UserResource($user),
            'countries' => Country::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Actualizar perfil (nombre, bio, país, avatar).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'country_id' => 'nullable|exists:countries,id',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ], [
            'name.required' => 'El nombre de usuario es obligatorio.',
            'name.max' => 'El nombre no puede superar los 255 caracteres.',
            'bio.max' => 'La biografía no puede superar los 1000 caracteres.',
            'country_id.exists' => 'El país seleccionado no es válido.',
            'avatar.image' => 'El archivo debe ser una imagen.',
            'avatar.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif o webp.',
            'avatar.max' => 'La imagen no debe superar los 3 MB.',
        ]);

        // Procesar avatar si se ha subido
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('userimg', 'public');
            $user->avatar = $path;
        }

        $user->name = $validated['name'];
        $user->bio = $validated['bio'];
        $user->country_id = $validated['country_id'];
        $user->save();

        return response()->json([
            'data' => new UserResource($user->fresh('country')),
            'message' => 'Perfil actualizado correctamente.',
        ]);
    }

    /**
     * Listas del usuario autenticado (creadas y seguidas).
     */
    public function lists(Request $request): JsonResponse
    {
        $user = $request->user();

        $createdLimit = (int) $request->input('created_limit', 6);
        $followedLimit = (int) $request->input('followed_limit', 6);

        // --- Listas CREADAS por el usuario ---
        $createdLists = $user->lists()
            ->with(['user', 'books', 'likes'])
            ->withCount(['likes', 'books'])
            ->latest()
            ->take($createdLimit)
            ->get();

        $totalCreated = $user->lists()->count();
        $hasMoreCreated = $totalCreated > $createdLimit;

        // --- Listas SEGUIDAS (liked) por el usuario ---
        $followedLists = $user->likedLists()
            ->with(['user', 'books', 'likes'])
            ->withCount(['books', 'likes'])
            ->latest('list_likes.created_at')
            ->take($followedLimit)
            ->get();

        $totalFollowed = $user->likedLists()->count();
        $hasMoreFollowed = $totalFollowed > $followedLimit;

        return response()->json([
            'created' => FavListResource::collection($createdLists),
            'total_created' => $totalCreated,
            'has_more_created' => $hasMoreCreated,

            'followed' => FavListResource::collection($followedLists),
            'total_followed' => $totalFollowed,
            'has_more_followed' => $hasMoreFollowed,
        ]);
    }

    /**
     * Reseñas del usuario autenticado.
     */
    public function reviews(Request $request): JsonResponse
    {
        $reviews = $request->user()->reviews()
            ->with(['book.authors', 'likes'])
            ->withCount('likes')
            ->latest()
            ->get();

        \App\Models\Review::preloadRatingRecords($reviews);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
        ]);
    }

    /**
     * Datos sociales: seguidores, seguidos, autores seguidos con soporte de paginación/límites.
     */
    public function social(Request $request): JsonResponse
    {
        $user = $request->user();

        $authorsLimit  = (int) $request->input('authors_limit', 8);
        $followingLimit = (int) $request->input('following_limit', 8);
        $followersLimit = (int) $request->input('followers_limit', 8);

        // 1. Autores seguidos
        $followedAuthors = $user->followedAuthors()
            ->withCount('books')
            ->latest('author_followers.created_at')
            ->take($authorsLimit)
            ->get();
        $followedAuthors->each(fn ($a) => $a->is_followed = true);
        $totalAuthors   = $user->followedAuthors()->count();
        $hasMoreAuthors = $totalAuthors > $authorsLimit;

        // 2. Usuarios que sigo
        $followingRecords = $user->following()
            ->with(['followed' => fn ($q) => $q->withCount(['followers', 'books'])])
            ->latest()
            ->take($followingLimit)
            ->get();
        $followingUsers = $followingRecords->pluck('followed')->filter()->values();
        $followingUsers->each(fn ($u) => $u->is_following = true);
        $totalFollowing  = $user->following()->count();
        $hasMoreFollowing = $totalFollowing > $followingLimit;

        // 3. Seguidores — HAL-PERF-04: pre-carga followedIds en memoria para evitar N+1
        $followersRecords = $user->followers()
            ->with(['follower' => fn ($q) => $q->withCount(['followers', 'books'])])
            ->latest()
            ->take($followersLimit)
            ->get();
        $followerUsers = $followersRecords->pluck('follower')->filter()->values();

        // Pre-cargar IDs seguidos en un solo query y resolver en memoria
        $followedIds = $followingRecords->pluck('followed_id')->toArray();
        $followerUsers->each(fn ($u) => $u->is_following = in_array($u->id, $followedIds));

        $totalFollowers  = $user->followers()->count();
        $hasMoreFollowers = $totalFollowers > $followersLimit;

        return response()->json([
            'followed_authors'  => AuthorResource::collection($followedAuthors),
            'total_authors'     => $totalAuthors,
            'has_more_authors'  => $hasMoreAuthors,

            'following'         => UserResource::collection($followingUsers),
            'following_count'   => $totalFollowing,
            'has_more_following' => $hasMoreFollowing,

            'followers'         => UserResource::collection($followerUsers),
            'followers_count'   => $totalFollowers,
            'has_more_followers' => $hasMoreFollowers,
        ]);
    }

    /**
     * Datos de configuración de la cuenta.
     */
    public function settings(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    /**
     * Actualizar email, teléfono y/o contraseña.
     * HAL-AUTH-04: exige current_password antes de modificar credenciales sensibles.
     */
    public function updateSettings(UpdateSettingsRequest $request): JsonResponse
    {
        $user      = $request->user();
        $validated = $request->validated();

        $user->email     = $validated['email'];
        $user->telephone = $validated['telephone'] ?? $user->telephone;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'data'    => new UserResource($user),
            'message' => 'Credenciales actualizadas correctamente.',
        ]);
    }

    /**
     * Actualizar visibilidad del perfil (privacidad).
     */
    public function updatePrivacy(Request $request): JsonResponse
    {
        $request->validate([
            'profile_visibility' => 'required|in:public,followers,friends,private',
        ]);

        $request->user()->update([
            'profile_visibility' => $request->profile_visibility,
        ]);

        return response()->json([
            'message' => 'Preferencias de privacidad guardadas correctamente.',
        ]);
    }

    /**
     * Eliminar permanentemente la cuenta del usuario.
     * HAL-AUTH-03: exige current_password para confirmar la identidad del propietario.
     */
    public function destroyAccount(DestroyAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $user->delete();

        return response()->json([
            'message' => 'Tu cuenta ha sido eliminada permanentemente.',
        ]);
    }
}
