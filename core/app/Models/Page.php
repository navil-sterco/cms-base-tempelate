<?php
namespace App\Models;

use App\Models\Image;
use App\Models\Degree;
use App\Models\ModuleEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'meta_description', 'is_published','page_type'
    ];

    protected $casts = [
        'is_published' => 'boolean'
    ];

    public function sections()
    {
        return $this->belongsToMany(PageSection::class, 'page_section')
                    ->withPivot('id','order', 'section_data')
                    ->withTimestamps()
                    ->orderBy('order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }

    public function getRenderedHtml()
    {
        $html = '';
        
        foreach ($this->sections as $section) {
            $sectionHtml = $section->html_template;
            $sectionData = json_decode($section->pivot->section_data, true) ?? [];
            
            // Replace regular fields
            if (isset($sectionData['data'])) {
                foreach ($sectionData['data'] as $key => $value) {
                    $sectionHtml = str_replace("{{$key}}", $value, $sectionHtml);
                }
            }

            $mappingItems = $this->resolveMappingItems($sectionData);
            if (!empty($mappingItems)) {
                if (preg_match('/<!-- START REPEATABLE ITEM -->(.*?)<!-- END REPEATABLE ITEM -->/s', $sectionHtml, $matches)) {
                    $repeatableBlock = $matches[1];
                    $allRepeatedBlocks = '';

                    foreach ($mappingItems as $item) {
                        $itemBlock = $repeatableBlock;
                        foreach ($item as $key => $value) {
                            $itemBlock = str_replace("{item.$key}", $value, $itemBlock);
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
            
            $html .= $sectionHtml . "\n";
        }
        
        return $html;
    }

    public function getSectionHtml($section)
    {
        $sectionHtml = $section->html_template;
        $sectionData = json_decode($section->pivot->section_data, true) ?? [];
        
        if (isset($sectionData['data'])) {
            foreach ($sectionData['data'] as $key => $value) {
                $sectionHtml = str_replace("{{$key}}", $value, $sectionHtml);
            }
        }
        
        $mappingItems = $this->resolveMappingItems($sectionData);
        if (!empty($mappingItems)) {
            if (preg_match('/<!-- START REPEATABLE ITEM -->(.*?)<!-- END REPEATABLE ITEM -->/s', $sectionHtml, $matches)) {
                $repeatableBlock = $matches[1];
                $allRepeatedBlocks = '';

                foreach ($mappingItems as $item) {
                    $itemBlock = $repeatableBlock;
                    foreach ($item as $key => $value) {
                        $itemBlock = str_replace("{item.$key}", $value, $itemBlock);
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

    public function getModularPageData()
    {
        $this->load([
            'moduleEntries.module',
            'moduleEntries.relatedEntries.module',
            'sections' => function ($query) {
                $query->orderBy('order');
            }
        ]);

        // Section data
        $sectionsData = $this->sections->mapWithKeys(function ($section) {
            return [$section->identifier => $this->getSectionHtml($section)];
        })->toArray();

        $mapped = [];

        // Module data
        foreach ($this->moduleEntries as $entry) {

            if ($entry->module && $entry->module->slug) {

                $slug = $entry->module->slug;

                if (!isset($mapped[$slug])) {
                    $mapped[$slug] = [];
                }

                $mapped[$slug][] = $entry->data ?? [];
            }

            // Related modules (optional but future-safe)
            foreach ($entry->relatedEntries as $related) {

                if ($related->module && $related->module->slug) {

                    $relatedSlug = $related->module->slug;

                    if (!isset($mapped[$relatedSlug])) {
                        $mapped[$relatedSlug] = [];
                    }

                    $mapped[$relatedSlug][] = $related->data ?? [];
                }
            }
        }

        return array_merge($sectionsData, $mapped);
    }

    public function images(): HasMany
    {
        return $this->hasMany(Image::class)->orderBy('order');
    }

    public function featuredImages(): HasMany
    {
        return $this->images()->where('type', 'image');
    }

    public function icons(): HasMany
    {
        return $this->images()->where('type', 'icon');
    }

    public function degrees()
    {
        return $this->belongsToMany(Degree::class, 'degree_page', 'page_id', 'degree_id')->withTimestamps();
    }

    public function moduleEntries(): BelongsToMany
    {
        return $this->belongsToMany(ModuleEntry::class, 'module_entry_page', 'page_id', 'module_entry_id')->withTimestamps();
    }

    private function resolveMappingItems(array $sectionData): array
    {
        if (isset($sectionData['mapping_items']) && is_array($sectionData['mapping_items']) && !empty($sectionData['mapping_items'])) {
            return $sectionData['mapping_items'];
        }

        $fieldArrays = [];
        foreach ($sectionData as $key => $value) {
            if ($key === 'data' || $key === 'mapping_items') {
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
}