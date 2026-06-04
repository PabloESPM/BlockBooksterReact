<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Purchase extends Model
{
    use HasFactory;

    // HAL-QA-04: $fillable explícito para prevenir errores silenciosos de mass assignment
    protected $fillable = [
        'book_isbn',
        'provider',
        'store_name',
        'format',
        'url',
        'price',
        'currency',
        'country_id',
        'affiliate_url',
        'active',
    ];

    protected $casts = [

        'active' => 'boolean',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'book_isbn', 'isbn');
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}
