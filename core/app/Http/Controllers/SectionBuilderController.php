<?php
namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SectionBuilderController extends Controller
{
    public function sections(Request $request, $pageId)
    {
        $page = Page::findOrFail($pageId);
        $page->load(['sections' => function($query) {
            $query->orderBy('order');
        }]);

        $activeSections = $page->sections->map(function($section) {
            $section->fields_config = $section->fields_config ?? [];
            $section->mapping_config = $section->mapping_config ?? [];
            $section->mapping_enabled = $section->mapping_enabled ?? false;
            return $section;
        });

        $sections = PageSection::active()->get(['id', 'name', 'identifier', 'fields_config', 'mapping_config', 'mapping_enabled']);

        return Inertia::render('Page/Sections', [
            'page' => $page,
            'activeSections' => $activeSections,
            'sections' => $sections,
        ]);
    }

    public function storeSections(Request $request, $pageId)
    {
        $page = Page::findOrFail($pageId);
        
        $request->validate([
            'sections' => 'required|array',
            'sections.*.section_id' => 'required|exists:page_sections,id',
            'sections.*.order' => 'required|integer',
            'sections.*.section_data' => 'required|string',
            'sections.*.files' => 'sometimes|array',
            'sections.*.mapping_files' => 'sometimes|array',
            'sections.*.files.*' => 'file|mimes:jpg,jpeg,png,gif,svg,webp,mp4,avi,mov,ico|max:3000',
            'sections.*.mapping_files.*.*.*' => 'file|mimes:jpg,jpeg,png,gif,svg,webp,mp4,avi,mov,ico|max:3000',
        ]);

        try {
            $page->sections()->detach();
            
            foreach ($request->sections as $index => $sectionData) {
                $parsedData = json_decode($sectionData['section_data'], true);
                
                if (isset($sectionData['files'])) {
                    foreach ($sectionData['files'] as $fieldName => $file) {
                        if ($file instanceof \Illuminate\Http\UploadedFile) {
                            $filePath = $this->uploadFile($file, $page->id);
                            $parsedData['data'][$fieldName] = $filePath;
                        }
                    }
                }
                
                if (isset($sectionData['mapping_files'])) {
                    foreach ($sectionData['mapping_files'] as $itemIndex => $itemFiles) {
                        foreach ($itemFiles as $fieldName => $file) {
                            if ($file instanceof \Illuminate\Http\UploadedFile) {
                                $filePath = $this->uploadFile($file, $page->id);
                                $parsedData['mapping_items'][$itemIndex][$fieldName] = $filePath;
                            }
                        }
                    }
                }

                $page->sections()->attach($sectionData['section_id'], [
                    'order' => $sectionData['order'],
                    'section_data' => json_encode($parsedData),
                ]);
            }

            return redirect()->back()->with('success', 'Sections saved successfully!');
            
        } catch (\Exception $e) {
            \Log::error('Error saving sections: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Error saving sections: ' . $e->getMessage());
        }
    }

    private function uploadFile($file, $pageId)
    {
        $extension = $file->getClientOriginalExtension();
        $filename = 'section_' . time() . '_' . uniqid() . '.' . $extension;
        
        $folder = 'assets/img/pages/' . $pageId . '/';
        $path = public_path($folder);
        
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }
        
        $file->move($path, $filename);
        
        return asset($folder . $filename);
    }

    public function destroySection($id)
    {
        DB::table('page_section')->where('id', $id)->delete();
        return back()->with('success', 'Section deleted successfully!');
    }
}