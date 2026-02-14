import React from 'react';
import CodeEditor from '@/Components/Fields/CodeEditor';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

export const buildEmptyData = (fields) => {
    const obj = {};
    (fields || []).forEach((f) => {
        if (f?.name) obj[f.name] = f?.type === 'checkbox' ? false : '';
    });
    return obj;
};

export const buildEmptyMappingItem = (mappingFields) => {
    const obj = {};
    (mappingFields || []).forEach((f) => {
        if (f?.name) obj[f.name] = f?.type === 'checkbox' ? false : '';
    });
    return obj;
};

export const renderFieldInput = (field, value, onChange, options = {}) => {
    const required = !!field.required;
    const placeholder = field.placeholder || '';

    if (field.type === 'code') {
        return (
            <div className="code-editor-container">
                <CodeEditor
                    value={value || ''}
                    onChange={onChange}
                    language={field.language || 'html'}
                    height="400px"
                />
                {placeholder && !value && (
                    <div className="text-muted small mt-1">{placeholder}</div>
                )}
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <textarea
                className="form-control"
                rows={3}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                style={{ minHeight: '38px', resize: 'vertical' }}
            />
        );
    }

    if (field.source_module_id && options.moduleEntries) {
        const moduleOptions = options.moduleEntries[field.source_module_id] || [];
        return (
            <select
                className="form-select"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            >
                <option value="">Select {field.label || field.name}</option>
                {moduleOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
            </select>
        );
    }

    if (field.type === 'select') {
        const selectOptions = Array.isArray(field.options) ? field.options : [];
        return (
            <select
                className="form-select"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            >
                <option value="">Select</option>
                {selectOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value || opt}>
                        {opt.label || opt}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="form-check d-flex align-items-center" style={{ minHeight: '38px' }}>
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    required={required}
                />
                <label className="form-check-label ms-2">
                    {field.label}
                </label>
            </div>
        );
    }

    if (field.type === 'radio') {
        return (
            <div className="radio-group" style={{ minHeight: '38px' }}>
                {(field.options || []).map((option, idx) => (
                    <div key={idx} className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name={field.name}
                            value={option.value || option}
                            checked={value === (option.value || option)}
                            onChange={(e) => onChange(e.target.value)}
                            required={required}
                        />
                        <label className="form-check-label ms-2">
                            {option.label || option}
                        </label>
                    </div>
                ))}
            </div>
        );
    }

    if (field.type === 'color') {
        return (
            <div className="d-flex align-items-center gap-2">
                <input
                    type="color"
                    className="form-control form-control-color p-1"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    style={{ height: '38px', width: '60px', minWidth: '60px' }}
                />
                <input
                    type="text"
                    className="form-control"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    style={{ height: '38px' }}
                />
            </div>
        );
    }

    if (field.type === 'file' || field.type === 'image') {
        const isFileObject = (obj) => {
            return obj && 
                   typeof obj === 'object' && 
                   typeof obj.name === 'string' &&
                   typeof obj.type === 'string' &&
                   typeof obj.size === 'number';
        };

        const hasFile = options.filePreview ? options.filePreview : (value && isFileObject(value));
        
        return (
            <div>
                {/* File Preview */}
                {hasFile && (
                    <div className="mb-2 p-2 border rounded">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                                <ImageIcon size={16} />
                            </div>
                            {options.onRemoveFile && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger flex-shrink-0 ms-2"
                                    onClick={() => options.onRemoveFile()}
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                        {/* Image Preview */}
                        {options.imagePreviewUrl && (
                            <div className="mt-2 text-center">
                                <img 
                                    src={options.imagePreviewUrl} 
                                    alt="Preview" 
                                    className="img-fluid rounded border"
                                    style={{ maxHeight: '100px', maxWidth: '100%' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <span className="small text-truncate">
                            {isFileObject(value) ? value.name : typeof value === 'string' ? value : 'File'}
                        </span>
                    </div>
                )}
                
                {/* File Input */}
                <div className="input-group">
                    <input
                        type="file"
                        className="form-control"
                        accept={field.accept || (field.type === 'image' ? "image/*" : "*")}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && options.onFileSelect) {
                                options.onFileSelect(file);
                            } else if (file) {
                                onChange(file);
                            }
                        }}
                        required={required && !hasFile}
                        id={`file-${field.name}`}
                        style={{ height: '38px' }}
                    />
                    <label 
                        className="input-group-text btn btn-outline-secondary border" 
                        htmlFor={`file-${field.name}`}
                        style={{ height: '38px' }}
                    >
                        <Upload size={16} />
                    </label>
                </div>
                <div className="form-text small mt-1">
                    {field.type === 'image' ? 
                        'Images (Max: 3MB)' : 
                        'All files (Max: 3MB)'}
                </div>
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
            style={{ height: '38px' }}
        />
    );
};

