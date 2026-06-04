<?php

namespace App\Providers;

use App\Models\FavList;
use App\Models\Review;
use App\Policies\FavListPolicy;
use App\Policies\ReviewPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * HAL-SEC-04: Mapa de modelos → Policies para autorización centralizada.
     */
    protected array $policies = [
        Review::class  => ReviewPolicy::class,
        FavList::class => FavListPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ── HAL-SEC-04: Registrar Policies ──────────────────────────────────────
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        // ── HAL-SEC-03: Rate Limiting ────────────────────────────────────────────
        // Endpoints de autenticación: máx. 8 intentos/min por IP (brute-force protection)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(8)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Demasiados intentos. Por favor, espera un minuto antes de reintentar.',
                ], 429));
        });

        // Endpoints de búsqueda: máx. 30 consultas/min por usuario o IP
        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(30)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Demasiadas búsquedas. Por favor, espera un momento.',
                ], 429));
        });

        // API general: máx. 120 req/min por usuario autenticado o por IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)
                ->by($request->user()?->id ?: $request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Límite de peticiones superado. Por favor, espera un momento.',
                ], 429));
        });

        // ── HAL-SEC-02: Macro SQL con columnas validadas ─────────────────────────
        // IMPORTANTE: $attribute DEBE ser un nombre de columna literal controlado
        // por el código fuente, NUNCA un valor proporcionado por el usuario.
        Builder::macro('whereLikeAccentInsensitive', function (string $attribute, string $searchTerm) {
            // HAL-SEC-02: Validar que el nombre de columna sólo contiene caracteres seguros
            // para prevenir inyección SQL si en el futuro se pasa un valor dinámico.
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_.]*$/', $attribute)) {
                throw new \InvalidArgumentException(
                    "El nombre de columna contiene caracteres no permitidos: [{$attribute}]. " .
                    "Solo se aceptan nombres de columna literales."
                );
            }
            $searchTerm = trim(mb_strtolower($searchTerm));
            return $this->whereRaw(
                "translate(lower({$attribute}), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun') LIKE translate(lower(?), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun')",
                ['%' . $searchTerm . '%']
            );
        });

        Builder::macro('orWhereLikeAccentInsensitive', function (string $attribute, string $searchTerm) {
            // HAL-SEC-02: Misma validación de columna que en whereLikeAccentInsensitive
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_.]*$/', $attribute)) {
                throw new \InvalidArgumentException(
                    "El nombre de columna contiene caracteres no permitidos: [{$attribute}]. " .
                    "Solo se aceptan nombres de columna literales."
                );
            }
            $searchTerm = trim(mb_strtolower($searchTerm));
            return $this->orWhereRaw(
                "translate(lower({$attribute}), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun') LIKE translate(lower(?), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun')",
                ['%' . $searchTerm . '%']
            );
        });
    }
}
