/**
 * Sharing API Routes
 * 
 * Handles:
 * - POST /api/sharing/send-confirmation
 * - POST /api/sharing/generate-link
 */

const express = require('express');
const { sendEmail } = require('../utils/emailService');
const { getBooking } = require('../utils/bookings');
const router = express.Router();

/**
 * POST /api/sharing/send-confirmation
 * Send booking confirmation via email
 * 
 * Body:
 * {
 *   bookingId: string,
 *   recipientEmail: string,
 *   serviceType: 'flight' | 'accommodation' | 'car' | 'transfer' | 'activity'
 * }
 */
router.post('/send-confirmation', async (req, res) => {
  try {
    const { bookingId, recipientEmail, serviceType } = req.body;

    if (!bookingId || !recipientEmail || !serviceType) {
      return res.status(400).json({
        error: 'bookingId, recipientEmail, and serviceType are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    // Get booking from storage
    const booking = getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    // Generate confirmation content based on service type
    const confirmationContent = generateConfirmationEmail(booking, serviceType);

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject: confirmationContent.subject,
      html: confirmationContent.html,
      text: confirmationContent.text,
      replyTo: 'support@colleco.co.za'
    });

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        result
      });
    }

    res.json({
      success: true,
      messageId: result.messageId,
      sentTo: recipientEmail,
      serviceType,
      bookingId,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[sharing] Error sending confirmation:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Generate confirmation email HTML based on service type
 */
function generateConfirmationEmail(booking, serviceType) {
  const baseHTML = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .header { background: linear-gradient(135deg, #F47C20 0%, #E0651C 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .logo { font-size: 24px; font-weight: bold; }
          .confirmation-id { background: #e8f4f8; padding: 10px; border-radius: 4px; margin: 10px 0; }
          .button { display: inline-block; background: #F47C20; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">✈️ CollEco Travel</div>
          <h1>Booking Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear Guest,</p>
          <p>Thank you for booking with CollEco Travel. Here is your booking confirmation:</p>
          
          <div class="confirmation-id">
            <strong>Booking ID:</strong> ${booking.id || 'N/A'}<br>
            <strong>Confirmation #:</strong> ${booking.confirmationId || generateConfirmationId()}<br>
            <strong>Service Type:</strong> ${capitalizeServiceType(serviceType)}
          </div>
          
          ${generateServiceSpecificDetails(booking, serviceType)}
          
          <h3>Important Information:</h3>
          <ul>
            <li>Save this confirmation for your records</li>
            <li>You'll receive additional details closer to your travel date</li>
            <li>For any changes, contact plantrip@travelcolleco.com or use the CollEco app</li>
            <li>Keep all booking references handy for check-in</li>
          </ul>
          
          <p>
            <a href="https://app.colleco.co.za/bookings/${booking.id}" class="button">View Full Booking Details</a>
          </p>
        </div>
        <div class="footer">
          <p>CollEco Travel | plantrip@travelcolleco.com | +27 31 123 4567</p>
          <p>This email contains your booking confirmation. Please keep it safe.</p>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `Your ${capitalizeServiceType(serviceType)} Booking Confirmation - ${booking.confirmationId || booking.id}`,
    html: baseHTML,
    text: `Booking Confirmation\nBooking ID: ${booking.id}\nService: ${serviceType}\n\nPlease check your email for full details.`
  };
}

/**
 * Generate service-specific booking details for email
 */
function generateServiceSpecificDetails(booking, serviceType) {
  let details = '<div class="details"><h3>Booking Details:</h3>';

  switch (serviceType) {
    case 'flight':
      details += `
        <p><strong>Route:</strong> ${booking.route || 'N/A'}</p>
        <p><strong>Departure:</strong> ${booking.departureDate || 'N/A'}</p>
        <p><strong>Passengers:</strong> ${booking.passengers || 1}</p>
        <p><strong>Total Price:</strong> R${booking.totalPrice ? booking.totalPrice.toLocaleString() : '0'}</p>
      `;
      break;
    case 'accommodation':
      details += `
        <p><strong>Property:</strong> ${booking.propertyName || 'N/A'}</p>
        <p><strong>Check-in:</strong> ${booking.checkInDate || 'N/A'}</p>
        <p><strong>Check-out:</strong> ${booking.checkOutDate || 'N/A'}</p>
        <p><strong>Nights:</strong> ${booking.nights || 'N/A'}</p>
        <p><strong>Total Price:</strong> R${booking.totalPrice ? booking.totalPrice.toLocaleString() : '0'}</p>
      `;
      break;
    case 'car':
      details += `
        <p><strong>Vehicle:</strong> ${booking.vehicleName || 'N/A'}</p>
        <p><strong>Pickup:</strong> ${booking.pickupLocation || 'N/A'} - ${booking.pickupDate || 'N/A'}</p>
        <p><strong>Dropoff:</strong> ${booking.dropoffLocation || 'N/A'} - ${booking.dropoffDate || 'N/A'}</p>
        <p><strong>Total Price:</strong> R${booking.totalPrice ? booking.totalPrice.toLocaleString() : '0'}</p>
      `;
      break;
    case 'transfer':
      details += `
        <p><strong>Service:</strong> ${booking.serviceType || 'N/A'}</p>
        <p><strong>Pickup:</strong> ${booking.pickupLocation || 'N/A'}</p>
        <p><strong>Destination:</strong> ${booking.destination || 'N/A'}</p>
        <p><strong>Date & Time:</strong> ${booking.pickupDate || 'N/A'}</p>
        <p><strong>Total Price:</strong> R${booking.totalPrice ? booking.totalPrice.toLocaleString() : '0'}</p>
      `;
      break;
    case 'activity':
      details += `
        <p><strong>Activity:</strong> ${booking.activityName || 'N/A'}</p>
        <p><strong>Date:</strong> ${booking.activityDate || 'N/A'}</p>
        <p><strong>Participants:</strong> ${booking.participants || 1}</p>
        <p><strong>Total Price:</strong> R${booking.totalPrice ? booking.totalPrice.toLocaleString() : '0'}</p>
      `;
      break;
    default:
      details += `<p>Service Type: ${serviceType}</p>`;
  }

  details += '</div>';
  return details;
}

/**
 * Helper functions
 */
function generateConfirmationId() {
  return 'CONF-' + Date.now().toString().slice(-8);
}

function capitalizeServiceType(type) {
  const map = {
    'flight': 'Flight',
    'accommodation': 'Accommodation',
    'car': 'Car Rental',
    'transfer': 'Transfer',
    'activity': 'Activity'
  };
  return map[type] || type;
}

module.exports = router;
