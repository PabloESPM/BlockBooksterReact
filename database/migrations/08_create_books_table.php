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
        Schema::create('books', function (Blueprint $table) {
            $table->string('isbn', 17)->primary();
            $table->string('title');
            $table->string('publisher');
            $table->year('publication_year');
            $table->foreignId('language_id')->constrained()->cascadeOnDelete();
            $table->integer('number_of_pages');
            $table->string('cover_path')->nullable();
            $table->foreignId('genre_id')->constrained()->cascadeOnDelete();
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
