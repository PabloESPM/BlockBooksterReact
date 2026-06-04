<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateListRequest — valida la actualización de una lista de favoritos.
 * HAL-QA-01: centraliza validación fuera del controlador.
 */
class UpdateListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'visibility'  => ['required', 'in:public,private,friends'],
        ];
    }
}
