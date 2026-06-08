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
        Schema::create('reviews', function (Blueprint $table) {

            $table->id();

            // Relaciones
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('book_isbn', 17);
            $table->foreign('book_isbn')
                ->references('isbn')
                ->on('books')
                ->cascadeOnDelete();

            //Comentarios y valoracion
            $table->string('title')->nullable();
            $table->text('body');

            $table->timestamps();

            // Un usuario solo puede reseñar una vez cada libro
            $table->unique(['user_id', 'book_isbn']);
        });

    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
