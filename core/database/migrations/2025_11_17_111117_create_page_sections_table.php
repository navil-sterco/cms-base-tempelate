<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('identifier')->unique();
            $table->text('html_template');
            $table->json('fields_config')->nullable();
            $table->json('mapping_config')->nullable(); // ADD THIS
            $table->boolean('mapping_enabled')->default(false); // ADD THIS
            $table->text('css_styles')->nullable();
            $table->text('javascript')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};