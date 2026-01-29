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

export const renderFieldInput = (field, value, onChange) => {
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

