/**
 * WhatsApp Business API Integration
 * 
 * Enables partners to communicate with clients via WhatsApp
 * Features:
 * - Send quotes, invoices, and itineraries
 * - Booking confirmations and updates
 * - Two-way messaging
 * - Template messages for compliance
 * - Message status tracking (sent, delivered, read)
 * - Media attachments (PDFs, images)
 * 
 * Setup Requirements:
 * 1. WhatsApp Business API account
 * 2. Verified business phone number
 * 3. Message templates approved by WhatsApp
 * 4. Webhook endpoint for receiving messages
 */

const WHATSAPP_CONFIG = {
  apiUrl: 'https://graph.facebook.com/v18.0',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
};

/**
 * Send a template message (pre-approved by WhatsApp)
 * Used for: Booking confirmations, payment receipts, appointment reminders
 */
export const sendTemplateMessage = async (recipientPhone, templateName, parameters = []) => {
  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: parameters.map(param => ({
                  type: 'text',
                  text: param
                }))
              }
            ]
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return {
      success: true,
      messageId: data.messages[0].id,
      recipientPhone
    };
  } catch (error) {
    console.error('WhatsApp template message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send a text message (requires 24-hour session window)
 */
export const sendTextMessage = async (recipientPhone, messageText) => {
  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'text',
          text: {
            body: messageText
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return {
      success: true,
      messageId: data.messages[0].id
    };
  } catch (error) {
    console.error('WhatsApp text message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send a document (PDF quote, invoice, itinerary)
 */
export const sendDocument = async (recipientPhone, documentUrl, filename, caption = '') => {
  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'document',
          document: {
            link: documentUrl,
            filename: filename,
            caption: caption
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp document');
    }

    return {
      success: true,
      messageId: data.messages[0].id
    };
  } catch (error) {
    console.error('WhatsApp document error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send an image
 */
export const sendImage = async (recipientPhone, imageUrl, caption = '') => {
  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'image',
          image: {
            link: imageUrl,
            caption: caption
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp image');
    }

    return {
      success: true,
      messageId: data.messages[0].id
    };
  } catch (error) {
    console.error('WhatsApp image error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send interactive buttons (e.g., "Confirm Booking", "Cancel")
 */
export const sendInteractiveButtons = async (recipientPhone, bodyText, buttons) => {
  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: bodyText
            },
            action: {
              buttons: buttons.map((btn, index) => ({
                type: 'reply',
                reply: {
                  id: btn.id || `btn_${index}`,
                  title: btn.title.substring(0, 20) // Max 20 chars
                }
              }))
            }
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send WhatsApp buttons');
    }

    return {
      success: true,
      messageId: data.messages[0].id
    };
  } catch (error) {
    console.error('WhatsApp buttons error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId) => {
  try {
    await fetch(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      }
    );

    return { success: true };
  } catch (error) {
    console.error('WhatsApp mark read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle incoming WhatsApp webhook
 * Call this from your webhook endpoint
 */
export const handleWhatsAppWebhook = async (webhookData) => {
  try {
    const entry = webhookData.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return { success: false, error: 'Invalid webhook data' };
    }

    // Handle message status updates (sent, delivered, read, failed)
    if (value.statuses) {
      const status = value.statuses[0];
      return {
        type: 'status',
        messageId: status.id,
        status: status.status,
        timestamp: status.timestamp,
        recipientId: status.recipient_id
      };
    }

    // Handle incoming messages
    if (value.messages) {
      const message = value.messages[0];
      const from = message.from;
      const messageId = message.id;
      const timestamp = message.timestamp;

      let messageData = {
        type: 'message',
        from,
        messageId,
        timestamp,
        messageType: message.type
      };

      // Extract message content based on type
      switch (message.type) {
        case 'text':
          messageData.text = message.text.body;
          break;
        case 'image':
          messageData.imageId = message.image.id;
          messageData.caption = message.image.caption;
          break;
        case 'document':
          messageData.documentId = message.document.id;
          messageData.filename = message.document.filename;
          break;
        case 'audio':
          messageData.audioId = message.audio.id;
          break;
        case 'video':
          messageData.videoId = message.video.id;
          break;
        case 'button':
          messageData.buttonPayload = message.button.payload;
          messageData.buttonText = message.button.text;
          break;
        case 'interactive':
          if (message.interactive.type === 'button_reply') {
            messageData.buttonId = message.interactive.button_reply.id;
            messageData.buttonTitle = message.interactive.button_reply.title;
          }
          break;
      }

      // Mark as read
      await markMessageAsRead(messageId);

      return messageData;
    }

    return { success: false, error: 'Unknown webhook event' };
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify WhatsApp webhook (required for initial setup)
 */
export const verifyWebhook = (mode, token, challenge) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'colleco_whatsapp_token_2024';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return challenge;
  }
  
  return null;
};

/**
 * Pre-built message templates for common use cases
 */
export const MessageTemplates = {
  /**
   * Send booking confirmation via WhatsApp
   */
  sendBookingConfirmation: async (clientPhone, bookingDetails) => {
    const message = `🎉 *Booking Confirmed!*\n\n` +
      `Booking Ref: ${bookingDetails.bookingNumber}\n` +
      `Package: ${bookingDetails.packageName}\n` +
      `Date: ${bookingDetails.travelDate}\n` +
      `Travelers: ${bookingDetails.numberOfTravelers}\n` +
      `Total: R${bookingDetails.totalAmount}\n\n` +
      `Thank you for choosing CollEco Travel! 🌍✈️`;

    return await sendTextMessage(clientPhone, message);
  },

  /**
   * Send quote via WhatsApp
   */
  sendQuote: async (clientPhone, quoteUrl, quoteNumber) => {
    await sendDocument(
      clientPhone,
      quoteUrl,
      `Quote_${quoteNumber}.pdf`,
      `Here's your travel quote ${quoteNumber}. Valid for 14 days.`
    );

    return await sendInteractiveButtons(
      clientPhone,
      'Would you like to proceed with this booking?',
      [
        { id: 'accept_quote', title: 'Yes, Book Now' },
        { id: 'modify_quote', title: 'Request Changes' },
        { id: 'decline_quote', title: 'Not Interested' }
      ]
    );
  },

  /**
   * Send itinerary via WhatsApp
   */
  sendItinerary: async (clientPhone, itineraryUrl, tripName) => {
    return await sendDocument(
      clientPhone,
      itineraryUrl,
      `Itinerary_${tripName}.pdf`,
      `📅 Your detailed itinerary for ${tripName}. Have a wonderful trip!`
    );
  },

  /**
   * Send payment reminder
   */
  sendPaymentReminder: async (clientPhone, bookingNumber, amountDue, dueDate) => {
    const message = `💰 *Payment Reminder*\n\n` +
      `Booking: ${bookingNumber}\n` +
      `Amount Due: R${amountDue}\n` +
      `Due Date: ${dueDate}\n\n` +
      `Please complete your payment to confirm your booking.`;

    return await sendTextMessage(clientPhone, message);
  },

  /**
   * Send partner collaboration request
   */
  sendCollaborationRequest: async (partnerPhone, requesterName, bookingDetails) => {
    const message = `🤝 *Collaboration Request*\n\n` +
      `From: ${requesterName}\n` +
      `Booking: ${bookingDetails.packageName}\n` +
      `Dates: ${bookingDetails.dates}\n` +
      `Guests: ${bookingDetails.numberOfGuests}\n\n` +
      `Please review and confirm availability.`;

    return await sendInteractiveButtons(
      partnerPhone,
      message,
      [
        { id: 'accept_collab', title: 'Accept' },
        { id: 'negotiate_collab', title: 'Negotiate' },
        { id: 'decline_collab', title: 'Decline' }
      ]
    );
  }
};

export default {
  sendTemplateMessage,
  sendTextMessage,
  sendDocument,
  sendImage,
  sendInteractiveButtons,
  markMessageAsRead,
  handleWhatsAppWebhook,
  verifyWebhook,
  MessageTemplates
};
