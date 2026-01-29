import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import { useFlashMessage } from '@/hooks/useFlashMessage';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import ActionDropdown from '@/Components/ActionDropdown';

const Index = ({ modules, searchTerm }) => {
    const [query, setQuery] = useState(searchTerm || '');
    useFlashMessage();

    const {
        modalRef,
        itemToDelete,
        processing,
        confirmDelete,
        handleDelete,
        cancelDelete
    } = useDeleteConfirmation('modules.destroy');

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Modules</h1>
                    <p className="text-muted mb-0">
                        Create reusable modules (e.g. Testimonials) and define their fields
                    </p>
                </div>

                <Link href={route('modules.create')} className="btn btn-primary">
                    <i className="bx bx-plus me-2"></i>
                    Add Module
                </Link>
            </div>

            <ToastContainer />

            {/* Search */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    <i className="bx bx-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search modules by name or slug..."
                                    value={query}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setQuery(value);
                                        router.get(
                                            route('modules.index'),
                                            { search: value },
                                            { preserveState: true, replace: true }
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-md-6 text-end text-muted small">
                            {modules.total} Modules Found
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-borderless table-hover align-middle mb-0">
                            <thead>
                                <tr className="border-bottom">
                                    <th className="ps-4 py-3 text-uppercase fw-semibold fs-7 text-muted">
                                        Module
                                    </th>
                                    <th className="py-3 text-uppercase fw-semibold fs-7 text-muted">
                                        Slug
                                    </th>
                                    <th className="text-center py-3 text-uppercase fw-semibold fs-7 text-muted">
                                        Fields
                                    </th>
                                    <th className="text-center py-3 text-uppercase fw-semibold fs-7 text-muted">
                                        Status
                                    </th>
                                    <th className="text-end pe-4 py-3 text-uppercase fw-semibold fs-7 text-muted">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {modules.data.map((m) => {
                                    const actions = [
                                        {
                                            label: 'Manage Entries',
                                            icon: 'bx-list-plus',
                                            href: route('modules.entries.index', m.id),
                                        },
                                        {
                                            label: 'Edit',
                                            icon: 'bx-edit-alt',
                                            href: route('modules.edit', m.id),
                                        },
                                        {
                                            label: 'Delete',
                                            icon: 'bx-trash',
                                            onClick: () => confirmDelete(m.id, { name: m.name }),
                                            className: 'text-danger',
                                        },
                                    ];

                                    return (
                                        <tr key={m.id} className="border-bottom">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                                                        <i className="bx bx-cube text-white fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark">
                                                            {m.name}
                                                        </div>
                                                        <div className="text-muted small">
                                                            ID: {m.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3">
                                                <div className="bg-label-secondary rounded px-3 py-1 d-inline-block">
                                                    <code className="text-dark">
                                                        {m.slug}
                                                    </code>
                                                </div>
                                            </td>

                                            <td className="text-center py-3">
                                                <div className="d-inline-flex align-items-center gap-1">
                                                    <span className="fw-bold">
                                                        {m.fields_count}
                                                    </span>
                                                    <span className="text-muted small">fields</span>
                                                </div>
                                            </td>

                                            <td className="text-center py-3">
                                                {m.is_active ? (
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1">
                                                        <i className="bx bx-check-circle fs-6"></i>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1">
                                                        <i className="bx bx-x-circle fs-6"></i>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="text-end pe-4 py-3">
                                                <div className="d-flex align-items-center justify-content-end gap-2">
                                                    <Link
                                                        href={route('modules.entries.index', m.id)}
                                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                                    >
                                                        <i className="bx bx-list-plus"></i>
                                                        Entries
                                                    </Link>
                                                    <Link
                                                        href={route('modules.edit', m.id)}
                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                    >
                                                        <i className="bx bx-edit-alt"></i>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(m.id, { name: m.name })}
                                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                    >
                                                        <i className="bx bx-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {modules.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5">
                                            <div className="py-5">
                                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                                                    <i className="bx bx-cube fs-1 text-muted"></i>
                                                </div>
                                                <h4 className="fw-semibold mb-2">No modules found</h4>
                                                <p className="text-muted mb-4">
                                                    {query ? 'Try adjusting your search terms' : 'Get started by creating your first module'}
                                                </p>
                                                {!query && (
                                                    <Link 
                                                        href={route('modules.create')} 
                                                        className="btn btn-primary"
                                                    >
                                                        <i className="bx bx-plus me-2"></i>
                                                        Create Module
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination (if applicable) */}
            {modules.data.length > 0 && modules.last_page > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="text-muted">
                        Showing {modules.from} to {modules.to} of {modules.total} entries
                    </div>
                    <nav>
                        <ul className="pagination mb-0">
                            {modules.links.map((link, index) => (
                                <li 
                                    key={index} 
                                    className={`page-item ${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}
                                >
                                    <Link 
                                        href={link.url || '#'} 
                                        className="page-link"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteConfirmationModal
                modalRef={modalRef}
                title="Confirm Deletion"
                message="Are you sure you want to delete this module? All its entries will also be deleted."
                itemName={itemToDelete?.name}
                onConfirm={handleDelete}
                onCancel={cancelDelete}
                processing={processing}
            />
        </>
    );
};

export default Index;