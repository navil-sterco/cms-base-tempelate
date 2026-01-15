import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import { useFlashMessage } from '@/hooks/useFlashMessage';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import { useToggleStatus } from '@/hooks/useToggleStatus';
import TableHeader from '@/Components/TableHeader';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import ActionDropdown from '@/Components/ActionDropdown';
import Pagination from '@/Components/Pagination';
import { useDebouncedSearch } from '@/hooks/useSearch';

const Index = ({ searchTerm, degree }) => {
    const [query, setQuery] = useState(searchTerm || "");
    // Hooks
    useDebouncedSearch(query, "degree");
    useFlashMessage();
    const { modalRef, itemToDelete, processing, confirmDelete, handleDelete } = 
    useDeleteConfirmation('degree.destroy');
    const { toggleStatus } = useToggleStatus('degree.toggleStatus');

    return (
        <>
            <h1 className="text-muted">Degree List</h1>
            <ToastContainer />

            <div className="card">
                <TableHeader
                    searchValue={query}
                    onSearchChange={setQuery}
                    searchPlaceholder="Search By Degree Name..."
                    addButtonText="Add Degree"
                    addButtonRoute={route('degree.create')}
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-hover my-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Program Name</th>
                                <th>ShortName</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {degree.data.length > 0 ? (
                                degree.data.map((deg) => {
                                    const actions = [
                                        {
                                            label: 'Edit',
                                            icon: 'bx-edit-alt',
                                            href: route('degree.edit', deg.id)
                                        },
                                        {
                                            label: 'Delete',
                                            icon: 'bx-trash',
                                            onClick: () => confirmDelete(deg.id, { name: deg.name }),
                                            className: 'text-danger'
                                        }
                                    ];

                                    return (
                                        <tr key={deg.id}>
                                            <td>
                                                <i className="bx bxs-graduation bx-sm me-3"></i>
                                                {deg.name}
                                            </td>
                                            <td>
                                                <i className="bx bxs-book bx-sm me-3"></i>
                                                {deg.program_name}
                                            </td>
                                            <td>
                                                <i className="bx bx-abacus bx-sm me-3"></i>
                                                {deg.short_name}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-1">
                                                    <Link
                                                        className="btn btn-sm btn-outline-primary p-1"
                                                        href={route("degree.mapping", deg.id)}
                                                    >
                                                        <i className="bx bx-right-arrow-circle me-1"></i>
                                                        Mapping
                                                    </Link>
                                                    <ActionDropdown actions={actions} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        <div className="text-muted">
                                            <i className="bx bx-info-circle bx-sm me-2"></i>
                                            No degrees found
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmationModal
                modalRef={modalRef}
                title="Confirm Deletion"
                message="Are you sure you want to delete this degree?"
                itemName={itemToDelete?.name}
                onConfirm={() => handleDelete()}
                processing={processing}
            />

            {degree.links.length > 3 && (
                <div className="row m-2">
                    <div className="col-md-4">
                        <p className="text-dark mb-0 mt-2">
                            Showing {degree.from ?? 0} to {degree.to ?? 0} of {degree.total} entries
                        </p>
                    </div>
                    <div className="col-md-8">
                        <div className="float-end">
                            <Pagination links={degree.links} query={query} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Index;