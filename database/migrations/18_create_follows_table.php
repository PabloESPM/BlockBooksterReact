<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     */
    // Seguir a usuarios
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {

            $table->id();

            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('followed_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['follower_id', 'followed_id']);
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
