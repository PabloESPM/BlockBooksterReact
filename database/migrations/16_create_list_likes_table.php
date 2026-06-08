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
        Schema::create('list_likes', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->foreignId('list_id')
                ->constrained('fav_lists')
                ->cascadeOnDelete();

            $table->timestamps();

            // Un usuario solo puede dar like una vez a una lista
            $table->unique(['user_id', 'list_id']);
        });

    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('list_likes');
    }
};
