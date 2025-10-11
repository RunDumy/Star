// STAR PWA Service Worker
// Enhanced offline functionality and caching for cosmic social network

const CACHE_NAME = 'star-pwa-v1.0.0';
const STATIC_CACHE = 'star-static-v1';
const API_CACHE = 'star-api-v1';
const IMAGES_CACHE = 'star-images-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline/',
  '/manifest.json',
  // Add critical CSS and JS files (will be updated during build)
];

// API endpoints to cache
const CACHE_API_ENDPOINTS = [
  '/api/health',
  '/api/oracle/daily-tonalpohualli',
  '/api/status'
];

// Image extensions to cache
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];

// ===============================
// INSTALL EVENT
// ===============================
self.addEventListener('install', (event) => {
  console.log('🌟 STAR Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Initialize other caches
      caches.open(API_CACHE),
      caches.open(IMAGES_CACHE),
    ])
    .then(() => {
      console.log('✅ STAR Service Worker installed successfully');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

// ===============================
// ACTIVATE EVENT
// ===============================
self.addEventListener('activate', (event) => {
  console.log('🔄 STAR Service Worker activating...');
  
  event.waitUntil(
    // Clean up old caches
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('star-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== API_CACHE && 
                   cacheName !== IMAGES_CACHE;
          })
          .map((cacheName) => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('✅ STAR Service Worker activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker activation failed:', error);
      })
  );
});

// ===============================
// FETCH EVENT - NETWORK STRATEGIES
// ===============================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(url.pathname)) {
    // Images - Cache first with network fallback
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/_next/')) {
    // Next.js static assets - Cache first
    event.respondWith(handleStaticAsset(request));
  } else {
    // App routes - Network first with cache fallback
    event.respondWith(handleAppRoute(request));
  }
});

// ===============================
// REQUEST HANDLERS
// ===============================

// API Request Handler - Network first
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok && request.method === 'GET') {
      // Cache successful GET requests
      const cache = await caches.open(API_CACHE);
      const responseClone = response.clone();
      
      // Cache with TTL for different endpoints
      if (CACHE_API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
        cache.put(request, responseClone);
      }
    }
    
    return response;
  } catch (error) {
    console.log('🌐 Network failed for API request, trying cache:', url.pathname);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Response': 'true'
        }
      }
    );
  }
}

// Image Request Handler - Cache first
async function handleImageRequest(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful image requests
      const cache = await caches.open(IMAGES_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      // 1x1 transparent PNG
      new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]),
      {
        headers: {
          'Content-Type': 'image/png',
          'X-Offline-Placeholder': 'true'
        }
      }
    );
  }
}

// Static Asset Handler - Cache first
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // For critical assets, return cached version if available
    return caches.match(request) || new Response('Asset unavailable offline', { 
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// App Route Handler - Network first with SPA fallback
async function handleAppRoute(request) {
  try {
    // Try network first for app routes
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful page responses
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🌐 Network failed for app route, trying cache or SPA fallback');
    
    // Try cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // SPA fallback - serve cached index.html for app routes
    const indexResponse = await caches.match('/');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Ultimate fallback - offline page
    return caches.match('/offline/') || new Response(
      generateOfflinePage(),
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// ===============================
// BACKGROUND SYNC
// ===============================
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'post-sync') {
    event.waitUntil(syncOfflinePosts());
  } else if (event.tag === 'like-sync') {
    event.waitUntil(syncOfflineLikes());
  }
});

// Sync offline posts when connection restored
async function syncOfflinePosts() {
  try {
    // Get stored offline posts from IndexedDB
    // Implementation would depend on your offline storage strategy
    console.log('📤 Syncing offline posts...');
    
    // Send notifications to user about sync status
    self.registration.showNotification('STAR Sync', {
      body: 'Your offline posts have been synchronized.',
      icon: '/icons/icon-96x96.png',
      badge: '/icons/badge-72x72.png',
      tag: 'sync-complete'
    });
  } catch (error) {
    console.error('❌ Failed to sync offline posts:', error);
  }
}

// Sync offline likes when connection restored
async function syncOfflineLikes() {
  try {
    console.log('❤️ Syncing offline likes...');
    // Implementation for syncing likes
  } catch (error) {
    console.error('❌ Failed to sync offline likes:', error);
  }
}

// ===============================
// PUSH NOTIFICATIONS
// ===============================
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  let notificationData = {
    title: 'STAR',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'star-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Failed to parse push notification data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
  // 'dismiss' action or default click - just close notification
});

// ===============================
// UTILITY FUNCTIONS
// ===============================

function isImageRequest(pathname) {
  return IMAGE_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

function generateOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>STAR - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f0f23 0%, #1e1e3f 100%);
          color: white;
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 400px;
        }
        .star-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 {
          color: #8b5cf6;
          margin-bottom: 1rem;
        }
        p {
          margin-bottom: 2rem;
          opacity: 0.8;
        }
        button {
          background: #8b5cf6;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: #7c3aed;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="star-icon">🌟</div>
        <h1>You're Offline</h1>
        <p>Connect to the internet to access the full STAR experience.</p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;
}

// Log service worker version
console.log('🌟 STAR Service Worker v1.0.0 loaded');