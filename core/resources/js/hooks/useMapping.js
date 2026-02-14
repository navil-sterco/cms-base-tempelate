import { useForm } from '@inertiajs/react';

export const useMapping = (entity, initialMappings = {}, routeParams = null) => {
    const { data, setData, post, processing, errors, reset } = useForm(initialMappings);
    const params = routeParams ?? entity?.id;

    const toggleItem = (id, field) => {
        const ids = data[field] || [];
        setData(field, ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);
    };

    const toggleAll = (items, field) => {
        const allIds = items.map((item) => item.id);
        const currentIds = data[field] || [];
        setData(field, currentIds.length === allIds.length ? [] : allIds);
    };

    const handleSubmit = (routeName, entityIdOrParams, options = {}) => (e) => {
        e.preventDefault();
        const targetParams = entityIdOrParams ?? params;
        post(route(routeName, targetParams), {
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