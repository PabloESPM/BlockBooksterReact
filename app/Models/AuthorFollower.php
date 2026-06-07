<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class AuthorFollower extends Pivot
{
    protected $table = 'author_followers';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'author_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function author()
    {
        return $this->belongsTo(Author::class);
    }
}
