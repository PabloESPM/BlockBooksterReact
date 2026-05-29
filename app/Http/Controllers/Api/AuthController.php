<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Country;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inicia sesión y devuelve el usuario autenticado.
     * Sanctum gestiona la sesión mediante cookies (stateful).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas no coinciden con nuestros registros.'],
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        // Verificar si la cuenta está bloqueada
        if ($user->is_blocked) {
            Auth::guard('web')->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            throw ValidationException::withMessages([
                'email' => ['Tu cuenta ha sido bloqueada. Por favor, contacta con soporte para obtener más información.'],
            ]);
        }

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Sesión iniciada correctamente.',
        ]);
    }

    /**
     * Registra un nuevo usuario y lo autentica.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users|confirmed',
            'password' => 'required|string|min:8',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'country_id' => 'required|exists:countries,id',
            'telephone' => 'required|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'country_id' => $validated['country_id'],
            'telephone' => $validated['telephone'],
            'avatar' => null,
        ]);

        Auth::login($user);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Cuenta creada correctamente.',
        ], 201);
    }

    /**
     * Cierra la sesión del usuario autenticado.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    /**
     * Devuelve el usuario actualmente autenticado.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    /**
     * Devuelve los países disponibles para el formulario de registro.
     */
    public function countries(): JsonResponse
    {
        return response()->json([
            'data' => Country::orderBy('name')->get(['id', 'name', 'phone_code', 'iso_code']),
        ]);
    }

    /**
     * Enviar enlace de recuperación de contraseña.
     */
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'email.exists' => 'No encontramos ningún usuario con ese correo electrónico.'
        ]);

        $status = \Illuminate\Support\Facades\Password::broker()->sendResetLink(
            $request->only('email')
        );

        if ($status === \Illuminate\Support\Facades\Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Te hemos enviado por correo el enlace para restablecer tu contraseña.']);
        }

        return response()->json(['error' => 'No se pudo enviar el correo de recuperación.'], 500);
    }

    /**
     * Restablecer la contraseña del usuario con el token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $status = \Illuminate\Support\Facades\Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(\Illuminate\Support\Str::random(60));

                $user->save();

                event(new \Illuminate\Auth\Events\PasswordReset($user));
            }
        );

        if ($status === \Illuminate\Support\Facades\Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Tu contraseña ha sido restablecida correctamente.']);
        }

        return response()->json([
            'errors' => [
                'email' => [__($status)]
            ]
        ], 422);
    }
}
