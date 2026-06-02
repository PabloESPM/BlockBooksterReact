<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GenreResource extends JsonResource
{
    /**
     * Transforma el recurso género en un array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'books_count' => $this->when(isset($this->books_count), $this->books_count),
            'top_books' => BookResource::collection($this->when(isset($this->top_books), $this->top_books)),
        ];
    }
}
