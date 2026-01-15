// resources/js/Pages/Image/Index.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import { Copy, Trash2, Upload, Image as ImageIcon, FileText, Search } from "lucide-react";
import _ from "lodash";
import Pagination from '@/Components/Pagination';

export default function Index({ images: initialImages }) {
    const { flash } = usePage().props;
    const [images, setImages] = useState(initialImages.data || initialImages);
    const [query, setQuery] = useState("");
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const [idDelete, setIdDelete] = useState(null);
    const { get, processing } = useForm();

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Update images when props change
    useEffect(() => {
        setImages(initialImages.data || initialImages);
    }, [initialImages]);

    // Initialize modals
    useEffect(() => {
        if (modalRef.current) {
            modalInstance.current = new bootstrap.Modal(modalRef.current);
        }
    }, []);

    // Search debounce - same as degree index
    useEffect(() => {
        const delaySearch = _.debounce(() => {
            router.get(route("images.index"), { search: query }, { 
                preserveState: true, 
                replace: true 
            });
        }, 300);

        delaySearch();
        return () => delaySearch.cancel();
    }, [query]);

    const copyToClipboard = (url) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => toast.info("URL copied to clipboard!"))
                .catch(() => toast.error("Failed to copy URL."));
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand("copy");
                if (successful) toast.info("URL copied to clipboard!");
                else toast.error("Failed to copy URL.");
            } catch (err) {
                toast.error("Failed to copy URL.");
            }
            document.body.removeChild(textArea);
        }
    };

    // Delete modal
    const showDeleteModal = (id) => {
        setIdDelete(id);
        modalInstance.current.show();
    };

    const handleConfirmDelete = () => {
        if (idDelete) {
            // Remove from local state immediately for better UX
            setImages(prevImages => prevImages.filter(img => img.id !== idDelete));
            
            get(route("images.destroy", idDelete), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Image deleted successfully!");
                    modalInstance.current.hide();
                    setIdDelete(null);
                },
                onError: () => {
                    // If there's an error, revert to original images
                    setImages(initialImages.data || initialImages);
                    toast.error("Failed to delete image.");
                    modalInstance.current.hide();
                    setIdDelete(null);
                }
            });
        }
    };

    // Extract filename from URL or file path
    const getFileName = (url) => {
        if (!url) return "Unknown file";
        return url.split('/').pop() || "Unknown file";
    };

    // Extract relative path for src attribute
    const getRelativePath = (url) => {
        if (!url) return "/placeholder.jpg";
        try {
            const urlObj = new URL(url);
            return urlObj.pathname;
        } catch {
            return url; // Return as-is if it's already a relative path
        }
    };

    return (
        <div className="container-fluid py-4">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            {/* Header - Same structure as degree index */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Image & Icon Library</h1>
                    <p className="text-muted mb-0">Manage all uploaded files</p>
                </div>
            </div>

            {/* Search Card - Similar to degree index */}
            <div className="card">
                <div className="card-header">
                    <div className="row">
                        <div className="col-md-6 col-8">
                            <div className="input-group input-group-merge">
                                <span className="input-group-text" id="basic-addon-search31">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search By Image Name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    aria-label="Search..."
                                    aria-describedby="basic-addon-search31"
                                />
                            </div>
                        </div>
                        <div className="col-md-6 col-4">
                            <Link
                                href={route("images.create")}
                                className="btn btn-primary float-end"
                            >
                                <Upload size={18} className="me-2" />
                                <span className='d-none d-sm-inline-block'>Upload Image</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Images Grid */}
                <div className="card-body">
                    <div className="row">
                        {images && images.length > 0 ? (
                            images.map((image) => (
                                <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4" key={image.id}>
                                    <div className="card shadow-sm h-100">
                                        {/* Image Preview */}
                                        <div className="position-relative">
                                            <img
                                                src={getRelativePath(image.images)}
                                                className="card-img-top"
                                                style={{ 
                                                    height: "140px", 
                                                    objectFit: "contain", 
                                                    padding: "10px",
                                                    backgroundColor: "#f8f9fa"
                                                }}
                                                alt={image.name || getFileName(image.images)}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder.jpg';
                                                }}
                                            />
                                            {/* Type Badge */}
                                            {image.type && (
                                                <span 
                                                    className={`position-absolute top-0 start-0 m-2 badge ${
                                                        image.type === 'image' ? 'bg-primary' : 'bg-success'
                                                    }`}
                                                >
                                                    {image.type === 'image' ? 
                                                        <ImageIcon size={12} className="me-1" /> : 
                                                        <FileText size={12} className="me-1" />
                                                    }
                                                    {image.type.toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="card-body p-3 d-flex flex-column">
                                            {/* File Info */}
                                            <div className="mb-2">
                                                <small className="text-muted d-block text-truncate" title={image.name || getFileName(image.images)}>
                                                    {image.name || getFileName(image.images)}
                                                </small>
                                                <small className="text-muted">
                                                    {image.created_at ? new Date(image.created_at).toLocaleDateString() : 'Unknown date'}
                                                </small>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-flex gap-2 mt-auto">
                                                {/* Copy URL Button */}
                                                <button
                                                    className="btn btn-sm btn-outline-primary flex-fill d-flex align-items-center justify-content-center gap-1"
                                                    onClick={() => copyToClipboard(image.images)}
                                                    title="Copy URL"
                                                >
                                                    <Copy size={14} />
                                                    <span className="d-none d-sm-inline">Copy</span>
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    className="btn btn-sm btn-outline-danger flex-fill d-flex align-items-center justify-content-center gap-1"
                                                    onClick={() => showDeleteModal(image.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="d-none d-sm-inline">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Empty State */
                            <div className="col-12">
                                <div className="text-center py-5">
                                    <div className="mb-3">
                                        <ImageIcon size={64} className="text-muted" />
                                    </div>
                                    <h4 className="text-muted">
                                        {query ? "No images found" : "No images uploaded yet"}
                                    </h4>
                                    <p className="text-muted mb-4">
                                        {query 
                                            ? "Try adjusting your search" 
                                            : "Get started by uploading your first image or icon"
                                        }
                                    </p>
                                    {query ? (
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => setQuery("")}
                                        >
                                            Clear Search
                                        </button>
                                    ) : (
                                        <Link
                                            href={route("images.create")}
                                            className="btn btn-primary d-inline-flex align-items-center gap-2"
                                        >
                                            <Upload size={18} />
                                            Upload Files
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination - Same as degree index */}
            {initialImages.links && initialImages.links.length > 3 && (
                <div className="row m-2">
                    <div className="col-md-4">
                        <p className="text-dark mb-0 mt-2">
                            Showing {initialImages.from ?? 0} to {initialImages.to ?? 0} of {initialImages.total} entries
                        </p>
                    </div>
                    <div className="col-md-8">
                        <div className="float-end">
                            <Pagination links={initialImages.links} query={query} />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <div
                className="modal fade"
                id="deleteConfirmModal"
                tabIndex="-1"
                aria-hidden="true"
                ref={modalRef}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Deletion</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this image? This action cannot be undone.
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
                                {processing ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}