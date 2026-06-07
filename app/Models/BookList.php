<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookList extends Model
{
    use HasFactory;
    public $timestamps = false;

    protected $casts = [
        'added_at' => 'datetime',
    ];

    public function list()
    {
        return $this->belongsTo(FavList::class, 'list_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_isbn', 'isbn');
    }
}

