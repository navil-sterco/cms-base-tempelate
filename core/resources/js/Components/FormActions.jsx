// Components/Form/FormActions.jsx
import React from 'react';
import SubmitButton from './SubmitButton';

const FormActions = ({
    processing = false,
    submitText = 'Submit',
    cancelText = 'Cancel',
    showCancel = true,
    onCancel,
    submitButtonProps = {},
    cancelButtonProps = {},
    className = '',
    justify = 'end', // 'start', 'center', 'end', 'between'
}) => {
    const justifyClasses = {
        start: 'justify-content-start',
        center: 'justify-content-center',
        end: 'justify-content-end',
        between: 'justify-content-between'
    };
    
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            window.history.back();
        }
    };
    
    return (
        <div className={`mt-4 pt-3 ${className}`}>
            <div className={`d-flex ${justifyClasses[justify]} gap-2`}>
                {showCancel && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={processing}
                        className="btn btn-outline-secondary"
                        {...cancelButtonProps}
                    >
                        {cancelText}
                    </button>
                )}
                
                <SubmitButton
                    processing={processing}
                    {...submitButtonProps}
                >
                    {submitText}
                </SubmitButton>
            </div>
        </div>
    );
};

export default FormActions;