// Kidney-Love service worker: offline shell + push notifications.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { title: 'Kidney-Love', body: event.data ? event.data.text() : '' };
    }

    const title = data.title || 'Kidney-Love';
    const options = {
        body: data.body || '',
        icon: '/apple-touch-icon.png',
        badge: '/favicon.ico',
        data: { url: data.url || '/dashboard' },
        tag: data.tag,
        requireInteraction: true, // stay on screen until the user dismisses it
        renotify: !!data.tag,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/dashboard';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return self.clients.openWindow(url);
        }),
    );
});
