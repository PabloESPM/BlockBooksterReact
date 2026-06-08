<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     */
    public function up(): void
    {
        Schema::create('authors', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('surname')->nullable();
            $table->string('slug')->unique();
            $table->date('birth_date')->nullable();
            $table->foreignId('country_id')->nullable()->constrained()->onDelete('set null');
            $table->text('biography')->nullable();
            $table->string('photo_url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('authors');
    }
};
