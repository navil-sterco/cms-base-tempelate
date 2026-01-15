import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useModal } from './useModal';

export const useDeleteConfirmation = (deleteRouteName) => {
    const [itemToDelete, setItemToDelete] = useState(null);
    const { get, processing } = useForm();
    const { modalRef, show, hide } = useModal();

    const confirmDelete = (id, additionalData = {}) => {
        setItemToDelete({ id, ...additionalData });
        show();
    };

    const handleDelete = (onSuccessCallback, onErrorCallback) => {
        if (!itemToDelete?.id) return;

        get(route(deleteRouteName, itemToDelete.id), {
            onSuccess: () => {
                hide();
                setItemToDelete(null);
                if (onSuccessCallback) onSuccessCallback();
            },
            onError: (errors) => {
                if (onErrorCallback) onErrorCallback(errors);
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