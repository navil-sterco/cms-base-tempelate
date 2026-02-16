import React, { useMemo, useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { buildEmptyData, buildEmptyMappingItem, renderFieldInput } from './entryFormHelpers';
import { Boxes, ChevronDown, ChevronUp } from 'lucide-react';

const Detail = ({ module, entry, sections = [], sectionData: initialSectionData = [] }) => {
    const normalizedSectionData = useMemo(() => {
        if (Array.isArray(initialSectionData)) return initialSectionData;
        if (initialSectionData && typeof initialSectionData === 'object') return Object.values(initialSectionData);
        return [];
    }, [initialSectionData]);

    const initial = useMemo(() => {
        const emptyBySection = (sec) => ({
            section_id: sec.id,
            data: buildEmptyData(sec.fields_config || []),
            mapping_items: [],
        });
        return (sections || []).map((sec) => {
            const sid = sec.id;
            const existing = normalizedSectionData.find((d) => (d.section_id === sid) || (d.section_id === Number(sid)) || (String(d.section_id) === String(sid)));
            if (existing) {
                const emptyData = buildEmptyData(sec.fields_config || []);
                const existingData = existing.data && typeof existing.data === 'object' ? existing.data : {};
                const mergedData = { ...emptyData, ...existingData };
                const mappingItems = Array.isArray(existing.mapping_items) ? existing.mapping_items : [];
                return {
                    section_id: sid,
                    data: mergedData,
                    mapping_items: mappingItems,
                };
            }
            return emptyBySection(sec);
        });
    }, [sections, normalizedSectionData]);

    const [data, setData] = useState(initial);
    const [files, setFiles] = useState({});
    const [filePreviews, setFilePreviews] = useState({});
    const [collapsed, setCollapsed] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setData(initial);
    }, [initial]);

    useEffect(() => {
        const previews = {};
        (sections || []).forEach((sec, idx) => {
            const sid = sec.id;
            const existing = normalizedSectionData.find((d) => (d.section_id === sid) || (d.section_id === Number(sid)) || (String(d.section_id) === String(sid)));
            if (!existing) return;
            const itemData = existing.data && typeof existing.data === 'object' ? existing.data : {};
            (sec.fields_config || []).forEach((field) => {
                if (['file', 'image'].includes(field.type)) {
                    const v = itemData[field.name];
                    if (v && typeof v === 'string') previews[`s_${idx}_${field.name}`] = v;
                }
            });
            const items = Array.isArray(existing.mapping_items) ? existing.mapping_items : [];
            items.forEach((mi, j) => {
                (sec.mapping_config || []).forEach((field) => {
                    if (['file', 'image'].includes(field.type)) {
                        const v = mi[field.name];
                        if (v && typeof v === 'string') previews[`s_${idx}_m_${j}_${field.name}`] = v;
                    }
                });
            });
        });
        setFilePreviews(previews);
    }, [initialSectionData, sections]);

    const updateSectionData = (sectionIndex, fieldName, value) => {
        setData((prev) => {
            const next = [...prev];
            if (!next[sectionIndex]) return prev;
            next[sectionIndex] = { ...next[sectionIndex], data: { ...next[sectionIndex].data, [fieldName]: value } };
            return next;
        });
    };

    const updateSectionMappingItem = (sectionIndex, itemIndex, fieldName, value) => {
        setData((prev) => {
            const next = [...prev];
            if (!next[sectionIndex]?.mapping_items?.[itemIndex]) return prev;
            const items = [...next[sectionIndex].mapping_items];
            items[itemIndex] = { ...items[itemIndex], [fieldName]: value };
            next[sectionIndex] = { ...next[sectionIndex], mapping_items: items };
            return next;
        });
    };

    const addSectionMappingItem = (sectionIndex) => {
        const sec = sections[sectionIndex];
        if (!sec?.mapping_config) return;
        setData((prev) => {
            const next = [...prev];
            next[sectionIndex] = {
                ...next[sectionIndex],
                mapping_items: [...(next[sectionIndex].mapping_items || []), buildEmptyMappingItem(sec.mapping_config || [])],
            };
            return next;
        });
    };

    const removeSectionMappingItem = (sectionIndex, itemIndex) => {
        setData((prev) => {
            const next = [...prev];
            const items = [...(next[sectionIndex].mapping_items || [])];
            items.splice(itemIndex, 1);
            next[sectionIndex] = { ...next[sectionIndex], mapping_items: items };
            return next;
        });
    };

    const handleSectionFileSelect = (sectionIndex, fieldName, file, isMapping = false, mappingItemIndex = null) => {
        const key = isMapping ? `s_${sectionIndex}_m_${mappingItemIndex}_${fieldName}` : `s_${sectionIndex}_${fieldName}`;
        setFiles((prev) => ({ ...prev, [key]: file }));
        if (file.type.startsWith('image/')) {
            setFilePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSectionRemoveFile = (sectionIndex, fieldName, isMapping = false, mappingItemIndex = null) => {
        const key = isMapping ? `s_${sectionIndex}_m_${mappingItemIndex}_${fieldName}` : `s_${sectionIndex}_${fieldName}`;
        setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; });
        setFilePreviews((prev) => {
            const n = { ...prev };
            if (n[key]?.startsWith('blob:')) URL.revokeObjectURL(n[key]);
            delete n[key];
            return n;
        });
        if (isMapping) updateSectionMappingItem(sectionIndex, mappingItemIndex, fieldName, '');
        else updateSectionData(sectionIndex, fieldName, '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) formData.append('_token', csrfToken);
        data.forEach((item, i) => {
            formData.append(`section_data[${i}][section_id]`, item.section_id);
            Object.entries(item.data || {}).forEach(([k, v]) => {
                const fileKey = `s_${i}_${k}`;
                if (files[fileKey] instanceof File) {
                    formData.append(`section_data[${i}][data][${k}]`, files[fileKey]);
                } else {
                    formData.append(`section_data[${i}][data][${k}]`, typeof v === 'boolean' ? (v ? '1' : '0') : (v || ''));
                }
            });
            (item.mapping_items || []).forEach((mi, j) => {
                Object.entries(mi).forEach(([k, v]) => {
                    const fileKey = `s_${i}_m_${j}_${k}`;
                    if (files[fileKey] instanceof File) {
                        formData.append(`section_data[${i}][mapping_items][${j}][${k}]`, files[fileKey]);
                    } else {
                        formData.append(`section_data[${i}][mapping_items][${j}][${k}]`, typeof v === 'boolean' ? (v ? '1' : '0') : (v || ''));
                    }
                });
            });
        });
        router.post(route('modules.entries.detail.store', { module: module.id, entry: entry.id }), formData, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
    };

    if (!sections || sections.length === 0) {
        return (
            <div className="card">
                <div className="card-body">
                    <p className="text-muted mb-0">No sections configured for this module.</p>
                    <Link href={route('modules.entries.index', module.id)} className="btn btn-secondary mt-3">Back to entries</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-muted mb-1">Section data</h1>
                    <p className="text-muted mb-0">{module?.name} – {entry?.slug || `Entry #${entry?.id}`}</p>
                </div>
                <Link href={route('modules.entries.index', module.id)} className="btn btn-outline-secondary">
                    <i className="bx bx-arrow-back me-1"></i> Back to entries
                </Link>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="card-body">
                        {data.map((item, sIndex) => {
                            const sec = sections[sIndex];
                            if (!sec) return null;
                            const secFields = sec.fields_config || [];
                            const secMapping = sec.mapping_config || [];
                            const hasMapping = sec.mapping_enabled && secMapping.length > 0;
                            const isCollapsed = collapsed[sIndex];
                            return (
                                <div key={sIndex} className="border rounded mb-4 overflow-hidden">
                                    <div
                                        className="px-3 py-2 bg-light d-flex align-items-center justify-content-between"
                                        onClick={() => setCollapsed((c) => ({ ...c, [sIndex]: !isCollapsed }))}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="d-flex align-items-center gap-2">
                                            <Boxes size={18} />
                                            <strong>{sec.name}</strong>
                                            {sec.identifier && <small className="text-muted">({sec.identifier})</small>}
                                        </span>
                                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="p-3">
                                            <div className="row g-3">
                                                {secFields.map((field) => (
                                                    <div key={field.name} className={field.type === 'code' || field.type === 'textarea' ? 'col-12' : 'col-md-6'}>
                                                        <label className="form-label">{field.label || field.name}{field.required && ' *'}</label>
                                                        {renderFieldInput(field, item.data?.[field.name], (v) => updateSectionData(sIndex, field.name, v), {
                                                            onFileSelect: (file) => handleSectionFileSelect(sIndex, field.name, file),
                                                            onRemoveFile: () => handleSectionRemoveFile(sIndex, field.name),
                                                            filePreview: files[`s_${sIndex}_${field.name}`] || filePreviews[`s_${sIndex}_${field.name}`],
                                                            imagePreviewUrl: filePreviews[`s_${sIndex}_${field.name}`],
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                            {hasMapping && (
                                                <div className="mt-4 pt-3 border-top">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <strong>Repeatable items</strong>
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addSectionMappingItem(sIndex)}>
                                                            Add Item
                                                        </button>
                                                    </div>
                                                    {(item.mapping_items || []).map((mi, miIdx) => (
                                                        <div key={miIdx} className="d-flex align-items-start gap-2 mb-2 p-2 border rounded">
                                                            <div className="row g-2 flex-grow-1">
                                                                {secMapping.map((mf) => (
                                                                    <div key={mf.name} className="col-md-6">
                                                                        <label className="form-label small">{mf.label || mf.name}</label>
                                                                        {renderFieldInput(mf, mi[mf.name], (v) => updateSectionMappingItem(sIndex, miIdx, mf.name, v), {
                                                                            onFileSelect: (file) => handleSectionFileSelect(sIndex, mf.name, file, true, miIdx),
                                                                            onRemoveFile: () => handleSectionRemoveFile(sIndex, mf.name, true, miIdx),
                                                                            filePreview: files[`s_${sIndex}_m_${miIdx}_${mf.name}`] || filePreviews[`s_${sIndex}_m_${miIdx}_${mf.name}`],
                                                                            imagePreviewUrl: filePreviews[`s_${sIndex}_m_${miIdx}_${mf.name}`],
                                                                        })}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeSectionMappingItem(sIndex, miIdx)}>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="mt-3">
                            <button type="submit" className="btn btn-primary me-2" disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bx bx-save me-2" />Save section data</>}
                            </button>
                            <Link href={route('modules.entries.index', module.id)} className="btn btn-secondary">
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Detail;
