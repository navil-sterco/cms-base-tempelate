<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'fields_config',
        'mapping_config',
        'mapping_enabled',
        'is_active',
    ];

    protected $casts = [
        'fields_config' => 'array',
        'mapping_config' => 'array',
        'mapping_enabled' => 'boolean',
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

