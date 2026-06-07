<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'alpha2',
        'iso_code',
        'phone_code',
        'currency',
        'continent',
        'timezone',
        'emoji',
    ];

    public function authors()
    {
        return $this->hasMany(Author::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
