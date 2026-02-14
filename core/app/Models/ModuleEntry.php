<?php

namespace App\Models;

use App\Models\Page;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ModuleEntry extends Model
{
    protected $fillable = [
        'module_id',
        'slug',
        'data',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'data' => 'array',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function pages(): BelongsToMany
    {
        return $this->belongsToMany(Page::class, 'module_entry_page', 'module_entry_id', 'page_id')->withTimestamps();
    }

    public function relatedEntries(): BelongsToMany
    {
        return $this->belongsToMany(ModuleEntry::class, 'module_entry_mapping', 'module_entry_id', 'related_module_entry_id')->withTimestamps();
    }

    public static function getData(int $id)
    {
        return self::with(['relatedEntries.module']) // Load related entries with their modules
            ->whereHas('module', fn ($q) => $q->where('id', $id))
            ->where('is_active', 1)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($entry) {
                $data = $entry->data ?? [];
                
                // Add related entries data if they exist
                if ($entry->relatedEntries->isNotEmpty()) {
                    foreach ($entry->relatedEntries as $related) {
                        $moduleSlug = $related->module->slug ?? null;
                        if ($moduleSlug) {
                            $data[$moduleSlug][] = $related->data ?? [];
                        }
                    }
                }
                
                return $data;
            });
    }
}

