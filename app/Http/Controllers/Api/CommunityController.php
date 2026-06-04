<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class CommunityController extends Controller
{
    /**
     * Rankings de la comunidad: más seguidos, mejores curadores, más activos.
     *
     * HAL-PERF-02: Sustituye los bucles con isFollowing() (N+1 queries) por
     * una única query pre-cargando followedIds y resolviendo en memoria.
     */
    public function index(): JsonResponse
    {
        // Más seguidos: usuarios con más seguidores
        $mostFollowed = User::where('profile_visibility', 'public')
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->take(5)
            ->get();

        // Mejores curadores: usuarios con más listas
        $topCurators = User::where('profile_visibility', 'public')
            ->withCount('lists')
            ->orderBy('lists_count', 'desc')
            ->take(5)
            ->get();

        // Más activos: usuarios con más reseñas
        $mostActive = User::where('profile_visibility', 'public')
            ->withCount('reviews')
            ->orderBy('reviews_count', 'desc')
            ->take(5)
            ->get();

        $viewer = auth('sanctum')->user();
        if ($viewer) {
            // HAL-PERF-02: Pre-cargar IDs seguidos en UNA sola query → resolver en memoria
            // Evita hasta 15 queries de isFollowing() en los tres bucles
            $followedIds = $viewer->following()->pluck('followed_id')->toArray();

            $allUsers = $mostFollowed->merge($topCurators)->merge($mostActive)->unique('id');
            foreach ($allUsers as $user) {
                $user->is_following = $user->id === $viewer->id
                    ? false
                    : in_array($user->id, $followedIds);
            }
        }

        return response()->json([
            'most_followed' => UserResource::collection($mostFollowed),
            'top_curators'  => UserResource::collection($topCurators),
            'most_active'   => UserResource::collection($mostActive),
        ]);
    }
}
