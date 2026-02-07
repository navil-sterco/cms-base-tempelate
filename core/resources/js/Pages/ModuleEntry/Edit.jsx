import React, { useMemo } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { buildEmptyData, buildEmptyMappingItem, renderFieldInput } from './entryFormHelpers';

const Edit = ({ module, entry }) => {
    const fields = useMemo(() => (Array.isArray(module?.fields_config) ? module.fields_config : []), [module]);
    const mappingEnabled = !!module?.mapping_enabled;
    const mappingFields = useMemo(() => (Array.isArray(module?.mapping_config) ? module.mapping_config : []), [module]);
    const typesEnabled = !!module?.types_enabled;
    const types = useMemo(() => (Array.isArray(module?.types) ? module.types : []), [module]);

    const entryData = entry?.data || {};
    const { data, setData, put, processing, errors } = useForm({
        type: entryData.type || '',
        data: { ...buildEmptyData(fields), ...entryData },
        mapping_items: entryData.mapping_items || [],
        sort_order: entry?.sort_order ?? 0,
        is_active: entry?.is_active ?? true,
    });

    const addMappingItem = () => {
        setData('mapping_items', [...(data.mapping_items || []), buildEmptyMappingItem(mappingFields)]);
    };

    const removeMappingItem = (index) => {
        setData('mapping_items', (data.mapping_items || []).filter((_, i) => i !== index));
    };

    const updateMappingItem = (index, fieldName, value) => {
        const items = [...(data.mapping_items || [])];
        items[index] = { ...(items[index] || {}), [fieldName]: value };
        setData('mapping_items', items);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('modules.entries.update', { module: module.id, entry: entry.id }));
    };

    return (
        <>
            <h1 className="text-muted">Edit {module?.name}</h1>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <div className="row g-3">
                            {typesEnabled && types.length > 0 && (
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Type <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors?.type ? 'is-invalid' : ''}`}
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {types.map((type, idx) => (
                                            <option key={idx} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors?.type && <div className="text-danger small">{errors.type}</div>}
                                </div>
                            )}

                            {fields.map((field) => (
                                <div key={field.name} className="col-md-6">
                                    <label className="form-label">
                                        {field.label || field.name}
                                        {field.required && <span className="text-danger"> *</span>}
                                    </label>
                                    {renderFieldInput(field, data.data[field.name], (v) => setData('data', { ...data.data, [field.name]: v }))}
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
                                                                    {renderFieldInput(mf, item[mf.name], (v) => updateMappingItem(idx, mf.name, v))}
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

                            <div className="col-12 mt-2">
                                <button type="submit" className="btn btn-primary me-2" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bx bx-save me-2"></i>
                                            Update
                                        </>
                                    )}
                                </button>
                                <Link href={route('modules.entries.index', module.id)} className="btn btn-secondary">
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Edit;

