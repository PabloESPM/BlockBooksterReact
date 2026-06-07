<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookUser extends Model
{
    use HasFactory;
    protected $table = 'book_user';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'book_isbn',
        'status',
        'rating',
        'started_at',
        'finished_at'
    ];

    // $dates está deprecado en Laravel 10+; usamos $casts para garantizar objetos Carbon
    protected $casts = [
        'started_at'  => 'date',
        'finished_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_isbn', 'isbn');
    }
}

