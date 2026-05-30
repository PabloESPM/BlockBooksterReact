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
     * Replica la lógica de UserController@community original.
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
            foreach ($mostFollowed as $user) {
                $user->is_following = $user->id === $viewer->id ? false : $viewer->isFollowing($user);
            }
            foreach ($topCurators as $user) {
                $user->is_following = $user->id === $viewer->id ? false : $viewer->isFollowing($user);
            }
            foreach ($mostActive as $user) {
                $user->is_following = $user->id === $viewer->id ? false : $viewer->isFollowing($user);
            }
        }

        return response()->json([
            'most_followed' => UserResource::collection($mostFollowed),
            'top_curators' => UserResource::collection($topCurators),
            'most_active' => UserResource::collection($mostActive),
        ]);
    }
}
