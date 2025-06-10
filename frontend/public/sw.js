/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

/**
 * Enhanced Service Worker for Bhavya Bazaar PWA
 * Provides offline functionality, caching strategies, and background sync
 */

const CACHE_NAME = 'bhavya-bazaar-v2.1.0';
const STATIC_CACHE = 'bhavya-static-v2.1.0';
const DYNAMIC_CACHE = 'bhavya-dynamic-v2.1.0';
const API_CACHE = 'bhavya-api-v2.1.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.webp',
  '/main.png',
  '/offline.html',
  // Add other critical static assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/v2\/product\/get-all-products/,
  /\/api\/v2\/product\/get-featured-products/,
  /\/api\/v2\/shop\/get-all-shops/,
  /\/api\/v2\/event\/get-all-events/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with fallback to cache
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(request)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAsset(request));
  } else {
    // Navigation requests - Network First with offline fallback
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses for API endpoints that should be cached
    if (networkResponse.ok && shouldCacheApiRequest(request)) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical API endpoints
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No network connection available',
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('📦 Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Navigation network failed, trying cache for:', request.url);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return caches.match('/offline.html');
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  );
}

// Check if API request should be cached
function shouldCacheApiRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncOfflineCartActions());
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOfflineOrderActions());
  } else if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncOfflineWishlistActions());
  }
});

// Sync offline cart actions
async function syncOfflineCartActions() {
  try {
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db, 'cart');
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/v2/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        // Remove successful action from IndexedDB
        await removeOfflineAction(db, 'cart', action.id);
        
        // Notify user of successful sync
        self.registration.showNotification('Cart Synced', {
          body: 'Your cart changes have been synced successfully!',
          icon: '/main.png',
          badge: '/main.png'
        });
        
      } catch (error) {
        console.error('Failed to sync cart action:', error);
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync offline order actions
async function syncOfflineOrderActions() {
  try {
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db, 'orders');
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/v2/order/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        await removeOfflineAction(db, 'orders', action.id);
        
        self.registration.showNotification('Order Synced', {
          body: 'Your order has been processed successfully!',
          icon: '/main.png',
          badge: '/main.png'
        });
        
      } catch (error) {
        console.error('Failed to sync order action:', error);
      }
    }
  } catch (error) {
    console.error('Order sync failed:', error);
  }
}

// Sync offline wishlist actions
async function syncOfflineWishlistActions() {
  try {
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db, 'wishlist');
    
    for (const action of offlineActions) {
      try {
        await fetch('/api/v2/wishlist/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        await removeOfflineAction(db, 'wishlist', action.id);
        
      } catch (error) {
        console.error('Failed to sync wishlist action:', error);
      }
    }
  } catch (error) {
    console.error('Wishlist sync failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BhavyaBazaarOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores for offline actions
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('wishlist')) {
        db.createObjectStore('wishlist', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getOfflineActions(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineAction(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: 'New updates available!',
    icon: '/main.png',
    badge: '/main.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/main.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/main.png'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.title = payload.title || 'Bhavya Bazaar';
    options.data = { ...options.data, ...payload.data };
  }

  event.waitUntil(
    self.registration.showNotification('Bhavya Bazaar', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('📤 Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Handle cache update requests
    event.waitUntil(updateCache(event.data.urls));
  }
});

// Update cache manually
async function updateCache(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        console.log('✅ Updated cache for:', url);
      }
    } catch (error) {
      console.error('❌ Failed to update cache for:', url, error);
    }
  }
}

console.log('🚀 Bhavya Bazaar Service Worker loaded successfully!');
