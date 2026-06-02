<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthorResource extends JsonResource
{
    /**
     * Transforma el recurso autor en un array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'surname' => $this->surname,
            'full_name' => trim($this->name . ' ' . $this->surname),
            'birth_date' => $this->birth_date,
            'biography' => $this->biography,
            'photo' => $this->photo,
            'photo_url' => $this->photo_url,

            // Relaciones opcionales
            'country' => new CountryResource($this->whenLoaded('country')),
            'books' => BookResource::collection($this->whenLoaded('books')),

            // Contadores (solo cuando están cargados)
            'books_count' => $this->when(isset($this->books_count), $this->books_count),
            'followers_count' => $this->when(isset($this->followers_count), $this->followers_count),

            // Estado del usuario autenticado
            'is_followed' => $this->when(isset($this->is_followed), $this->is_followed),

            'average_rating' => isset($this->average_rating) ? (float) $this->average_rating : null,
        ];
    }
}
