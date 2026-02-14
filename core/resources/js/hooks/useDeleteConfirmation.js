import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useModal } from './useModal';

export const useDeleteConfirmation = (deleteRouteName) => {
    const [itemToDelete, setItemToDelete] = useState(null);
    const { get: destroy, processing } = useForm();
    const { modalRef, show, hide } = useModal();

    const confirmDelete = (id, additionalData = {}) => {
        setItemToDelete({ id, ...additionalData });
        show();
    };

    const handleDelete = () => {
        if (!itemToDelete?.id) return;

        destroy(route(deleteRouteName, itemToDelete.id), {
            onSuccess: () => {
                hide();
                setItemToDelete(null);
            }
        });
    };

    const cancelDelete = () => {
        hide();
        setItemToDelete(null);
    };

    return {
        modalRef,
        itemToDelete,
        processing,
        confirmDelete,
        handleDelete,
        cancelDelete
    };
};
