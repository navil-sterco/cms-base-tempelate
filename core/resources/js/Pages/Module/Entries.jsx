import React, { useMemo, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { renderFieldInput } from '@/Pages/ModuleEntry/entryFormHelpers';

const migrateToMappingData = (entryData, mappingFields) => {
    const oldItems = entryData?.mapping_items;
    if (Array.isArray(oldItems) && oldItems.length > 0) {
        const result = {};
        (mappingFields || []).forEach((mf) => {
            const name = mf?.name;
            if (name) result[name] = oldItems.map((item) => item[name] ?? '');
        });
        return result;
    }
    const result = {};
    (mappingFields || []).forEach((mf) => {
        const name = mf?.name;
        if (name) result[name] = Array.isArray(entryData?.[name]) ? [...entryData[name]] : [];
    });
    return result;
};

const Entries = ({ module, entries, searchTerm, mappedModuleEntries = {} }) => {
    const fields = useMemo(() => (Array.isArray(module?.fields_config) ? module.fields_config : []), [module]);
    const mappingFields = useMemo(() => (Array.isArray(module?.mapping_config) ? module.mapping_config : []), [module]);
    const mappingEnabled = !!module?.mapping_enabled;

    const emptyData = useMemo(() => {
        const obj = {};
        fields.forEach((f) => {
            if (f?.name) obj[f.name] = f?.type === 'checkbox' ? false : '';
        });
        return obj;
    }, [fields]);

    const emptyMappingData = useMemo(() => {
        const obj = {};
        mappingFields.forEach((f) => {
            if (f?.name) obj[f.name] = [];
        });
        return obj;
    }, [mappingFields]);

    const { data, setData, post, processing, errors, reset } = useForm({
        data: emptyData,
        mapping_data: emptyMappingData,
        sort_order: 0,
        is_active: true,
    });

    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [editingMappingData, setEditingMappingData] = useState({});

    const startEdit = (entry) => {
        setEditingId(entry.id);
        const entryData = entry.data || {};
        const mappingFieldNames = new Set((mappingFields || []).map((f) => f.name).filter(Boolean));
        const regular = { ...entryData };
        delete regular.mapping_items;
        mappingFieldNames.forEach((n) => delete regular[n]);
        setEditingData(regular);
        setEditingMappingData(migrateToMappingData(entryData, mappingFields));
    };

    const stopEdit = () => {
        setEditingId(null);
        setEditingData({});
        setEditingMappingData({});
    };

    const submitNew = (e) => {
        e.preventDefault();
        post(route('modules.entries.store', module.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        router.put(route('modules.entries.update', { module: module.id, entry: editingId }), {
            data: editingData,
            mapping_data: editingMappingData,
        }, { preserveScroll: true, onSuccess: stopEdit });
    };

    const deleteEntry = (entryId) => {
        router.delete(route('modules.entries.destroy', { module: module.id, entry: entryId }), { preserveScroll: true });
    };

    const addMappingItem = (fieldName) => {
        setData('mapping_data', {
            ...(data.mapping_data || {}),
            [fieldName]: [...(data.mapping_data?.[fieldName] || []), ''],
        });
    };

    const removeMappingItem = (fieldName, index) => {
        const arr = [...(data.mapping_data?.[fieldName] || [])];
        arr.splice(index, 1);
        setData('mapping_data', { ...(data.mapping_data || {}), [fieldName]: arr });
    };

    const updateMappingItem = (fieldName, index, value) => {
        const arr = [...(data.mapping_data?.[fieldName] || [])];
        arr[index] = value;
        setData('mapping_data', { ...(data.mapping_data || {}), [fieldName]: arr });
    };

    const addEditingMappingItem = (fieldName) => {
        setEditingMappingData({
            ...editingMappingData,
            [fieldName]: [...(editingMappingData[fieldName] || []), ''],
        });
    };

    const removeEditingMappingItem = (fieldName, index) => {
        const arr = [...(editingMappingData[fieldName] || [])];
        arr.splice(index, 1);
        setEditingMappingData({ ...editingMappingData, [fieldName]: arr });
    };

    const updateEditingMappingItem = (fieldName, index, value) => {
        const arr = [...(editingMappingData[fieldName] || [])];
        arr[index] = value;
        setEditingMappingData({ ...editingMappingData, [fieldName]: arr });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">{module?.name} Entries</h1>
                    <p className="text-muted mb-0">
                        Add multiple items for this module using the fields you defined.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Link href={route('modules.edit', module.id)} className="btn btn-outline-primary">
                        <i className="bx bx-edit me-2"></i>
                        Edit Module Fields
                    </Link>
                    <Link href={route('modules.index')} className="btn btn-secondary">
                        <i className="bx bx-arrow-back me-2"></i>
                        Back
                    </Link>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Add New {module?.name}</h5>
                </div>
                <div className="card-body">
                    {fields.length === 0 ? (
                        <div className="alert alert-warning mb-0">
                            This module has no fields yet. Add fields in <code>Edit Module Fields</code> first.
                        </div>
                    ) : (
                        <form onSubmit={submitNew}>
                            <div className="row g-3">
                                {fields.map((field) => (
                                    <div key={field.name} className="col-md-6">
                                        <label className="form-label">
                                            {field.label || field.name}
                                            {field.required && <span className="text-danger"> *</span>}
                                        </label>
                                        {renderFieldInput(field, data.data[field.name], (v) => setData('data', { ...data.data, [field.name]: v }), { moduleEntries: mappedModuleEntries })}
                                        {errors?.[`data.${field.name}`] && (
                                            <div className="text-danger small">{errors[`data.${field.name}`]}</div>
                                        )}
                                    </div>
                                ))}

                                {mappingEnabled && mappingFields.length > 0 && (
                                    <div className="col-12">
                                        <h6 className="mb-3">Repeatable Items (each field has its own array)</h6>
                                        <div className="d-flex flex-column gap-4">
                                            {mappingFields.map((mf) => (
                                                <div key={mf.name} className="border rounded p-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <strong>{mf.label || mf.name}</strong>
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addMappingItem(mf.name)}>
                                                            <i className="bx bx-plus me-1"></i>
                                                            Add Item
                                                        </button>
                                                    </div>
                                                    {(data.mapping_data?.[mf.name] || []).length === 0 ? (
                                                        <div className="text-muted small">No items yet.</div>
                                                    ) : (
                                                        <div className="d-flex flex-column gap-2">
                                                            {(data.mapping_data?.[mf.name] || []).map((val, idx) => (
                                                                <div key={idx} className="d-flex align-items-center gap-2">
                                                                    <div className="flex-grow-1">
                                                                        {renderFieldInput(mf, val, (v) => updateMappingItem(mf.name, idx, v), { moduleEntries: mappedModuleEntries })}
                                                                    </div>
                                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeMappingItem(mf.name, idx)}>
                                                                        <i className="bx bx-trash"></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bx bx-plus me-2"></i>
                                                Add Entry
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">All Entries ({entries?.data?.length ?? 0})</h5>
                        <div style={{ width: 320 }}>
                            <input
                                className="form-control form-control-sm"
                                placeholder="Search..."
                                defaultValue={searchTerm}
                                onChange={(e) => {
                                    router.get(route('modules.entries.index', module.id), { search: e.target.value }, { preserveState: true, replace: true });
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {entries.data.length === 0 ? (
                        <div className="alert alert-info mb-0">
                            No entries yet. Add your first one above.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th width="80">ID</th>
                                        {fields.map((f) => (
                                            <th key={f.name}>{f.label || f.name}</th>
                                        ))}
                                        <th width="160">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.data.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.id}</td>
                                            {fields.map((f) => (
                                                <td key={f.name}>
                                                    {editingId === entry.id ? (
                                                        renderFieldInput(f, editingData[f.name], (v) => setEditingData({ ...editingData, [f.name]: v }), { moduleEntries: mappedModuleEntries })
                                                    ) : (
                                                        <span>{String(entry.data?.[f.name] ?? '')}</span>
                                                    )}
                                                </td>
                                            ))}
                                            <td>
                                                {editingId === entry.id ? (
                                                    <div className="btn-group btn-group-sm">
                                                        <button type="button" className="btn btn-outline-primary" onClick={submitEdit}>
                                                            <i className="bx bx-save"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-outline-secondary" onClick={stopEdit}>
                                                            <i className="bx bx-x"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Link
                                                            className="btn btn-sm btn-outline-primary p-1"
                                                            href={route('modules.entries.mapping', { module: module.id, entry: entry.id })}
                                                        >
                                                            <i className="bx bx-right-arrow-circle me-1"></i>
                                                            Mapping
                                                        </Link>
                                                        <div className="btn-group btn-group-sm">
                                                            <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(entry)}>
                                                                <i className="bx bx-edit"></i>
                                                            </button>
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => deleteEntry(entry.id)}>
                                                                <i className="bx bx-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {mappingEnabled && mappingFields.length > 0 && editingId && (
                                <div className="mt-4 border-top pt-3">
                                    <h6 className="mb-3">Edit Repeatable Items (Entry #{editingId})</h6>
                                    <div className="d-flex flex-column gap-4">
                                        {mappingFields.map((mf) => (
                                            <div key={mf.name} className="border rounded p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <strong>{mf.label || mf.name}</strong>
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addEditingMappingItem(mf.name)}>
                                                        <i className="bx bx-plus me-1"></i>
                                                        Add Item
                                                    </button>
                                                </div>
                                                {(editingMappingData[mf.name] || []).length === 0 ? (
                                                    <div className="text-muted small">No items yet.</div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        {(editingMappingData[mf.name] || []).map((val, idx) => (
                                                            <div key={idx} className="d-flex align-items-center gap-2">
                                                                <div className="flex-grow-1">
                                                                    {renderFieldInput(mf, val, (v) => updateEditingMappingItem(mf.name, idx, v), { moduleEntries: mappedModuleEntries })}
                                                                </div>
                                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeEditingMappingItem(mf.name, idx)}>
                                                                    <i className="bx bx-trash"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Entries;
