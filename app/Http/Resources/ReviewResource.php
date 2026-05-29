<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transforma el recurso reseña en un array.
     */
    public function toArray(Request $request): array
    {
        $authUser = $request->user();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'rating' => $this->rating, // Accessor del modelo (lee de book_user)
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Usuario autor de la reseña
            'user' => new UserResource($this->whenLoaded('user')),

            // Libro reseñado
            'book' => new BookResource($this->whenLoaded('book')),
            'book_isbn' => $this->book_isbn,

            // Likes
            'likes_count' => $this->when(isset($this->likes_count), $this->likes_count),
            'is_liked' => $this->when(
                $authUser !== null,
                fn () => $this->likes->contains('user_id', $authUser?->id)
            ),

            // Propiedad del usuario autenticado
            'is_owner' => $this->when(
                $authUser !== null,
                fn () => $this->user_id === $authUser?->id
            ),
        ];
    }
}
