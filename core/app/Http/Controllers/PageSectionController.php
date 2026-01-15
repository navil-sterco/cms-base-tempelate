<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageSectionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $sections = PageSection::when($search, function($query, $search) {
            return $query->where('name', 'like', "%{$search}%")
                       ->orWhere('identifier', 'like', "%{$search}%");
        })
        ->orderBy('id', 'desc')
        ->paginate(10)
        ->withQueryString()
        ->through(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->name,
                'identifier' => $section->identifier,
                'html_template' => Str::limit($section->html_template, 100),
                'fields_count' => count($section->fields_config ?? []),
                'mapping_count' => $section->mapping_enabled ? count($section->mapping_config ?? []) : 0,
                'mapping_enabled' => $section->mapping_enabled,
                'is_active' => $section->is_active,
                'created_at' => $section->created_at->format('M d, Y'),
                'used_in_pages' => $section->pages()->count(),
            ];
        });

        return Inertia::render('PageSection/Index', [
            'sections' => $sections,
            'searchTerm' => $search ?? '',
        ]);
    }

    public function create()
    {
        return Inertia::render('PageSection/Create');
    }

    public function store(Request $request)
    {
        $fieldsConfig = $request->input('fields_config');
        if (is_string($fieldsConfig)) {
            $decoded = json_decode($fieldsConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'fields_config' => 'Invalid JSON format for fields configuration.'
                ])->withInput();
            }
            $request->merge(['fields_config' => $decoded]);
        }
        
        $mappingConfig = $request->input('mapping_config');
        if (is_string($mappingConfig)) {
            $decoded = json_decode($mappingConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'mapping_config' => 'Invalid JSON format for mapping configuration.'
                ])->withInput();
            }
            $request->merge(['mapping_config' => $decoded]);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'identifier' => 'required|string|max:255|unique:page_sections,identifier',
            'html_template' => 'required|string',
            'fields_config' => 'nullable|array',
            'fields_config.*.name' => 'required|string',
            'fields_config.*.type' => 'required|string|in:text,textarea,number,email,url,select,checkbox,radio,file,date,image,code,color',
            'fields_config.*.label' => 'required|string',
            'fields_config.*.required' => 'boolean',
            'fields_config.*.options' => 'nullable|array',
            'mapping_config' => 'nullable|array',
            'mapping_config.*.name' => 'required|string',
            'mapping_config.*.type' => 'required|string|in:text,textarea,number,email,url,select,checkbox,radio,file,date,image,code,color',
            'mapping_config.*.label' => 'required|string',
            'mapping_config.*.required' => 'boolean',
            'mapping_config.*.options' => 'nullable|array',
            'mapping_enabled' => 'boolean',
            'css_styles' => 'nullable|string',
            'javascript' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        PageSection::create($validated);

        return redirect()->route('page-sections.index')
            ->with('success', 'Page section created successfully!');
    }

    public function show(PageSection $pageSection)
    {
        return Inertia::render('PageSection/Show', [
            'section' => $pageSection->load('pages')
        ]);
    }

    public function edit(PageSection $pageSection)
    {
        return Inertia::render('PageSection/Edit', [
            'section' => $pageSection
        ]);
    }

    public function update(Request $request, PageSection $pageSection)
    {
        // Process fields_config
        $rawFieldsConfig = $request->input('fields_config');
        if (is_string($rawFieldsConfig)) {
            $decoded = json_decode($rawFieldsConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'fields_config' => 'Invalid JSON format for fields configuration.'
                ])->withInput();
            }
            $request->merge(['fields_config' => $decoded]);
        }

        // Process mapping_config
        $rawMappingConfig = $request->input('mapping_config');
        if (is_string($rawMappingConfig)) {
            $decoded = json_decode($rawMappingConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'mapping_config' => 'Invalid JSON format for mapping configuration.'
                ])->withInput();
            }
            $request->merge(['mapping_config' => $decoded]);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'identifier' => 'required|string|max:255|unique:page_sections,identifier,' . $pageSection->id,
            'html_template' => 'required|string',
            'fields_config' => 'nullable|array',
            'fields_config.*.name' => 'required|string',
            'fields_config.*.type' => 'required|string|in:text,textarea,number,email,url,select,checkbox,radio,file,date,image,code,color',
            'fields_config.*.label' => 'required|string',
            'fields_config.*.required' => 'boolean',
            'fields_config.*.options' => 'nullable|array',
            'mapping_config' => 'nullable|array',
            'mapping_config.*.name' => 'required|string',
            'mapping_config.*.type' => 'required|string|in:text,textarea,number,email,url,select,checkbox,radio,file,date,image,code,color',
            'mapping_config.*.label' => 'required|string',
            'mapping_config.*.required' => 'boolean',
            'mapping_config.*.options' => 'nullable|array',
            'mapping_enabled' => 'boolean',
            'css_styles' => 'nullable|string',
            'javascript' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $pageSection->update($validated);

        return redirect()->route('page-sections.index')
            ->with('success', 'Page section updated successfully!');
    }

    public function destroy(PageSection $pageSection)
    {
        if ($pageSection->pages()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete section. It is being used in pages.');
        }

        $pageSection->delete();

        return redirect()->route('page-sections.index')
            ->with('success', 'Page section deleted successfully!');
    }

    public function toggleStatus(PageSection $pageSection)
    {
        $pageSection->update([
            'is_active' => !$pageSection->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Section status updated successfully!');
    }
}