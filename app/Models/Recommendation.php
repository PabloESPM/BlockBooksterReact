<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Recommendation extends Model
{
    use HasFactory;
    // HAL-QA-03: $dates está deprecado desde Laravel 10; usar $casts
    protected $casts = ['read_at' => 'datetime'];


    public function from()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function to()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_isbn', 'isbn');
    }
}

