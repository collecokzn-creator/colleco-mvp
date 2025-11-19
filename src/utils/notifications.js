// Push notification utility for transfer updates

let notificationPermission = 'default';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[notifications] Not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission === 'granted';
  }

  return false;
}

export function showNotification(title, options = {}) {
  if (notificationPermission !== 'granted') {
    console.warn('[notifications] Permission not granted');
    return;
  }

  const defaultOptions = {
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'transfer-notification',
    requireInteraction: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) {
        options.onClick();
      }
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    return notification;
  } catch (e) {
    console.error('[notifications] Show failed', e);
  }
}

export function notifyTransferStatus(status, request) {
  const notifications = {
    matched: {
      title: '✅ Driver Found!',
      body: 'A driver has been matched to your transfer request.',
      icon: '/assets/icons/icon-192x192.png'
    },
    accepted: {
      title: '🚗 Driver Accepted',
      body: `${request?.driver?.name || 'Your driver'} is preparing to pick you up.`,
      icon: '/assets/icons/icon-192x192.png'
    },
    'en-route': {
      title: '🛣️ Driver En Route',
      body: `${request?.driver?.name || 'Your driver'} is on the way. ETA: ${request?.driver?.eta || '10 min'}`,
      icon: '/assets/icons/icon-192x192.png',
      requireInteraction: true
    },
    arrived: {
      title: '📍 Driver Arrived!',
      body: `${request?.driver?.name || 'Your driver'} is at your pickup location.`,
      icon: '/assets/icons/icon-192x192.png',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200]
    },
    completed: {
      title: '✅ Trip Completed',
      body: 'Thank you for using CollEco Transfer! Please rate your driver.',
      icon: '/assets/icons/icon-192x192.png'
    }
  };

  const config = notifications[status];
  if (config) {
    showNotification(config.title, config);
  }
}

export function notifyNewMessage(from, message) {
  showNotification('💬 New Message', {
    body: `${from}: ${message.slice(0, 100)}${message.length > 100 ? '...' : ''}`,
    tag: 'transfer-chat',
    requireInteraction: false
  });
}

// Register service worker for push notifications (optional)
export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] Service Worker or Push API not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      )
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    return true;
  } catch (e) {
    console.error('[push] Registration failed', e);
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
