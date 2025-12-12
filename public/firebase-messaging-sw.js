// Firebase Cloud Messaging Service Worker
// Handles all push notifications (when app is open or closed)

importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC3QiZg49j60-ECaNfwDvNeyl6gFGRgRiE",
  authDomain: "lab7-6385a.firebaseapp.com",
  projectId: "lab7-6385a",
  storageBucket: "lab7-6385a.firebasestorage.app",
  messagingSenderId: "144722466834",
  appId: "1:144722466834:web:52e829b896d6a592da20cb",
  measurementId: "G-FSFDMBSP5K"
});

const messaging = firebase.messaging();

// Handle all push notifications (works when app is open or closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received push notification:', payload);

  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'fcm-notification',
    requireInteraction: false
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle click on notification
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked');
  event.notification.close();

  // Open app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});

