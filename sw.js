const CACHE_NAME = 'pb-max-share-cache';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force update immediately
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // Take control immediately
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // INTERCEPT SHARE POST REQUEST
    if (event.request.method === 'POST' && url.searchParams.has('share_target')) {
        event.respondWith(
            (async () => {
                try {
                    // 1. Parse the incoming data
                    const formData = await event.request.formData();
                    
                    // 2. SMART SEARCH: Find ANY file in the data
                    let file = formData.get('image');
                    if (!file) {
                        for (const value of formData.values()) {
                            if (value instanceof File) {
                                file = value;
                                break;
                            }
                        }
                    }

                    // 3. Save to Cache
                    if (file) {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put('shared-image', new Response(file, {
                            headers: { 'Content-Type': file.type }
                        }));
                        // Redirect to app with success flag
                        return Response.redirect('/index.html?image_shared=true&ts=' + Date.now(), 303);
                    } else {
                        return Response.redirect('/index.html?error=no_file', 303);
                    }

                } catch (err) {
                    console.error('Share Target Error:', err);
                    return Response.redirect('/index.html?error=sw_crash', 303);
                }
            })()
        );
    }
});
