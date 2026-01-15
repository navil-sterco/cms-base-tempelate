import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        type: "image",
        name: "",
        images: [] // Changed from 'files' to 'images' to match backend
    });

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);
        setData("images", files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.images.length === 0) {
            alert("Please select at least one file");
            return;
        }

        const formData = new FormData();

        // Append each file with 'images[]' name to match backend validation
        data.images.forEach((file) => {
            formData.append("images[]", file);
        });

        formData.append("type", data.type);

        post(route("images.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                setData("images", []);
                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            }
        });
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Upload Images / Icons</h1>
                    <p className="text-muted mb-0">Store multiple image or icon files</p>
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <div className="row">
                            <div className="mb-3 col-md-6">
                                <label htmlFor="name" className="form-label">Name <span className="text-danger">*</span></label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder='About Us Image'
                                    value={data.name}
                                    onChange={(e) => setData("name",e.target.value)}
                                />
                                <div className="form-text text-danger">{errors.name}</div> 
                            </div>
                            {/* Type */}
                            <div className="mb-3 col-md-6">
                                <label className="form-label">File Type</label>
                                <select
                                    className="form-select"
                                    value={data.type}
                                    onChange={(e) => setData("type", e.target.value)}
                                >
                                    <option value="image">Image</option>
                                    <option value="icon">Icon</option>
                                </select>
                                {errors.type && (
                                    <div className="text-danger small">{errors.type}</div>
                                )}
                            </div>

                            {/* Files */}
                            <div className="mb-3 col-md-6">
                                <label className="form-label">Upload Files</label>
                                <input
                                    type="file"
                                    multiple
                                    className="form-control"
                                    onChange={handleFiles}
                                    accept=".jpg,.jpeg,.png,.svg,.webp"
                                />
                                
                                {/* Show selected files */}
                                {data.images.length > 0 && (
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            Selected files: {data.images.length}
                                        </small>
                                        <ul className="small mt-1">
                                            {data.images.map((file, index) => (
                                                <li key={index}>{file.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Error messages */}
                                {errors.images && (
                                    <div className="text-danger small">{errors.images}</div>
                                )}
                                {errors["images.0"] && (
                                    <div className="text-danger small">{errors["images.0"]}</div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <button
                                type="submit"
                                className="btn btn-primary me-2"
                                disabled={processing || data.images.length === 0}
                            >
                                {processing ? "Uploading..." : `Upload ${data.images.length} Files`}
                            </button>

                            <Link href={route("images.index")} className="btn btn-secondary">
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}