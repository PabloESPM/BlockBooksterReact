<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\FavListResource;
use App\Http\Resources\AuthorResource;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller
{
    /**
     * Estadísticas principales del dashboard del usuario.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'stats' => [
                'read_books' => $user->books()->where('status', 'read')->count(),
                'reading_books' => $user->books()->where('status', 'reading')->count(),
                'pending_books' => $user->books()->where('status', 'pending')->count(),
                'lists' => $user->lists()->count(),
                'reviews' => $user->reviews()->count(),
                'followers' => $user->followers()->count(),
                'following' => $user->following()->count(),
            ],
        ]);
    }

    /**
     * Datos del perfil del usuario para el formulario de edición.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('country');

        return response()->json([
            'data' => new UserResource($user),
            'countries' => Country::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Actualizar perfil (nombre, bio, país, avatar).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'country_id' => 'nullable|exists:countries,id',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ], [
            'name.required' => 'El nombre de usuario es obligatorio.',
            'name.max' => 'El nombre no puede superar los 255 caracteres.',
            'bio.max' => 'La biografía no puede superar los 1000 caracteres.',
            'country_id.exists' => 'El país seleccionado no es válido.',
            'avatar.image' => 'El archivo debe ser una imagen.',
            'avatar.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif o webp.',
            'avatar.max' => 'La imagen no debe superar los 3 MB.',
        ]);

        // Procesar avatar si se ha subido
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('userimg', 'public');
            $user->avatar = $path;
        }

        $user->name = $validated['name'];
        $user->bio = $validated['bio'];
        $user->country_id = $validated['country_id'];
        $user->save();

        return response()->json([
            'data' => new UserResource($user->fresh('country')),
            'message' => 'Perfil actualizado correctamente.',
        ]);
    }

    /**
     * Listas del usuario autenticado.
     */
    public function lists(Request $request): JsonResponse
    {
        $lists = $request->user()->lists()
            ->with('likes')
            ->withCount(['books', 'likes'])
            ->latest()
            ->get();

        return response()->json([
            'data' => FavListResource::collection($lists),
        ]);
    }

    /**
     * Reseñas del usuario autenticado.
     */
    public function reviews(Request $request): JsonResponse
    {
        $reviews = $request->user()->reviews()
            ->with(['book.authors', 'likes'])
            ->withCount('likes')
            ->latest()
            ->get();

        \App\Models\Review::preloadRatingRecords($reviews);

        return response()->json([
            'data' => ReviewResource::collection($reviews),
        ]);
    }

    /**
     * Datos sociales: seguidores, seguidos, autores seguidos.
     */
    public function social(Request $request): JsonResponse
    {
        $user = $request->user();

        $followers = $user->followers()->with('follower')->latest()->take(10)->get()
            ->map(fn ($f) => $f->follower);
        $following = $user->following()->with('followed')->latest()->take(10)->get()
            ->map(fn ($f) => $f->followed);
        $followedAuthors = $user->followedAuthors()->withCount('books')->get();

        return response()->json([
            'followers' => UserResource::collection($followers),
            'followers_count' => $user->followers()->count(),
            'following' => UserResource::collection($following),
            'following_count' => $user->following()->count(),
            'followed_authors' => AuthorResource::collection($followedAuthors),
        ]);
    }

    /**
     * Datos de configuración de la cuenta.
     */
    public function settings(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    /**
     * Actualizar email, teléfono y/o contraseña.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'email.unique' => 'Este correo electrónico ya está en uso por otra cuenta.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $user->email = $validated['email'];
        $user->telephone = $validated['telephone'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Credenciales actualizadas correctamente.',
        ]);
    }

    /**
     * Actualizar visibilidad del perfil (privacidad).
     */
    public function updatePrivacy(Request $request): JsonResponse
    {
        $request->validate([
            'profile_visibility' => 'required|in:public,followers,friends,private',
        ]);

        $request->user()->update([
            'profile_visibility' => $request->profile_visibility,
        ]);

        return response()->json([
            'message' => 'Preferencias de privacidad guardadas correctamente.',
        ]);
    }

    /**
     * Eliminar permanentemente la cuenta del usuario.
     */
    public function destroyAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $user->delete();

        return response()->json([
            'message' => 'Tu cuenta ha sido eliminada permanentemente.',
        ]);
    }
}
