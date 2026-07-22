import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useFlashToasts } from '@/hooks/use-flash-toasts';
import { syncThemeFromAccount } from '@/hooks/use-theme';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    useFlashToasts();

    const { auth } = usePage<{
        auth: { user?: { theme?: string; text_size?: string } };
    }>().props;
    useEffect(() => {
        syncThemeFromAccount(auth.user?.theme, auth.user?.text_size);
    }, [auth.user?.theme, auth.user?.text_size]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
