<?php

namespace App\Models;

use App\Models\Page;
use App\Models\Program;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Degree extends Model
{
    protected $fillable = [
        'name',
        'short_name',
    ];

    public function pages()
    {
        return $this->belongsToMany(Page::class, 'degree_page', 'degree_id', 'page_id')->withTimestamps();
    }

    public function scopeFilter(Builder $query, $filters)
    {
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%");
            });
        }
    }
}
