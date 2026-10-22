/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// SPA navigations: serve the cached shell so the app opens offline.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }));

// Study content: fast from cache, refreshed in the background (ETag keeps it cheap).
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/content/'),
  new StaleWhileRevalidate({ cacheName: 'ledger-content', plugins: [new ExpirationPlugin({ maxEntries: 40 })] }),
);

// Read-only progress views: network first, cached copy when offline.
registerRoute(
  ({ url, request }) => request.method === 'GET' && /^\/api\/(dashboard|plan|progress|review\/summary|league|me)$/.test(url.pathname),
  new NetworkFirst({ cacheName: 'ledger-data', networkTimeoutSeconds: 4, plugins: [new ExpirationPlugin({ maxEntries: 30 })] }),
);

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

// ---------------- push notifications ----------------

self.addEventListener('push', (event) => {
  let data: { title?: string; body?: string; url?: string; tag?: string } = {};
  try { data = event.data?.json() ?? {}; } catch { data = { body: event.data?.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ledger', {
      body: data.body || '',
      tag: data.tag || 'ledger',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) {
        await (c as WindowClient).focus();
        if ('navigate' in c) await (c as WindowClient).navigate(url).catch(() => {});
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
