<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — BlockBookster (React SPA)
|--------------------------------------------------------------------------
|
| Tras la migración completa de Livewire a React, todas las rutas web
| se resuelven mediante la SPA de React servida desde spa.blade.php.
| La lógica de negocio se gestiona íntegramente vía la API REST (/api/*).
|
| Solo se mantiene la ruta catch-all que delega el enrutamiento al
| Router de React (react-router-dom).
|
*/

// ──────────────────────────────────────────────────────────────
// Catch-all → React SPA
// Cualquier petición GET que no coincida con /api/* ni con un
// archivo estático (/build/*, /storage/*) se sirve con la SPA.
// React Router se encargará del enrutamiento del lado del cliente.
// ──────────────────────────────────────────────────────────────
// Redirección para el email de recuperación de contraseña de Laravel a la SPA
Route::get('/reset-password/{token}', function (\Illuminate\Http\Request $request, $token) {
    $email = $request->query('email');
    return redirect('/reset-password?token=' . $token . '&email=' . urlencode($email));
})->name('password.reset');

// Catch-all → React SPA
Route::get('/{any?}', function () {
    return view('spa');
})->where('any', '^(?!api|sanctum|storage|build).*$')->name('spa');