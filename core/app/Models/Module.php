<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'auto_generate_slug',
        'fields_config',
        'mapping_config',
        'mapping_enabled',
        'map_to_module_ids',
        'types_enabled',
        'types',
        'is_active',
    ];

    protected $casts = [
        'fields_config' => 'array',
        'mapping_config' => 'array',
        'map_to_module_ids' => 'array',
        'mapping_enabled' => 'boolean',
        'auto_generate_slug' => 'boolean',
        'types_enabled' => 'boolean',
        'types' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(ModuleEntry::class);
    }
}

