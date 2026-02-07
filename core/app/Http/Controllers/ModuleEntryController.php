<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\ModuleEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

                    if ($module->mapping_enabled) {
                        $q->orWhere('data->mapping_items', 'like', "%{$search}%");
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
                    'data' => $entry->data ?? [],
                    'sort_order' => $entry->sort_order,
                    'is_active' => (bool) $entry->is_active,
                    'created_at' => optional($entry->created_at)?->format('M d, Y'),
                ];
            });

        return Inertia::render('ModuleEntry/Index', [
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
                'data' => $entry->data ?? [],
                'sort_order' => $entry->sort_order,
                'is_active' => (bool) $entry->is_active,
            ],
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

        $validated = $request->validate($rules);

        $data = $validated['data'] ?? [];
        if ((bool) ($module->mapping_enabled ?? false)) {
            $data['mapping_items'] = $validated['mapping_items'] ?? [];
        }
        if ((bool) ($module->types_enabled ?? false) && isset($validated['type'])) {
            $data['type'] = $validated['type'];
        }

        $module->entries()->create([
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
        $validated = $request->validate($rules);

        $data = $validated['data'] ?? [];
        if ((bool) ($module->mapping_enabled ?? false)) {
            $data['mapping_items'] = $validated['mapping_items'] ?? [];
        }
        if ((bool) ($module->types_enabled ?? false) && isset($validated['type'])) {
            $data['type'] = $validated['type'];
        }

        $entry->update([
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
            if (in_array($type, ['number'], true)) {
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
            $rules['mapping_items'] = 'nullable|array';

            foreach ($mappingConfig as $field) {
                $name = $field['name'] ?? null;
                if (!$name) continue;

                $required = (bool) ($field['required'] ?? false);
                $type = $field['type'] ?? 'text';

                $rule = $required ? 'required' : 'nullable';

                if (in_array($type, ['number'], true)) {
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

                $rules["mapping_items.*.{$name}"] = $rule;
            }
        }

        return $rules;
    }
}

