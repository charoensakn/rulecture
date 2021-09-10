import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { googleFontsCache, imageCache, staticResourceCache } from 'workbox-recipes';
import { registerRoute, setDefaultHandler } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

declare global {
  interface Window {
    __WB_MANIFEST: string[];
  }
}

setDefaultHandler(new NetworkOnly());
registerRoute(({ url }) => url.origin === 'https://connectivitycheck.gstatic.com', new NetworkOnly());

setCacheNameDetails({
  prefix: 'rulecture',
  suffix: '1',
});

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
  ({ sameOrigin, request }) => sameOrigin && request.destination === 'font',
  new CacheFirst({ cacheName: 'fonts' })
);
googleFontsCache();
imageCache();
staticResourceCache();
