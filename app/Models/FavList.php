<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class FavList extends Model
{
    use HasFactory;
    protected $table = 'fav_lists';
    // HAL-AUTH-01: user_id eliminado de $fillable para evitar mass-assignment spoofing
    protected $fillable = ['name', 'description', 'visibility'];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function books()
    {
        return $this->belongsToMany(
            Book::class,      // Modelo relacionado
            'book_list',       // Tabla pivot
            'list_id',         // FK de la lista en pivot
            'book_isbn'        // FK del libro en pivot
        )->withPivot(['position', 'note', 'added_at']);
    }

    public function likes()
    {
        return $this->hasMany(ListLike::class, 'list_id');
    }
}
