import React, { useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import { useFlashMessage } from '@/hooks/useFlashMessage';
import TableHeader from '@/Components/TableHeader';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import ActionDropdown from '@/Components/ActionDropdown';
import Pagination from '@/Components/Pagination';
import { useDebouncedSearch } from '@/hooks/useSearch';
import { useModal } from '@/hooks/useModal';

const Index = ({ module, entries, searchTerm }) => {
    const [query, setQuery] = useState(searchTerm || '');
    useDebouncedSearch(query, route('modules.entries.index', module.id));
    useFlashMessage();
    const hasSections = Array.isArray(module?.sections) && module.sections.length > 0;

    const fields = useMemo(() => (Array.isArray(module?.fields_config) ? module.fields_config : []), [module]);
    const listFields = useMemo(() => {
        // Filter out image, file, textarea, and code fields
        return fields
            .filter(f => !['image', 'file', 'textarea', 'code'].includes(f.type))
            .slice(0, 7);
    }, [fields]);

    const { modalRef, show, hide } = useModal();
    const [itemToDelete, setItemToDelete] = useState(null);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = (entry) => {
        setItemToDelete(entry);
        show();
    };

    const handleDelete = () => {
        if (!itemToDelete?.id) return;
        setProcessing(true);
        router.delete(route('modules.entries.destroy', { module: module.id, entry: itemToDelete.id }), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                hide();
                setItemToDelete(null);
            },
        });
    };

    return (
        <>
            <h1 className="text-muted">{module?.name} Entries</h1>
            <ToastContainer />

            <div className="card">
                <TableHeader
                    searchValue={query}
                    onSearchChange={setQuery}
                    searchPlaceholder={`Search ${module?.name}...`}
                    addButtonText={`Add ${module?.name}`}
                    addButtonRoute={route('modules.entries.create', module.id)}
                    additionalButtons={
                        <Link href={route('modules.edit', module.id)} className="btn btn-outline-primary">
                            <i className="bx bx-edit me-1"></i>
                            <span className="d-none d-sm-inline-block">Edit Fields</span>
                        </Link>
                    }
                />

                <div className="table-responsive text-nowrap">
                    <table className="table table-hover my-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                {listFields.map((f) => (
                                    <th key={f.name}>{f.label || f.name}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {entries.data.length > 0 ? (
                                entries.data.map((entry) => {
                                    const actions = [
                                        ...(hasSections ? [{
                                            label: 'Detail',
                                            icon: 'bx-detail',
                                            href: route('modules.entries.detail', { module: module.id, entry: entry.id }),
                                        }] : []),
                                        {
                                            label: 'Mapping',
                                            icon: 'bx-right-arrow-circle',
                                            href: route('modules.entries.mapping', { module: module.id, entry: entry.id }),
                                        },
                                        {
                                            label: 'Show',
                                            icon: 'bx-show',
                                            href: route('modules.entries.show', { module: module.id, entry: entry.id }),
                                        },
                                        {
                                            label: 'Edit',
                                            icon: 'bx-edit-alt',
                                            href: route('modules.entries.edit', { module: module.id, entry: entry.id }),
                                        },
                                        {
                                            label: 'Delete',
                                            icon: 'bx-trash',
                                            onClick: () => confirmDelete(entry),
                                            className: 'text-danger',
                                        },
                                    ];

                                    return (
                                        <tr key={entry.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-primary bg-opacity-10 rounded p-2">
                                                        <i className="bx bx-cube text-white fs-5"></i>
                                                    </div>
                                                    <span>{entry.id}</span>
                                                </div>
                                            </td>
                                            {listFields.map((f) => (
                                                <td key={f.name}>
                                                    {String(entry.data?.[f.name] ?? '')}
                                                </td>
                                            ))}
                                            <td>
                                                <div className="d-flex align-items-center gap-1">
                                                    {hasSections && (
                                                        <Link
                                                            className="btn btn-sm btn-outline-secondary p-1"
                                                            href={route('modules.entries.detail', { module: module.id, entry: entry.id })}
                                                        >
                                                            <i className="bx bx-detail me-1"></i>
                                                            Detail
                                                        </Link>
                                                    )}
                                                    <Link
                                                        className="btn btn-sm btn-outline-primary p-1"
                                                        href={route('modules.entries.mapping', { module: module.id, entry: entry.id })}
                                                    >
                                                        <i className="bx bx-right-arrow-circle me-1"></i>
                                                        Mapping
                                                    </Link>
                                                    <ActionDropdown actions={actions} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={listFields.length + 2} className="text-center py-4">
                                        <div className="text-muted">
                                            <i className="bx bx-info-circle bx-sm me-2"></i>
                                            No entries found
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmationModal
                modalRef={modalRef}
                title="Confirm Deletion"
                message={`Are you sure you want to delete this ${module?.name} entry?`}
                itemName={itemToDelete ? `Entry #${itemToDelete.id}` : null}
                onConfirm={handleDelete}
                onCancel={() => {
                    hide();
                    setItemToDelete(null);
                }}
                processing={processing}
            />

            {entries.links.length > 3 && (
                <div className="row m-2">
                    <div className="col-md-4">
                        <p className="text-dark mb-0 mt-2">
                            Showing {entries.from ?? 0} to {entries.to ?? 0} of {entries.total} entries
                        </p>
                    </div>
                    <div className="col-md-8">
                        <div className="float-end">
                            <Pagination links={entries.links} query={query} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Index;

