import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';

const Show = ({ module, entry }) => {
    const fields = useMemo(() => (Array.isArray(module?.fields_config) ? module.fields_config : []), [module]);
    const mappingEnabled = !!module?.mapping_enabled;
    const mappingFields = useMemo(() => (Array.isArray(module?.mapping_config) ? module.mapping_config : []), [module]);
    const mappingItems = entry?.data?.mapping_items || [];

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="text-muted">{module?.name} Entry #{entry?.id}</h1>
                <div className="d-flex gap-2">
                    <Link href={route('modules.entries.edit', { module: module.id, entry: entry.id })} className="btn btn-outline-primary">
                        <i className="bx bx-edit me-2"></i>
                        Edit
                    </Link>
                    <Link href={route('modules.entries.index', module.id)} className="btn btn-secondary">
                        Back
                    </Link>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Details</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {fields.map((f) => (
                            <div key={f.name} className="col-md-6">
                                <div className="text-muted small">{f.label || f.name}</div>
                                <div className="fw-medium">{String(entry?.data?.[f.name] ?? '')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {mappingEnabled && mappingFields.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Repeatable Items ({mappingItems.length})</h5>
                    </div>
                    <div className="card-body">
                        {mappingItems.length === 0 ? (
                            <div className="text-muted">No items.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th width="80">#</th>
                                            {mappingFields.map((mf) => (
                                                <th key={mf.name}>{mf.label || mf.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mappingItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                {mappingFields.map((mf) => (
                                                    <td key={mf.name}>{String(item?.[mf.name] ?? '')}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Show;

