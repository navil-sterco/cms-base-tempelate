// hooks/useModal.js
import { useEffect, useRef, useState } from 'react';

export const useModal = () => {
    const modalRef = useRef(null);
    const modalInstance = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (modalRef.current && typeof bootstrap !== 'undefined') {
            modalInstance.current = new bootstrap.Modal(modalRef.current);

            const handleHidden = () => setIsOpen(false);
            const handleShown = () => setIsOpen(true);

            modalRef.current.addEventListener('hidden.bs.modal', handleHidden);
            modalRef.current.addEventListener('shown.bs.modal', handleShown);

            return () => {
                if (modalRef.current) {
                    modalRef.current.removeEventListener('hidden.bs.modal', handleHidden);
                    modalRef.current.removeEventListener('shown.bs.modal', handleShown);
                }
                if (modalInstance.current) {
                    modalInstance.current.dispose();
                }
            };
        }
    }, []);

    const show = () => {
        modalInstance.current?.show();
    };

    const hide = () => {
        modalInstance.current?.hide();
    };

    const toggle = () => {
        modalInstance.current?.toggle();
    };

    return { modalRef, show, hide, toggle, isOpen };
};