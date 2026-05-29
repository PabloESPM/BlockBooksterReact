<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\FavList;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    /**
     * Toggle seguir/dejar de seguir a un usuario.
     */
    public function toggleUser(User $user): JsonResponse
    {
        $auth = Auth::user();

        if ($auth->id === $user->id) {
            return response()->json(['error' => 'No puedes seguirte a ti mismo.'], 403);
        }

        if ($auth->isFollowing($user)) {
            $auth->unfollow($user);
            $following = false;
        } else {
            $auth->follow($user);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'followers_count' => $user->followers()->count(),
        ]);
    }

    /**
     * Toggle seguir/dejar de seguir a un autor.
     */
    public function toggleAuthor(Author $author): JsonResponse
    {
        $auth = Auth::user();

        if ($auth->isFollowingAuthor($author)) {
            $auth->unfollowAuthor($author);
            $following = false;
        } else {
            $auth->followAuthor($author);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'followers_count' => $author->followers()->count(),
        ]);
    }

    /**
     * Toggle seguir/dejar de seguir una lista (like).
     */
    public function toggleList(FavList $list): JsonResponse
    {
        $auth = Auth::user();

        if ($auth->isFollowingList($list)) {
            $auth->unfollowList($list);
            $following = false;
        } else {
            $auth->followList($list);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'likes_count' => $list->likes()->count(),
        ]);
    }
}
