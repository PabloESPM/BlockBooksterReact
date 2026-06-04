<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

/**
 * ReviewPolicy — centraliza la autorización de operaciones sobre reseñas.
 * Sustituye los checks inline `$review->user_id !== $request->user()->id`.
 */
class ReviewPolicy
{
    /**
     * El usuario puede actualizar su propia reseña.
     */
    public function update(User $user, Review $review): bool
    {
        return $user->id === $review->user_id;
    }

    /**
     * El usuario puede eliminar su propia reseña.
     * Los admins y workers también pueden eliminar cualquier reseña.
     */
    public function delete(User $user, Review $review): bool
    {
        return $user->id === $review->user_id
            || in_array($user->type, ['admin', 'worker']);
    }

    /**
     * Cualquier usuario autenticado puede dar like a una reseña.
     */
    public function toggleLike(User $user, Review $review): bool
    {
        return true;
    }
}
