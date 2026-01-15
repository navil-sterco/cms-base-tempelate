import { useForm } from '@inertiajs/react';

export const useMapping = (entity, initialMappings = {}) => {
    const { data, setData, post, processing, errors, reset } = useForm(initialMappings);

    const toggleItem = (id, field) => {
        const ids = data[field] || [];
        setData(field, ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);
    };

    const toggleAll = (items, field) => {
        const allIds = items.map((item) => item.id);
        const currentIds = data[field] || [];
        setData(field, currentIds.length === allIds.length ? [] : allIds);
    };

    const handleSubmit = (routeName, entityId, options = {}) => (e) => {
        e.preventDefault();
        post(route(routeName, entityId), {
            preserveScroll: true,
            ...options,
        });
    };

    return {
        data,
        setData,
        processing,
        errors,
        reset,
        toggleItem,
        toggleAll,
        handleSubmit,
    };
};