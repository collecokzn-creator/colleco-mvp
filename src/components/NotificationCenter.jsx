import React, { useState, useEffect, useContext, createContext } from 'react';
import { /* UserContext */ } from '../context/UserContext';
import { API_BASE_URL, VAPID_PUBLIC_KEY } from '../config';

/**
 * NotificationContext
 * Manages global notification state across the application
 */
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Save to localStorage
    const allNotifications = [newNotification, ...notifications];
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    // Load notifications from localStorage
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(stored);
    setUnreadCount(stored.filter(n => !n.read).length);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * NotificationCenter Component
 * Dropdown panel showing all notifications with actions
 */
export const NotificationCenter = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all'); // all, unread, bookings, messages, quotes

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.read) return false;
    if (filter !== 'all' && notif.type !== filter) return false;
    return true;
  });

  const getNotificationIcon = (type) => {
    const icons = {
      booking: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      message: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      quote: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      payment: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      alert: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      system: (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[type] || icons.system;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'unread', 'bookings', 'messages', 'quotes'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                !notif.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      {notif.actionUrl && (
                        <a
                          href={notif.actionUrl}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 rounded"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatTimestamp(notif.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * ToastNotification Component
 * Pop-up toast for real-time alerts
 */
export const ToastNotification = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastColor = (type) => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className={`${getToastColor(notification.type)} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in`}>
      <div className="flex-1">
        <p className="font-semibold">{notification.title}</p>
        <p className="text-sm opacity-90">{notification.message}</p>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * NotificationBell Component
 * Bell icon with unread badge for navbar
 */
export const NotificationBell = ({ onClick }) => {
  const { unreadCount } = useContext(NotificationContext);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

/**
 * Push Notification Service
 * Handles browser and mobile push notifications
 * Supports:
 * - Desktop browsers (Chrome, Firefox, Edge)
 * - Mobile browsers (Chrome Android, Safari iOS via Add to Home Screen)
 * - Custom vibration patterns
 * - Badge updates on mobile home screen icon
 * - Action buttons (reply, view, dismiss)
 */
export class PushNotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Check if device is mobile
   */
  static isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if app is installed as PWA
   */
  static isInstalledPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  /**
   * Send push notification with mobile optimization
   */
  static async sendPushNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      return null;
    }

    // Get service worker registration
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    // Default options with mobile optimizations
    const defaultOptions = {
      icon: '/assets/icons/colleco-logo-192.png',
      badge: '/assets/icons/colleco-logo-72.png',
      vibrate: [200, 100, 200], // Default vibration pattern
      requireInteraction: false,
      silent: false,
      tag: 'colleco-notification',
      renotify: true,
      timestamp: Date.now(),
      ...options
    };

    // Customize vibration based on notification type
    const vibrationPatterns = {
      message: [200, 100, 200],
      booking: [300, 100, 300, 100, 300],
      payment: [500, 200, 500],
      alert: [100, 50, 100, 50, 100, 50, 100],
      system: [200]
    };

    if (options.type && vibrationPatterns[options.type]) {
      defaultOptions.vibrate = vibrationPatterns[options.type];
    }

    // Add action buttons based on notification type
    if (options.type === 'message' && !defaultOptions.actions) {
      defaultOptions.actions = [
        { action: 'reply', title: '💬 Reply' },
        { action: 'view', title: '👁️ View' }
      ];
    } else if (options.type === 'booking' && !defaultOptions.actions) {
      defaultOptions.actions = [
        { action: 'view', title: '📋 View Booking' },
        { action: 'dismiss', title: '✓ OK' }
      ];
    } else if (options.type === 'quote' && !defaultOptions.actions) {
      defaultOptions.actions = [
        { action: 'view', title: '📄 View Quote' },
        { action: 'dismiss', title: '✓ OK' }
      ];
    }

    // Update app badge (mobile home screen icon)
    if ('setAppBadge' in navigator) {
      try {
        await navigator.setAppBadge(options.unreadCount || 1);
      } catch (e) {
        /* badge api unsupported */
      }
    }

    // Show notification via service worker for better mobile support
    try {
      await registration.showNotification(title, defaultOptions);
      
      // notification sent
      
      return { success: true, title, options: defaultOptions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear app badge (called when notifications are read)
   */
  static async clearBadge() {
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (e) {
        /* ignore badge clear failure */
      }
    }
  }

  /**
   * Update app badge count
   */
  static async updateBadge(count) {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (e) {
        /* ignore badge update failure */
      }
    }
  }

  /**
   * Subscribe to push notifications (requires backend)
   */
  static async subscribeToNotifications(userId) {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe with VAPID public key from environment
        const vapidPublicKey = VAPID_PUBLIC_KEY || 
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp2ENSg1CYQ2vUJ6_4L7pj_b9O8z6rKrC2xkx-z7xXOsqJQSk4JC_2Y';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // Send subscription to backend
      await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          subscription,
          deviceType: this.isMobileDevice() ? 'mobile' : 'desktop',
          isPWA: this.isInstalledPWA()
        })
      });

      return subscription;
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribeFromNotifications(userId) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        await fetch(`${API_BASE_URL}/api/notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            userId,
            endpoint: subscription.endpoint 
          })
        });
      }
  }

  /**
   * Helper: Convert VAPID key to Uint8Array
   */
  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Test notification (for setup verification)
   */
  static async sendTestNotification() {
    return await this.sendPushNotification('CollEco Test', {
      body: 'Push notifications are working! 🎉',
      type: 'system',
      icon: '/assets/icons/colleco-logo-192.png',
      badge: '/assets/icons/colleco-logo-72.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      requireInteraction: false
    });
  }

  /**
   * Prompt user to install PWA (for mobile notifications)
   */
  static async promptInstallPWA() {
    // This requires deferredPrompt event to be captured in main app
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome: _outcome } = await window.deferredPrompt.userChoice;
      window.deferredPrompt = null;
    } else {
      /* prompt not available */
    }
  }
}

export default NotificationCenter;
