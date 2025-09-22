self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
	const { request } = event
	if (request.method !== 'GET') return
	event.respondWith(
		caches.open('smartshop-cache-v1').then(async (cache) => {
			const cached = await cache.match(request)
			if (cached) return cached
			try {
				const res = await fetch(request)
				if (res && res.status === 200 && res.type === 'basic') {
					cache.put(request, res.clone())
				}
				return res
			} catch {
				return cached || Response.error()
			}
		})
	)
})


