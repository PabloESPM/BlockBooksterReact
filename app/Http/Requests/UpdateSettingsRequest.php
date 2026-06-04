<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateSettingsRequest — valida el cambio de credenciales (email/password).
 * HAL-AUTH-04: exige current_password para modificar credenciales sensibles.
 * HAL-QA-01: centraliza validación fuera del controlador.
 */
class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'current_password' => ['required', 'string', 'current_password'],
            'email'            => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'telephone'        => ['nullable', 'string', 'max:20'],
            'password'         => ['nullable', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required'    => 'Debes confirmar tu contraseña actual.',
            'current_password.current_password' => 'La contraseña actual no es correcta.',
            'email.required'               => 'El correo electrónico es obligatorio.',
            'email.email'                  => 'Introduce un correo electrónico válido.',
            'email.unique'                 => 'Este correo electrónico ya está en uso por otra cuenta.',
            'password.min'                 => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'           => 'Las contraseñas no coinciden.',
        ];
    }
}
