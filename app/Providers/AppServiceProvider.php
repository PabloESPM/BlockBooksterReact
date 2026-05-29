<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Builder;

class AppServiceProvider extends ServiceProvider
{
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
        // Búsqueda robusta ignorando mayúsculas y acentos (Ideal para PostgreSQL sin plugin unaccent)
        Builder::macro('whereLikeAccentInsensitive', function ($attribute, $searchTerm) {
            $searchTerm = trim(mb_strtolower($searchTerm));
            return $this->whereRaw(
                "translate(lower({$attribute}), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun') LIKE translate(lower(?), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun')",
                ['%' . $searchTerm . '%']
            );
        });

        Builder::macro('orWhereLikeAccentInsensitive', function ($attribute, $searchTerm) {
            $searchTerm = trim(mb_strtolower($searchTerm));
            return $this->orWhereRaw(
                "translate(lower({$attribute}), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun') LIKE translate(lower(?), 'áéíóúàèìòùäëïöüñ', 'aeiouaeiouaeioun')",
                ['%' . $searchTerm . '%']
            );
        });
    }
}
