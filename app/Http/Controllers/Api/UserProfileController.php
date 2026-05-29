<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\FavListResource;
use App\Http\Resources\BookResource;
use App\Http\Resources\AuthorResource;
use App\Models\User;
use App\Models\BookUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    /**
     * Perfil público de un usuario con lógica de visibilidad.
     * Replica exactamente la lógica de UserProfileController@show original.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $viewer = $request->user();
        $isOwner = $viewer && $viewer->id === $user->id;

        // Determinar si el visitante puede ver el contenido completo
        $canViewContent = match ($user->profile_visibility) {
            'public' => true,
            'followers' => $isOwner || ($viewer && $viewer->isFollowing($user)),
            'friends' => $isOwner || ($viewer && $viewer->isFriend($user)),
            'private' => $isOwner,
            default => true,
        };

        $user->load('country');
        $user->loadCount(['followers', 'following', 'reviews', 'lists']);

        // Estado de follow del visitante
        if ($viewer && !$isOwner) {
            $user->is_following = $viewer->isFollowing($user);
        }

        // Estadísticas de lectura
        $readCount = $user->books()->where('status', 'read')->count();
        $readingCount = $user->books()->where('status', 'reading')->count();
        $pendingCount = $user->books()->where('status', 'pending')->count();

        return response()->json([
            'data' => new UserResource($user),
            'can_view_content' => $canViewContent,
            'is_owner' => $isOwner,
            'book_stats' => [
                'read' => $readCount,
                'reading' => $readingCount,
                'pending' => $pendingCount,
            ],
        ]);
    }

    /**
     * Libros del usuario por estado (paginados).
     */
    public function books(Request $request, User $user): JsonResponse
    {
        if (!$this->canViewUserProfile($user, $request->user())) {
            return response()->json(['message' => 'Este perfil es privado.'], 403);
        }

        $status = $request->input('status', 'read');
        $books = $user->books()
            ->where('status', $status)
            ->with('book.authors')
            ->paginate(6);

        // Transformar BookUser -> Book con datos de estado
        $transformed = $books->through(function ($bookUser) {
            $book = $bookUser->book;
            $book->user_book_status = [
                'status' => $bookUser->status,
                'rating' => $bookUser->rating,
                'started_at' => $bookUser->started_at?->toISOString(),
                'finished_at' => $bookUser->finished_at?->toISOString(),
            ];
            return $book;
        });

        return response()->json([
            'data' => BookResource::collection($transformed),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    /**
     * Reseñas del usuario (paginadas).
     */
    public function reviews(Request $request, User $user): JsonResponse
    {
        if (!$this->canViewUserProfile($user, $request->user())) {
            return response()->json(['message' => 'Este perfil es privado.'], 403);
        }

        $reviews = $user->reviews()
            ->with(['book', 'likes'])
            ->withCount('likes')
            ->latest()
            ->paginate(5);

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

    /**
     * Listas del usuario con lógica de visibilidad.
     */
    public function lists(Request $request, User $user): JsonResponse
    {
        if (!$this->canViewUserProfile($user, $request->user())) {
            return response()->json(['message' => 'Este perfil es privado.'], 403);
        }

        $viewer = $request->user();
        $isOwner = $viewer && $viewer->id === $user->id;

        $query = $user->lists()
            ->with(['likes', 'user'])
            ->withCount(['books', 'likes']);

        // Aplicar filtros de visibilidad
        if (!$isOwner) {
            if ($viewer && $viewer->isFriend($user)) {
                $query->whereIn('visibility', ['public', 'followers', 'friends']);
            } elseif ($viewer && $viewer->isFollowing($user)) {
                $query->whereIn('visibility', ['public', 'followers']);
            } else {
                $query->where('visibility', 'public');
            }
        }

        $lists = $query->paginate(6);

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
     * Seguidores del usuario (paginados).
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        if (!$this->canViewUserProfile($user, $request->user())) {
            return response()->json(['message' => 'Este perfil es privado.'], 403);
        }

        $followers = $user->followers()
            ->with('follower')
            ->paginate(10);

        $users = $followers->through(fn ($follow) => $follow->follower);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $followers->currentPage(),
                'last_page' => $followers->lastPage(),
                'per_page' => $followers->perPage(),
                'total' => $followers->total(),
            ],
        ]);
    }

    /**
     * Usuarios seguidos por el usuario (paginados).
     */
    public function following(Request $request, User $user): JsonResponse
    {
        if (!$this->canViewUserProfile($user, $request->user())) {
            return response()->json(['message' => 'Este perfil es privado.'], 403);
        }

        $following = $user->following()
            ->with('followed')
            ->paginate(10);

        $users = $following->through(fn ($follow) => $follow->followed);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $following->currentPage(),
                'last_page' => $following->lastPage(),
                'per_page' => $following->perPage(),
                'total' => $following->total(),
            ],
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
