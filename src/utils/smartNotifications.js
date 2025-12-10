/**
 * Smart Notification System
 * Intelligent, context-aware notifications with AI prioritization
 */

// Notification priority levels
export const PRIORITY = {
  CRITICAL: 'critical',   // Immediate action required
  HIGH: 'high',          // Action needed soon
  MEDIUM: 'medium',      // Informational, can wait
  LOW: 'low'            // Nice to know
};

// Notification categories
export const CATEGORY = {
  BOOKING: 'booking',
  APPROVAL: 'approval',
  PAYMENT: 'payment',
  TRAVEL_UPDATE: 'travel_update',
  SYSTEM: 'system',
  PROMOTION: 'promotion'
};

class SmartNotificationManager {
  constructor() {
    this.queue = [];
    this.userPreferences = this.loadPreferences();
    this.deliveryChannels = ['in_app', 'email', 'push', 'sms'];
  }

  // Load user notification preferences
  loadPreferences() {
    const stored = localStorage.getItem('colleco.notification_preferences');
    return stored ? JSON.parse(stored) : this.getDefaultPreferences();
  }

  getDefaultPreferences() {
    return {
      channels: {
        'in_app': true,
        'email': true,
        'push': true,
        'sms': false
      },
      categories: {
        'booking': { enabled: true, channels: ['in_app', 'email', 'push'] },
        'approval': { enabled: true, channels: ['in_app', 'email'] },
        'payment': { enabled: true, channels: ['in_app', 'email'] },
        'travel_update': { enabled: true, channels: ['in_app', 'push'] },
        'system': { enabled: true, channels: ['in_app'] },
        'promotion': { enabled: false, channels: [] }
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      },
      priorityOverride: {
        critical: true, // Always notify, even during quiet hours
        high: false
      }
    };
  }

  // Smart notification creation with AI prioritization
  async create(notification) {
    const enriched = await this.enrichNotification(notification);
    const priority = this.calculatePriority(enriched);
    const channels = this.determineChannels(enriched, priority);
    
    const smartNotification = {
      id: this.generateId(),
      ...enriched,
      priority,
      channels,
      createdAt: new Date().toISOString(),
      status: 'pending',
      readAt: null,
      actionTaken: null
    };

    // Check if should be delivered now or queued
    if (this.shouldDeliverNow(smartNotification)) {
      await this.deliver(smartNotification);
    } else {
      this.queueForLater(smartNotification);
    }

    return smartNotification;
  }

  // Enrich notification with context
  async enrichNotification(notification) {
    const context = await this.gatherContext(notification);
    
    return {
      ...notification,
      context,
      relatedNotifications: this.findRelatedNotifications(notification),
      suggestedActions: this.suggestActions(notification, context),
      estimatedReadTime: this.estimateReadTime(notification.message),
      expiresAt: this.calculateExpiry(notification)
    };
  }

  // Calculate smart priority based on content and context
  calculatePriority(notification) {
    let score = 0;

    // Category-based scoring
    const categoryScores = {
      approval: 40,
      payment: 35,
      booking: 30,
      travel_update: 25,
      system: 15,
      promotion: 5
    };
    score += categoryScores[notification.category] || 10;

    // Time sensitivity
    if (notification.context?.tripStartsIn) {
      const hours = notification.context.tripStartsIn;
      if (hours <= 24) score += 30;
      else if (hours <= 72) score += 20;
      else if (hours <= 168) score += 10;
    }

    // Amount-based (for payments/bookings)
    if (notification.context?.amount) {
      const amount = notification.context.amount;
      if (amount > 50000) score += 25;
      else if (amount > 20000) score += 15;
      else if (amount > 10000) score += 5;
    }

    // Action required
    if (notification.actionRequired) score += 20;

    // User-specific context
    if (notification.context?.userRole === 'admin') score += 10;

    // Determine priority level
    if (score >= 70) return PRIORITY.CRITICAL;
    if (score >= 50) return PRIORITY.HIGH;
    if (score >= 30) return PRIORITY.MEDIUM;
    return PRIORITY.LOW;
  }

