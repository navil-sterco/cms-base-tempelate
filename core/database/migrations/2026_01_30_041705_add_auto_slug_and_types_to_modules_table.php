<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->boolean('auto_generate_slug')->default(true)->after('slug');
            $table->boolean('types_enabled')->default(false)->after('mapping_enabled');
            $table->json('types')->nullable()->after('types_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn(['auto_generate_slug', 'types_enabled', 'types']);
        });
    }
};
