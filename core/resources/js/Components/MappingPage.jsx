import React from "react";
import { Link } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";
import { useFlashMessage } from "@/hooks/useFlashMessage";
import { useMapping } from "@/hooks/useMapping";

const MappingPage = ({
    entity,
    entityName,
    title,
    icon,
    backRoute,
    submitRoute,
    lists,
    containerClass = "container py-4",
    submitText = "Save Mapping",
}) => {
    useFlashMessage();

    // Prepare initial mappings from entity relationships
    const initialMappings = {};
    lists.forEach((list) => {
        const relationshipKey = list.relationshipKey || `${list.field.replace('_ids', '')}s`;
        initialMappings[list.field] = entity[relationshipKey]?.map((item) => item.id) || [];
    });

    const { data, processing, errors, toggleItem, toggleAll, handleSubmit } = useMapping(entity, initialMappings);

    // Calculate total selected
    const totalSelected = Object.values(data).reduce(
        (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
        0
    );

    return (
        <div className={containerClass}>
            <ToastContainer />
            <div className="card shadow-sm">
                {/* Header */}
                <div className="card-header bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            {icon && <i className={`bx ${icon} me-2`}></i>}
                            {title}: <span className="text-muted">{entityName}</span>
                        </h5>
                        {backRoute && (
                            <Link href={backRoute} className="btn btn-sm btn-outline-secondary">
                                <i className="bx bx-arrow-back me-1"></i>
                                Back
                            </Link>
                        )}
                    </div>
                </div>

                <div className="card-body">
                    {/* Summary Alert */}
                    {totalSelected > 0 && (
                        <div className="alert alert-info mb-3">
                            <i className="bx bx-info-circle me-2"></i>
                            <strong>Total Selected:</strong> {totalSelected} item(s)
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(submitRoute, entity.id)}>
                        <div className="row">
                            {lists.map((list) => {
                                const selectedIds = data[list.field] || [];
                                const allSelected = list.items.length > 0 && selectedIds.length === list.items.length;
                                const someSelected = selectedIds.length > 0 && selectedIds.length < list.items.length;

                                return (
                                    <div key={list.field} className={list.colClass || "col-md-4 mb-3"}>
                                        {/* List Header */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold mb-0">
                                                {list.icon && <span className="me-2">{list.icon}</span>}
                                                {list.label}
                                            </h6>
                                            {list.items.length > 0 && (
                                                <small className="text-muted">
                                                    {selectedIds.length}/{list.items.length}
                                                </small>
                                            )}
                                        </div>

                                        {/* Select All Button */}
                                        {list.items.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary w-100 mb-2"
                                                onClick={() => toggleAll(list.items, list.field)}
                                            >
                                                <i className={`bx ${
                                                    allSelected ? 'bx-checkbox-checked' : 
                                                    someSelected ? 'bx-checkbox-minus' : 'bx-checkbox'
                                                } me-1`}></i>
                                                {allSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        )}

                                        {/* Items List */}
                                        <div
                                            className="border rounded p-2 overflow-auto"
                                            style={{ 
                                                minHeight: list.minHeight || 250, 
                                                maxHeight: list.maxHeight || 400 
                                            }}
                                        >
                                            {list.items.length > 0 ? (
                                                list.items.map((item) => {
                                                    const isSelected = selectedIds.includes(item.id);
                                                    const displayValue = list.displayField 
                                                        ? item[list.displayField] 
                                                        : (item.title || item.name);

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => toggleItem(item.id, list.field)}
                                                            className={`p-2 mb-1 rounded d-flex justify-content-between align-items-center ${
                                                                isSelected ? "bg-primary text-white" : "bg-light"
                                                            }`}
                                                            style={{ cursor: "pointer", transition: "all 0.2s" }}
                                                        >
                                                            <span className="text-truncate">
                                                                {list.renderItem ? list.renderItem(item) : displayValue}
                                                            </span>
                                                            {isSelected && <i className="bx bx-check-circle ms-2"></i>}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center text-muted py-4">
                                                    <i className="bx bx-info-circle bx-sm d-block mb-2"></i>
                                                    {list.emptyMessage || "No items available"}
                                                </div>
                                            )}
                                        </div>

                                        {/* Error Message */}
                                        {errors[list.field] && (
                                            <div className="text-danger small mt-2">
                                                <i className="bx bx-error-circle me-1"></i>
                                                {errors[list.field]}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Submit Button */}
                        <div className="text-end mt-4 pt-3 border-top">
                            <button className="btn btn-primary" type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-save me-2"></i>
                                        {submitText}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MappingPage;