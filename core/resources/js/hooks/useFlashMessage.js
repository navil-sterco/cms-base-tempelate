// hooks/useFlashMessage.js
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';

export const useFlashMessage = (options = {}) => {
    const { flash } = usePage().props;

    useEffect(() => {
        const toastOptions = {
            position: options.position || 'top-right',
            autoClose: options.autoClose || 3000,
            hideProgressBar: options.hideProgressBar || false,
            closeOnClick: options.closeOnClick !== false,
            pauseOnHover: options.pauseOnHover !== false,
            draggable: options.draggable !== false,
        };

        if (flash?.success) {
            toast.success(flash.success, toastOptions);
        }
        if (flash?.error) {
            toast.error(flash.error, toastOptions);
        }
        if (flash?.warning) {
            toast.warning(flash.warning, toastOptions);
        }
        if (flash?.info) {
            toast.info(flash.info, toastOptions);
        }
    }, [flash]);
};