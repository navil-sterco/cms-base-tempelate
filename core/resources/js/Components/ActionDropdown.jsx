// Components/ActionDropdown.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

const ActionDropdown = ({ actions, buttonClass = "btn-outline-secondary" }) => {
    return (
        <div className="dropdown">
            <button
                type="button"
                className={`btn ${buttonClass} p-1 dropdown-toggle hide-arrow`}
                data-bs-toggle="dropdown"
                aria-label="Actions"
            >
                <i className="bx bx-dots-vertical-rounded"></i>
            </button>
            <div className="dropdown-menu">
                {actions.map((action, index) => {
                    if (action.divider) {
                        return <div key={index} className="dropdown-divider"></div>;
                    }

                    if (action.href) {
                        return (
                            <Link
                                key={index}
                                className={`dropdown-item ${action.className || ''}`}
                                href={action.href}
                            >
                                {action.icon && <i className={`bx ${action.icon} me-2`}></i>}
                                {action.label}
                            </Link>
                        );
                    }

                    return (
                        <a
                            key={index}
                            onClick={action.onClick}
                            className={`dropdown-item ${action.className || ''}`}
                            href="#"
                        >
                            {action.icon && <i className={`bx ${action.icon} me-2`}></i>}
                            {action.label}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default ActionDropdown;