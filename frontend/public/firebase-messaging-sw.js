// Firebase Cloud Messaging Service Worker
// This file must exist at /firebase-messaging-sw.js for FCM to work.
// Replace the config values below with your actual Firebase project config.

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Epic Moments', {
    body: body || '',
    icon: icon || '/logo.png',
  });
});
