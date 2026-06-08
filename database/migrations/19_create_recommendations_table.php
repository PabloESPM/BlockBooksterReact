<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     */
    //Recomendaciones de libros entre usuarios
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {

            $table->id();

            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();

            $table->string('book_isbn', 17);
            $table->foreign('book_isbn')
                ->references('isbn')
                ->on('books')
                ->cascadeOnDelete();

            $table->text('message')->nullable();

            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->unique([
                'from_user_id',
                'to_user_id',
                'book_isbn'
            ]);
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
