// Components/Layout/FormLayout.jsx
import React from 'react';

const FormLayout = ({
    title,
    subtitle,
    children,
    cardClassName = '',
    headerClassName = '',
    bodyClassName = '',
    footer,
    onSubmit,
    processing = false
}) => {
    return (
        <>
            <div className={`mb-4 ${headerClassName}`}>
                <h1 className="text-muted mb-1">{title}</h1>
                {subtitle && (
                    <p className="text-muted text-sm">{subtitle}</p>
                )}
            </div>
            
            <div className={`card mb-4 ${cardClassName}`}>
                <form onSubmit={onSubmit}>
                    <div className={`card-body ${bodyClassName}`}>
                        {children}
                    </div>
                    
                    {footer && (
                        <div className="card-footer">
                            {footer}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default FormLayout;