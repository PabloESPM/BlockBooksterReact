<?php

namespace App\Traits;

use App\Models\User;

/**
 * ChecksProfileVisibility — lógica centralizada para verificar acceso a perfiles de usuario.
 *
 * Extrae la lógica duplicada que existía en UserProfileController y ListController.
 * HAL-AUTH-02: Elimina la duplicación de canViewUserProfile() en dos controladores.
 */
trait ChecksProfileVisibility
{
    /**
     * Comprueba si el visitante tiene permiso para ver el contenido del perfil de un usuario.
     *
     * @param  User       $user    El propietario del perfil
     * @param  User|null  $viewer  El visitante (puede ser null si no está autenticado)
     * @return bool
     */
    protected function canViewUserProfile(User $user, ?User $viewer): bool
    {
        $isOwner = $viewer && $viewer->id === $user->id;

        return match ($user->profile_visibility) {
            'public'    => true,
            'followers' => $isOwner || ($viewer && $viewer->isFollowing($user)),
            'friends'   => $isOwner || ($viewer && $viewer->isFriend($user)),
            'private'   => (bool) $isOwner,
            default     => true,
        };
    }
}
