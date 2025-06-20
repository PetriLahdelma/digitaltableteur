/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  CacheFirst,
  StaleWhileRevalidate,
  NetworkFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache navigation requests (pages)
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
  }),
);

// Cache static assets like JS, CSS and workers
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  }),
);

// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  }),
);

const handler = createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html");
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

export {};
