import React from 'react';
import { Link } from '@inertiajs/react';
import SearchBar from './SearchBar';

const TableHeader = ({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    addButtonText,
    addButtonRoute,
    addButtonIcon = "bx-plus",
    showAddButton = true,
    additionalButtons = null,
    searchColClass = "col-md-6 col-8",
    buttonColClass = "col-md-6 col-4"
}) => {
    return (
        <div className="card-header">
            <div className="row">
                <div className={searchColClass}>
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className={buttonColClass}>
                    <div className="d-flex justify-content-end gap-2">
                        {additionalButtons}
                        {showAddButton && addButtonRoute && (
                            <Link
                                href={addButtonRoute}
                                className="btn btn-primary"
                            >
                                <i className={`bx ${addButtonIcon} me-1`}></i>
                                <span className="d-none d-sm-inline-block">
                                    {addButtonText}
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableHeader;