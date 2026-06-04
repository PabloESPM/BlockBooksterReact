<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\ReviewLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Crear una nueva reseña (o actualizar si ya existe para ese libro).
     * HAL-QA-01: validación centralizada en StoreReviewRequest.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Verificar si ya existe una reseña de este usuario para este libro
        $exists = Review::where('user_id', $request->user()->id)
            ->where('book_isbn', $validated['book_isbn'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ya has escrito una reseña para este libro.',
                'errors'  => [
                    'book_isbn' => ['Ya has escrito una reseña para este libro.'],
                ],
            ], 422);
        }

        $review = $request->user()->reviews()->create([
            'book_isbn' => $validated['book_isbn'],
            'title'     => $validated['title'] ?? null,
            'body'      => $validated['body'],
        ]);

        // Guardar el rating en book_user (tabla separada)
        $request->user()->books()->updateOrCreate(
            ['book_isbn' => $validated['book_isbn']],
            ['rating'    => $validated['rating']]
        );

        $review->load(['user', 'likes']);
        $review->loadCount('likes');

        return response()->json([
            'data'    => new ReviewResource($review),
            'message' => '¡Reseña publicada correctamente!',
        ], 201);
    }

    /**
     * Actualizar una reseña existente.
     * HAL-SEC-04: autorización via ReviewPolicy.
     * HAL-QA-01: validación centralizada en UpdateReviewRequest.
     */
    public function update(UpdateReviewRequest $request, Review $review): JsonResponse
    {
        // HAL-SEC-04: Policy centralizada (sustituye el if inline)
        $this->authorize('update', $review);

        $validated = $request->validated();

        $review->update([
            'title' => $validated['title'] ?? null,
            'body'  => $validated['body'],
        ]);

        // Actualizar rating en book_user
        $request->user()->books()->updateOrCreate(
            ['book_isbn' => $review->book_isbn],
            ['rating'    => $validated['rating']]
        );

        $review->load(['user', 'likes']);
        $review->loadCount('likes');

        return response()->json([
            'data'    => new ReviewResource($review),
            'message' => '¡Reseña actualizada correctamente!',
        ]);
    }

    /**
     * Eliminar una reseña.
     * HAL-SEC-04: autorización via ReviewPolicy.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->json([
            'message' => '¡Reseña eliminada correctamente!',
        ]);
    }

    /**
     * Toggle like de una reseña.
     * HAL-SEC-04: autorización via ReviewPolicy.
     */
    public function toggleLike(Request $request, Review $review): JsonResponse
    {
        $this->authorize('toggleLike', $review);

        $user = $request->user();
        $like = ReviewLike::where('user_id', $user->id)
            ->where('review_id', $review->id)
            ->first();

        if ($like) {
            $like->delete();
            $status = 'unliked';
        } else {
            ReviewLike::create([
                'user_id'   => $user->id,
                'review_id' => $review->id,
            ]);
            $status = 'liked';
        }

        return response()->json([
            'status'      => $status,
            'likes_count' => $review->likes()->count(),
        ]);
    }
}
