<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('modules', 'map_to_module_ids')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->json('map_to_module_ids')->nullable()->after('mapping_config');
            });
        }

        if (!Schema::hasTable('module_entry_page')) {
        Schema::create('module_entry_page', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_entry_id')->constrained('module_entries')->cascadeOnDelete();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['module_entry_id', 'page_id']);
        });
        }

        if (!Schema::hasTable('module_entry_mapping')) {
        Schema::create('module_entry_mapping', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_entry_id')->constrained('module_entries')->cascadeOnDelete();
            $table->foreignId('related_module_entry_id')->constrained('module_entries')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['module_entry_id', 'related_module_entry_id'], 'mod_entry_mapping_unique');
        });
        }
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn('map_to_module_ids');
        });
        Schema::dropIfExists('module_entry_mapping');
        Schema::dropIfExists('module_entry_page');
    }
};
