import React, { useEffect, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import JsonEditor from '@/Components/Fields/JsonEditor';
import TextInput from '@/Components/Form/TextInput';
import { Type, Tag } from 'lucide-react';

const Create = ({ modules = [], sections: availableSections = [] }) => {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        slug: '',
        auto_generate_slug: true,
        page_section_ids: [],
        fields_config: '[]',
        mapping_config: '[]',
        mapping_enabled: false,
        map_to_module_ids: [],
        types_enabled: false,
        types: [],
        is_active: true,
    });

    const [jsonError, setJsonError] = useState('');
    const [mappingJsonError, setMappingJsonError] = useState('');
    const [fields, setFields] = useState([]);
    const [mappingFields, setMappingFields] = useState([]);
    const [newField, setNewField] = useState({
        name: '',
        type: 'text',
        label: '',
        required: false,
        placeholder: '',
        options: '',
        default: '',
        is_slug: false,
    });
    const [newMappingField, setNewMappingField] = useState({
        name: '',
        type: 'text',
        label: '',
        required: false,
        placeholder: '',
        options: '',
        default: '',
    });
    const [fieldErrors, setFieldErrors] = useState({
        label: '',
        name: '',
        options: '',
    });
    const [mappingFieldErrors, setMappingFieldErrors] = useState({
        label: '',
        name: '',
        options: '',
    });
    const [moduleSectionSearch, setModuleSectionSearch] = useState('');

    const fieldTypes = [
        { value: 'text', label: 'Text Input', icon: 'bx-text' },
        { value: 'textarea', label: 'Text Area', icon: 'bx-align-left' },
        { value: 'code', label: 'Code Editor', icon: 'bx-edit' },
        { value: 'number', label: 'Number', icon: 'bx-hash' },
        { value: 'email', label: 'Email', icon: 'bx-envelope' },
        { value: 'url', label: 'URL', icon: 'bx-link' },
        { value: 'select', label: 'Dropdown Select', icon: 'bx-chevron-down' },
        { value: 'checkbox', label: 'Checkbox', icon: 'bx-check-square' },
        { value: 'radio', label: 'Radio Button', icon: 'bx-radio-circle' },
        { value: 'file', label: 'File Upload', icon: 'bx-upload' },
        { value: 'image', label: 'Image Upload', icon: 'bx-image' },
        { value: 'date', label: 'Date', icon: 'bx-calendar' },
        { value: 'color', label: 'Color Picker', icon: 'bx-palette' },
    ];

    useEffect(() => {
        if (data.auto_generate_slug && data.name) {
            const generatedSlug = data.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
            setData('slug', generatedSlug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.name, data.auto_generate_slug]);

    useEffect(() => {
        try {
            if (data.fields_config && data.fields_config.trim()) {
                const parsed = JSON.parse(data.fields_config);
                if (Array.isArray(parsed)) setFields(parsed);
            }
        } catch (e) {
            // ignore; user may be typing JSON
        }
    }, [data.fields_config]);

    useEffect(() => {
        try {
            if (data.mapping_config && data.mapping_config.trim()) {
                const parsed = JSON.parse(data.mapping_config);
                if (Array.isArray(parsed)) setMappingFields(parsed);
            }
        } catch (e) {
            // ignore; user may be typing JSON
        }
    }, [data.mapping_config]);

    const updateFieldsConfig = (updatedFields) => {
        // Ensure only one field has is_slug true
        let found = false;
        const normalized = updatedFields.map((f) => {
            if (f.is_slug && !found) {
                found = true;
                return { ...f, is_slug: true };
            }
            return { ...f, is_slug: false };
        });
        setData('fields_config', JSON.stringify(normalized, null, 2));
        setFields(normalized);
    };

    const setSlugField = (index) => {
        const updated = fields.map((f, i) => ({ ...f, is_slug: i === index }));
        updateFieldsConfig(updated);
    };

    const updateMappingConfig = (updatedFields) => {
        setData('mapping_config', JSON.stringify(updatedFields, null, 2));
        setMappingFields(updatedFields);
    };

    const generateFieldName = (label) => {
        return label
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    const handleLabelChange = (label) => {
        setNewField({
            ...newField,
            label,
            name: generateFieldName(label),
        });
        setFieldErrors({ ...fieldErrors, label: '', name: '' });
    };

    const handleMappingLabelChange = (label) => {
        setNewMappingField({
            ...newMappingField,
            label,
            name: generateFieldName(label),
        });
        setMappingFieldErrors({ ...mappingFieldErrors, label: '', name: '' });
    };

    const addField = () => {
        const errs = {};
        if (!newField.label.trim()) errs.label = 'Label is required';
        if (!newField.name.trim()) errs.name = 'Field name is required';
        else if (fields.some((f) => f.name === newField.name)) errs.name = 'Field name already exists';
        else if (!/^[a-z][a-z0-9_]*$/.test(newField.name)) errs.name = 'Invalid field name format';

        if ((newField.type === 'select' || newField.type === 'radio') && !newField.options.trim()) {
            errs.options = 'Options are required';
        }

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }

        const field = {
            name: newField.name,
            type: newField.type,
            label: newField.label,
            required: newField.required || false,
            placeholder: newField.placeholder || '',
            is_slug: !!newField.is_slug,
        };

        if (newField.default) field.default = newField.default;
        if (['select', 'radio'].includes(newField.type) && newField.options) {
            field.options = newField.options.split(',').map((opt) => opt.trim()).filter((opt) => opt);
        }

        updateFieldsConfig([...fields, field]);
        setNewField({ name: '', type: 'text', label: '', required: false, placeholder: '', options: '', default: '' });
        setFieldErrors({ label: '', name: '', options: '' });
    };

    const addMappingField = () => {
        const errs = {};
        if (!newMappingField.label.trim()) errs.label = 'Label is required';
        if (!newMappingField.name.trim()) errs.name = 'Field name is required';
        else if (mappingFields.some((f) => f.name === newMappingField.name)) errs.name = 'Field name already exists';
        else if (!/^[a-z][a-z0-9_]*$/.test(newMappingField.name)) errs.name = 'Invalid field name format';

        if ((newMappingField.type === 'select' || newMappingField.type === 'radio') && !newMappingField.options.trim()) {
            errs.options = 'Options are required';
        }

        if (Object.keys(errs).length > 0) {
            setMappingFieldErrors(errs);
            return;
        }

        const field = {
            name: newMappingField.name,
            type: newMappingField.type,
            label: newMappingField.label,
            required: newMappingField.required || false,
            placeholder: newMappingField.placeholder || '',
        };

        if (newMappingField.default) field.default = newMappingField.default;
        if (['select', 'radio'].includes(newMappingField.type) && newMappingField.options) {
            field.options = newMappingField.options.split(',').map((opt) => opt.trim()).filter((opt) => opt);
        }

        updateMappingConfig([...mappingFields, field]);
        setNewMappingField({ name: '', type: 'text', label: '', required: false, placeholder: '', options: '', default: '' });
        setMappingFieldErrors({ label: '', name: '', options: '' });
    };

    const removeField = (index) => {
        updateFieldsConfig(fields.filter((_, i) => i !== index));
    };

    const removeMappingField = (index) => {
        updateMappingConfig(mappingFields.filter((_, i) => i !== index));
    };

    const moveField = (index, direction) => {
        const updated = [...fields];
        if (direction === 'up' && index > 0) {
            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
        } else if (direction === 'down' && index < updated.length - 1) {
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        }
        updateFieldsConfig(updated);
    };

    const moveMappingField = (index, direction) => {
        const updated = [...mappingFields];
        if (direction === 'up' && index > 0) {
            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
        } else if (direction === 'down' && index < updated.length - 1) {
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        }
        updateMappingConfig(updated);
    };

    const editField = (index) => {
        const field = fields[index];
        setNewField({
            name: field.name,
            type: field.type,
            label: field.label,
            required: field.required || false,
            placeholder: field.placeholder || '',
            options: field.options ? field.options.join(', ') : '',
            default: field.default || '',
            is_slug: field.is_slug || false,
        });
        removeField(index);
    };

    const editMappingField = (index) => {
        const field = mappingFields[index];
        setNewMappingField({
            name: field.name,
            type: field.type,
            label: field.label,
            required: field.required || false,
            placeholder: field.placeholder || '',
            options: field.options ? field.options.join(', ') : '',
            default: field.default || '',
        });
        removeMappingField(index);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            let parsedFieldsConfig = [];
            if (data.fields_config && data.fields_config.trim()) {
                parsedFieldsConfig = JSON.parse(data.fields_config);
                if (!Array.isArray(parsedFieldsConfig)) throw new Error('Fields config must be an array');
            }

            let parsedMappingConfig = [];
            if (data.mapping_config && data.mapping_config.trim()) {
                parsedMappingConfig = JSON.parse(data.mapping_config);
                if (!Array.isArray(parsedMappingConfig)) throw new Error('Mapping config must be an array');
            }

            setJsonError('');
            setMappingJsonError('');
            post(route('modules.store'), {
                ...data,
                fields_config: parsedFieldsConfig,
                mapping_config: parsedMappingConfig,
                map_to_module_ids: data.map_to_module_ids || [],
                page_section_ids: data.page_section_ids || [],
            });
        } catch (err) {
            if (err.message.includes('Mapping')) setMappingJsonError(err.message);
            else setJsonError(err.message);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Create Module</h1>
                    <p className="text-muted mb-0">Example: Testimonials, Awards, Timeline…</p>
                </div>
                <Link href={route('modules.index')} className="btn btn-secondary">
                    <i className="bx bx-arrow-back me-2"></i>
                    Back
                </Link>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Module Configuration</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <TextInput
                                name="name"
                                label="Module Name"
                                value={data.name}
                                onChange={(value) => setData('name', value)}
                                error={errors.name}
                                placeholder="Testimonials"
                                required={true}
                                icon={<Type size={16} />}
                                helperText="Human readable name, e.g. Testimonials, Awards, Timeline."
                            />
                        </div>

                        <div className="col-md-6">
                            <TextInput
                                name="slug"
                                label="Slug"
                                value={data.slug}
                                onChange={(value) => setData('slug', value)}
                                error={errors.slug}
                                placeholder="testimonials"
                                icon={<Tag size={16} />}
                                helperText="URL-friendly key; auto-filled from name but you can override it."
                                disabled={data.auto_generate_slug}
                            />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={data.auto_generate_slug}
                                    onChange={(e) => setData('auto_generate_slug', e.target.checked)}
                                    role="switch"
                                />
                                <label className="form-check-label fw-medium">Auto-generate slug from module name</label>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    role="switch"
                                />
                                <label className="form-check-label fw-medium">Active Module</label>
                            </div>
                        </div>
                    </div>

                    {/* Page Sections: compact selector (modal with search) */}
                    {availableSections.length > 0 && (
                        <div className="border-top pt-3 mt-3">
                            <h6 className="mb-2">Page Sections</h6>
                            <p className="text-muted small mb-2">
                                Optional. Add section data per entry via the <strong>Detail</strong> button on each entry (same as Page → Sections).
                            </p>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#module-section-picker-modal"
                                >
                                    <i className="bx bx-plus me-1"></i>
                                    Select sections
                                </button>
                                {(data.page_section_ids || []).length > 0 && (
                                    <span className="text-muted small">
                                        ({(data.page_section_ids || []).length} selected)
                                    </span>
                                )}
                            </div>
                            {(data.page_section_ids || []).length > 0 && (
                                <div className="d-flex flex-wrap gap-1">
                                    {(data.page_section_ids || []).map((id) => {
                                        const sec = availableSections.find((s) => s.id === id);
                                        return (
                                            <span key={id} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                                                {sec?.name || id}
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 border-0 bg-transparent text-white"
                                                    style={{ fontSize: '1rem', lineHeight: 1 }}
                                                    onClick={() => setData('page_section_ids', (data.page_section_ids || []).filter((x) => x !== id))}
                                                    aria-label="Remove"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="modal fade" id="module-section-picker-modal" tabIndex={-1}>
                                <div className="modal-dialog modal-dialog-scrollable">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Select page sections</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            <input
                                                type="text"
                                                className="form-control mb-3"
                                                placeholder="Search by name or identifier..."
                                                value={moduleSectionSearch}
                                                onChange={(e) => setModuleSectionSearch(e.target.value)}
                                            />
                                            <ul className="list-group list-group-flush">
                                                {availableSections
                                                    .filter((s) => !moduleSectionSearch.trim() || s.name.toLowerCase().includes(moduleSectionSearch.toLowerCase()) || (s.identifier || '').toLowerCase().includes(moduleSectionSearch.toLowerCase()))
                                                    .map((section) => {
                                                        const selected = (data.page_section_ids || []).includes(section.id);
                                                        return (
                                                            <li key={section.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                <span><strong>{section.name}</strong>{section.identifier && <small className="text-muted ms-1">({section.identifier})</small>}</span>
                                                                <button
                                                                    type="button"
                                                                    className={selected ? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-outline-primary'}
                                                                    onClick={() => {
                                                                        if (selected) {
                                                                            setData('page_section_ids', (data.page_section_ids || []).filter((x) => x !== section.id));
                                                                        } else {
                                                                            setData('page_section_ids', [...(data.page_section_ids || []), section.id]);
                                                                        }
                                                                    }}
                                                                >
                                                                    {selected ? 'Remove' : 'Add'}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {errors.page_section_ids && <div className="text-danger small mt-1">{errors.page_section_ids}</div>}
                        </div>
                    )}

                    {/* Types Configuration */}
                    <div className="border-top pt-3 mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Module Types</h6>
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={data.types_enabled}
                                    onChange={(e) => {
                                        setData('types_enabled', e.target.checked);
                                        if (!e.target.checked) {
                                            setData('types', []);
                                        }
                                    }}
                                    role="switch"
                                />
                                <label className="form-check-label fw-medium">Enable Types</label>
                            </div>
                        </div>

                        {data.types_enabled && (
                            <div className="border rounded p-3 bg-light">
                                <div className="d-flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Add type (e.g., Student, Parent, Teacher)"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const value = e.target.value.trim();
                                                if (value && !(data.types || []).includes(value)) {
                                                    setData('types', [...(data.types || []), value]);
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const input = e.target.previousElementSibling;
                                            const value = input.value.trim();
                                            if (value && !(data.types || []).includes(value)) {
                                                setData('types', [...(data.types || []), value]);
                                                input.value = '';
                                            }
                                        }}
                                    >
                                        <i className="bx bx-plus me-1"></i>
                                        Add
                                    </button>
                                </div>

                                {(data.types || []).length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {(data.types || []).map((type, idx) => (
                                            <span key={idx} className="badge bg-primary d-flex align-items-center gap-2">
                                                {type}
                                                <button
                                                    type="button"
                                                    className="btn-close btn-close-white"
                                                    style={{ fontSize: '0.7rem' }}
                                                    onClick={() => {
                                                        setData('types', (data.types || []).filter((_, i) => i !== idx));
                                                    }}
                                                ></button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted small">No types added yet. Add types like Student, Parent, Teacher, etc.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Map to Modules - checkboxes for Mapping button */}
                    <div className="border-top pt-3 mt-3">
                        <h6 className="mb-2">Map to Modules</h6>
                        <p className="text-muted small mb-2">When checked, entries of this module will have a Mapping button. The Mapping page shows Pages (always) plus entries from checked modules.</p>
                        {(modules || []).length === 0 ? (
                            <div className="text-muted small">No other modules available yet. Create modules first.</div>
                        ) : (
                            <div className="d-flex flex-wrap gap-3">
                                {(modules || []).map((m) => {
                                    const checked = (data.map_to_module_ids || []).includes(m.id);
                                    return (
                                        <div key={m.id} className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`map-module-${m.id}`}
                                                checked={checked}
                                                onChange={(e) => {
                                                    const ids = data.map_to_module_ids || [];
                                                    setData('map_to_module_ids', e.target.checked
                                                        ? [...ids, m.id]
                                                        : ids.filter((i) => i !== m.id));
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`map-module-${m.id}`}>
                                                {m.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="card-header">
                        <h5 className="card-title mb-0">Fields Configuration</h5>
                    </div>
                    <div className="card-body">
                        <div className="border rounded p-3 mb-4 bg-light">
                            <h6 className="mb-3">Add Field</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Field Label *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${fieldErrors.label ? 'is-invalid' : ''}`}
                                        value={newField.label}
                                        onChange={(e) => handleLabelChange(e.target.value)}
                                        placeholder="Name"
                                    />
                                    {fieldErrors.label && <div className="invalid-feedback">{fieldErrors.label}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Field Name *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                                        value={newField.name}
                                        onChange={(e) => {
                                            setNewField({ ...newField, name: e.target.value });
                                            if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                                        }}
                                        placeholder="name"
                                    />
                                    {fieldErrors.name && <div className="invalid-feedback d-block">{fieldErrors.name}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Field Type *</label>
                                    <select
                                        className="form-select"
                                        value={newField.type}
                                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                    >
                                        {fieldTypes.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Placeholder</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newField.placeholder}
                                        onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                        placeholder="Enter name..."
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Default Value</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newField.default}
                                        onChange={(e) => setNewField({ ...newField, default: e.target.value })}
                                        placeholder="Default value"
                                    />
                                </div>

                                {(newField.type === 'select' || newField.type === 'radio') && (
                                    <div className="col-md-12">
                                        <label className="form-label">Options (comma separated) *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${fieldErrors.options ? 'is-invalid' : ''}`}
                                            value={newField.options}
                                            onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                                            placeholder="Option 1, Option 2"
                                        />
                                        {fieldErrors.options && <div className="invalid-feedback">{fieldErrors.options}</div>}
                                    </div>
                                )}

                                <div className="col-md-12">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={newField.required}
                                            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                        />
                                        <label className="form-check-label">Required Field</label>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={newField.is_slug}
                                            onChange={(e) => setNewField({ ...newField, is_slug: e.target.checked })}
                                        />
                                        <label className="form-check-label">Use this field to generate entry slug</label>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <button type="button" className="btn btn-primary" onClick={addField}>
                                        <i className="bx bx-plus me-2"></i>
                                        Add Field
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h6 className="mb-3">Fields ({fields.length})</h6>
                            {fields.length === 0 ? (
                                <div className="alert alert-info mb-0">
                                    <i className="bx bx-info-circle me-2"></i>
                                    No fields added yet.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th width="50">#</th>
                                                <th>Field Name</th>
                                                <th>Label</th>
                                                <th>Type</th>
                                                <th>Required</th>
                                                <th>Slug</th>
                                                <th width="120">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fields.map((field, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td><code>{field.name}</code></td>
                                                    <td>{field.label}</td>
                                                    <td><span className="badge bg-light text-dark">{field.type}</span></td>
                                                    <td>
                                                        {field.required ? (
                                                            <span className="badge bg-danger">Required</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Optional</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                name="slugField"
                                                                className="form-check-input"
                                                                checked={!!field.is_slug}
                                                                onChange={() => setSlugField(index)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button type="button" className="btn btn-outline-primary" onClick={() => editField(index)} title="Edit">
                                                                <i className="bx bx-edit"></i>
                                                            </button>
                                                            <button type="button" className="btn btn-outline-secondary" onClick={() => moveField(index, 'up')} disabled={index === 0} title="Move Up">
                                                                <i className="bx bx-up-arrow-alt"></i>
                                                            </button>
                                                            <button type="button" className="btn btn-outline-secondary" onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} title="Move Down">
                                                                <i className="bx bx-down-arrow-alt"></i>
                                                            </button>
                                                            <button type="button" className="btn btn-outline-danger" onClick={() => removeField(index)} title="Remove">
                                                                <i className="bx bx-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div>
                            <h6 className="mb-3">Fields JSON Configuration</h6>
                            <JsonEditor
                                value={data.fields_config}
                                onChange={(value) => setData('fields_config', value)}
                                placeholder="[]"
                                height="200px"
                            />
                            {jsonError && <div className="text-danger small mt-2">{jsonError}</div>}
                            {errors.fields_config && <div className="text-danger small mt-2">{errors.fields_config}</div>}
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Repeatable Items (Mapping)</h5>
                                <div className="form-check form-switch">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={data.mapping_enabled}
                                        onChange={(e) => {
                                            setData('mapping_enabled', e.target.checked);
                                            if (!e.target.checked) {
                                                setData('mapping_config', '[]');
                                                setMappingFields([]);
                                            }
                                        }}
                                        role="switch"
                                    />
                                    <label className="form-check-label fw-medium">
                                        {data.mapping_enabled ? 'Enabled' : 'Enable'}
                                    </label>
                                </div>
                            </div>

                            {data.mapping_enabled && (
                                <>
                                    <div className="border rounded p-3 mb-4 bg-light">
                                        <h6 className="mb-3">Add Item Field</h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label">Field Label *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${mappingFieldErrors.label ? 'is-invalid' : ''}`}
                                                    value={newMappingField.label}
                                                    onChange={(e) => handleMappingLabelChange(e.target.value)}
                                                    placeholder="Name"
                                                />
                                                {mappingFieldErrors.label && <div className="invalid-feedback">{mappingFieldErrors.label}</div>}
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label">Field Name *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${mappingFieldErrors.name ? 'is-invalid' : ''}`}
                                                    value={newMappingField.name}
                                                    onChange={(e) => {
                                                        setNewMappingField({ ...newMappingField, name: e.target.value });
                                                        if (mappingFieldErrors.name) setMappingFieldErrors({ ...mappingFieldErrors, name: '' });
                                                    }}
                                                    placeholder="name"
                                                />
                                                {mappingFieldErrors.name && <div className="invalid-feedback d-block">{mappingFieldErrors.name}</div>}
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label">Field Type *</label>
                                                <select
                                                    className="form-select"
                                                    value={newMappingField.type}
                                                    onChange={(e) => setNewMappingField({ ...newMappingField, type: e.target.value })}
                                                >
                                                    {fieldTypes.map((t) => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Placeholder</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newMappingField.placeholder}
                                                    onChange={(e) => setNewMappingField({ ...newMappingField, placeholder: e.target.value })}
                                                    placeholder="Enter value..."
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Default Value</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newMappingField.default}
                                                    onChange={(e) => setNewMappingField({ ...newMappingField, default: e.target.value })}
                                                    placeholder="Default value"
                                                />
                                            </div>

                                            {(newMappingField.type === 'select' || newMappingField.type === 'radio') && (
                                                <div className="col-md-12">
                                                    <label className="form-label">Options (comma separated) *</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${mappingFieldErrors.options ? 'is-invalid' : ''}`}
                                                        value={newMappingField.options}
                                                        onChange={(e) => setNewMappingField({ ...newMappingField, options: e.target.value })}
                                                        placeholder="Option 1, Option 2"
                                                    />
                                                    {mappingFieldErrors.options && <div className="invalid-feedback">{mappingFieldErrors.options}</div>}
                                                </div>
                                            )}

                                            <div className="col-md-12">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={newMappingField.required}
                                                        onChange={(e) => setNewMappingField({ ...newMappingField, required: e.target.checked })}
                                                    />
                                                    <label className="form-check-label">Required Field</label>
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <button type="button" className="btn btn-primary" onClick={addMappingField}>
                                                    <i className="bx bx-plus me-2"></i>
                                                    Add Item Field
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="mb-3">Item Fields ({mappingFields.length})</h6>
                                        {mappingFields.length === 0 ? (
                                            <div className="alert alert-info mb-0">
                                                <i className="bx bx-info-circle me-2"></i>
                                                No item fields added yet.
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th width="50">#</th>
                                                            <th>Field Name</th>
                                                            <th>Label</th>
                                                            <th>Type</th>
                                                            <th>Required</th>
                                                            <th width="120">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {mappingFields.map((field, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td><code>item.{field.name}</code></td>
                                                                <td>{field.label}</td>
                                                                <td><span className="badge bg-light text-dark">{field.type}</span></td>
                                                                <td>
                                                                    {field.required ? (
                                                                        <span className="badge bg-danger">Required</span>
                                                                    ) : (
                                                                        <span className="badge bg-secondary">Optional</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group btn-group-sm">
                                                                        <button type="button" className="btn btn-outline-primary" onClick={() => editMappingField(index)} title="Edit">
                                                                            <i className="bx bx-edit"></i>
                                                                        </button>
                                                                        <button type="button" className="btn btn-outline-secondary" onClick={() => moveMappingField(index, 'up')} disabled={index === 0} title="Move Up">
                                                                            <i className="bx bx-up-arrow-alt"></i>
                                                                        </button>
                                                                        <button type="button" className="btn btn-outline-secondary" onClick={() => moveMappingField(index, 'down')} disabled={index === mappingFields.length - 1} title="Move Down">
                                                                            <i className="bx bx-down-arrow-alt"></i>
                                                                        </button>
                                                                        <button type="button" className="btn btn-outline-danger" onClick={() => removeMappingField(index)} title="Remove">
                                                                            <i className="bx bx-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h6 className="mb-3">Item Fields JSON Configuration</h6>
                                        <JsonEditor
                                            value={data.mapping_config}
                                            onChange={(value) => setData('mapping_config', value)}
                                            placeholder="[]"
                                            height="200px"
                                        />
                                        {mappingJsonError && <div className="text-danger small mt-2">{mappingJsonError}</div>}
                                        {errors.mapping_config && <div className="text-danger small mt-2">{errors.mapping_config}</div>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <button type="submit" className="btn btn-primary me-2 px-4" disabled={processing}>
                                {processing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-plus me-2"></i>
                                        Create Module
                                    </>
                                )}
                            </button>
                            <Link href={route('modules.index')} className="btn btn-secondary px-4">
                                <i className="bx bx-x me-2"></i>
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Create;

