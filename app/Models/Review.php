<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_isbn',
        'title',
        'body'
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_isbn', 'isbn');
    }

    public function likes()
    {
        return $this->hasMany(ReviewLike::class);
    }

    public function ratingRecord(): HasOne
    {
        return $this->hasOne(BookUser::class, 'user_id', 'user_id')
            ->where('book_isbn', $this->book_isbn)
            ->withDefault();
    }

    public function getRatingAttribute()
    {
        if ($this->relationLoaded('ratingRecord')) {
            return $this->ratingRecord ? $this->ratingRecord->rating : 0;
        }

        $bookUser = \App\Models\BookUser::where('user_id', $this->user_id)
            ->where('book_isbn', $this->book_isbn)
            ->first();

        return $bookUser ? $bookUser->rating : 0;
    }

    /**
     * Pre-carga los registros BookUser en un solo query eficiente.
     * HAL-PERF-05: sustituye la cadena de OR anidados por un único whereIn + filtro en memoria,
     * que PostgreSQL optimiza mejor especialmente con colecciones grandes (50+ reseñas).
     *
     * @param  \Illuminate\Support\Collection|\Illuminate\Pagination\LengthAwarePaginator|array  $reviews
     */
    public static function preloadRatingRecords($reviews): void
    {
        if (empty($reviews)) {
            return;
        }

        $items = match (true) {
            $reviews instanceof \Illuminate\Pagination\LengthAwarePaginator => collect($reviews->items()),
            $reviews instanceof \Illuminate\Support\Collection => $reviews,
            default => collect($reviews),
        };

        if ($items->isEmpty()) {
            return;
        }

        // Extraer user_ids y book_isbns únicos para reducir el tamaño del IN
        $userIds = $items->pluck('user_id')->unique()->values()->all();
        $bookIsbns = $items->pluck('book_isbn')->unique()->values()->all();

        // Una sola query con doble whereIn (mucho más eficiente que OR anidados)
        $bookUsers = \App\Models\BookUser::whereIn('user_id', $userIds)
            ->whereIn('book_isbn', $bookIsbns)
            ->get()
            ->keyBy(fn($bu) => $bu->user_id . '_' . $bu->book_isbn);

        // Asociar cada BookUser a su reseña en memoria (sin queries adicionales)
        foreach ($items as $review) {
            $key = $review->user_id . '_' . $review->book_isbn;
            $review->setRelation('ratingRecord', $bookUsers->get($key));
        }
    }

}

