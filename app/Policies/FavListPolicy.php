<?php

namespace App\Policies;

use App\Models\FavList;
use App\Models\User;

/**
 * FavListPolicy — centraliza la autorización de operaciones sobre listas de favoritos.
 * Sustituye los checks inline `$list->user_id !== $request->user()->id`.
 */
class FavListPolicy
{
    /**
     * El usuario puede actualizar su propia lista.
     */
    public function update(User $user, FavList $list): bool
    {
        return $user->id === $list->user_id;
    }

    /**
     * El usuario puede eliminar su propia lista.
     * Los admins y workers también pueden eliminar cualquier lista.
     */
    public function delete(User $user, FavList $list): bool
    {
        return $user->id === $list->user_id
            || in_array($user->type, ['admin', 'worker']);
    }

    /**
     * El usuario puede modificar los libros de su propia lista.
     */
    public function attachBook(User $user, FavList $list): bool
    {
        return $user->id === $list->user_id;
    }

    /**
     * Cualquier usuario autenticado puede dar like a una lista.
     */
    public function toggleLike(User $user, FavList $list): bool
    {
        return true;
    }
}
