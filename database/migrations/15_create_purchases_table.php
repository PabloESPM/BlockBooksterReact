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
        Schema::create('purchases', function (Blueprint $table) {

            $table->id();

            $table->string('book_isbn', 17);
            $table->foreign('book_isbn')
                ->references('isbn')
                ->on('books')
                ->cascadeOnDelete();

            $table->string('provider'); // amazon, fnac, casa_del_libro, etc.

            $table->enum('format', [
                'paperback',
                'hardcover',
                'ebook',
                'audiobook'
            ]);

            $table->foreignId('country_id')->constrained();

            $table->string('affiliate_url');

            $table->boolean('active')->default(true);

            $table->string('store_name')->nullable();
            $table->string('url')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->nullable();

            $table->timestamps();

            $table->unique([
                'book_isbn',
                'provider',
                'format',
                'country_id'
            ]);
        });


    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
