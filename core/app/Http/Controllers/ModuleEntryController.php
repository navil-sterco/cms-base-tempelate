<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleEntry;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class ModuleEntryController extends Controller
{
    public function index(Request $request, Module $module)
    {
        $module->fields_config = $module->fields_config ?? [];
        $module->mapping_config = $module->mapping_config ?? [];
        $module->mapping_enabled = $module->mapping_enabled ?? false;

        $search = $request->input('search');

        $entries = $module->entries()
            ->when($search, function ($query, $search) use ($module) {
                return $query->where(function ($q) use ($search, $module) {
                    foreach (($module->fields_config ?? []) as $field) {
                        $name = $field['name'] ?? null;
                        if (!$name) continue;
                        $q->orWhere("data->$name", 'like', "%{$search}%");
                    }

                    if ($module->mapping_enabled && !empty($module->mapping_config)) {
                        foreach ($module->mapping_config as $mf) {
                            $name = $mf['name'] ?? null;
                            if ($name) {
                                $q->orWhere("data->$name", 'like', "%{$search}%");
                            }
                        }
                    }
                });
            })
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (ModuleEntry $entry) {
                return [
                    'id' => $entry->id,
                    'slug' => $entry->slug,
                    'data' => $entry->data ?? [],
                    'sort_order' => $entry->sort_order,
                    'is_active' => (bool) $entry->is_active,
                    'created_at' => optional($entry->created_at)?->format('M d, Y'),
                ];
            });

        $mappedModuleEntries = $this->getMappedModuleEntries($module->mapping_config ?? []);

        return Inertia::render('ModuleEntry/Index', [
            'mappedModuleEntries' => $mappedModuleEntries,
            'module' => [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'fields_config' => $module->fields_config,
                'mapping_enabled' => (bool) $module->mapping_enabled,
                'mapping_config' => $module->mapping_config,
                'types_enabled' => (bool) ($module->types_enabled ?? false),
                'types' => $module->types ?? [],
            ],
            'entries' => $entries,
            'searchTerm' => $search ?? '',
        ]);
    }

    public function create(Module $module)
    {
        $mappedModuleEntries = $this->getMappedModuleEntries($module->mapping_config ?? []);

        return Inertia::render('ModuleEntry/Create', [
            'module' => [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'fields_config' => $module->fields_config ?? [],
                'mapping_enabled' => (bool) ($module->mapping_enabled ?? false),
                'mapping_config' => $module->mapping_config ?? [],
                'types_enabled' => (bool) ($module->types_enabled ?? false),
                'types' => $module->types ?? [],
            ],
            'mappedModuleEntries' => $mappedModuleEntries,
        ]);
    }

    public function show(Module $module, ModuleEntry $entry)
    {
        abort_unless($entry->module_id === $module->id, 404);

        return Inertia::render('ModuleEntry/Show', [
            'module' => [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'fields_config' => $module->fields_config ?? [],
                'mapping_enabled' => (bool) ($module->mapping_enabled ?? false),
                'mapping_config' => $module->mapping_config ?? [],
                'types_enabled' => (bool) ($module->types_enabled ?? false),
                'types' => $module->types ?? [],
            ],
            'entry' => [
                'id' => $entry->id,
                'slug' => $entry->slug,
                'data' => $entry->data ?? [],
                'sort_order' => $entry->sort_order,
                'is_active' => (bool) $entry->is_active,
                'created_at' => optional($entry->created_at)?->format('M d, Y'),
            ],
        ]);
    }

    public function edit(Module $module, ModuleEntry $entry)
    {
        abort_unless($entry->module_id === $module->id, 404);

        $mappedModuleEntries = $this->getMappedModuleEntries($module->mapping_config ?? []);

        return Inertia::render('ModuleEntry/Edit', [
            'module' => [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'fields_config' => $module->fields_config ?? [],
                'mapping_enabled' => (bool) ($module->mapping_enabled ?? false),
                'mapping_config' => $module->mapping_config ?? [],
                'types_enabled' => (bool) ($module->types_enabled ?? false),
                'types' => $module->types ?? [],
            ],
            'entry' => [
                'id' => $entry->id,
                'slug' => $entry->slug,
                'data' => $entry->data ?? [],
                'sort_order' => $entry->sort_order,
                'is_active' => (bool) $entry->is_active,
            ],
            'mappedModuleEntries' => $mappedModuleEntries,
        ]);
    }

    public function store(Request $request, Module $module)
    {
        $rules = $this->buildRulesFromConfig(
            $module->fields_config ?? [],
            (bool) ($module->mapping_enabled ?? false),
            $module->mapping_config ?? [],
            (bool) ($module->types_enabled ?? false),
            $module->types ?? []
        );

        // Add slug validation - must be unique per module
        $rules['slug'] = [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) use ($module) {
                if (ModuleEntry::where('module_id', $module->id)->where('slug', $value)->exists()) {
                    $fail('This slug already exists for this module.');
                }
            }
        ];

        // Add file validation rules
        $fieldsConfig = $module->fields_config ?? [];
        foreach ($fieldsConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;
            if (in_array($field['type'] ?? 'text', ['file', 'image'])) {
                $rules["data.{$name}"] = 'nullable|file|mimes:jpg,jpeg,png,gif,svg,webp,mp4,avi,mov,ico,pdf,doc,docx|max:3000';
            }
        }
        
        $mappingConfig = $module->mapping_config ?? [];
        foreach ($mappingConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;
            if (in_array($field['type'] ?? 'text', ['file', 'image'])) {
                $rules["mapping_data.{$name}.*"] = 'nullable|file|mimes:jpg,jpeg,png,gif,svg,webp,mp4,avi,mov,ico,pdf,doc,docx|max:3000';
            }
        }

        $validated = $request->validate($rules);

        $data = $validated['data'] ?? [];
        
        // Handle file uploads for regular fields
        foreach ($fieldsConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;
            if (in_array($field['type'] ?? 'text', ['file', 'image']) && $request->hasFile("data.{$name}")) {
                $file = $request->file("data.{$name}");
                $filePath = $this->uploadFile($file, $module->id);
                $data[$name] = $filePath;
            }
        }
        
        if ((bool) ($module->mapping_enabled ?? false)) {
            $mappingFields = $module->mapping_config ?? [];
            foreach ($mappingFields as $mf) {
                $name = $mf['name'] ?? null;
                if (!$name) continue;
                $data[$name] = $validated['mapping_data'][$name] ?? [];
                if (!is_array($data[$name])) {
                    $data[$name] = [];
                }
                
                // Handle file uploads for mapping fields
                if (in_array($mf['type'] ?? 'text', ['file', 'image']) && $request->hasFile("mapping_data.{$name}")) {
                    $files = $request->file("mapping_data.{$name}");
                    $uploadedPaths = [];
                    foreach ($files as $file) {
                        if ($file instanceof \Illuminate\Http\UploadedFile) {
                            $uploadedPaths[] = $this->uploadFile($file, $module->id);
                        }
                    }
                    $data[$name] = $uploadedPaths;
                }
            }
        }
        if ((bool) ($module->types_enabled ?? false) && isset($validated['type'])) {
            $data['type'] = $validated['type'];
        }

        $module->entries()->create([
            'slug' => $validated['slug'] ?? '',
            'data' => $data,
            'sort_order' => (int) ($request->input('sort_order', 0)),
            'is_active' => (bool) $request->boolean('is_active', true),
        ]);

        return redirect()
            ->route('modules.entries.index', $module->id)
            ->with('success', 'Entry added successfully!');
    }

    public function update(Request $request, Module $module, ModuleEntry $entry)
    {
        abort_unless($entry->module_id === $module->id, 404);

        $rules = $this->buildRulesFromConfig(
            $module->fields_config ?? [],
            (bool) ($module->mapping_enabled ?? false),
            $module->mapping_config ?? [],
            (bool) ($module->types_enabled ?? false),
            $module->types ?? []
        );

        // Add slug validation - must be unique per module (but can be the same as current entry)
        $rules['slug'] = [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) use ($module, $entry) {
                if (ModuleEntry::where('module_id', $module->id)
                    ->where('slug', $value)
                    ->where('id', '!=', $entry->id)
                    ->exists()) {
                    $fail('This slug already exists for this module.');
                }
            }
        ];

        // Add file validation rules - for update, always allow nullable with custom validation
        $fieldsConfig = $module->fields_config ?? [];
        foreach ($fieldsConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;
            if (in_array($field['type'] ?? 'text', ['file', 'image'])) {
                // File/image fields should ALWAYS be nullable to allow preserving existing files without re-uploading
                // User shouldn't be forced to re-upload just to edit other fields
                $rules["data.{$name}"] = [
                    'nullable',
                    function ($attribute, $value, $fail) {
                        // Accept null/empty (preserve existing), strings (existing URLs), or files (new uploads)
                        if ($value === null || $value === '') {
                            return; // Valid - will preserve existing file or remain empty
                        }
                        if (is_string($value)) {
                            return; // Valid - existing file URL
                        }
                        if ($value instanceof \Illuminate\Http\UploadedFile) {
                            // Validate file
                            if (!in_array($value->getMimeType(), [
                                'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
                                'video/mp4', 'video/x-msvideo', 'video/quicktime', 'image/x-icon',
                                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ])) {
                                $fail("The {$attribute} field has an invalid file type.");
                            } elseif ($value->getSize() > 3000 * 1024) {
                                $fail("The {$attribute} field must not exceed 3000 KB.");
                            }
                            return;
                        }
                        $fail("The {$attribute} field must be a file or string.");
                    }
                ];
            }
        }
        
        $mappingConfig = $module->mapping_config ?? [];
        foreach ($mappingConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;
            if (in_array($field['type'] ?? 'text', ['file', 'image'])) {
                // File/image fields in mapping should also always be nullable
                $rules["mapping_data.{$name}.*"] = [
                    'nullable',
                    function ($attribute, $value, $fail) {
                        // Accept null/empty, strings (existing URLs), or files
                        if ($value === null || $value === '') {
                            return; // Valid
                        }
                        if (is_string($value)) {
                            return; // Valid (existing file URL)
                        }
                        if ($value instanceof \Illuminate\Http\UploadedFile) {
                            // Validate file
                            if (!in_array($value->getMimeType(), [
                                'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
                                'video/mp4', 'video/x-msvideo', 'video/quicktime', 'image/x-icon',
                                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ])) {
                                $fail("The {$attribute} field has an invalid file type.");
                            } elseif ($value->getSize() > 3000 * 1024) {
                                $fail("The {$attribute} field must not exceed 3000 KB.");
                            }
                            return;
                        }
                        $fail("The {$attribute} field must be a file or string.");
                    }
                ];
            }
        }
        
        $validated = $request->validate($rules);

        // Get the list of explicitly deleted files from frontend
        $deletedFiles = [];
        if ($request->has('_deleted_files')) {
            $deletedFiles = json_decode($request->input('_deleted_files', '[]'), true) ?? [];
        }

        $data = $validated['data'] ?? [];
        
        // Handle file uploads for regular fields
        foreach ($fieldsConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;
            
            $value = $data[$name] ?? null;
            $isFileType = in_array($field['type'] ?? 'text', ['file', 'image']);
            
            if ($isFileType) {
                // Check if file was explicitly deleted
                if (in_array($name, $deletedFiles)) {
                    // File was deleted - set to empty
                    $data[$name] = '';
                } elseif ($value instanceof \Illuminate\Http\UploadedFile) {
                    // New file - upload it
                    $filePath = $this->uploadFile($value, $module->id);
                    $data[$name] = $filePath;
                } elseif (is_string($value) && !empty($value)) {
                    // It's an existing file path (URL string), keep it
                    $data[$name] = $value;
                } else {
                    // No file provided and not deleted, keep existing from database
                    $data[$name] = $entry->data[$name] ?? '';
                }
            } else {
                // Non-file field, keep the validated value
                $data[$name] = $validated['data'][$name] ?? ($entry->data[$name] ?? '');
            }
        }
        
        if ((bool) ($module->mapping_enabled ?? false)) {
            $mappingFields = $module->mapping_config ?? [];
            foreach ($mappingFields as $mf) {
                $name = $mf['name'] ?? null;
                if (!$name) continue;
                
                $value = $validated['mapping_data'][$name] ?? [];
                $isFileType = in_array($mf['type'] ?? 'text', ['file', 'image']);
                
                if ($isFileType && is_array($value)) {
                    // Handle file uploads for mapping fields
                    $uploadedPaths = [];
                    foreach ($value as $item) {
                        if ($item instanceof \Illuminate\Http\UploadedFile) {
                            // New file - upload it
                            $uploadedPaths[] = $this->uploadFile($item, $module->id);
                        } elseif (is_string($item) && !empty($item)) {
                            // Existing file path - keep it
                            $uploadedPaths[] = $item;
                        }
                    }
                    $data[$name] = $uploadedPaths;
                } elseif (is_array($entry->data[$name] ?? null)) {
                    // Non-file field or no new data - keep existing
                    $data[$name] = $entry->data[$name];
                } else {
                    // Ensure it's an array
                    $data[$name] = is_array($value) ? $value : [];
                }
            }
            // Remove legacy mapping_items if present
            unset($data['mapping_items']);
        }
        if ((bool) ($module->types_enabled ?? false) && isset($validated['type'])) {
            $data['type'] = $validated['type'];
        }

        $entry->update([
            'slug' => $validated['slug'] ?? $entry->slug,
            'data' => $data,
            'sort_order' => (int) ($request->input('sort_order', $entry->sort_order)),
            'is_active' => (bool) $request->boolean('is_active', $entry->is_active),
        ]);

        return redirect()
            ->route('modules.entries.index', $module->id)
            ->with('success', 'Entry updated successfully!');
    }

    public function destroy(Module $module, ModuleEntry $entry)
    {
        abort_unless($entry->module_id === $module->id, 404);

        $entry->delete();

        return redirect()
            ->route('modules.entries.index', $module->id)
            ->with('success', 'Entry deleted successfully!');
    }

    public function mapping(Module $module, ModuleEntry $entry)
    {
        abort_unless($entry->module_id === $module->id, 404);

        $entry->load(['pages:id,title', 'relatedEntries']);

        $lists = [];

        // Pages - always shown by default
        $pages = Page::select('id', 'title')->where('page_type', 'modular')->get();
        $lists[] = [
            'field' => 'page_ids',
            'label' => 'Pages',
            'icon' => '📄',
            'items' => $pages,
            'displayField' => 'title',
            'relationshipKey' => 'pages',
            'colClass' => 'col-lg-4 col-md-6 mb-3',
        ];

        // Mappable modules (checked in module config)
        $mapToModuleIds = $module->map_to_module_ids ?? [];
        $mappableModules = Module::whereIn('id', $mapToModuleIds)->get()->keyBy('id');

        foreach ($mapToModuleIds as $mid) {
            $m = $mappableModules->get($mid);
            if (!$m) continue;

            $moduleEntries = ModuleEntry::where('module_id', $mid)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'module_id', 'data']);

            $items = [];
            foreach ($moduleEntries as $me) {
                $label = $this->getEntryLabel($me->data ?? [], $m->fields_config ?? [], $me->id);
                $items[] = ['id' => $me->id, 'title' => $label];
            }

            $fieldKey = 'module_' . $mid . '_ids';
            $relatedIds = $entry->relatedEntries()->where('module_id', $mid)->pluck('module_entries.id')->toArray();

            $lists[] = [
                'field' => $fieldKey,
                'label' => $m->name,
                'icon' => '📋',
                'items' => $items,
                'displayField' => 'title',
                'relationshipKey' => 'related_' . $mid,
                'colClass' => 'col-lg-4 col-md-6 mb-3',
            ];
        }

        $entity = $entry->toArray();
        $entity['pages'] = $entry->pages->map(fn ($p) => ['id' => $p->id]);
        foreach ($mapToModuleIds as $mid) {
            $entity['related_' . $mid] = $entry->relatedEntries()->where('module_id', $mid)->get()->map(fn ($e) => ['id' => $e->id]);
        }

        return Inertia::render('ModuleEntry/Mapping', [
            'module' => ['id' => $module->id, 'name' => $module->name],
            'entry' => $entity,
            'entryLabel' => $this->getEntryLabel($entry->data ?? [], $module->fields_config ?? [], $entry->id),
            'lists' => $lists,
        ]);
    }

    public function attachMapping(Request $request, Module $module, ModuleEntry $entry)
    {
        abort_unless($entry->module_id === $module->id, 404);

        $rules = ['page_ids' => 'nullable|array', 'page_ids.*' => 'exists:pages,id'];
        $mapToModuleIds = $module->map_to_module_ids ?? [];
        foreach ($mapToModuleIds as $mid) {
            $rules['module_' . $mid . '_ids'] = 'nullable|array';
            $rules['module_' . $mid . '_ids.*'] = 'exists:module_entries,id';
        }

        $validated = $request->validate($rules);

        $entry->pages()->sync($validated['page_ids'] ?? []);

        $allRelatedIds = [];
        foreach ($mapToModuleIds as $mid) {
            $ids = $validated['module_' . $mid . '_ids'] ?? [];
            $allRelatedIds = array_merge($allRelatedIds, $ids);
        }
        $entry->relatedEntries()->sync(array_unique($allRelatedIds));

        return redirect()
            ->route('modules.entries.index', $module->id)
            ->with('success', 'Mapping saved successfully!');
    }

    private function buildRulesFromConfig(array $fieldsConfig, bool $mappingEnabled, array $mappingConfig, bool $typesEnabled = false, array $types = []): array
    {
        $rules = [
            'data' => 'required|array',
        ];

        // Add type validation if types are enabled
        if ($typesEnabled && count($types) > 0) {
            $rules['type'] = 'required|string|in:' . implode(',', $types);
        }

        foreach ($fieldsConfig as $field) {
            $name = $field['name'] ?? null;
            if (!$name) continue;

            $required = (bool) ($field['required'] ?? false);
            $type = $field['type'] ?? 'text';

            $rule = $required ? 'required' : 'nullable';

            // Map field types to basic validation; keep it permissive and consistent with UI.
            if (in_array($type, ['file', 'image'], true)) {
                // File/image fields will be validated separately with custom closures
                $rule .= '|string';
            } elseif (in_array($type, ['number'], true)) {
                $rule .= '|numeric';
            } elseif (in_array($type, ['email'], true)) {
                $rule .= '|email';
            } elseif (in_array($type, ['url'], true)) {
                $rule .= '|url';
            } elseif (in_array($type, ['checkbox'], true)) {
                $rule .= '|boolean';
            } else {
                $rule .= '|string';
            }

            $rules["data.{$name}"] = $rule;
        }

        if ($mappingEnabled) {
            $rules['mapping_data'] = 'nullable|array';

            foreach ($mappingConfig as $field) {
                $name = $field['name'] ?? null;
                if (!$name) continue;

                $rules["mapping_data.{$name}"] = 'nullable|array';
                $rules["mapping_data.{$name}.*"] = 'nullable|string';
            }
        }

        return $rules;
    }

    /**
     * Fetch entries for each module referenced in mapping_config via source_module_id.
     * Returns: [ moduleId => [ { id, label }, ... ], ... ]
     */
    private function getMappedModuleEntries(array $mappingConfig): array
    {
        $moduleIds = [];
        foreach ($mappingConfig as $field) {
            $mid = $field['source_module_id'] ?? null;
            if ($mid && is_numeric($mid)) {
                $moduleIds[] = (int) $mid;
            }
        }
        $moduleIds = array_unique($moduleIds);
        if (empty($moduleIds)) {
            return [];
        }

        $result = [];
        $modules = Module::whereIn('id', $moduleIds)->get()->keyBy('id');
        $entries = ModuleEntry::whereIn('module_id', $moduleIds)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        foreach ($moduleIds as $mid) {
            $module = $modules->get($mid);
            $moduleEntries = $entries->where('module_id', $mid);
            $items = [];
            foreach ($moduleEntries as $entry) {
                $label = $this->getEntryLabel($entry->data ?? [], $module->fields_config ?? [], $entry->id);
                $items[] = ['id' => (string) $entry->id, 'label' => $label];
            }
            $result[$mid] = $items;
        }

        return $result;
    }

    private function getEntryLabel(array $data, array $fieldsConfig, int $entryId): string
    {
        foreach ($fieldsConfig as $f) {
            $name = $f['name'] ?? null;
            if (!$name) continue;
            $v = $data[$name] ?? null;
            if ($v !== null && $v !== '') {
                return is_string($v) ? $v : json_encode($v);
            }
        }
        return 'Entry #' . $entryId;
    }

    private function uploadFile($file, $moduleId)
    {
        $extension = $file->getClientOriginalExtension();
        $filename = 'module_' . time() . '_' . uniqid() . '.' . $extension;
        
        $folder = 'assets/img/modules/' . $moduleId . '/';
        $path = public_path($folder);
        
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }
        
        $file->move($path, $filename);
        
        return asset($folder . $filename);
    }
}

