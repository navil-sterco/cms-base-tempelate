// resources/js/Components/ImageSelectorModal.jsx
import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from "react-toastify";
import { Search, X, Copy, Check } from 'lucide-react';
import _ from 'lodash';

const ImageSelectorModal = ({ isOpen, onClose, initialImages,pageId }) => {
    const { flash, url } = usePage().props;
    const [images, setImages] = useState(initialImages?.data || []);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(initialImages?.current_page || 1);
    const [lastPage, setLastPage] = useState(initialImages?.last_page || 1);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedUrl, setCopiedUrl] = useState(null);

    // Get current route and determine if we're on create or edit page
    const currentRoute = route().current();
    const isCreatePage = currentRoute === 'pages.create';
    const isEditPage = currentRoute === 'pages.edit';
    const currentPageId = isEditPage ? route().params.page : null;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    // Function to get the appropriate route based on current page
    const getCurrentRoute = () => {
        return route('pages.sections', pageId);
    };
    
    // Search debounce - uses Inertia to refresh the page with new data
    useEffect(() => {
        const delaySearch = _.debounce(() => {
            const routeUrl = getCurrentRoute();
            router.get(routeUrl, { 
                search: searchQuery || null
            }, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        if (isOpen) {
            delaySearch();
        }

        return () => delaySearch.cancel();
    }, [searchQuery, isOpen]);

    // Update images when initialImages prop changes
    useEffect(() => {
        if (initialImages) {
            setImages(initialImages.data || []);
            setCurrentPage(initialImages.current_page || 1);
            setLastPage(initialImages.last_page || 1);
        }
    }, [initialImages]);

    // Clear search function
    const clearSearch = () => {
        setSearchQuery('');
        // Immediately trigger search with empty query
        setLoading(true);
        const routeUrl = getCurrentRoute();
        router.get(routeUrl, { 
            search: null 
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const copyToClipboard = (url) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    toast.info("URL copied to clipboard!");
                    setCopiedUrl(url);
                    setTimeout(() => {
                        setCopiedUrl(null);
                    }, 2000);
                })
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
                if (successful) {
                    toast.info("URL copied to clipboard!");
                    setCopiedUrl(url);
                    setTimeout(() => {
                        setCopiedUrl(null);
                    }, 2000);
                } else {
                    toast.error("Failed to copy URL.");
                }
            } catch (err) {
                toast.error("Failed to copy URL.");
            }
            document.body.removeChild(textArea);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) {
            setLoading(true);
            const routeUrl = getCurrentRoute();
            router.get(routeUrl, { 
                page: page,
                search: searchQuery || null 
            }, {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Image Library - Copy URLs</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        {/* Search Bar */}
                        <div className="input-group mb-4">
                            <span className="input-group-text">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search images by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={clearSearch}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Images Grid */}
                                <div className="row">
                                    {images.length > 0 ? (
                                        images.map((image) => (
                                            <div key={image.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-img-top d-flex align-items-center justify-content-center"
                                                        style={{ 
                                                            height: '150px', 
                                                            overflow: 'hidden',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    >
                                                        <img 
                                                            src={image.images} 
                                                            alt={image.name || `Image ${image.id}`}
                                                            style={{ 
                                                                maxHeight: '100%', 
                                                                maxWidth: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = '/assets/img/placeholder.png';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <small className="text-muted text-truncate" title={image.name}>
                                                                {image.name || 'Untitled Image'}
                                                            </small>
                                                            <span className={`badge ${image.type === 'image' ? 'bg-primary' : 'bg-success'}`}>
                                                                {image.type}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                                            onClick={() => copyToClipboard(image.images)}
                                                        >
                                                            {copiedUrl === image.images ? (
                                                                <>
                                                                    <Check size={16} />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy size={16} />
                                                                    Copy URL
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-5">
                                            <p className="text-muted">No images found</p>
                                            {searchQuery && (
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={clearSearch}
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {lastPage > 1 && (
                                    <nav aria-label="Image pagination" className="mt-4">
                                        <ul className="pagination justify-content-center">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            
                                            {[...Array(lastPage)].map((_, index) => (
                                                <li 
                                                    key={index + 1} 
                                                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            
                                            <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === lastPage}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageSelectorModal;