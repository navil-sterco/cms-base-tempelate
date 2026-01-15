<?php
// app/Models/PageSection.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PageSection extends Model
{
    protected $fillable = [
        'name',
        'identifier', 
        'html_template',
        'fields_config',
        'mapping_config',
        'mapping_enabled',
        'css_styles',
        'javascript',
        'is_active'
    ];

    protected $casts = [
        'fields_config' => 'array',
        'mapping_config' => 'array',
        'mapping_enabled' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function pages(): BelongsToMany
    {
        return $this->belongsToMany(Page::class, 'page_section')
                    ->withPivot('id', 'order', 'section_data')
                    ->withTimestamps()
                    ->orderBy('order');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getDynamicFields()
    {
        $fields = [];
        
        if ($this->fields_config && is_array($this->fields_config)) {
            foreach ($this->fields_config as $field) {
                $fields[] = [
                    'name' => $field['name'],
                    'label' => $field['label'],
                    'type' => $field['type'],
                    'required' => $field['required'] ?? false,
                    'placeholder' => $field['placeholder'] ?? '',
                    'options' => $field['options'] ?? [],
                    'is_mapping' => false
                ];
            }
        }
        
        if ($this->mapping_enabled && $this->mapping_config && is_array($this->mapping_config)) {
            foreach ($this->mapping_config as $field) {
                $fields[] = [
                    'name' => 'item.' . $field['name'],
                    'label' => $field['label'] . ' (Repeatable)',
                    'type' => $field['type'],
                    'required' => $field['required'] ?? false,
                    'placeholder' => $field['placeholder'] ?? '',
                    'options' => $field['options'] ?? [],
                    'is_mapping' => true
                ];
            }
        }
        
        return $fields;
    }

    public function hasMapping(): bool
    {
        return $this->mapping_enabled && 
               $this->mapping_config && 
               is_array($this->mapping_config) && 
               count($this->mapping_config) > 0;
    }
}