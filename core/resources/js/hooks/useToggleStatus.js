import { router } from '@inertiajs/react';

export const useToggleStatus = (routeName, options = {}) => {
    const toggleStatus = (id, additionalData = {}) => {
        router.post(
            route(routeName, id),
            additionalData,
            {
                preserveScroll: options.preserveScroll !== false,
                preserveState: options.preserveState !== false,
                only: options.only || [],
                onSuccess: options.onSuccess,
                onError: options.onError,
                ...options
            }
        );
    };

    return { toggleStatus };
};