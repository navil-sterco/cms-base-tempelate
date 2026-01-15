import React from 'react';

const SearchBar = ({ 
    value, 
    onChange, 
    placeholder = "Search...",
    icon = "bx-search",
    className = ""
}) => {
    return (
        <div className={`input-group input-group-merge ${className}`}>
            <span className="input-group-text">
                <i className={`bx ${icon}`}></i>
            </span>
            <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Search..."
            />
        </div>
    );
};

export default SearchBar;