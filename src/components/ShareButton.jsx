import React, { useState } from 'react';

/**
 * ShareButton Component
 * 
 * Provides sharing functionality for booking confirmations via:
 * - Web Share API (WhatsApp, Messages, Email, etc.) - preferred on mobile
 * - Direct Email fallback
 * - Print functionality
 * 
 * Props:
 * - bookingId: string - The booking ID to share
 * - serviceType: 'flight' | 'accommodation' | 'car' | 'transfer' | 'activity'
 * - confirmationId: string - Display confirmation number
 * - shareData: object - Additional data to include in share
 */
export default function ShareButton({ bookingId, serviceType, confirmationId, shareData = {} }) {
  const [isSharing, setIsSharing] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [sendStatus, setSendStatus] = useState(null);

  const shareText = `My ${serviceType} booking with CollEco Travel\nConfirmation: ${confirmationId}\nBooking ID: ${bookingId}`;
  const shareUrl = `${window.location.origin}/bookings/${bookingId}`;

  const handleShare = async () => {
    setIsSharing(true);

    // Try Web Share API first (works on mobile and modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CollEco Travel - ${serviceType} Booking`,
          text: shareText,
          url: shareUrl
        });
        console.log('Shared successfully via Web Share API');
        setIsSharing(false);
        return;
      } catch (error) {
        // User cancelled or share failed
        if (error.name !== 'AbortError') {
          console.log('Web Share API failed, falling back to email:', error);
        }
      }
    }

    // Fallback: Show email input
    setShowEmailInput(true);
    setIsSharing(false);
  };

  const handleEmailSend = async () => {
    if (!email || !email.includes('@')) {
      setSendStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setIsSharing(true);
    setSendStatus(null);

    try {
      const response = await fetch('/api/sharing/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          recipientEmail: email,
          serviceType,
          ...shareData
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSendStatus({
          type: 'success',
          message: `Confirmation sent to ${email} successfully!`
        });
        setTimeout(() => {
          setShowEmailInput(false);
          setEmail('');
          setSendStatus(null);
        }, 3000);
      } else {
        setSendStatus({
          type: 'error',
          message: result.error || 'Failed to send confirmation'
        });
      }
    } catch (error) {
      console.error('Error sending confirmation:', error);
      setSendStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 items-start">
      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Share via WhatsApp, Messages, Email, or other apps"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {isSharing ? 'Sharing...' : 'Share'}
      </button>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
        title="Print confirmation"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>

      {/* Email Input Modal */}
      {showEmailInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4" style={{ zIndex: 2147483646 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-brown">Share Confirmation</h3>
              <button
                onClick={() => {
                  setShowEmailInput(false);
                  setEmail('');
                  setSendStatus(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter an email address to send your booking confirmation:
            </p>

            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSend()}
                placeholder="recipient@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                autoFocus
              />

              {sendStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  sendStatus.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {sendStatus.message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleEmailSend}
                  disabled={isSharing || !email}
                  className="flex-1 bg-brand-orange text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => {
                    setShowEmailInput(false);
                    setEmail('');
                    setSendStatus(null);
                  }}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Your confirmation will be sent securely via CollEco Travel
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
