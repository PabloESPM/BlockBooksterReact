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
        Schema::create('author_book', function (Blueprint $table) {
            $table->id();

            $table->foreignId('author_id')
                ->constrained('authors')
                ->cascadeOnDelete();

            $table->string('book_isbn', 17);
            $table->foreign('book_isbn')
                ->references('isbn')
                ->on('books')
                ->cascadeOnDelete();

            // Metadatos profesionales
            $table->enum('role', ['author', 'coauthor', 'editor'])
                ->default('author');

            $table->integer('author_order')->nullable();

            // Evita duplicados autor-libro
            $table->unique(['author_id', 'book_isbn']);
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('author_book');
    }
};
