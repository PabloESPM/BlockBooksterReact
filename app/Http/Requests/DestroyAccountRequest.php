<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * DestroyAccountRequest — valida la eliminación permanente de cuenta.
 * HAL-AUTH-03: exige current_password antes de eliminar la cuenta.
 * HAL-QA-01: centraliza validación fuera del controlador.
 */
class DestroyAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'current_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required'         => 'Debes confirmar tu contraseña para eliminar la cuenta.',
            'current_password.current_password' => 'La contraseña introducida no es correcta.',
        ];
    }
}
