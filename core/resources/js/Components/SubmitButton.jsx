// Components/Form/SubmitButton.jsx
import React from 'react';

const SubmitButton = ({
    processing = false,
    children,
    className = '',
    type = 'submit',
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon,
    ...props
}) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-info',
        light: 'btn-light',
        dark: 'btn-dark',
        outline: 'btn-outline-primary',
        link: 'btn-link'
    };
    
    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg'
    };
    
    const widthClass = fullWidth ? 'w-100' : '';
    
    return (
        <button
            type={type}
            disabled={disabled || processing}
            className={`
                ${baseClasses}
                ${variantClasses[variant] || variantClasses.primary}
                ${sizeClasses[size]}
                ${widthClass}
                ${className}
            `.trim()}
            aria-label={processing ? 'Processing...' : props['aria-label'] || children}
            {...props}
        >
            {processing ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                </>
            ) : (
                <>
                    {icon && <span className="me-2">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default SubmitButton;