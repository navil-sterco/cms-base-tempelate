<?php
namespace App\Models;

use App\Models\Image;
use App\Models\Degree;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
            
            // Handle mapping (repeatable) items
            if (isset($sectionData['mapping_items']) && !empty($sectionData['mapping_items'])) {
                // Find the repeatable block in the template
                if (preg_match('/<!-- START REPEATABLE ITEM -->(.*?)<!-- END REPEATABLE ITEM -->/s', $sectionHtml, $matches)) {
                    $repeatableBlock = $matches[1];
                    $allRepeatedBlocks = '';
                    
                    foreach ($sectionData['mapping_items'] as $item) {
                        $itemBlock = $repeatableBlock;
                        foreach ($item as $key => $value) {
                            $itemBlock = str_replace("{item.$key}", $value, $itemBlock);
                        }
                        $allRepeatedBlocks .= $itemBlock;
                    }
                    
                    // Replace the original block with all repeated blocks
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
        
        if (isset($sectionData['mapping_items']) && !empty($sectionData['mapping_items'])) {
            if (preg_match('/<!-- START REPEATABLE ITEM -->(.*?)<!-- END REPEATABLE ITEM -->/s', $sectionHtml, $matches)) {
                $repeatableBlock = $matches[1];
                $allRepeatedBlocks = '';
                
                foreach ($sectionData['mapping_items'] as $item) {
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
}