import React, { useEffect, useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { router, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import debounce from "lodash/debounce";
const Index = ({ pages, searchTerm }) => {
    const [query, setQuery] = useState(searchTerm || "");
    const { flash } = usePage().props;
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const [idDelete, setIdDelete] = useState(null);
    const { delete: destroy, processing } = useForm();

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
    }, [flash]);

    // Search debounce
    useEffect(() => {
        const delaySearch = debounce(() => {
            router.get("pages", { search: query }, { preserveState: true, replace: true });
        }, 300);

        delaySearch();
        return () => delaySearch.cancel();
    }, [query]);

    useEffect(() => {
        if (modalRef.current) {
            modalInstance.current = new bootstrap.Modal(modalRef.current);
        }
    }, []);

    const showDeleteModal = (id) => {
        setIdDelete(id);
        modalInstance.current.show();
    };

    const handleConfirmDelete = () => {
        destroy(route('pages.destroy', idDelete), {
            preserveScroll: true,
            onSuccess: () => {
                modalInstance.current.hide();
                setIdDelete(null);
            }
        });
    };

    const togglePublish = (page) => {
        router.put(route('pages.toggle-publish', page.id), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Pages</h1>
                    <p className="text-muted mb-0">Manage dynamic pages with reusable sections</p>
                </div>
                <Link
                    href={route('pages.create')}
                    className="btn btn-primary"
                >
                    <i className='bx bx-plus me-2'></i>
                    Create Page
                </Link>
            </div>

            <ToastContainer />
            
            <div className="card">
                <div className="card-header">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="input-group input-group-merge">
                                <span className="input-group-text">
                                    <i className="bx bx-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search pages by title or slug..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Sections</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th width="120">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.data.length > 0 ? (
                                pages.data.map((page) => (
                                    <tr key={page.id}>
                                        <td>
                                            <strong>{page.title}</strong>
                                        </td>
                                        <td>
                                            <code className='text-primary'>/{page.slug}</code>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary">{page.sections_count} Sections</span>
                                        </td>
                                        <td>
                                            <span 
                                                className={`badge ${page.is_published ? 'bg-label-success' : 'bg-label-secondary'} cursor-pointer`}
                                                onClick={() => togglePublish(page)}
                                                title="Click to toggle publish status"
                                            >
                                                {page.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted">{page.created_at}</small>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                <Link
                                                    href={route('pages.sections', page.id)}
                                                    method="get"
                                                    as="button"
                                                    className="btn btn-sm btn-outline-primary p-1 m-1"
                                                >
                                                    <span className="tf-icons bx bx-right-arrow-circle bx-18px me-2"></span>Add/Edit
                                                </Link>
                                                <div className="dropdown">
                                                    <button
                                                        aria-label='Click me'
                                                        type="button"
                                                        className="btn btn-outline-secondary p-1 m-1 dropdown-toggle hide-arrow"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        <i className="bx bx-dots-vertical-rounded"></i>
                                                    </button>
                                                    <div className="dropdown-menu">
                                                        <Link
                                                            aria-label="dropdown action option"
                                                            className="dropdown-item"
                                                            href={route('pages.edit', page.id)}
                                                        >
                                                            <i className="bx bx-edit-alt me-1"></i> Edit
                                                        </Link>
                                                        <Link
                                                            aria-label="dropdown action option"
                                                            className="dropdown-item"
                                                            href={route('pages.show', page.id)}
                                                        >
                                                            <i className="bx bx-show me-1"></i> Show
                                                        </Link>
                                                        <button
                                                            onClick={() => showDeleteModal(page.id)}
                                                            aria-label="dropdown action option"
                                                            className="dropdown-item"
                                                            disabled={processing}
                                                        >
                                                            <i className="bx bx-trash me-1"></i> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        <div className="text-muted">
                                            <i className="bx bx-file bx-lg mb-2"></i>
                                            <p>No pages found</p>
                                            {query && (
                                                <small>Try adjusting your search criteria</small>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Modal */}
                <div className="modal fade" ref={modalRef} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to delete this page? 
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleConfirmDelete}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Yes, Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {pages.links.length > 3 && (
                <div className="row mt-4">
                    <div className="col-md-6">
                        <p className="text-muted mb-0">
                            Showing {pages.from ?? 0} to {pages.to ?? 0} of {pages.total} entries
                        </p>
                    </div>
                    <div className="col-md-6">
                        <div className="float-end">
                            <Pagination links={pages.links} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Index;