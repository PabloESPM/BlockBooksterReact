<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('alpha2', 2)->nullable()->unique();
            $table->string('iso_code', 3)->nullable()->unique();
            $table->string('phone_code')->nullable();
            $table->string('currency', 3)->nullable();
            $table->string('continent')->nullable();
            $table->string('timezone')->nullable();
            $table->string('emoji', 10)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
