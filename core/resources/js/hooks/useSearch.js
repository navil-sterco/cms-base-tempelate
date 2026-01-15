import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';

export const useDebouncedSearch = (query, url) => {
    useEffect(() => {
        const delaySearch = debounce(() => {
            router.get(url, { search: query }, { preserveState: true, replace: true });
        }, 300);

        delaySearch();
        return () => delaySearch.cancel();
    }, [query, url]);
};