<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


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

    public function ratingRecord()
    {
        // Define standard relation on user_id as a fallback.
        return $this->hasOne(BookUser::class, 'user_id', 'user_id');
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
     * Preloads ratingRecord for a collection/array of reviews in a single query.
     */
    public static function preloadRatingRecords($reviews)
    {
        if (empty($reviews)) {
            return;
        }

        if ($reviews instanceof \Illuminate\Support\Collection) {
            $items = $reviews;
        } elseif ($reviews instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $items = collect($reviews->items());
        } else {
            $items = collect($reviews);
        }

        if ($items->isEmpty()) {
            return;
        }

        // Build list of user_id and book_isbn combinations
        $pairs = $items->map(fn ($r) => [
            'user_id' => $r->user_id,
            'book_isbn' => $r->book_isbn,
        ])->unique(fn ($p) => $p['user_id'] . '_' . $p['book_isbn']);

        // Fetch matching BookUser records
        $query = \App\Models\BookUser::query();
        $query->where(function ($q) use ($pairs) {
            foreach ($pairs as $pair) {
                $q->orWhere(function ($sq) use ($pair) {
                    $sq->where('user_id', $pair['user_id'])
                       ->where('book_isbn', $pair['book_isbn']);
                });
            }
        });

        $bookUsers = $query->get()->keyBy(fn ($bu) => $bu->user_id . '_' . $bu->book_isbn);

        // Associate BookUser records with reviews
        foreach ($items as $review) {
            $key = $review->user_id . '_' . $review->book_isbn;
            $review->setRelation('ratingRecord', $bookUsers->get($key));
        }
    }
}

