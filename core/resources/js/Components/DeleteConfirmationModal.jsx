import { Trash2 } from 'lucide-react';
import React from 'react';

const DeleteConfirmationModal = ({
    modalRef,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item?",
    confirmText = "Yes, Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    processing = false,
    itemName = null
}) => {
    return (
        <div
            className="modal fade"
            tabIndex="-1"
            aria-hidden="true"
            ref={modalRef}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <Trash2 className="me-2 text-danger" size={25} />
                            {title}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            disabled={processing}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {message}
                        {itemName && (
                            <div className="alert alert-warning mt-3 mb-0">
                                <strong>{itemName}</strong>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onConfirm}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="me-2" size={20} />
                                    {confirmText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;