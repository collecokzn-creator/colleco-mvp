import React, { useState } from "react";
import { createMockCheckout } from "../../utils/payments";
import { createBooking as apiCreateBooking } from "../../api/client";

export default function PaymentButton({ items = [], currency = "USD" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // bookingInfo: { booking?, checkoutUrl?, sessionId?, fees? }
  const [bookingInfo, setBookingInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  function sendAnalytics(event, data = {}) {
    // Lightweight analytics hook: prefer dataLayer if present, otherwise console.debug
    try {
      if (window && window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push({ event, ...data });
      }
    } catch (e) {
      // ignore analytics failures in older browsers
    }
  }

  async function startCheckout() {
    setError("");
    setLoading(true);
    setBookingInfo(null);
    setCopied(false);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      // If API base is configured, create booking on server which will return checkout info
      if (apiBase) {
        const payload = { items, customer: {}, currency, metadata: { source: 'itinerary' } };
        const created = await apiCreateBooking(payload);
        if (!created || !created.booking) throw new Error('Booking creation failed');
        // Keep booking info in UI and let user confirm before redirecting to checkout
        setBookingInfo({ booking: created.booking, checkoutUrl: created.checkout?.checkoutUrl, fees: created.fees });
        sendAnalytics('booking:created', { id: created.booking.id, ref: created.booking.ref });
        return;
      }

      // Local mock: create a mock checkout and surface session id as a reference
      const mock = createMockCheckout({ items, currency, metadata: { source: 'itinerary' } });
      setBookingInfo({ sessionId: mock.sessionId, checkoutUrl: mock.checkoutUrl });
      sendAnalytics('booking:created:mock', { sessionId: mock.sessionId });
    } catch (e) {
      setError(e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  function handleProceed() {
    if (!bookingInfo) return;
    const url = bookingInfo.checkoutUrl;
    if (url) {
      // support relative URL returned by server
      const to = url.startsWith('/') ? `${window.location.origin}${url}` : url;
      // small analytics event
      sendAnalytics('booking:proceed_to_payment', { bookingRef: bookingInfo.booking?.ref || bookingInfo.sessionId });
      window.location.assign(to);
      return;
    }
    // no checkout required — go to bookings list or success page
    if (bookingInfo.booking && bookingInfo.booking.id) {
      window.location.assign(`/payment-success?bookingId=${bookingInfo.booking.id}`);
      return;
    }
    window.location.assign('/bookings');
  }

  function handleView() {
    if (bookingInfo && bookingInfo.booking && bookingInfo.booking.id) {
      window.location.assign(`/payment-success?bookingId=${bookingInfo.booking.id}`);
      return;
    }
    window.location.assign('/bookings');
  }

  async function handleCopyRef() {
    const ref = bookingInfo?.booking?.ref || bookingInfo?.sessionId || '';
    if (!ref) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ref);
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = ref; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      sendAnalytics('booking:ref_copied', { ref });
    } catch (e) {
      // ignore copy failures
    }
  }

  return (
    <div>
      {!bookingInfo ? (
        <div>
          <button onClick={startCheckout} disabled={loading} className="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-95 disabled:opacity-60">
            {loading ? 'Creating booking…' : 'Pay securely'}
          </button>
          {error ? <div className="text-sm text-red-600 mt-1">{error}</div> : null}
        </div>
      ) : (
        <div className="p-3 border rounded bg-gray-50 mt-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500">Booking</div>
              <div className="font-medium text-sm">{bookingInfo.booking ? bookingInfo.booking.ref : `Session ${bookingInfo.sessionId}`}</div>
              {bookingInfo.booking && bookingInfo.booking.status ? <div className="text-xs text-gray-500">Status: {bookingInfo.booking.status}</div> : null}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopyRef} className="text-sm text-gray-600 hover:text-gray-800">{copied ? 'Copied!' : 'Copy ref'}</button>
            </div>
          </div>
          {bookingInfo.fees ? (
            <div className="mt-2 text-sm text-gray-700">Total: {bookingInfo.fees.currency} {bookingInfo.fees.total}</div>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button onClick={handleProceed} className="px-3 py-1 bg-brand-orange text-white rounded">Proceed to payment</button>
            <button onClick={handleView} className="px-3 py-1 border rounded">View booking</button>
          </div>
        </div>
      )}
    </div>
  );
}
