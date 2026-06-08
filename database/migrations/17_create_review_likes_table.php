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
        Schema::create('review_likes', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->foreignId('review_id')
                ->constrained('reviews')
                ->cascadeOnDelete();

            $table->timestamps();

            // Un usuario solo puede dar like una vez a una review
            $table->unique(['user_id', 'review_id']);
        });

    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_likes');
    }
};
