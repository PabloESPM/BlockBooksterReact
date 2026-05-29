<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FavListResource extends JsonResource
{
    /**
     * Transforma el recurso lista de favoritos en un array.
     */
    public function toArray(Request $request): array
    {
        $authUser = $request->user();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Propietario de la lista
            'user' => new UserResource($this->whenLoaded('user')),

            // Libros de la lista
            'books' => BookResource::collection($this->whenLoaded('books')),

            // Contadores
            'books_count' => $this->when(isset($this->books_count), $this->books_count),
            'likes_count' => $this->when(isset($this->likes_count), $this->likes_count),

            // Estado del usuario autenticado
            'is_liked' => $this->when(
                $authUser !== null && $this->relationLoaded('likes'),
                fn () => $this->likes->contains('user_id', $authUser?->id)
            ),
            'is_owner' => $this->when(
                $authUser !== null,
                fn () => $this->user_id === $authUser?->id
            ),
        ];
    }
}
