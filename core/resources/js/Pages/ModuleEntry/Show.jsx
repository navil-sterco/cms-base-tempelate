import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';

const Show = ({ module, entry }) => {
    const fields = useMemo(
        () => (Array.isArray(module?.fields_config) ? module.fields_config : []),
        [module]
    );

    const mappingEnabled = !!module?.mapping_enabled;
    const mappingFields = useMemo(
        () => (Array.isArray(module?.mapping_config) ? module.mapping_config : []),
        [module]
    );

    const mappingItems = useMemo(() => {
        const data = entry?.data || {};
        const oldItems = data.mapping_items;
        if (Array.isArray(oldItems) && oldItems.length > 0) return oldItems;
        const fieldArrays = {};
        (mappingFields || []).forEach((mf) => {
            const name = mf?.name;
            if (name && Array.isArray(data[name])) fieldArrays[name] = data[name];
        });
        if (Object.keys(fieldArrays).length === 0) return [];
        const maxLen = Math.max(...Object.values(fieldArrays).map((a) => a.length), 0);
        const items = [];
        for (let i = 0; i < maxLen; i++) {
            const item = {};
            Object.keys(fieldArrays).forEach((k) => (item[k] = fieldArrays[k][i] ?? ''));
            items.push(item);
        }
        return items;
    }, [entry?.data, mappingFields]);

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="text-muted">{module?.name} Details</h1>
                    </div>

                    <div className="d-flex gap-2">
                        <Link
                            href={route('modules.entries.edit', { module: module.id, entry: entry.id })}
                            className="btn btn-primary d-flex align-items-center gap-2"
                        >
                            <i className="bx bx-edit"></i>
                            <span>Edit Entry</span>
                        </Link>
                        <Link
                            href={route('modules.entries.index', module.id)}
                            className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        >
                            <i className="bx bx-arrow-back"></i>
                            <span>Back to List</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Entry Information */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                            <i className="bx bx-file text-white fs-4"></i>
                        </div>
                        <div>
                            <h5 className="mb-1 fw-semibold">Details</h5>
                            <p className="text-muted mb-0 small">View all field details for this entry</p>
                        </div>
                    </div>

                    <div className="row g-3">
                        {fields.map((f) => (
                            <div key={f.name} className="col-sm-6 col-lg-4">
                                <div className="p-3 bg-label-warning rounded-3 h-100">
                                    <label className="form-label text-primary small mb-2 fw-large">
                                        {f.label || f.name}
                                    </label>
                                    <div className="fw-semibold text-break">
                                        {entry?.data?.[f.name] ? (
                                            <span className="text-dark">{String(entry.data[f.name])}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Not set</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Repeatable Items */}
            {mappingEnabled && mappingFields.length > 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                                    <i className="bx bx-list-ul text-success fs-4"></i>
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-semibold">Repeatable Items</h5>
                                    <p className="text-muted mb-0 small">
                                        {mappingItems.length} {mappingItems.length === 1 ? 'item' : 'items'} found
                                    </p>
                                </div>
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                {mappingItems.length}
                            </span>
                        </div>

                        {mappingItems.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="mb-3">
                                    <i className="bx bx-inbox fs-1 text-muted opacity-50"></i>
                                </div>
                                <p className="text-muted mb-0">No repeatable items available for this entry.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr className="border-bottom">
                                            <th className="text-muted fw-semibold small py-3" style={{ width: 60 }}>
                                                #
                                            </th>
                                            {mappingFields.map((mf) => (
                                                <th key={mf.name} className="text-muted fw-semibold small py-3">
                                                    {mf.label || mf.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mappingItems.map((item, idx) => (
                                            <tr key={idx} className="border-bottom">
                                                <td className="py-3">
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-circle" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                {mappingFields.map((mf) => (
                                                    <td key={mf.name} className="text-break py-3">
                                                        {item?.[mf.name] ? (
                                                            String(item[mf.name])
                                                        ) : (
                                                            <span className="text-muted fst-italic">—</span>
                                                        )}
                                                    </td>
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
        </div>
    );
};

export default Show;