<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * StoreReviewRequest — valida la creación de una nueva reseña.
 * HAL-QA-01: centraliza validación fuera del controlador.
 */
class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'book_isbn' => ['required', 'string', 'exists:books,isbn'],
            'title'     => ['nullable', 'string', 'max:255'],
            'rating'    => ['required', 'numeric', 'min:1', 'max:5'],
            'body'      => ['required', 'string', 'max:1000'],
        ];
    }
}
