<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Book extends Model
{
    use HasFactory;
    protected $primaryKey = 'isbn';
    protected $keyType = 'string';
    public $incrementing = false;

    public function authors()
    {
        return $this->belongsToMany(
            Author::class,
            'author_book',
            'book_isbn',
            'author_id'
        )->withPivot(['role', 'author_order']);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }

    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }
    // Relación con los usuarios a través de la tabla pivote book_user
    // Esto permite acceder a las valoraciones (rating) que los usuarios han dado al libro
    public function users()
    {
        return $this->belongsToMany(User::class, 'book_user', 'book_isbn', 'user_id')
            ->withPivot(['rating', 'status', 'started_at', 'finished_at']);
    }

    public function lists()
    {
        return $this->belongsToMany(
            FavList::class,
            'book_list',
            'book_isbn',
            'list_id'
        )->withPivot(['position', 'note', 'added_at']);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'book_isbn', 'isbn');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'book_isbn', 'isbn');
    }

    /**
     * Accessor para obtener la URL de la portada del libro.
     * Si el cover_path existe, devuelve la URL de Storage. En caso contrario, null.
     */
    public function getCoverImageAttribute(): ?string
    {
        if ($this->cover_path) {
            if (str_starts_with($this->cover_path, 'http://') || str_starts_with($this->cover_path, 'https://')) {
                return $this->cover_path;
            }
            $cleanPath = ltrim($this->cover_path, '/');
            if (str_starts_with($cleanPath, 'storage/')) {
                $cleanPath = substr($cleanPath, 8);
            }
            return \Illuminate\Support\Facades\Storage::disk('public')->url($cleanPath);
        }

        return null;
    }

    /**
     * Accessor de compatibilidad para obtener la URL de la portada del libro.
     *
     * @return string|null
     */
    public function getCoverAttribute(): ?string
    {
        return $this->cover_image;
    }

    /**
     * Ciclo de vida y eventos del modelo Book.
     */
    protected static function booted(): void
    {
        // Limpiar el archivo físico de la portada al eliminar un libro
        static::deleting(function (Book $book) {
            if ($book->cover_path) {
                $disco = \Illuminate\Support\Facades\Storage::disk('public');
                $disco->delete($book->cover_path);
                $carpeta = dirname($book->cover_path);
                if ($disco->exists($carpeta) && count($disco->files($carpeta)) === 0) {
                    $disco->deleteDirectory($carpeta);
                }
            }
        });
    }
}


