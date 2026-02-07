<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $modules = Module::query()
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($module) {
                return [
                    'id' => $module->id,
                    'name' => $module->name,
                    'slug' => $module->slug,
                    'fields_count' => count($module->fields_config ?? []),
                    'is_active' => (bool) $module->is_active,
                    'created_at' => optional($module->created_at)?->format('M d, Y'),
                ];
            });

        return Inertia::render('Module/Index', [
            'modules' => $modules,
            'searchTerm' => $search ?? '',
        ]);
    }

    public function create()
    {
        return Inertia::render('Module/Create');
    }

    public function store(Request $request)
    {
        $fieldsConfig = $request->input('fields_config');
        if (is_string($fieldsConfig)) {
            $decoded = json_decode($fieldsConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'fields_config' => 'Invalid JSON format for fields configuration.',
                ])->withInput();
            }
            $request->merge(['fields_config' => $decoded]);
        }

        $mappingConfig = $request->input('mapping_config');
        if (is_string($mappingConfig)) {
            $decoded = json_decode($mappingConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'mapping_config' => 'Invalid JSON format for mapping configuration.',
                ])->withInput();
            }
            $request->merge(['mapping_config' => $decoded]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:modules,slug',
            'auto_generate_slug' => 'boolean',
            'fields_config' => 'nullable|array',
            'fields_config.*.name' => 'required|string',
            'fields_config.*.type' => 'required|string|in:text,textarea,number,email,url,select,checkbox,radio,file,date,image,code,color',
            'fields_config.*.label' => 'required|string',
            'fields_config.*.placeholder' => 'required|string',
            'fields_config.*.default' => 'required|string',
            'fields_config.*.required' => 'boolean',
            'fields_config.*.options' => 'nullable|array',
            'mapping_config' => 'nullable|array',
            'mapping_config.*.name' => 'required|string',
            'mapping_config.*.type' => 'required|string|in:text,textarea,number,email,url,select,checkbox,radio,file,date,image,code,color',
            'mapping_config.*.label' => 'required|string',
            'mapping_config.*.required' => 'boolean',
            'mapping_config.*.options' => 'nullable|array',
            'mapping_enabled' => 'boolean',
            'types_enabled' => 'boolean',
            'types' => 'nullable|array',
            'types.*' => 'string|max:255',
            'is_active' => 'boolean',
        ]);

        // Auto-generate slug if enabled or if slug is empty
        if (($validated['auto_generate_slug'] ?? true) || empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        Module::create($validated);

        return redirect()->route('modules.index')
            ->with('success', 'Module created successfully!');
    }

    public function edit(Module $module)
    {
        return Inertia::render('Module/Edit', [
            'module' => $module,
        ]);
    }

    public function update(Request $request, Module $module)
    {
        $rawFieldsConfig = $request->input('fields_config');
        if (is_string($rawFieldsConfig)) {
            $decoded = json_decode($rawFieldsConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'fields_config' => 'Invalid JSON format for fields configuration.',
                ])->withInput();
            }
            $request->merge(['fields_config' => $decoded]);
        }

        $rawMappingConfig = $request->input('mapping_config');
        if (is_string($rawMappingConfig)) {
            $decoded = json_decode($rawMappingConfig, true);
            if (!is_array($decoded)) {
                return back()->withErrors([
                    'mapping_config' => 'Invalid JSON format for mapping configuration.',
                ])->withInput();
            }
            $request->merge(['mapping_config' => $decoded]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:modules,slug,' . $module->id,
            'auto_generate_slug' => 'boolean',
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
            'types_enabled' => 'boolean',
            'types' => 'nullable|array',
            'types.*' => 'string|max:255',
            'is_active' => 'boolean',
        ]);

        // Auto-generate slug if enabled
        if ($validated['auto_generate_slug'] ?? false) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $module->update($validated);

        return redirect()->route('modules.index')
            ->with('success', 'Module updated successfully!');
    }

    public function destroy(Module $module)
    {
        // Delete all related entries (safety in addition to DB cascade)
        $module->entries()->delete();

        $module->delete();

        return redirect()->route('modules.index')
            ->with('success', 'Module deleted successfully!');
    }
}

