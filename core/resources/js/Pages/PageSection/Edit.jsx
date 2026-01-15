import React, { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import CodeEditor from '@/Components/Fields/CodeEditor';
import JsonEditor from '@/Components/Fields/JsonEditor';
import RichTextEditor from '@/Components/Fields/RichTextEditor';

const Edit = ({ section }) => {
    // Helper function to safely convert configs to string for editing
    const getConfigValue = (config, defaultValue = '[]') => {
        if (typeof config === 'string') {
            try {
                JSON.parse(config);
                return config;
            } catch (error) {
                return JSON.stringify(config, null, 2);
            }
        }
        if (Array.isArray(config) || typeof config === 'object') {
            return JSON.stringify(config, null, 2);
        }
        return defaultValue;
    };

    const { data, setData, put, errors, processing } = useForm({
        name: section?.name || '',
        identifier: section?.identifier || '',
        html_template: section?.html_template || '',
        fields_config: getConfigValue(section?.fields_config),
        mapping_config: getConfigValue(section?.mapping_config),
        mapping_enabled: section?.mapping_enabled || false,
        css_styles: section?.css_styles || '',
        javascript: section?.javascript || '',
        is_active: section?.is_active ?? true
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
        default: ''
    });
    const [newMappingField, setNewMappingField] = useState({
        name: '',
        type: 'text',
        label: '',
        required: false,
        placeholder: '',
        options: '',
        default: ''
    });
    const [fieldErrors, setFieldErrors] = useState({
        label: '',
        name: ''
    });
    const [mappingFieldErrors, setMappingFieldErrors] = useState({
        label: '',
        name: ''
    });

    // Field types with their configurations
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

    // Generate field name from label
    const generateFieldName = (label, isMapping = false) => {
        let baseName = label
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        
        // For mapping fields, ensure unique names
        if (isMapping) {
            let counter = 1;
            let finalName = baseName;
            while (mappingFields.some(field => field.name === finalName)) {
                finalName = `${baseName}_${counter}`;
                counter++;
            }
            return finalName;
        }
        
        return baseName;
    };

    // Handle label change for regular fields
    const handleLabelChange = (label) => {
        const generatedName = generateFieldName(label);
        setNewField({
            ...newField,
            label,
            name: generatedName
        });
        setFieldErrors({...fieldErrors, label: '', name: ''});
    };

    // Handle label change for mapping fields
    const handleMappingLabelChange = (label) => {
        const generatedName = generateFieldName(label, true);
        setNewMappingField({
            ...newMappingField,
            label,
            name: generatedName
        });
        setMappingFieldErrors({...mappingFieldErrors, label: '', name: ''});
    };

    // Load fields from JSON when component mounts or data changes
    useEffect(() => {
        try {
            if (data.fields_config && data.fields_config.trim()) {
                const parsedFields = JSON.parse(data.fields_config);
                if (Array.isArray(parsedFields)) {
                    setFields(parsedFields);
                }
            }
        } catch (error) {
            console.error('Error parsing fields config:', error);
        }
    }, [data.fields_config]);

    // Load mapping fields from JSON when component mounts or data changes
    useEffect(() => {
        try {
            if (data.mapping_config && data.mapping_config.trim()) {
                const parsedFields = JSON.parse(data.mapping_config);
                if (Array.isArray(parsedFields)) {
                    setMappingFields(parsedFields);
                }
            }
        } catch (error) {
            console.error('Error parsing mapping config:', error);
        }
    }, [data.mapping_config]);

    // Update JSON when fields change
    const updateFieldsConfig = (updatedFields) => {
        const jsonString = JSON.stringify(updatedFields, null, 2);
        setData('fields_config', jsonString);
        setFields(updatedFields);
    };

    // Update JSON when mapping fields change
    const updateMappingConfig = (updatedFields) => {
        const jsonString = JSON.stringify(updatedFields, null, 2);
        setData('mapping_config', jsonString);
        setMappingFields(updatedFields);
    };

    // Validate and add regular field
    const addField = () => {
        const errors = {};
        if (!newField.label.trim()) errors.label = 'Label is required';
        if (!newField.name.trim()) errors.name = 'Field name is required';
        else if (fields.some(f => f.name === newField.name)) errors.name = 'Field name already exists';
        else if (!/^[a-z][a-z0-9_]*$/.test(newField.name)) errors.name = 'Invalid field name format';
        
        if ((newField.type === 'select' || newField.type === 'radio') && !newField.options.trim()) {
            errors.options = 'Options are required';
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        const field = {
            name: newField.name,
            type: newField.type,
            label: newField.label,
            required: newField.required || false,
            placeholder: newField.placeholder || '',
        };

        if (newField.default) field.default = newField.default;
        if (['select', 'radio'].includes(newField.type) && newField.options) {
            field.options = newField.options.split(',').map(opt => opt.trim()).filter(opt => opt);
        }

        updateFieldsConfig([...fields, field]);
        setNewField({ name: '', type: 'text', label: '', required: false, placeholder: '', options: '', default: '' });
        setFieldErrors({ label: '', name: '', options: '' });
    };

    // Validate and add mapping field
    const addMappingField = () => {
        const errors = {};
        if (!newMappingField.label.trim()) errors.label = 'Label is required';
        if (!newMappingField.name.trim()) errors.name = 'Field name is required';
        else if (mappingFields.some(f => f.name === newMappingField.name)) errors.name = 'Field name already exists';
        else if (!/^[a-z][a-z0-9_]*$/.test(newMappingField.name)) errors.name = 'Invalid field name format';
        
        if ((newMappingField.type === 'select' || newMappingField.type === 'radio') && !newMappingField.options.trim()) {
            errors.options = 'Options are required';
        }
        
        if (Object.keys(errors).length > 0) {
            setMappingFieldErrors(errors);
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
            field.options = newMappingField.options.split(',').map(opt => opt.trim()).filter(opt => opt);
        }

        updateMappingConfig([...mappingFields, field]);
        setNewMappingField({ name: '', type: 'text', label: '', required: false, placeholder: '', options: '', default: '' });
        setMappingFieldErrors({ label: '', name: '', options: '' });
    };

    // Remove field
    const removeField = (index, isMapping = false) => {
        if (isMapping) {
            const updated = mappingFields.filter((_, i) => i !== index);
            updateMappingConfig(updated);
        } else {
            const updated = fields.filter((_, i) => i !== index);
            updateFieldsConfig(updated);
        }
    };

    // Move field
    const moveField = (index, direction, isMapping = false) => {
        if (isMapping) {
            const updated = [...mappingFields];
            if (direction === 'up' && index > 0) {
                [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
            } else if (direction === 'down' && index < updated.length - 1) {
                [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            }
            updateMappingConfig(updated);
        } else {
            const updated = [...fields];
            if (direction === 'up' && index > 0) {
                [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
            } else if (direction === 'down' && index < updated.length - 1) {
                [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            }
            updateFieldsConfig(updated);
        }
    };

    // Edit field
    const editField = (index, isMapping = false) => {
        if (isMapping) {
            const field = mappingFields[index];
            setNewMappingField({
                name: field.name,
                type: field.type,
                label: field.label,
                required: field.required || false,
                placeholder: field.placeholder || '',
                options: field.options ? field.options.join(', ') : '',
                default: field.default || ''
            });
            removeField(index, true);
        } else {
            const field = fields[index];
            setNewField({
                name: field.name,
                type: field.type,
                label: field.label,
                required: field.required || false,
                placeholder: field.placeholder || '',
                options: field.options ? field.options.join(', ') : '',
                default: field.default || ''
            });
            removeField(index, false);
        }
    };

    // Get field icon
    const getFieldIcon = (type) => {
        const typeConfig = fieldTypes.find(t => t.value === type);
        return typeConfig ? typeConfig.icon : 'bx-cube';
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        try {
            let parsedFieldsConfig = [];
            let parsedMappingConfig = [];
            
            if (data.fields_config && data.fields_config.trim()) {
                parsedFieldsConfig = JSON.parse(data.fields_config);
                if (!Array.isArray(parsedFieldsConfig)) {
                    throw new Error('Fields config must be an array');
                }
            }
            
            if (data.mapping_config && data.mapping_config.trim()) {
                parsedMappingConfig = JSON.parse(data.mapping_config);
                if (!Array.isArray(parsedMappingConfig)) {
                    throw new Error('Mapping config must be an array');
                }
            }
            
            setJsonError('');
            setMappingJsonError('');
            
            put(route('page-sections.update', section.id), {
                ...data,
                fields_config: parsedFieldsConfig,
                mapping_config: parsedMappingConfig
            });
            
        } catch (error) {
            if (error.message.includes('Mapping')) {
                setMappingJsonError(error.message);
            } else {
                setJsonError(error.message);
            }
        }
    };

    // Load repeatable facts template
    const loadRepeatableFactsTemplate = () => {
        setData({
            ...data,
            mapping_enabled: true,
            html_template: 
`<section class="hero_overview">
    <div class="container">
        <div class="herover_grid">
            <div class="herover_left">
                <!-- START REPEATABLE ITEM -->
                <div class="fact_bx">
                    <figure>
                        <img src="{item.icon_image}" alt="{item.alt_text}" class="img-fluid">
                    </figure>
                    <strong class="counter" data-count="{item.start_count}" data-target="{item.final_count}">{item.display_count}</strong>
                    <p>{item.description}</p>
                </div>
                <!-- END REPEATABLE ITEM -->
            </div>
        </div>
    </div>
</section>`,
            fields_config: JSON.stringify([
                {
                    name: "section_title",
                    type: "text",
                    label: "Section Title",
                    required: false,
                    placeholder: "Our Achievements"
                }
            ], null, 2),
            mapping_config: JSON.stringify([
                {
                    name: "icon_image",
                    type: "image",
                    label: "Icon Image",
                    required: true,
                    accept: "image/*"
                },
                {
                    name: "alt_text",
                    type: "text", 
                    label: "Alt Text",
                    required: true,
                    placeholder: "plants icon"
                },
                {
                    name: "start_count",
                    type: "number",
                    label: "Start Count",
                    required: false,
                    placeholder: "0"
                },
                {
                    name: "final_count",
                    type: "number",
                    label: "Final Count",
                    required: true,
                    placeholder: "100"
                },
                {
                    name: "display_count",
                    type: "text",
                    label: "Display Count",
                    required: true,
                    placeholder: "100"
                },
                {
                    name: "description",
                    type: "text",
                    label: "Description",
                    required: true,
                    placeholder: "Achievement description"
                }
            ], null, 2),
            css_styles: 
`h1 {
  font-size: 35px;
  font-weight: normal;
  margin-top: 5px;
}`,
            javascript: 
`<script type="module">
import dummy from 'https://cdn.jsdelivr.net/npm/dummy@0.1.6/+esm'
</script>`
        });
    };

    // Get all field names for template
    const getAllFieldNames = () => {
        const regularFields = fields.map(f => ({ 
            name: f.name, 
            type: 'regular',
            label: f.label 
        }));
        const mappingFieldsList = mappingFields.map(mf => ({ 
            name: `item.${mf.name}`, 
            type: 'mapping',
            label: mf.label 
        }));
        return [...regularFields, ...mappingFieldsList];
    };

    // Generate template from mapping fields
    const generateMappingTemplate = () => {
        if (mappingFields.length === 0) {
            alert('Please add mapping fields first');
            return;
        }

        const itemTemplate = mappingFields.map(field => 
            `    <div class="item-field">
      <strong>${field.label}:</strong>
      <span>{item.${field.name}}</span>
    </div>`
        ).join('\n');
        
        const template = `<!-- Regular Section Fields -->
<div class="section-header">
  <h1>{title}</h1>
  <p>{description}</p>
</div>

<!-- Repeatable Items Section -->
<div class="items-container">
  <!-- START REPEATABLE ITEM -->
  <div class="item">
${itemTemplate}
  </div>
  <!-- END REPEATABLE ITEM -->
</div>`;
        
        setData('html_template', template);
    };

    const extractVariables = (html) => {
        if (!html) return [];
        const matches = html.match(/{([^}]+)}/g) || [];
        return [...new Set(matches)];
    };

    if (!section) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div className="text-muted">
                        <i className="bx bx-error-circle bx-lg mb-3"></i>
                        <h5>Section not found</h5>
                        <p>The page section you're trying to edit doesn't exist.</p>
                        <Link href={route('page-sections.index')} className="btn btn-primary">
                            <i className="bx bx-arrow-back me-2"></i>
                            Back to Sections
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Edit Page Section</h1>
                    <p className="text-muted mb-0">Update section template and field configuration</p>
                </div>
                <Link 
                    href={route('page-sections.index')} 
                    className="btn btn-secondary"
                >
                    <i className="bx bx-arrow-back me-2"></i>
                    Back to Sections
                </Link>
            </div>

            {/* Quick Templates Card */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Quick Templates</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap">
                        <button 
                            type="button" 
                            className="btn btn-outline-primary"
                            onClick={loadRepeatableFactsTemplate}
                        >
                            <i className="bx bx-layout me-2"></i>
                            Repeatable Facts Section
                        </button>
                        {data.mapping_enabled && mappingFields.length > 0 && (
                            <button 
                                type="button" 
                                className="btn btn-outline-success"
                                onClick={generateMappingTemplate}
                            >
                                <i className="bx bx-code me-2"></i>
                                Generate Template
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Section Configuration</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="mb-3 col-md-6">
                            <label className="form-label">Section Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Facts & Statistics Section"
                                required
                            />
                            {errors.name && <div className="text-danger small">{errors.name}</div>}
                        </div>

                        <div className="mb-3 col-md-6">
                            <label className="form-label">Unique Identifier *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={data.identifier}
                                onChange={e => setData('identifier', e.target.value)}
                                placeholder="facts_statistics_section"
                                required
                            />
                            {errors.identifier && <div className="text-danger small">{errors.identifier}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Regular Fields Configuration */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Regular Fields Configuration</h5>
                </div>
                <div className="card-body">
                    <div className="border rounded p-3 mb-4 bg-light">
                        <h6 className="mb-3">Add Regular Field</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Field Label *</label>
                                <input
                                    type="text"
                                    className={`form-control ${fieldErrors.label ? 'is-invalid' : ''}`}
                                    value={newField.label}
                                    onChange={e => handleLabelChange(e.target.value)}
                                    placeholder="Section Title"
                                />
                                {fieldErrors.label && <div className="invalid-feedback">{fieldErrors.label}</div>}
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label">Field Name *</label>
                                <input
                                    type="text"
                                    className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                                    value={newField.name}
                                    onChange={e => {
                                        setNewField({...newField, name: e.target.value});
                                        if (fieldErrors.name) setFieldErrors({...fieldErrors, name: ''});
                                    }}
                                    placeholder="section_title"
                                />
                                {fieldErrors.name && <div className="invalid-feedback d-block">{fieldErrors.name}</div>}
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label">Field Type *</label>
                                <select
                                    className="form-select"
                                    value={newField.type}
                                    onChange={e => setNewField({...newField, type: e.target.value})}
                                >
                                    {fieldTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Placeholder Text</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newField.placeholder}
                                    onChange={e => setNewField({...newField, placeholder: e.target.value})}
                                    placeholder="Enter section title..."
                                />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">Default Value</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newField.default}
                                    onChange={e => setNewField({...newField, default: e.target.value})}
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
                                        onChange={e => setNewField({...newField, options: e.target.value})}
                                        placeholder="Option 1, Option 2, Option 3"
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
                                        onChange={e => setNewField({...newField, required: e.target.checked})}
                                    />
                                    <label className="form-check-label">Required Field</label>
                                </div>
                            </div>
                            
                            <div className="col-md-12">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={addField}
                                >
                                    <i className="bx bx-plus me-2"></i>
                                    Add Regular Field
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Regular Fields List */}
                    <div className="mb-4">
                        <h6 className="mb-3">Regular Fields ({fields.length})</h6>
                        
                        {fields.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="bx bx-info-circle me-2"></i>
                                No regular fields added yet.
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
                                        {fields.map((field, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <code>{field.name}</code>
                                                    {field.placeholder && (
                                                        <small className="d-block text-muted">Placeholder: {field.placeholder}</small>
                                                    )}
                                                    {field.default && (
                                                        <small className="d-block text-muted">Default: {field.default}</small>
                                                    )}
                                                </td>
                                                <td>{field.label}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        <i className={`bx ${getFieldIcon(field.type)} me-1`}></i>
                                                        {field.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    {field.required ? (
                                                        <span className="badge bg-danger">Required</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Optional</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary"
                                                            onClick={() => editField(index, false)}
                                                            title="Edit"
                                                        >
                                                            <i className="bx bx-edit"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => moveField(index, 'up', false)}
                                                            disabled={index === 0}
                                                            title="Move Up"
                                                        >
                                                            <i className="bx bx-up-arrow-alt"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => moveField(index, 'down', false)}
                                                            disabled={index === fields.length - 1}
                                                            title="Move Down"
                                                        >
                                                            <i className="bx bx-down-arrow-alt"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => removeField(index, false)}
                                                            title="Remove"
                                                        >
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

                    {/* Regular Fields JSON */}
                    <div>
                        <h6 className="mb-3">Regular Fields JSON Configuration</h6>
                        <JsonEditor
                            value={data.fields_config}
                            onChange={(value) => setData('fields_config', value)}
                            placeholder="[]"
                            height="200px"
                        />
                        {jsonError && <div className="text-danger small mt-2">{jsonError}</div>}
                    </div>
                </div>
            </div>

            {/* Repeatable Items Configuration */}
            <div className="card mb-4">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Repeatable Items Configuration</h5>
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
                                {data.mapping_enabled ? 'Repeatable Items Enabled' : 'Enable Repeatable Items'}
                            </label>
                        </div>
                    </div>
                </div>
                
                {data.mapping_enabled && (
                    <div className="card-body">
                        <div className="alert alert-info mb-4">
                            <div className="d-flex">
                                <i className="bx bx-info-circle me-2 mt-1"></i>
                                <div>
                                    <strong>Repeatable Items:</strong> 
                                    <p className="mb-1">Users can add multiple items (like facts, features, testimonials) to this section.</p>
                                    <p className="mb-0">In your HTML template, use <code>{'{item.field_name}'}</code> for item fields.</p>
                                </div>
                            </div>
                        </div>

                        {/* Add Mapping Field Form */}
                        <div className="border rounded p-3 mb-4 bg-light">
                            <h6 className="mb-3">Add Item Field</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Field Label *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${mappingFieldErrors.label ? 'is-invalid' : ''}`}
                                        value={newMappingField.label}
                                        onChange={e => handleMappingLabelChange(e.target.value)}
                                        placeholder="Icon Image"
                                    />
                                    {mappingFieldErrors.label && <div className="invalid-feedback">{mappingFieldErrors.label}</div>}
                                </div>
                                
                                <div className="col-md-4">
                                    <label className="form-label">Field Name *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${mappingFieldErrors.name ? 'is-invalid' : ''}`}
                                        value={newMappingField.name}
                                        onChange={e => {
                                            setNewMappingField({...newMappingField, name: e.target.value});
                                            if (mappingFieldErrors.name) setMappingFieldErrors({...mappingFieldErrors, name: ''});
                                        }}
                                        placeholder="icon_image"
                                    />
                                    {mappingFieldErrors.name && <div className="invalid-feedback d-block">{mappingFieldErrors.name}</div>}
                                </div>
                                
                                <div className="col-md-4">
                                    <label className="form-label">Field Type *</label>
                                    <select
                                        className="form-select"
                                        value={newMappingField.type}
                                        onChange={e => setNewMappingField({...newMappingField, type: e.target.value})}
                                    >
                                        {fieldTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Placeholder Text</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newMappingField.placeholder}
                                        onChange={e => setNewMappingField({...newMappingField, placeholder: e.target.value})}
                                        placeholder="Enter icon description..."
                                    />
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Default Value</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newMappingField.default}
                                        onChange={e => setNewMappingField({...newMappingField, default: e.target.value})}
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
                                            onChange={e => setNewMappingField({...newMappingField, options: e.target.value})}
                                            placeholder="Option 1, Option 2, Option 3"
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
                                            onChange={e => setNewMappingField({...newMappingField, required: e.target.checked})}
                                        />
                                        <label className="form-check-label">Required Field</label>
                                    </div>
                                </div>
                                
                                <div className="col-md-12">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={addMappingField}
                                    >
                                        <i className="bx bx-plus me-2"></i>
                                        Add Item Field
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mapping Fields List */}
                        <div className="mb-4">
                            <h6 className="mb-3">Item Fields ({mappingFields.length})</h6>
                            
                            {mappingFields.length === 0 ? (
                                <div className="alert alert-info">
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
                                                    <td>
                                                        <code>item.{field.name}</code>
                                                        {field.placeholder && (
                                                            <small className="d-block text-muted">Placeholder: {field.placeholder}</small>
                                                        )}
                                                        {field.default && (
                                                            <small className="d-block text-muted">Default: {field.default}</small>
                                                        )}
                                                    </td>
                                                    <td>{field.label}</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            <i className={`bx ${getFieldIcon(field.type)} me-1`}></i>
                                                            {field.type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {field.required ? (
                                                            <span className="badge bg-danger">Required</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Optional</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary"
                                                                onClick={() => editField(index, true)}
                                                                title="Edit"
                                                            >
                                                                <i className="bx bx-edit"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => moveField(index, 'up', true)}
                                                                disabled={index === 0}
                                                                title="Move Up"
                                                            >
                                                                <i className="bx bx-up-arrow-alt"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => moveField(index, 'down', true)}
                                                                disabled={index === mappingFields.length - 1}
                                                                title="Move Down"
                                                            >
                                                                <i className="bx bx-down-arrow-alt"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => removeField(index, true)}
                                                                title="Remove"
                                                            >
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

                        {/* Mapping Fields JSON */}
                        <div>
                            <h6 className="mb-3">Item Fields JSON Configuration</h6>
                            <JsonEditor
                                value={data.mapping_config}
                                onChange={(value) => setData('mapping_config', value)}
                                placeholder="[]"
                                height="200px"
                            />
                            {mappingJsonError && <div className="text-danger small mt-2">{mappingJsonError}</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Template Editor */}
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <div className="mb-3 col-12">
                            <label className="form-label d-flex justify-content-between align-items-center">
                                <span>HTML Template *</span>
                                <small className="text-muted">
                                    Available fields:&nbsp;
                                    {getAllFieldNames().length > 0 ? (
                                        getAllFieldNames().map((field, index) => (
                                            <span key={index} className="me-1">
                                                <code title={field.label}>{field.name}</code>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-danger">No fields defined</span>
                                    )}
                                </small>
                            </label>
                            
                            <div className="alert alert-success mb-3">
                                <div className="d-flex">
                                    <i className="bx bx-code-alt me-2 mt-1"></i>
                                    <div>
                                        <strong>Template Syntax:</strong>
                                        <ul className="mb-1">
                                            <li>Regular fields: <code>{'{field_name}'}</code></li>
                                            <li>Repeatable item fields: <code>{'{item.field_name}'}</code></li>
                                            <li>Use comments to mark repeatable block: <code>&lt;!-- START REPEATABLE ITEM --&gt;</code> and <code>&lt;!-- END REPEATABLE ITEM --&gt;</code></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <CodeEditor
                                value={data.html_template}
                                onChange={(value) => setData('html_template', value)}
                                language="html"
                                placeholder={`<section class="hero_overview">
    <div class="container">
        <div class="herover_left">
            <!-- START REPEATABLE ITEM -->
            <div class="fact_bx">
                <img src="{item.icon_image}" alt="{item.alt_text}">
                <strong>{item.display_count}</strong>
                <p>{item.description}</p>
            </div>
            <!-- END REPEATABLE ITEM -->
        </div>
    </div>
</section>`}
                                height="400px"
                            />
                            {errors.html_template && <div className="text-danger small">{errors.html_template}</div>}
                        </div>

                        <div className="mb-3 col-12">
                            <label className="form-label">CSS Styles</label>
                            <CodeEditor
                                value={data.css_styles}
                                onChange={(value) => setData('css_styles', value)}
                                language="css"
                                placeholder=".section { color: #333; }"
                                height="200px"
                            />
                        </div>

                        <div className="mb-3 col-12">
                            <label className="form-label">JavaScript</label>
                            <CodeEditor
                                value={data.javascript}
                                onChange={(value) => setData('javascript', value)}
                                language="javascript"
                                placeholder="console.log('Section loaded');"
                                height="200px"
                            />
                        </div>

                        <div className="mb-3 col-12">
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    role="switch"
                                />
                                <label className="form-check-label fw-medium">Active Section</label>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <button 
                                type="submit" 
                                className="btn btn-primary me-2 px-4"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Updating Section...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-save me-2"></i>
                                        Update Section
                                    </>
                                )}
                            </button>
                            <Link 
                                href={route('page-sections.index')} 
                                className="btn btn-secondary px-4"
                            >
                                <i className="bx bx-x me-2"></i>
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </div>

            {/* Variables Helper Card */}
            {extractVariables(data.html_template).length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h6 className="card-title mb-0">
                            <i className="bx bx-code-alt me-2"></i>
                            Template Variables
                        </h6>
                    </div>
                    <div className="card-body">
                        <p className="text-muted mb-3">
                            The following variables are used in your HTML template. Make sure they are defined in your fields configuration.
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                            {extractVariables(data.html_template).map((variable, index) => (
                                <code key={index} className="bg-light px-2 py-1 rounded border">
                                    {variable}
                                </code>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Edit;