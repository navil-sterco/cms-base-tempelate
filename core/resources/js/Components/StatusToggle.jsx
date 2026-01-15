import React from 'react';

const StatusToggle = ({ 
    isActive, 
    onToggle, 
    activeText = "Active", 
    inactiveText = "Inactive",
    size = "sm" 
}) => {
    return (
        <button
            type="button"
            className={`btn btn-${size} btn-${isActive ? 'success' : 'secondary'}`}
            onClick={onToggle}
        >
            <i className={`bx ${isActive ? 'bx-check-circle' : 'bx-x-circle'} me-1`}></i>
            {isActive ? activeText : inactiveText}
        </button>
    );
};

export default StatusToggle;