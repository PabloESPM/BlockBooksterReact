<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CountryResource;
use App\Http\Resources\GenreResource;
use App\Http\Resources\LanguageResource;
use App\Models\Country;
use App\Models\Genre;
use App\Models\Language;
use Illuminate\Http\JsonResponse;

class FilterDataController extends Controller
{
    /**
     * Devuelve todos los géneros disponibles.
     */
    public function genres(): JsonResponse
    {
        return response()->json([
            'data' => GenreResource::collection(Genre::orderBy('name')->get()),
        ]);
    }

    /**
     * Devuelve todos los idiomas disponibles.
     */
    public function languages(): JsonResponse
    {
        return response()->json([
            'data' => LanguageResource::collection(Language::orderBy('name')->get()),
        ]);
    }

    /**
     * Devuelve los países que tienen autores con libros (para filtro de libros).
     */
    public function countries(): JsonResponse
    {
        $countries = Country::whereHas('authors', function ($q) {
            $q->has('books');
        })->orderBy('name')->get();

        return response()->json([
            'data' => CountryResource::collection($countries),
        ]);
    }

    /**
     * Devuelve todos los países (para formularios de registro/perfil).
     */
    public function allCountries(): JsonResponse
    {
        return response()->json([
            'data' => CountryResource::collection(Country::orderBy('name')->get()),
        ]);
    }
}
