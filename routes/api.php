<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FilterDataController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| Autenticación — HAL-SEC-03: Rate Limiting en endpoints críticos
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    // HAL-SEC-03: Throttle 'auth' = 8 req/min por IP (definido en AppServiceProvider)
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::get('/countries', [AuthController::class, 'countries']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| Home (página principal) — HAL-SEC-03: Throttle general
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:api')->get('/home', [HomeController::class, 'index']);
Route::get('/stats', [HomeController::class, 'stats']);

/*
|--------------------------------------------------------------------------
| Libros (público)
|--------------------------------------------------------------------------
*/
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Autores (público)
|--------------------------------------------------------------------------
*/
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{author}', [AuthorController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Listas (lectura pública, escritura autenticada)
|--------------------------------------------------------------------------
*/
Route::get('/lists', [ListController::class, 'index']);
Route::get('/lists/{list}', [ListController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Perfil de Usuario (público con lógica de visibilidad)
|--------------------------------------------------------------------------
*/
Route::get('/users/{user}', [UserProfileController::class, 'show']);
Route::get('/users/{user}/books', [UserProfileController::class, 'books']);
Route::get('/users/{user}/reviews', [UserProfileController::class, 'reviews']);
Route::get('/users/{user}/lists', [UserProfileController::class, 'lists']);
Route::get('/users/{user}/followers', [UserProfileController::class, 'followers']);
Route::get('/users/{user}/following', [UserProfileController::class, 'following']);
Route::get('/users/{user}/authors', [UserProfileController::class, 'followedAuthors']);

/*
|--------------------------------------------------------------------------
| Comunidad (público)
|--------------------------------------------------------------------------
*/
Route::get('/community', [CommunityController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Búsqueda global — HAL-SEC-03: Throttle específico para búsquedas
|--------------------------------------------------------------------------
*/
// HAL-SEC-03: Throttle 'search' = 30 req/min (definido en AppServiceProvider)
Route::middleware('throttle:search')->get('/search', [SearchController::class, 'search']);

/*
|--------------------------------------------------------------------------
| Datos auxiliares para filtros (público)
|--------------------------------------------------------------------------
*/
Route::get('/genres', [FilterDataController::class, 'genres']);
Route::get('/languages', [FilterDataController::class, 'languages']);
Route::get('/countries', [FilterDataController::class, 'countries']);
Route::get('/countries/all', [FilterDataController::class, 'allCountries']);

/*
|--------------------------------------------------------------------------
| Rutas protegidas (requieren autenticación) — HAL-SEC-03: Throttle API
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // ── Acciones sociales ──
    Route::post('/users/{user}/follow', [FollowController::class, 'toggleUser']);
    Route::post('/authors/{author}/follow', [FollowController::class, 'toggleAuthor']);
    Route::post('/lists/{list}/follow', [FollowController::class, 'toggleList']);
    Route::post('/books/{book}/status', [BookController::class, 'updateStatus']);

    // ── Reseñas ──
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::post('/reviews/{review}/like', [ReviewController::class, 'toggleLike']);

    // ── Listas (CRUD) ──
    Route::post('/lists', [ListController::class, 'store']);
    Route::put('/lists/{list}', [ListController::class, 'update']);
    Route::delete('/lists/{list}', [ListController::class, 'destroy']);
    Route::post('/lists/{list}/books', [ListController::class, 'attachBook']);
    Route::post('/lists/store-and-attach', [ListController::class, 'storeAndAttach']);
    Route::post('/lists/{list}/like', [ListController::class, 'toggleLike']);

    // ── Dashboard del usuario ──
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/profile', [DashboardController::class, 'profile']);
        Route::post('/profile', [DashboardController::class, 'updateProfile']);
        Route::get('/lists', [DashboardController::class, 'lists']);
        Route::get('/reviews', [DashboardController::class, 'reviews']);
        Route::get('/social', [DashboardController::class, 'social']);
        Route::get('/settings', [DashboardController::class, 'settings']);
        Route::put('/settings', [DashboardController::class, 'updateSettings']);
        Route::put('/settings/privacy', [DashboardController::class, 'updatePrivacy']);
        Route::delete('/account', [DashboardController::class, 'destroyAccount']);
    });
});

/*
|--------------------------------------------------------------------------
| Panel de Administración — HAL-SEC-06: Separación de roles admin vs worker
|--------------------------------------------------------------------------
*/

// ── Operaciones de solo lectura y moderación (admin + worker) ──────────────
Route::middleware(['auth:sanctum', 'role:admin,worker'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard']);

    // Libros
    Route::get('/books', [AdminController::class, 'books']);
    Route::get('/books/{book}', [AdminController::class, 'bookShow']);
    Route::post('/books', [AdminController::class, 'bookSave']);
    Route::delete('/books/{book}', [AdminController::class, 'bookDelete']);

    // Autores
    Route::get('/authors', [AdminController::class, 'authors']);
    Route::get('/authors/{author}', [AdminController::class, 'authorShow']);
    Route::post('/authors', [AdminController::class, 'authorSave']);
    Route::delete('/authors/{author}', [AdminController::class, 'authorDelete']);
    Route::get('/authors-search', [AdminController::class, 'authorSearch']);

    // Usuarios (lectura)
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{user}', [AdminController::class, 'userShow']);

    // Reseñas (moderación)
    Route::get('/reviews', [AdminController::class, 'reviews']);
    Route::delete('/reviews/{review}', [AdminController::class, 'reviewDelete']);

    // Listas (moderación)
    Route::get('/lists', [AdminController::class, 'lists']);
    Route::delete('/lists/{list}', [AdminController::class, 'listDelete']);
});

// ── Operaciones críticas de gestión de usuarios (SOLO admin) ───────────────
// HAL-SEC-06: toggle-block y change-role requieren role:admin (no worker)
// HAL-SEC-05: Los checks de auto-demotion están en AdminController
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/users/{user}/toggle-block', [AdminController::class, 'userToggleBlock']);
    Route::post('/users/{user}/change-role', [AdminController::class, 'userChangeRole']);
});
