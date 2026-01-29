import React, { useMemo, useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';

const Entries = ({ module, entries, searchTerm }) => {
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

    const { data, setData, post, processing, errors, reset } = useForm({
        data: emptyData,
        mapping_items: [],
        sort_order: 0,
        is_active: true,
    });

    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({});
    const [editingMappingItems, setEditingMappingItems] = useState([]);

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setEditingData({ ...(entry.data || {}) });
        setEditingMappingItems([...(entry.data?.mapping_items || [])]);
    };

    const stopEdit = () => {
        setEditingId(null);
        setEditingData({});
        setEditingMappingItems([]);
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
            mapping_items: editingMappingItems,
        }, { preserveScroll: true, onSuccess: stopEdit });
    };

    const deleteEntry = (entryId) => {
        router.delete(route('modules.entries.destroy', { module: module.id, entry: entryId }), { preserveScroll: true });
    };

    const renderInput = (field, value, onChange) => {
        const required = !!field.required;
        const placeholder = field.placeholder || '';

        if (field.type === 'textarea') {
            return (
                <textarea
                    className="form-control"
                    rows={3}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                />
            );
        }

        if (field.type === 'select') {
            const options = Array.isArray(field.options) ? field.options : [];
            return (
                <select
                    className="form-select"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                >
                    <option value="">Select</option>
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt.value || opt}>
                            {opt.label || opt}
                        </option>
                    ))}
                </select>
            );
        }

        if (field.type === 'checkbox') {
            return (
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                </div>
            );
        }

        const htmlType = field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : 'text');
        return (
            <input
                type={htmlType}
                className="form-control"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
            />
        );
    };

    const renderMappingInput = (field, value, onChange) => {
        return renderInput(field, value, onChange);
    };

    const addMappingItem = () => {
        const item = {};
        mappingFields.forEach((f) => {
            if (f?.name) item[f.name] = f?.type === 'checkbox' ? false : '';
        });
        setData('mapping_items', [...(data.mapping_items || []), item]);
    };

    const removeMappingItem = (index) => {
        setData('mapping_items', (data.mapping_items || []).filter((_, i) => i !== index));
    };

    const updateMappingItem = (index, fieldName, value) => {
        const items = [...(data.mapping_items || [])];
        items[index] = { ...(items[index] || {}), [fieldName]: value };
        setData('mapping_items', items);
    };

    const addEditingMappingItem = () => {
        const item = {};
        mappingFields.forEach((f) => {
            if (f?.name) item[f.name] = f?.type === 'checkbox' ? false : '';
        });
        setEditingMappingItems([...(editingMappingItems || []), item]);
    };

    const removeEditingMappingItem = (index) => {
        setEditingMappingItems((editingMappingItems || []).filter((_, i) => i !== index));
    };

    const updateEditingMappingItem = (index, fieldName, value) => {
        const items = [...(editingMappingItems || [])];
        items[index] = { ...(items[index] || {}), [fieldName]: value };
        setEditingMappingItems(items);
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
                                        {renderInput(field, data.data[field.name], (v) => setData('data', { ...data.data, [field.name]: v }))}
                                        {errors?.[`data.${field.name}`] && (
                                            <div className="text-danger small">{errors[`data.${field.name}`]}</div>
                                        )}
                                    </div>
                                ))}

                                {mappingEnabled && mappingFields.length > 0 && (
                                    <div className="col-12">
                                        <div className="border rounded p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">Repeatable Items</h6>
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addMappingItem}>
                                                    <i className="bx bx-plus me-1"></i>
                                                    Add Item
                                                </button>
                                            </div>

                                            {(data.mapping_items || []).length === 0 ? (
                                                <div className="text-muted small">No items yet.</div>
                                            ) : (
                                                <div className="d-flex flex-column gap-3">
                                                    {(data.mapping_items || []).map((item, idx) => (
                                                        <div key={idx} className="border rounded p-3 bg-light">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <strong>Item #{idx + 1}</strong>
                                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeMappingItem(idx)}>
                                                                    <i className="bx bx-trash"></i>
                                                                </button>
                                                            </div>
                                                            <div className="row g-3">
                                                                {mappingFields.map((mf) => (
                                                                    <div key={mf.name} className="col-md-6">
                                                                        <label className="form-label">
                                                                            {mf.label || mf.name}
                                                                            {mf.required && <span className="text-danger"> *</span>}
                                                                        </label>
                                                                        {renderMappingInput(mf, item[mf.name], (v) => updateMappingItem(idx, mf.name, v))}
                                                                        {errors?.[`mapping_items.${idx}.${mf.name}`] && (
                                                                            <div className="text-danger small">{errors[`mapping_items.${idx}.${mf.name}`]}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                                        renderInput(f, editingData[f.name], (v) => setEditingData({ ...editingData, [f.name]: v }))
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
                                                    <div className="btn-group btn-group-sm">
                                                        <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(entry)}>
                                                            <i className="bx bx-edit"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-outline-danger" onClick={() => deleteEntry(entry.id)}>
                                                            <i className="bx bx-trash"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {mappingEnabled && mappingFields.length > 0 && editingId && (
                                <div className="mt-4 border-top pt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">Edit Repeatable Items (Entry #{editingId})</h6>
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addEditingMappingItem}>
                                            <i className="bx bx-plus me-1"></i>
                                            Add Item
                                        </button>
                                    </div>

                                    {(editingMappingItems || []).length === 0 ? (
                                        <div className="text-muted small">No items yet.</div>
                                    ) : (
                                        <div className="d-flex flex-column gap-3">
                                            {(editingMappingItems || []).map((item, idx) => (
                                                <div key={idx} className="border rounded p-3 bg-light">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <strong>Item #{idx + 1}</strong>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeEditingMappingItem(idx)}>
                                                            <i className="bx bx-trash"></i>
                                                        </button>
                                                    </div>
                                                    <div className="row g-3">
                                                        {mappingFields.map((mf) => (
                                                            <div key={mf.name} className="col-md-6">
                                                                <label className="form-label">
                                                                    {mf.label || mf.name}
                                                                    {mf.required && <span className="text-danger"> *</span>}
                                                                </label>
                                                                {renderMappingInput(mf, item[mf.name], (v) => updateEditingMappingItem(idx, mf.name, v))}
                                                                {errors?.[`mapping_items.${idx}.${mf.name}`] && (
                                                                    <div className="text-danger small">{errors[`mapping_items.${idx}.${mf.name}`]}</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

