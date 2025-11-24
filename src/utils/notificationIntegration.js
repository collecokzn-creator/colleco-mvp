/**
 * Push Notification Integration Helper
 * 
 * Connects push notifications with CollEco features:
 * - Bookings
 * - Payments
 * - Messages
 * - Quotes
 * - Partner collaborations
 */

import { API_BASE_URL } from '../config';

/**
 * Send push notification via backend
 */
export async function sendPushNotification({
  userId,
  userIds,
  title,
  body,
  type = 'message',
  url = '/',
  icon = '/assets/icons/colleco-logo-192.png',
  badge = '/assets/icons/colleco-logo-72.png',
  vibrate,
  actions,
  unreadCount = 1
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId,
        userIds,
        title,
        body,
        type,
        url,
        icon,
        badge,
        vibrate,
        actions,
        unreadCount
      })
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * Notification Templates
 */

export const NotificationTemplates = {
  /**
   * New booking notification
   */
  newBooking: ({ bookingId, clientName, packageName, amount, partnerId }) => ({
    type: 'booking',
    title: '📋 New Booking',
    body: `${clientName} booked ${packageName} for R${amount.toLocaleString()}`,
    url: `/bookings/${bookingId}`,
    vibrate: [300, 100, 300, 100, 300], // Triple ping
    actions: [
      { action: 'view', title: '📋 View Booking' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    userId: partnerId
  }),

  /**
   * Booking status update
   */
  bookingStatusUpdate: ({ bookingId, status, clientName, partnerId }) => ({
    type: 'booking',
    title: '📋 Booking Update',
    body: `Booking for ${clientName} is now ${status}`,
    url: `/bookings/${bookingId}`,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: '📋 View Booking' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    userId: partnerId
  }),

  /**
   * Payment received notification
   */
  paymentReceived: ({ bookingId, amount, clientName, partnerId }) => ({
    type: 'payment',
    title: '💰 Payment Received',
    body: `R${amount.toLocaleString()} received from ${clientName}`,
    url: `/finance/payments/${bookingId}`,
    vibrate: [500, 200, 500], // Long double ping
    actions: [
      { action: 'view', title: '💰 View Payment' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    userId: partnerId
  }),

  /**
   * Payment due reminder
   */
  paymentDue: ({ bookingId, amount, dueDate, clientName, partnerId }) => ({
    type: 'payment',
    title: '⚠️ Payment Due',
    body: `R${amount.toLocaleString()} due from ${clientName} on ${dueDate}`,
    url: `/finance/payments/${bookingId}`,
    vibrate: [100, 50, 100, 50, 100, 50, 100], // Urgent rapid
    actions: [
      { action: 'view', title: '💰 View Invoice' },
      { action: 'remind', title: '📧 Send Reminder' }
    ],
    userId: partnerId
  }),

  /**
   * New message notification
   */
  newMessage: ({ conversationId, senderName, message, partnerId }) => ({
    type: 'message',
    title: `💬 ${senderName}`,
    body: message.length > 100 ? message.substring(0, 100) + '...' : message,
    url: `/messages/${conversationId}`,
    vibrate: [200, 100, 200], // Double ping
    actions: [
      { action: 'reply', title: '💬 Reply' },
      { action: 'view', title: '👁️ View' }
    ],
    userId: partnerId
  }),

  /**
   * New quote request
   */
  newQuoteRequest: ({ quoteId, clientName, destination, partnerId }) => ({
    type: 'quote',
    title: '📄 New Quote Request',
    body: `${clientName} requested a quote for ${destination}`,
    url: `/quotes/${quoteId}`,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: '📄 View Request' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    userId: partnerId
  }),

  /**
   * Quote accepted
   */
  quoteAccepted: ({ quoteId, clientName, amount, partnerId }) => ({
    type: 'quote',
    title: '✅ Quote Accepted',
    body: `${clientName} accepted your quote (R${amount.toLocaleString()})`,
    url: `/quotes/${quoteId}`,
    vibrate: [300, 100, 300, 100, 300],
    actions: [
      { action: 'view', title: '📄 View Quote' },
      { action: 'book', title: '📋 Create Booking' }
    ],
    userId: partnerId
  }),

  /**
   * Partner collaboration invitation
   */
  collaborationInvite: ({ collaborationId, inviterName, packageName, partnerId }) => ({
    type: 'collaboration',
    title: '🤝 Collaboration Invite',
    body: `${inviterName} invited you to collaborate on ${packageName}`,
    url: `/collaborations/${collaborationId}`,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'accept', title: '✅ Accept' },
      { action: 'view', title: '👁️ View Details' }
    ],
    userId: partnerId
  }),

  /**
   * Collaboration approval needed
   */
  approvalNeeded: ({ collaborationId, requesterName, action, partnerId }) => ({
    type: 'collaboration',
    title: '✋ Approval Needed',
    body: `${requesterName} needs your approval for ${action}`,
    url: `/collaborations/${collaborationId}`,
    vibrate: [100, 50, 100, 50, 100, 50, 100],
    actions: [
      { action: 'approve', title: '✅ Approve' },
      { action: 'view', title: '👁️ Review' }
    ],
    userId: partnerId
  }),

  /**
   * System alert
   */
  systemAlert: ({ title, message, url = '/', partnerId }) => ({
    type: 'alert',
    title: `⚠️ ${title}`,
    body: message,
    url,
    vibrate: [100, 50, 100, 50, 100, 50, 100],
    actions: [
      { action: 'view', title: '👁️ View' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    userId: partnerId
  }),

  /**
   * Generic notification
   */
  generic: ({ title, body, url = '/', type = 'system', partnerId }) => ({
    type,
    title,
    body,
    url,
    vibrate: [200],
    actions: [
      { action: 'view', title: '👁️ View' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    userId: partnerId
  })
};

/**
 * Notification Helpers for Common Actions
 */

export const NotificationHelpers = {
  /**
   * Notify all partners in a collaboration
   */
  async notifyCollaborators({ collaborationId, partners, excludePartnerId, notification }) {
    const partnerIds = partners
      .filter(p => p.id !== excludePartnerId)
      .map(p => p.id);

    if (partnerIds.length === 0) return;

    return await sendPushNotification({
      ...notification,
      userIds: partnerIds
    });
  },

  /**
   * Notify partner about booking action
   */
  async notifyBookingAction({ bookingId, partnerId, action, clientName, packageName, amount }) {
    const templates = {
      created: NotificationTemplates.newBooking,
      confirmed: NotificationTemplates.bookingStatusUpdate,
      cancelled: NotificationTemplates.bookingStatusUpdate,
      modified: NotificationTemplates.bookingStatusUpdate
    };

    const template = templates[action] || NotificationTemplates.bookingStatusUpdate;
    
    const notification = template({
      bookingId,
      clientName,
      packageName,
      amount,
      status: action,
      partnerId
    });

    return await sendPushNotification(notification);
  },

  /**
   * Notify partner about payment
   */
  async notifyPayment({ bookingId, partnerId, amount, clientName, type = 'received' }) {
    const notification = type === 'received' 
      ? NotificationTemplates.paymentReceived({ bookingId, amount, clientName, partnerId })
      : NotificationTemplates.paymentDue({ bookingId, amount, clientName, partnerId });

    return await sendPushNotification(notification);
  },

  /**
   * Notify partner about new message
   */
  async notifyMessage({ conversationId, partnerId, senderName, message }) {
    const notification = NotificationTemplates.newMessage({
      conversationId,
      senderName,
      message,
      partnerId
    });

    return await sendPushNotification(notification);
  },

  /**
   * Batch notify multiple partners
   */
  async notifyMultiple(notifications) {
    const results = await Promise.allSettled(
      notifications.map(notif => sendPushNotification(notif))
    );

    return results.map((result, index) => ({
      notification: notifications[index],
      success: result.status === 'fulfilled',
      result: result.status === 'fulfilled' ? result.value : result.reason
    }));
  }
};

/**
 * Get user's notification subscription status
 */
export async function getSubscriptionStatus(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/subscriptions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get subscription status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * Track notification analytics
 */
export async function trackNotificationAnalytics({ action, type, userId }) {
  try {
    await fetch(`${API_BASE_URL}/api/notifications/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action, // 'shown', 'clicked', 'dismissed'
        type, // 'message', 'booking', 'payment', etc.
        userId,
        timestamp: Date.now()
      })
    });
  } catch (error) {
    console.error('Failed to track notification analytics:', error);
  }
}

export default {
  sendPushNotification,
  NotificationTemplates,
  NotificationHelpers,
  getSubscriptionStatus,
  trackNotificationAnalytics
};
