<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->json('mapping_config')->nullable()->after('fields_config');
            $table->boolean('mapping_enabled')->default(false)->after('mapping_config');
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn(['mapping_config', 'mapping_enabled']);
        });
    }
};

