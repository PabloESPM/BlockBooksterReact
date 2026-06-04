<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateReviewRequest — valida la actualización de una reseña existente.
 * HAL-QA-01: centraliza validación fuera del controlador.
 */
class UpdateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title'  => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'numeric', 'min:1', 'max:5'],
            'body'   => ['required', 'string', 'max:1000'],
        ];
    }
}
