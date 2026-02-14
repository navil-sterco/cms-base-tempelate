<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('module_entries', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('module_id');
            // Create a unique index on (module_id, slug)
            $table->unique(['module_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('module_entries', function (Blueprint $table) {
            $table->dropUnique(['module_id', 'slug']);
            $table->dropColumn('slug');
        });
    }
};
