import React, { useMemo, useState, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { buildEmptyData, renderFieldInput } from './entryFormHelpers';

const migrateMappingItemsToMappingData = (entryData, mappingFields) => {
    const mappingItems = entryData?.mapping_items;
    if (Array.isArray(mappingItems) && mappingItems.length > 0) {
        const result = {};
        (mappingFields || []).forEach((mf) => {
            const name = mf?.name;
            if (name) result[name] = mappingItems.map((item) => item[name] ?? '').filter((v) => v !== null && v !== undefined);
        });
        return result;
    }
    const result = {};
    (mappingFields || []).forEach((mf) => {
        const name = mf?.name;
        if (name && Array.isArray(entryData?.[name])) {
            result[name] = [...entryData[name]];
        } else {
            result[name] = [];
        }
    });
    return result;
};

const Edit = ({ module, entry, mappedModuleEntries = {} }) => {
    const fields = useMemo(() => (Array.isArray(module?.fields_config) ? module.fields_config : []), [module]);
    const mappingEnabled = !!module?.mapping_enabled;
    const mappingFields = useMemo(() => (Array.isArray(module?.mapping_config) ? module.mapping_config : []), [module]);
    const typesEnabled = !!module?.types_enabled;
    const types = useMemo(() => (Array.isArray(module?.types) ? module.types : []), [module]);

    const entryData = entry?.data || {};
    const mappingData = useMemo(() => migrateMappingItemsToMappingData(entryData, mappingFields), [entryData, mappingFields]);
    const mappingFieldNames = useMemo(() => new Set((mappingFields || []).map((f) => f.name).filter(Boolean)), [mappingFields]);
    const regularData = useMemo(() => {
        const d = { ...entryData };
        delete d.mapping_items;
        mappingFieldNames.forEach((n) => delete d[n]);
        return d;
    }, [entryData, mappingFieldNames]);

    // File management state
    const [files, setFiles] = useState({});
    const [filePreviews, setFilePreviews] = useState({});
    const [mappingFiles, setMappingFiles] = useState({});
    const [mappingFilePreviews, setMappingFilePreviews] = useState({});
    const [deletedFiles, setDeletedFiles] = useState(new Set()); // Track explicitly deleted files
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slugEdited, setSlugEdited] = useState(false);

    const { data, setData, errors } = useForm({
        type: entryData.type || '',
        data: { ...buildEmptyData(fields), ...regularData },
        slug: entry?.slug || '',
        mapping_data: mappingData,
        sort_order: entry?.sort_order ?? 0,
        is_active: entry?.is_active ?? true,
    });

    // Initialize file previews with existing images from entry data
    useEffect(() => {
        const initialPreviews = {};
        fields.forEach(field => {
            if (['file', 'image'].includes(field.type)) {
                const value = entryData[field.name];
                if (value && typeof value === 'string') {
                    initialPreviews[field.name] = value;
                }
            }
        });
        setFilePreviews(initialPreviews);
    }, [entryData, fields]);

    // Initialize mapping file previews with existing images from entry data
    useEffect(() => {
        const initialMappingPreviews = {};
        mappingFields.forEach(field => {
            if (['file', 'image'].includes(field.type)) {
                const values = entryData[field.name];
                if (Array.isArray(values)) {
                    values.forEach((value, index) => {
                        if (value && typeof value === 'string') {
                            const fileKey = `${field.name}_${index}`;
                            initialMappingPreviews[fileKey] = value;
                        }
                    });
                }
            }
        });
        setMappingFilePreviews(initialMappingPreviews);
    }, [entryData, mappingFields]);

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
        
        // Remove file if exists
        const fileKey = `${fieldName}_${index}`;
        if (mappingFiles[fileKey]) {
            const newMappingFiles = { ...mappingFiles };
            delete newMappingFiles[fileKey];
            setMappingFiles(newMappingFiles);
        }
        if (mappingFilePreviews[fileKey]) {
            const newPreviews = { ...mappingFilePreviews };
            delete newPreviews[fileKey];
            setMappingFilePreviews(newPreviews);
        }
    };

    const updateMappingItem = (fieldName, index, value) => {
        const arr = [...(data.mapping_data?.[fieldName] || [])];
        arr[index] = value;
        setData('mapping_data', { ...(data.mapping_data || {}), [fieldName]: arr });
    };

    const handleFileSelect = (fieldName, file) => {
        const newFiles = { ...files };
        newFiles[fieldName] = file;
        setFiles(newFiles);
        
        // Create preview if image
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            const newPreviews = { ...filePreviews };
            newPreviews[fieldName] = previewUrl;
            setFilePreviews(newPreviews);
        }
    };

    const handleRemoveFile = (fieldName) => {
        const newFiles = { ...files };
        delete newFiles[fieldName];
        setFiles(newFiles);
        
        // Revoke preview URL if exists
        if (filePreviews[fieldName] && filePreviews[fieldName].startsWith('blob:')) {
            URL.revokeObjectURL(filePreviews[fieldName]);
        }
        
        const newPreviews = { ...filePreviews };
        delete newPreviews[fieldName];
        setFilePreviews(newPreviews);
        
        // Mark this field as deleted so backend knows to clear it
        const newDeletedFiles = new Set(deletedFiles);
        newDeletedFiles.add(fieldName);
        setDeletedFiles(newDeletedFiles);
        
        setData('data', { ...data.data, [fieldName]: '' });
    };

    const handleMappingFileSelect = (fieldName, index, file) => {
        const fileKey = `${fieldName}_${index}`;
        const newMappingFiles = { ...mappingFiles };
        newMappingFiles[fileKey] = file;
        setMappingFiles(newMappingFiles);
        
        // Create preview if image
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            const newPreviews = { ...mappingFilePreviews };
            newPreviews[fileKey] = previewUrl;
            setMappingFilePreviews(newPreviews);
        }
    };

    const handleRemoveMappingFile = (fieldName, index) => {
        const fileKey = `${fieldName}_${index}`;
        const newMappingFiles = { ...mappingFiles };
        delete newMappingFiles[fileKey];
        setMappingFiles(newMappingFiles);
        
        // Revoke preview URL if exists
        if (mappingFilePreviews[fileKey] && mappingFilePreviews[fileKey].startsWith('blob:')) {
            URL.revokeObjectURL(mappingFilePreviews[fileKey]);
        }
        
        const newPreviews = { ...mappingFilePreviews };
        delete newPreviews[fileKey];
        setMappingFilePreviews(newPreviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        setIsSubmitting(true);
        
        const formData = new FormData();
        // Append slug if present
        formData.append('slug', data.slug || '');
        formData.append('type', data.type);
        formData.append('sort_order', data.sort_order);
        formData.append('is_active', data.is_active);
        formData.append('_deleted_files', JSON.stringify(Array.from(deletedFiles))); // Send list of deleted files

        // Add regular data and files - iterate through ALL fields to ensure completeness
        fields.forEach(field => {
            const key = field.name;
            const value = data.data[key];
            const isFileType = ['file', 'image'].includes(field.type);
            
            if (isFileType) {
                // For file fields, send new file if exists, otherwise send existing value
                if (files[key]) {
                    formData.append(`data[${key}]`, files[key]);
                } else if (deletedFiles.has(key)) {
                    // This file was explicitly deleted, send empty string
                    formData.append(`data[${key}]`, '');
                } else if (value) {
                    // Send existing value (URL string) so it doesn't get marked as missing
                    formData.append(`data[${key}]`, value);
                } else {
                    // No file and not deleted
                    formData.append(`data[${key}]`, '');
                }
            } else {
                // For non-file fields, always send the value
                formData.append(`data[${key}]`, value || '');
            }
        });

        // Add mapping data
        if (mappingEnabled) {
            mappingFields.forEach(mf => {
                const fieldName = mf.name;
                const values = data.mapping_data?.[fieldName] || [];
                const isFileType = ['file', 'image'].includes(mf.type);
                
                if (Array.isArray(values)) {
                    values.forEach((value, index) => {
                        if (isFileType) {
                            const fileKey = `${fieldName}_${index}`;
                            if (mappingFiles[fileKey]) {
                                formData.append(`mapping_data[${fieldName}][]`, mappingFiles[fileKey]);
                            } else if (value) {
                                // Send existing value for non-file uploads
                                formData.append(`mapping_data[${fieldName}][]`, value);
                            } else {
                                // Always append, even if empty
                                formData.append(`mapping_data[${fieldName}][]`, '');
                            }
                        } else {
                            formData.append(`mapping_data[${fieldName}][]`, value || '');
                        }
                    });
                }
            });
        }

        router.post(route('modules.entries.update', { module: module.id, entry: entry.id }), formData, {
            preserveScroll: true,
            onError: (errors) => {
                setFormErrors(errors);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Auto-generate slug from selected module field if configured
    const slugFieldName = fields.find((f) => f.is_slug)?.name;
    useEffect(() => {
        if (!slugFieldName) return;
        const val = data.data?.[slugFieldName] || '';
        if (slugEdited) return; // user edited slug manually
        if (!val) return;
        const generated = val
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        setData('slug', generated);
    }, [data.data, fields, slugFieldName, slugEdited]);

    return (
        <>
            <h1 className="text-muted">Edit {module?.name}</h1>

            <div className="card">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                                    {renderFieldInput(
                                        field, 
                                        data.data[field.name], 
                                        (v) => setData('data', { ...data.data, [field.name]: v }),
                                        {
                                            moduleEntries: mappedModuleEntries,
                                            onFileSelect: (file) => handleFileSelect(field.name, file),
                                            onRemoveFile: () => handleRemoveFile(field.name),
                                            filePreview: files[field.name] || filePreviews[field.name],
                                            imagePreviewUrl: filePreviews[field.name]
                                        }
                                    )}
                                    {errors?.[`data.${field.name}`] && (
                                        <div className="text-danger small mt-2">
                                            {Array.isArray(errors[`data.${field.name}`]) 
                                                ? errors[`data.${field.name}`].join(', ') 
                                                : errors[`data.${field.name}`]}
                                        </div>
                                    )}
                                    {formErrors?.[`data.${field.name}`] && (
                                        <div className="text-danger small mt-2">
                                            {Array.isArray(formErrors[`data.${field.name}`]) 
                                                ? formErrors[`data.${field.name}`].join(', ') 
                                                : formErrors[`data.${field.name}`]}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Slug input (auto-generated from selected field if configured) */}
                            <div className="col-md-6">
                                <label className="form-label">
                                    URL Slug <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors?.slug ? 'is-invalid' : ''}`}
                                    value={data.slug || ''}
                                    onChange={(e) => {
                                        setData('slug', e.target.value);
                                        setSlugEdited(true);
                                    }}
                                />
                                <div className="form-text">
                                    {fields.find((f) => f.is_slug)
                                        ? `Will be generated from "${fields.find((f) => f.is_slug).label || fields.find((f) => f.is_slug).name}" if left empty.`
                                        : 'Enter a unique URL-friendly slug.'}
                                </div>
                                {errors?.slug && <div className="text-danger small">{errors.slug}</div>}
                            </div>

                            {mappingEnabled && mappingFields.length > 0 && (
                                <div className="col-12">
                                    <h6 className="mb-3">Repeatable Items (each field has its own array)</h6>
                                    <div className="d-flex flex-column gap-4">
                                        {mappingFields.map((mf) => (
                                            <div key={mf.name} className="border rounded p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <strong>{mf.label || mf.name}</strong>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => addMappingItem(mf.name)}
                                                    >
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
                                                                    {renderFieldInput(
                                                                        mf,
                                                                        val,
                                                                        (v) => updateMappingItem(mf.name, idx, v),
                                                                        {
                                                                            moduleEntries: mappedModuleEntries,
                                                                            onFileSelect: (file) => handleMappingFileSelect(mf.name, idx, file),
                                                                            onRemoveFile: () => handleRemoveMappingFile(mf.name, idx),
                                                                            filePreview: mappingFiles[`${mf.name}_${idx}`] || mappingFilePreviews[`${mf.name}_${idx}`],
                                                                            imagePreviewUrl: mappingFilePreviews[`${mf.name}_${idx}`]
                                                                        }
                                                                    )}
                                                                    {errors?.[`mapping_data.${mf.name}`] && (
                                                                        <div className="text-danger small mt-2">
                                                                            {Array.isArray(errors[`mapping_data.${mf.name}`]) 
                                                                                ? errors[`mapping_data.${mf.name}`].join(', ') 
                                                                                : errors[`mapping_data.${mf.name}`]}
                                                                        </div>
                                                                    )}
                                                                    {formErrors?.[`mapping_data.${mf.name}`] && (
                                                                        <div className="text-danger small mt-2">
                                                                            {Array.isArray(formErrors[`mapping_data.${mf.name}`]) 
                                                                                ? formErrors[`mapping_data.${mf.name}`].join(', ') 
                                                                                : formErrors[`mapping_data.${mf.name}`]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => removeMappingItem(mf.name, idx)}
                                                                >
                                                                    <i className="bx bx-trash"></i>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {errors?.[`mapping_data.${mf.name}`] && (
                                                    <div className="text-danger small mt-1">{errors[`mapping_data.${mf.name}`]}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="col-12 mt-2">
                                <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
                                    {isSubmitting ? (
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
