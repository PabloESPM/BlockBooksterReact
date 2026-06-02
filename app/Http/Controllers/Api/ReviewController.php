<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\ReviewLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Crear una nueva reseña (o actualizar si ya existe para ese libro).
     * Replica la lógica de ReviewController@store original.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_isbn' => ['required', 'string', 'exists:books,isbn'],
            'title' => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'numeric', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'max:1000'],
        ]);

        // Verificar si ya existe una reseña de este usuario para este libro
        $exists = Review::where('user_id', $request->user()->id)
            ->where('book_isbn', $validated['book_isbn'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ya has escrito una reseña para este libro.',
                'errors' => [
                    'book_isbn' => ['Ya has escrito una reseña para este libro.']
                ]
            ], 422);
        }

        $review = $request->user()->reviews()->create([
            'book_isbn' => $validated['book_isbn'],
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'],
        ]);

        // Guardar el rating en book_user (tabla separada)
        $request->user()->books()->updateOrCreate(
            ['book_isbn' => $validated['book_isbn']],
            ['rating' => $validated['rating']]
        );

        $review->load(['user', 'likes']);
        $review->loadCount('likes');

        return response()->json([
            'data' => new ReviewResource($review),
            'message' => '¡Reseña publicada correctamente!',
        ], 201);
    }

    /**
     * Actualizar una reseña existente.
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para editar esta reseña.');
        }

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'numeric', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $review->update([
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'],
        ]);

        // Actualizar rating en book_user
        $request->user()->books()->updateOrCreate(
            ['book_isbn' => $review->book_isbn],
            ['rating' => $validated['rating']]
        );

        $review->load(['user', 'likes']);
        $review->loadCount('likes');

        return response()->json([
            'data' => new ReviewResource($review),
            'message' => '¡Reseña actualizada correctamente!',
        ]);
    }

    /**
     * Eliminar una reseña.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            abort(403, 'No tienes permiso para eliminar esta reseña.');
        }

        $review->delete();

        return response()->json([
            'message' => '¡Reseña eliminada correctamente!',
        ]);
    }

    /**
     * Toggle like de una reseña.
     */
    public function toggleLike(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();
        $like = ReviewLike::where('user_id', $user->id)
            ->where('review_id', $review->id)
            ->first();

        if ($like) {
            $like->delete();
            $status = 'unliked';
        } else {
            ReviewLike::create([
                'user_id' => $user->id,
                'review_id' => $review->id,
            ]);
            $status = 'liked';
        }

        return response()->json([
            'status' => $status,
            'likes_count' => $review->likes()->count(),
        ]);
    }
}