  // Determine optimal delivery channels
  determineChannels(notification, priority) {
    const prefs = this.userPreferences.categories[notification.category];
    if (!prefs || !prefs.enabled) return [];

    let channels = [...prefs.channels];

    // Override for critical notifications
    if (priority === PRIORITY.CRITICAL) {
      channels = ['in_app', 'email', 'push', 'sms'];
    }

    // Remove channels based on user preferences
    channels = channels.filter(ch => this.userPreferences.channels[ch]);

    // Smart channel selection based on user activity
    if (this.isUserActive()) {
      // User is online, prioritize in-app
      channels = channels.filter(ch => ch === 'in_app' || ch === 'push');
    }

    return channels;
  }

  // Check if notification should be delivered now
  shouldDeliverNow(notification) {
    // Critical always go through
    if (notification.priority === PRIORITY.CRITICAL) return true;

    // Check quiet hours
    if (this.isQuietHours() && !this.userPreferences.priorityOverride[notification.priority]) {
      return false;
    }

    // Check rate limiting (avoid spam)
    if (this.isRateLimited(notification.category)) {
      return false;
    }

    return true;
  }

  // Deliver notification through selected channels
  async deliver(notification) {
    const deliveryPromises = notification.channels.map(async channel => {
      try {
        switch (channel) {
          case 'in_app':
            return await this.deliverInApp(notification);
          case 'email':
            return await this.deliverEmail(notification);
          case 'push':
            return await this.deliverPush(notification);
          case 'sms':
            return await this.deliverSMS(notification);
          default:
            return { channel, success: false, error: 'Unknown channel' };
        }
      } catch (error) {
        return { channel, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(deliveryPromises);
    
    notification.status = 'delivered';
    notification.deliveryResults = results.map((r, i) => ({
      channel: notification.channels[i],
      success: r.status === 'fulfilled',
      result: r.value || r.reason
    }));

    this.storeNotification(notification);
    return notification;
  }

  // In-app delivery
  async deliverInApp(notification) {
    // Store in localStorage for in-app display
    const stored = this.getStoredNotifications();
    stored.unshift(notification);
    
    // Keep only last 100 notifications
    const trimmed = stored.slice(0, 100);
    localStorage.setItem('colleco.notifications', JSON.stringify(trimmed));

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('colleco:notification', { detail: notification }));

    return { success: true, deliveredAt: new Date().toISOString() };
  }

  // Email delivery
  async deliverEmail(notification) {
    // Call backend API for email sending
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: notification.recipient?.email,
        subject: notification.title,
        body: notification.message,
        template: this.getEmailTemplate(notification),
        priority: notification.priority
      })
    });

