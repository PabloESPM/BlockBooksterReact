<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->string('slug')->nullable();
        });

        // Pre-populate the slug column for existing authors using Str::slug()
        DB::table('authors')->orderBy('id')->chunk(100, function ($authors) {
            foreach ($authors as $author) {
                $fullName = trim($author->name . ' ' . ($author->surname ?? ''));
                $slug = Str::slug($fullName);
                
                if (empty($slug)) {
                    $slug = 'author-' . $author->id;
                }
                
                $originalSlug = $slug;
                $counter = 1;
                while (DB::table('authors')->where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }

                DB::table('authors')->where('id', $author->id)->update(['slug' => $slug]);
            }
        });

        Schema::table('authors', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
