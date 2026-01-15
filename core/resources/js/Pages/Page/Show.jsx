import React from 'react';
import { Link } from '@inertiajs/react';

const Show = ({ page }) => {
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">{page.title}</h1>
                    <p className="text-muted mb-0">Page details and content</p>
                </div>
                <div className="d-flex gap-2">
                    <Link
                        href={route('pages.edit', page.id)}
                        className="btn btn-primary"
                    >
                        <i className="bx bx-edit me-2"></i>
                        Edit Page
                    </Link>
                    <Link
                        href={route('pages.index')}
                        className="btn btn-secondary"
                    >
                        Back to List
                    </Link>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Page Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>URL Slug:</strong>
                                    <br />
                                    <code className="text-primary">/pages/{page.slug}</code>
                                </div>
                                <div className="col-md-6">
                                    <strong>Status:</strong>
                                    <br />
                                    <span className={`badge ${page.is_published ? 'bg-success' : 'bg-secondary'}`}>
                                        {page.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                            {page.meta_description && (
                                <div className="mt-3">
                                    <strong>Meta Description:</strong>
                                    <br />
                                    <p className="text-muted mb-0">{page.meta_description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Page Preview</h5>
                        </div>
                        <div className="card-body">
                            <div className="bg-light p-4 rounded border">
                                {page.sections && page.sections.length > 0 ? (
                                    page.sections.map((section, index) => (
                                        <div key={index} className="mb-4 p-3 border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0 text-primary">{section.name}</h6>
                                                <small className="text-muted">{section.identifier}</small>
                                            </div>
                                            <div className="bg-white p-3 rounded">
                                                <pre style={{ fontSize: '14px', margin: 0 }}>
                                                    {section.html_template}
                                                </pre>
                                            </div>
                                            {section.pivot.section_data && (
                                                <div className="mt-3">
                                                    <small className="text-muted">Section Data:</small>
                                                    <pre className="bg-white p-2 rounded small mt-1">
                                                        {JSON.stringify(section.pivot.section_data, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted mb-0 text-center">No sections added to this page</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Page Sections</h5>
                        </div>
                        <div className="card-body">
                            {page.sections && page.sections.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {page.sections.map((section, index) => (
                                        <div key={index} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <strong>{section.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        Order: {section.pivot.order} • {section.identifier}
                                                    </small>
                                                </div>
                                                <span className="badge bg-light text-dark">#{index + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted mb-0">No sections added</p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                {page.page_type == 'cms' &&
                                    <a
                                        href={route('pages.frontend.show', page.slug)}
                                        className="btn btn-outline-primary"
                                        target="_blank"
                                    >
                                        <i className="bx bx-show me-2"></i>
                                        View Live Page
                                    </a>
                                }
                                <Link
                                    href={route('pages.edit', page.id)}
                                    className="btn btn-outline-success"
                                >
                                    <i className="bx bx-edit me-2"></i>
                                    Edit Page
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Show;