// resources/js/Components/Fields/HtmlEditor.jsx
import React from 'react';

const HtmlEditor = ({ value, onChange, placeholder, ...props }) => {
    return (
        <div className="html-editor">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows="12"
                className="form-control font-monospace"
                style={{ fontSize: '14px' }}
                {...props}
            />
        </div>
    );
};

export default HtmlEditor;