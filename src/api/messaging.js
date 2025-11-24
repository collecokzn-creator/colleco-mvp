/**
 * Communication API Layer
 * 
 * Centralized API utilities for all communication features:
 * - Real-time messaging (WebSocket)
 * - Notifications
 * - WhatsApp integration
 * - Email
 * - SMS
 */

// ==================== MESSAGING API ====================

/**
 * Send a message
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

/**
 * Get conversation by ID
 */
export const getConversation = async (conversationId) => {
  try {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch conversation');
    return await response.json();
  } catch (error) {
    console.error('Get conversation error:', error);
    throw error;
  }
};

/**
 * Get all conversations for user
 */
export const getConversations = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/conversations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (conversationId, userId) => {
  try {
    const response = await fetch(`/api/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) throw new Error('Failed to mark as read');
    return await response.json();
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

/**
 * Upload attachment
 */
export const uploadAttachment = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/messages/attachments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload attachment');
    return await response.json();
  } catch (error) {
    console.error('Upload attachment error:', error);
    throw error;
  }
};

// ==================== WEBSOCKET CONNECTION ====================

export class WebSocketManager {
  constructor(userId) {
    this.userId = userId;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Set();
    this.statusHandlers = new Set();
  }

  connect() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?userId=${this.userId}`;
    
    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.notifyStatusHandlers('connected');
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyMessageHandlers(data);
      } catch (error) {
        /* ignore malformed message */
      }
    };
    this.ws.onclose = () => {
      this.notifyStatusHandlers('disconnected');
      this.attemptReconnect();
    };
    this.ws.onerror = () => {
      this.notifyStatusHandlers('error');
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyStatusHandlers('failed');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  notifyMessageHandlers(data) {
    this.messageHandlers.forEach(handler => handler(data));
  }

  notifyStatusHandlers(status) {
    this.statusHandlers.forEach(handler => handler(status));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// ==================== NOTIFICATION API ====================

/**
 * Get notifications for user
 */
export const getNotifications = async (userId, filter = {}) => {
  try {
    const queryParams = new URLSearchParams(filter);
    const response = await fetch(`/api/users/${userId}/notifications?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

/**
 * Create notification
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) throw new Error('Failed to create notification');
    return await response.json();
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (subscription) => {
  try {
    const response = await fetch('/api/notifications/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) throw new Error('Failed to subscribe to push notifications');
    return await response.json();
  } catch (error) {
    console.error('Subscribe to push error:', error);
    throw error;
  }
};

// ==================== EMAIL API ====================

/**
 * Send email
 */
export const sendEmail = async (emailData) => {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) throw new Error('Failed to send email');
    return await response.json();
  } catch (error) {
    console.error('Send email error:', error);
    throw error;
  }
};

/**
 * Send quote via email
 */
export const sendQuoteEmail = async (quoteId, recipientEmail) => {
  try {
    const response = await fetch(`/api/quotes/${quoteId}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ recipientEmail })
    });

    if (!response.ok) throw new Error('Failed to send quote email');
    return await response.json();
  } catch (error) {
    console.error('Send quote email error:', error);
    throw error;
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (bookingId) => {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/confirmation-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to send booking confirmation');
    return await response.json();
  } catch (error) {
    console.error('Send booking confirmation error:', error);
    throw error;
  }
};

// ==================== SMS API ====================

/**
 * Send SMS
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ phoneNumber, message })
    });

    if (!response.ok) throw new Error('Failed to send SMS');
    return await response.json();
  } catch (error) {
    console.error('Send SMS error:', error);
    throw error;
  }
};

// ==================== PARTNER API ====================

/**
 * Get partners for collaboration
 */
export const getPartners = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/partners?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch partners');
    return await response.json();
  } catch (error) {
    console.error('Get partners error:', error);
    throw error;
  }
};

/**
 * Search partners
 */
export const searchPartners = async (searchQuery, filters = {}) => {
  try {
    const response = await fetch('/api/partners/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ query: searchQuery, ...filters })
    });

    if (!response.ok) throw new Error('Failed to search partners');
    return await response.json();
  } catch (error) {
    console.error('Search partners error:', error);
    throw error;
  }
};

// ==================== COLLABORATION API ====================

/**
 * Create collaboration
 */
export const createCollaboration = async (collaborationData) => {
  try {
    const response = await fetch('/api/collaborations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(collaborationData)
    });

    if (!response.ok) throw new Error('Failed to create collaboration');
    return await response.json();
  } catch (error) {
    console.error('Create collaboration error:', error);
    throw error;
  }
};

/**
 * Get collaborations
 */
export const getCollaborations = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/collaborations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch collaborations');
    return await response.json();
  } catch (error) {
    console.error('Get collaborations error:', error);
    throw error;
  }
};

/**
 * Update collaboration status
 */
export const updateCollaborationStatus = async (collaborationId, status) => {
  try {
    const response = await fetch(`/api/collaborations/${collaborationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to update collaboration status');
    return await response.json();
  } catch (error) {
    console.error('Update collaboration status error:', error);
    throw error;
  }
};

/**
 * Add collaboration message
 */
export const addCollaborationMessage = async (collaborationId, message) => {
  try {
    const response = await fetch(`/api/collaborations/${collaborationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Failed to add message');
    return await response.json();
  } catch (error) {
    console.error('Add collaboration message error:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format phone number for international use
 */
export const formatPhoneNumber = (phoneNumber, countryCode = '+27') => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Remove leading zero if present
  const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
  
  // Add country code if not present
  if (!withoutLeadingZero.startsWith(countryCode.replace('+', ''))) {
    return `${countryCode}${withoutLeadingZero}`;
  }
  
  return `+${withoutLeadingZero}`;
};

/**
 * Validate email address
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate conversation ID from participant IDs
 */
export const generateConversationId = (userId1, userId2) => {
  const sorted = [userId1, userId2].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
};

export default {
  // Messaging
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  uploadAttachment,
  
  // WebSocket
  WebSocketManager,
  
  // Notifications
  getNotifications,
  createNotification,
  markNotificationAsRead,
  subscribeToPushNotifications,
  
  // Email
  sendEmail,
  sendQuoteEmail,
  sendBookingConfirmationEmail,
  
  // SMS
  sendSMS,
  
  // Partners
  getPartners,
  searchPartners,
  
  // Collaboration
  createCollaboration,
  getCollaborations,
  updateCollaborationStatus,
  addCollaborationMessage,
  
  // Helpers
  formatPhoneNumber,
  isValidEmail,
  generateConversationId
};
