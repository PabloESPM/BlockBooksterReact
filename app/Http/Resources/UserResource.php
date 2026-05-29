<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->when(
                $this->isCurrentUser($request),
                $this->email
            ),
            'telephone' => $this->when(
                $this->isCurrentUser($request),
                $this->telephone
            ),
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'location' => $this->location,
            'website' => $this->website,
            'twitter' => $this->twitter,
            'date_of_birth' => $this->when(
                $this->isCurrentUser($request),
                $this->date_of_birth
            ),
            'gender' => $this->when(
                $this->isCurrentUser($request),
                $this->gender
            ),
            'country' => $this->whenLoaded('country', function () {
                return [
                    'id' => $this->country->id,
                    'name' => $this->country->name,
                    'iso_code' => $this->country->iso_code,
                ];
            }),
            'country_id' => $this->when(
                $this->isCurrentUser($request),
                $this->country_id
            ),
            'type' => $this->type,
            'profile_visibility' => $this->profile_visibility,
            'is_blocked' => $this->when(
                $request->user()?->type === 'admin',
                $this->is_blocked
            ),
            'created_at' => $this->created_at?->toISOString(),

            // Counts — only included when loaded
            'followers_count' => $this->when(isset($this->followers_count), $this->followers_count),
            'following_count' => $this->when(isset($this->following_count), $this->following_count),
            'reviews_count' => $this->when(isset($this->reviews_count), $this->reviews_count),
            'lists_count' => $this->when(isset($this->lists_count), $this->lists_count),

            // Relationship flags — only when explicitly set
            'is_following' => $this->when(isset($this->is_following), $this->is_following),
        ];
    }

    /**
     * Comprueba si el recurso es el usuario actual o si el solicitante es admin.
     * Los campos privados (email, teléfono, etc.) se muestran al dueño y a los admins.
     */
    private function isCurrentUser(Request $request): bool
    {
        $user = $request->user();
        return $user?->id === $this->id
            || in_array($user?->type, ['admin', 'worker']);
    }
}
