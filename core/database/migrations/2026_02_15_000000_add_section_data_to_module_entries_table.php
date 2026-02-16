<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('module_entries', function (Blueprint $table) {
            $table->json('section_data')->nullable()->after('data');
        });

        // Backfill: copy data->sections into section_data for existing rows
        $entries = DB::table('module_entries')->whereNotNull('data')->get();
        foreach ($entries as $row) {
            $data = json_decode($row->data, true);
            if (is_array($data) && isset($data['sections']) && is_array($data['sections'])) {
                DB::table('module_entries')->where('id', $row->id)->update([
                    'section_data' => json_encode($data['sections']),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('module_entries', function (Blueprint $table) {
            $table->dropColumn('section_data');
        });
    }
};