    return { success: response.ok, deliveredAt: new Date().toISOString() };
  }

  // Push notification delivery
  async deliverPush(notification) {
    if (!('Notification' in window)) {
      return { success: false, error: 'Push notifications not supported' };
    }

    if (Notification.permission !== 'granted') {
      return { success: false, error: 'Push permission not granted' };
    }

    const pushNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/assets/logo/logo-192.png',
      badge: '/assets/logo/logo-72.png',
      tag: notification.id,
      requireInteraction: notification.priority === PRIORITY.CRITICAL,
      data: notification
    });

    pushNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    };

    return { success: true, deliveredAt: new Date().toISOString() };
  }

  // SMS delivery
  async deliverSMS(notification) {
    // Call backend API for SMS
    const response = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: notification.recipient?.phone,
        message: this.formatForSMS(notification)
      })
    });

    return { success: response.ok, deliveredAt: new Date().toISOString() };
  }

  // Helper methods
  generateId() {
    return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async gatherContext(notification) {
    // Gather additional context based on notification type
    const context = {};

    if (notification.bookingId) {
      // Fetch booking details
      try {
        const response = await fetch(`/api/bookings/${notification.bookingId}`);
        if (response.ok) {
          const booking = await response.json();
          context.booking = booking;
          
          if (booking.startDate) {
            const now = new Date();
            const start = new Date(booking.startDate);
            context.tripStartsIn = Math.ceil((start - now) / (1000 * 60 * 60));
          }
          
          context.amount = booking.totalAmount;
        }
      } catch (error) {
        console.error('Failed to fetch booking context:', error);
      }
    }

    return context;
  }

  findRelatedNotifications(notification) {
    const stored = this.getStoredNotifications();
    return stored.filter(n =>
      n.id !== notification.id &&
      (n.bookingId === notification.bookingId ||
       n.category === notification.category) &&
      !n.readAt
    ).slice(0, 3);
  }

  suggestActions(notification, _context) {
    const actions = [];

    if (notification.category === CATEGORY.APPROVAL) {
      actions.push(
        { label: 'Approve', action: 'approve', style: 'primary' },
        { label: 'Reject', action: 'reject', style: 'danger' },
        { label: 'View Details', action: 'view', style: 'secondary' }
      );
    } else if (notification.category === CATEGORY.BOOKING) {
      actions.push(
        { label: 'View Booking', action: 'view', style: 'primary' }
      );
    } else if (notification.category === CATEGORY.PAYMENT) {
      actions.push(
        { label: 'Pay Now', action: 'pay', style: 'primary' },
        { label: 'View Invoice', action: 'view', style: 'secondary' }
      );
    }

    return actions;
  }

  estimateReadTime(message) {
    const words = message.split(/\s+/).length;
    const wpm = 200; // Average reading speed
    return Math.ceil(words / wpm * 60); // seconds
  }

  calculateExpiry(notification) {
    const now = new Date();
    let expiryHours = 72; // Default 3 days

    if (notification.category === CATEGORY.APPROVAL) {
      expiryHours = 24;
    } else if (notification.category === CATEGORY.PROMOTION) {
      expiryHours = 168; // 1 week
    }

    const expiry = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);
    return expiry.toISOString();
  }

  isQuietHours() {
    if (!this.userPreferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const { start, end } = this.userPreferences.quietHours;
    
    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      // Crosses midnight
      return currentTime >= start || currentTime < end;
    }
  }

  isUserActive() {
    const lastActivity = localStorage.getItem('colleco.last_activity');
    if (!lastActivity) return false;

    const threshold = 5 * 60 * 1000; // 5 minutes
    return Date.now() - parseInt(lastActivity) < threshold;
  }

  isRateLimited(category) {
    const key = `colleco.rate_limit.${category}`;
    const lastSent = localStorage.getItem(key);
    
    if (!lastSent) {
      localStorage.setItem(key, Date.now().toString());
      return false;
    }

    const minInterval = 60 * 1000; // 1 minute between notifications of same category
    const canSend = Date.now() - parseInt(lastSent) >= minInterval;
    
    if (canSend) {
      localStorage.setItem(key, Date.now().toString());
    }
    
    return !canSend;
  }

  queueForLater(notification) {
    this.queue.push(notification);
    localStorage.setItem('colleco.notification_queue', JSON.stringify(this.queue));
  }

  getStoredNotifications() {
    const stored = localStorage.getItem('colleco.notifications');
    return stored ? JSON.parse(stored) : [];
  }

  storeNotification(notification) {
    const stored = this.getStoredNotifications();
    const index = stored.findIndex(n => n.id === notification.id);
    
    if (index >= 0) {
      stored[index] = notification;
    } else {
      stored.unshift(notification);
    }
    
    localStorage.setItem('colleco.notifications', JSON.stringify(stored.slice(0, 100)));
  }

  getEmailTemplate(notification) {
    return `notification_${notification.category}`;
  }

  formatForSMS(notification) {
    // Truncate for SMS (160 chars)
    const prefix = `CollEco: `;
    const maxLength = 160 - prefix.length;
    const message = notification.message.substring(0, maxLength);
    return prefix + message + (notification.message.length > maxLength ? '...' : '');
  }

  // Public API for marking notifications as read
  markAsRead(notificationId) {
    const stored = this.getStoredNotifications();
    const notification = stored.find(n => n.id === notificationId);
    
    if (notification) {
      notification.readAt = new Date().toISOString();
      this.storeNotification(notification);
    }
  }

  // Get unread count
  getUnreadCount() {
    return this.getStoredNotifications().filter(n => !n.readAt).length;
  }
}

// Singleton instance
const notificationManager = new SmartNotificationManager();

// Export convenience functions
export const createNotification = (notification) => notificationManager.create(notification);
export const markAsRead = (id) => notificationManager.markAsRead(id);
export const getUnreadCount = () => notificationManager.getUnreadCount();
export const getNotifications = () => notificationManager.getStoredNotifications();

export default notificationManager;
