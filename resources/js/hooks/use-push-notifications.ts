import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const out = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

function getCsrf(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

export interface PushState {
    supported: boolean;
    subscribed: boolean;
    busy: boolean;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}

/**
 * Register the service worker and manage the Web Push subscription so
 * reminders arrive even when the app is closed.
 */
export function usePushNotifications(): PushState {
    const { vapidPublicKey } = usePage<{ vapidPublicKey?: string | null }>().props;
    const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        !!vapidPublicKey;

    const [subscribed, setSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!supported) return;
        navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => reg.pushManager.getSubscription())
            .then((sub) => setSubscribed(!!sub))
            .catch(() => setSubscribed(false));
    }, [supported]);

    const subscribe = useCallback(async () => {
        if (!supported || !vapidPublicKey) return;
        setBusy(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                    .buffer as ArrayBuffer,
            });

            await fetch('/push-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(sub.toJSON()),
            });
            setSubscribed(true);
        } finally {
            setBusy(false);
        }
    }, [supported, vapidPublicKey]);

    const unsubscribe = useCallback(async () => {
        if (!supported) return;
        setBusy(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch('/push-subscriptions', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrf(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setSubscribed(false);
        } finally {
            setBusy(false);
        }
    }, [supported]);

    return { supported, subscribed, busy, subscribe, unsubscribe };
}
