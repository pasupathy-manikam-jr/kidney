import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashProps {
    flash?: {
        success?: string | null;
        error?: string | null;
        alert?: string | null;
    };
    [key: string]: unknown;
}

/**
 * Surface Laravel flash messages (session 'status' / 'error' / 'alert') as toasts.
 */
export function useFlashToasts(): void {
    const { flash } = usePage<FlashProps>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.alert) {
            // Critical health alert — stays until dismissed.
            toast.warning(flash.alert, { duration: Infinity, closeButton: true });
        }
    }, [flash?.success, flash?.error, flash?.alert]);
}
