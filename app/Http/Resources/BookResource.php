<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transforma el recurso libro en un array.
     * Incluye relaciones anidadas cuando están cargadas.
     */
    public function toArray(Request $request): array
    {
        return [
            'isbn' => $this->isbn,
            'title' => $this->title,
            'synopsis' => $this->description,
            'publication_year' => $this->publication_year,
            'number_of_pages' => $this->number_of_pages,
            'cover_image' => $this->cover_image,
            'cover_path' => $this->cover_path,

            // Relaciones (solo cuando están cargadas)
            'authors' => AuthorResource::collection($this->whenLoaded('authors')),
            'genre' => new GenreResource($this->whenLoaded('genre')),
            'language' => new LanguageResource($this->whenLoaded('language')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'purchases' => PurchaseResource::collection($this->whenLoaded('purchases')),

            // Estadísticas (solo cuando están calculadas)
            'average_rating' => $this->when(
                isset($this->average_rating),
                fn () => round((float) $this->average_rating, 1)
            ),
            'reviews_count' => $this->when(isset($this->reviews_count), $this->reviews_count),
            'users_count' => $this->when(isset($this->users_count), $this->users_count),

            // Estado del usuario autenticado respecto a este libro
            'user_book' => $this->when(
                isset($this->user_book_status),
                $this->user_book_status
            ),

            'user_review' => $this->relationLoaded('reviews')
                ? new \App\Http\Resources\ReviewResource($this->reviews->where('user_id', optional($request->user())->id)->first())
                : ($request->user()
                    ? new \App\Http\Resources\ReviewResource(\App\Models\Review::where('user_id', $request->user()->id)->where('book_isbn', $this->isbn)->first())
                    : null),

        ];
    }
}
