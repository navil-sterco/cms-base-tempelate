<?php

namespace App\Models;

use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ModuleEntry extends Model
{
    protected $fillable = [
        'module_id',
        'slug',
        'data',
        'section_data',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'data' => 'array',
        'section_data' => 'array',
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

    public function getSectionDataRenderedHtml(): array
    {
        $this->loadMissing('module');
        $module = $this->module;
    
        if (!$module) {
            return [];
        }
    
        $pageSectionIds = $module->page_section_ids ?? [];
    
        if (empty($pageSectionIds)) {
            return [];
        }
    
        $sections = PageSection::whereIn('id', $pageSectionIds)
            ->get()
            ->keyBy('id');
    
        $sectionDataBySectionId = [];
    
        foreach ($this->section_data ?? [] as $item) {
            $sid = $item['section_id'] ?? null;
            if ($sid !== null) {
                $sectionDataBySectionId[$sid] = $item;
            }
        }
    
        $result = [];
    
        foreach ($pageSectionIds as $sectionId) {
    
            $section = $sections->get($sectionId);
            $item = $sectionDataBySectionId[$sectionId] ?? null;
    
            if (!$section) {
                continue;
            }
    
            $sectionIdentifier = $section->identifier ?? 'section_' . $sectionId;
    
            $result[$sectionIdentifier] = self::renderSectionHtml(
                $section->html_template ?? '',
                $item
            );
        }
    
        return $result;
    }

    public static function renderSectionHtml(string $sectionHtml, ?array $sectionData): string
    {
        $sectionData = $sectionData ?? [];
        $data = $sectionData['data'] ?? [];
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $sectionHtml = str_replace("{{$key}}", (string) $value, $sectionHtml);
            }
        }
        $mappingItems = self::resolveMappingItemsForSection($sectionData);
        if (!empty($mappingItems)) {
            if (preg_match('/<!-- START REPEATABLE ITEM -->(.*?)<!-- END REPEATABLE ITEM -->/s', $sectionHtml, $matches)) {
                $repeatableBlock = $matches[1];
                $allRepeatedBlocks = '';
                foreach ($mappingItems as $item) {
                    $itemBlock = $repeatableBlock;
                    foreach ($item as $key => $value) {
                        $itemBlock = str_replace("{item.$key}", (string) $value, $itemBlock);
                    }
                    $allRepeatedBlocks .= $itemBlock;
                }
                $sectionHtml = preg_replace(
                    '/<!-- START REPEATABLE ITEM -->.*?<!-- END REPEATABLE ITEM -->/s',
                    $allRepeatedBlocks,
                    $sectionHtml
                );
            }
        }
        return $sectionHtml;
    }

    private static function resolveMappingItemsForSection(array $sectionData): array
    {
        if (isset($sectionData['mapping_items']) && is_array($sectionData['mapping_items']) && !empty($sectionData['mapping_items'])) {
            return $sectionData['mapping_items'];
        }
        $fieldArrays = [];
        foreach ($sectionData as $key => $value) {
            if ($key === 'data' || $key === 'section_id' || $key === 'mapping_items') {
                continue;
            }
            if (is_array($value)) {
                $fieldArrays[$key] = $value;
            }
        }
        if (empty($fieldArrays)) {
            return [];
        }
        $maxLen = max(array_map('count', $fieldArrays));
        $items = [];
        for ($i = 0; $i < $maxLen; $i++) {
            $item = [];
            foreach ($fieldArrays as $fieldName => $arr) {
                $item[$fieldName] = $arr[$i] ?? '';
            }
            $items[] = $item;
        }
        return $items;
    }

    public static function getData(int $id)
    {
        return self::with(['relatedEntries.module', 'module'])
            ->whereHas('module', fn ($q) => $q->where('id', $id))
            ->where('is_active', 1)
            ->orderBy('sort_order')
            ->get()
            ->map(function (ModuleEntry $entry) {
                $data = $entry->data ?? [];
                $slug = $entry->slug ?? [];
                if ($entry->relatedEntries->isNotEmpty()) {
                    foreach ($entry->relatedEntries as $related) {
                        $moduleSlug = $related->module->slug ?? null;
                        if ($moduleSlug) {
                            $data[$moduleSlug][] = $related->data ?? [];
                        }
                    }
                }
                $sectionHtml = $entry->getSectionDataRenderedHtml();
                return array_merge(
                    [
                        'data' => $data,
                        'slug' => $slug,
                    ],
                    $sectionHtml
                );
            });
    }
}

