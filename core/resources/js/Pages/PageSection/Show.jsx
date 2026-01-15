import React from 'react';
import { Link } from '@inertiajs/react';

const Show = ({ section }) => {
    const parseJsonSafely = (jsonData) => {
        try {
            if (typeof jsonData === 'string') {
                return JSON.parse(jsonData);
            }
            return jsonData || [];
        } catch (error) {
            return [];
        }
    };

    const fieldsConfig = parseJsonSafely(section.fields_config);
    const mappingConfig = parseJsonSafely(section.mapping_config);
    
    const fieldTypeIcons = {
        text: 'bx-text',
        textarea: 'bx-align-left',
        richtext: 'bx-edit',
        number: 'bx-hash',
        email: 'bx-envelope',
        url: 'bx-link',
        select: 'bx-chevron-down',
        checkbox: 'bx-check-square',
        radio: 'bx-radio-circle',
        file: 'bx-upload',
        image: 'bx-image',
        date: 'bx-calendar',
        color: 'bx-palette',
    };

    const getFieldIcon = (type) => {
        return fieldTypeIcons[type] || 'bx-cube';
    };

    const extractVariables = (html) => {
        if (!html) return [];
        const matches = html.match(/{([^}]+)}/g) || [];
        return [...new Set(matches)];
    };

    const variables = extractVariables(section.html_template);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">{section.name}</h1>
                    <p className="text-muted mb-0">Section details and usage</p>
                </div>
                <div className="d-flex gap-2">
                    <Link
                        href={route('page-sections.edit', section.id)}
                        className="btn btn-primary"
                    >
                        <i className="bx bx-edit me-2"></i>
                        Edit Section
                    </Link>
                    <Link
                        href={route('page-sections.index')}
                        className="btn btn-secondary"
                    >
                        Back to List
                    </Link>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    {/* Regular Fields Card */}
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-list-check me-2"></i>
                                Regular Fields
                            </h5>
                            <span className="badge bg-primary">{fieldsConfig.length}</span>
                        </div>
                        <div className="card-body p-0">
                            {fieldsConfig.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {fieldsConfig.map((field, index) => (
                                        <div key={index} className="list-group-item border-bottom">
                                            <div className="d-flex align-items-start mb-2">
                                                <div className="me-2">
                                                    <i className={`bx ${getFieldIcon(field.type)} text-primary`}></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <strong className="d-block">{field.label}</strong>
                                                    <small className="text-muted">
                                                        <code className="text-dark">{field.name}</code> • {field.type}
                                                    </small>
                                                </div>
                                                <span className={`badge ${field.required ? 'bg-danger border-0' : 'bg-secondary border-0'}`}>
                                                    {field.required ? 'Required' : 'Optional'}
                                                </span>
                                            </div>
                                            {(field.placeholder || field.default) && (
                                                <div className="ms-4">
                                                    {field.placeholder && (
                                                        <div className="small text-muted mb-1">
                                                            <span className="text-dark">Placeholder:</span> {field.placeholder}
                                                        </div>
                                                    )}
                                                    {field.default && (
                                                        <div className="small text-muted">
                                                            <span className="text-dark">Default:</span> {field.default}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bx bx-slider text-muted fs-1 mb-2"></i>
                                    <p className="text-muted mb-0">No regular fields configured</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Template Preview Card */}
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">HTML Template</h5>
                            {variables.length > 0 && (
                                <small className="text-muted">
                                    {variables.length} variable{variables.length !== 1 ? 's' : ''}
                                </small>
                            )}
                        </div>
                        <div className="card-body">
                            {/* Variables Preview */}
                            {variables.length > 0 && (
                                <div className="alert alert-light border mb-3">
                                    <div className="d-flex align-items-start">
                                        <i className="bx bx-code-alt text-primary mt-1 me-2"></i>
                                        <div>
                                            <strong className="d-block mb-1">Template Variables:</strong>
                                            <div className="d-flex flex-wrap gap-1">
                                                {variables.map((variable, index) => {
                                                    const isMapping = variable.startsWith('{item.');
                                                    return (
                                                        <span key={index} className={`badge ${isMapping ? 'bg-warning text-dark' : 'bg-primary text-dark'} border-0`}>
                                                            <code className="bg-transparent text-white">{variable}</code>
                                                            {isMapping ? <i className="bx bx-repeat ms-1"></i> : <i className="bx bx-up-arrow-circle ms-1"></i>}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="border rounded bg-light">
                                <pre className="p-3 mb-0" style={{ 
                                    fontSize: '14px', 
                                    maxHeight: '400px', 
                                    overflow: 'auto',
                                    backgroundColor: '#f8f9fa',
                                    border: 'none'
                                }}>
                                    {section.html_template}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* CSS Styles Card */}
                    {section.css_styles && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title mb-0">CSS Styles</h5>
                            </div>
                            <div className="card-body">
                                <div className="border rounded bg-light">
                                    <pre className="p-3 mb-0" style={{ 
                                        fontSize: '14px', 
                                        maxHeight: '200px', 
                                        overflow: 'auto',
                                        backgroundColor: '#f8f9fa',
                                        border: 'none'
                                    }}>
                                        {section.css_styles}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* JavaScript Card */}
                    {section.javascript && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title mb-0">JavaScript</h5>
                            </div>
                            <div className="card-body">
                                <div className="border rounded bg-light">
                                    <pre className="p-3 mb-0" style={{ 
                                        fontSize: '14px', 
                                        maxHeight: '200px', 
                                        overflow: 'auto',
                                        backgroundColor: '#f8f9fa',
                                        border: 'none'
                                    }}>
                                        {section.javascript}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    {/* Repeatable Item Fields Card */}
                    {section.mapping_enabled && (
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="card-title mb-0">
                                    <i className="bx bx-layer me-2"></i>
                                    Repeatable Item Fields
                                </h5>
                                <span className="badge bg-warning text-dark">{mappingConfig.length}</span>
                            </div>
                            <div className="card-body p-0">
                                {mappingConfig.length > 0 ? (
                                    <>
                                        <div className="alert alert-light border mx-3 mt-3 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="bx bx-repeat text-warning mt-1 me-2"></i>
                                                <div>
                                                    <small className="text-muted d-block mb-1">Usage in template:</small>
                                                    <code className="bg-warning text-dark px-2 py-1 rounded">{'{item.field_name}'}</code>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="list-group list-group-flush">
                                            {mappingConfig.map((field, index) => (
                                                <div key={index} className="list-group-item border-bottom">
                                                    <div className="d-flex align-items-start mb-2">
                                                        <div className="me-2">
                                                            <i className={`bx ${getFieldIcon(field.type)} text-warning`}></i>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <strong className="d-block">{field.label}</strong>
                                                            <small className="text-muted">
                                                                <code className="text-dark">item.{field.name}</code> • {field.type}
                                                            </small>
                                                        </div>
                                                        <span className={`badge ${field.required ? 'bg-danger border-0' : 'bg-secondary border-0'}`}>
                                                            {field.required ? 'Required' : 'Optional'}
                                                        </span>
                                                    </div>
                                                    {(field.placeholder || field.default) && (
                                                        <div className="ms-4">
                                                            {field.placeholder && (
                                                                <div className="small text-muted mb-1">
                                                                    <span className="text-dark">Placeholder:</span> {field.placeholder}
                                                                </div>
                                                            )}
                                                            {field.default && (
                                                                <div className="small text-muted">
                                                                    <span className="text-dark">Default:</span> {field.default}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bx bx-layer text-muted fs-1 mb-2"></i>
                                        <p className="text-muted mb-0">No repeatable item fields configured</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Usage Information Card */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bx bx-file me-2"></i>
                                Usage Information
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* Page Usage */}
                            <div className="mb-4">
                                <h6 className="border-bottom pb-2 mb-3">Pages Using This Section</h6>
                                {section.pages && section.pages.length > 0 ? (
                                    <div>
                                        {section.pages.map((page) => (
                                            <Link
                                                key={page.id}
                                                href={route('pages.show', page.id)}
                                                className="d-flex align-items-center text-decoration-none mb-2 p-2 bg-light rounded border"
                                            >
                                                <i className="bx bx-file text-primary me-2"></i>
                                                <div className="flex-grow-1">
                                                    <strong className="d-block">{page.title}</strong>
                                                    <small className="text-muted">/{page.slug}</small>
                                                </div>
                                                <i className="bx bx-chevron-right text-muted"></i>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-3">
                                        <i className="bx bx-file text-muted fs-1 mb-2 d-block"></i>
                                        <p className="text-muted mb-0">Not used in any pages yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Template Usage Guide */}
                            <div className="border-top pt-3">
                                <h6 className="mb-3">Template Syntax Guide</h6>
                                <div className="row g-2">
                                    <div className="col-12">
                                        <div className="border rounded p-2 bg-light">
                                            <small className="text-muted d-block mb-1">Regular Fields:</small>
                                            <code className="bg-primary text-white px-2 py-1 rounded">{'{field_name}'}</code>
                                        </div>
                                    </div>
                                    {section.mapping_enabled && (
                                        <div className="col-12">
                                            <div className="border rounded p-2 bg-light">
                                                <small className="text-muted d-block mb-1">Repeatable Fields:</small>
                                                <code className="bg-warning text-dark px-2 py-1 rounded">{'{item.field_name}'}</code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Example Preview */}
            {section.mapping_enabled && section.html_template && mappingConfig.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h5 className="card-title mb-0">
                            <i className="bx bx-show me-2"></i>
                            Repeatable Item Example Preview
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-warning">
                            <div className="d-flex">
                                <i className="bx bx-info-circle text-warning me-2 mt-1"></i>
                                <div>
                                    <strong className="d-block mb-1">How it works:</strong>
                                    <p className="mb-2">Users can add multiple items when using this section. Each item will have all the fields below.</p>
                                    <p className="mb-0">The HTML block between the repeatable item comments will repeat for each item added.</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Example Item Preview */}
                        <div className="border rounded p-4 bg-white">
                            <h6 className="border-bottom pb-2 mb-3">Single Item Preview</h6>
                            <div className="row g-3">
                                {mappingConfig.map((field, index) => (
                                    <div key={index} className="col-md-6">
                                        <div className="border rounded p-3 bg-light">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className={`bx ${getFieldIcon(field.type)} text-warning me-2`}></i>
                                                <div>
                                                    <div className="text-muted small">{field.label}</div>
                                                    <div className="fw-medium">
                                                        <code className="text-dark">{'{item.'}{field.name}{'}'}</code>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="small text-muted">
                                                Type: {field.type}
                                                {field.required && <span className="text-danger ms-2">• Required</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    This shows how fields appear for a single repeatable item
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Show;