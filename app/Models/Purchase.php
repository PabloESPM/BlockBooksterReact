<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


/**
 * Corrección de Inconsistencia (Alineación de $fillable y migración):
 * Se aplicó la OPCIÓN B. Se añadieron las columnas correspondientes a la migración
 * ('store_name', 'url', 'price', 'currency') debido a que se utilizan y exponen
 * activamente en la API a través del recurso App\Http\Resources\PurchaseResource.
 */
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
