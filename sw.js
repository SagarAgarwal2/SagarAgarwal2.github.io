const CACHE_NAME = 'attendance-predictor-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Cached all files successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching files', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch Strategy: Cache First, then Network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('googleapis.com') &&
      !event.request.url.includes('cdnjs.cloudflare.com') &&
      !event.request.url.includes('jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(error => {
        console.error('Service Worker: Fetch failed', error);
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Push Notification Handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Check your attendance status!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-128x128.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-128x128.png'
      }
    ],
    tag: 'attendance-reminder',
    renotify: true,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification('Attendance Reminder', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background Sync
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'attendance-sync') {
    event.waitUntil(
      // Sync attendance data when back online
      syncAttendanceData()
    );
  }
});

async function syncAttendanceData() {
  try {
    // Get stored data from IndexedDB or localStorage
    const storedData = await getStoredAttendanceData();
    if (storedData) {
      console.log('Service Worker: Syncing attendance data');
      // Sync with server if needed
    }
  } catch (error) {
    console.error('Service Worker: Error syncing data', error);
  }
}

async function getStoredAttendanceData() {
  // Implementation for getting stored data
  return null;
}

// Periodic Background Sync (for attendance reminders)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'attendance-reminder') {
    event.waitUntil(checkAttendanceStatus());
  }
});

async function checkAttendanceStatus() {
  // Check if user needs attendance reminder
  const lastCalculation = await getLastCalculation();
  if (lastCalculation && shouldSendReminder(lastCalculation)) {
    self.registration.showNotification('Attendance Check', {
      body: 'Time to check your attendance status!',
      icon: '/icons/icon-192x192.png',
      tag: 'attendance-reminder'
    });
  }
}

async function getLastCalculation() {
  // Get last calculation from storage
  return null;
}

function shouldSendReminder(lastCalculation) {
  // Logic to determine if reminder should be sent
  const daysSinceLastCheck = (Date.now() - lastCalculation.timestamp) / (1000 * 60 * 60 * 24);
  return daysSinceLastCheck >= 1; // Remind after 1 day
}
