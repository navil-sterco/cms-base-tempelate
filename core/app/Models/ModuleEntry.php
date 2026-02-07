<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModuleEntry extends Model
{
    protected $fillable = [
        'module_id',
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

    public static function getData(int $id)
    {
        return self::whereHas('module', fn ($q) =>
                $q->where('id', $id)
            )
            ->where('is_active', 1)
            ->orderBy('sort_order')
            ->pluck('data');
    }
}

