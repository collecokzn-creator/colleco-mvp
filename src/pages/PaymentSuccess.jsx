import React, { useEffect, useState } from 'react';
import { confirmMockPayment, getPayment } from '../utils/payments';
import { getBooking as apiGetBooking } from '../api/client';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  // Support both normal query string and hash-based query (used by static preview / hash router)
  let params = new URLSearchParams(window.location.search);
  // If no booking/session in search, attempt to parse query from the hash portion (#/path?key=v)
  if ((!params.get('bookingId') && !params.get('sessionId')) && window.location.hash && window.location.hash.includes('?')) {
    try {
      const hashQuery = window.location.hash.split('?')[1] || '';
      params = new URLSearchParams(hashQuery);
    } catch (e) {
      // ignore parsing errors and fall back to original params
    }
  }
  const sessionId = params.get('sessionId');
  const [status, setStatus] = useState('processing');
  const [payment, setPayment] = useState(null);

  const bookingId = params.get('bookingId');
  useEffect(() => {
    if (bookingId) {
      // E2E shortcut: allow tests to inject booking data directly via window.__E2E_BOOKING
      try {
        if (typeof window !== 'undefined' && window.__E2E_BOOKING && window.__E2E_BOOKING.id === bookingId) {
          const b = window.__E2E_BOOKING;
          if (b.pricing) {
            const p = b.pricing;
            setPayment({ id: b.id, amount: p.total || 0, currency: p.currency || 'ZAR', items: p.items || [], pricing: p });
          } else {
            const fees = b.items ? { total: b.items.reduce((s, i) => s + (Number(i.amount || i.price || 0) || 0), 0) } : null;
            setPayment({ id: b.id, amount: Number(fees?.total || 0), currency: 'USD', items: b.items || [] });
          }
          setStatus('ok');
          return;
        }
      } catch (e) {}
      // Try to fetch booking from API (server-side)
      (async () => {
        try {
          const res = await apiGetBooking(bookingId);
          if (res && res.booking) {
            // If server returned pricing breakdown, use it for display
            if (res.booking.pricing) {
              const p = res.booking.pricing;
              setPayment({ id: res.booking.id, amount: p.total || 0, currency: p.currency || 'ZAR', items: p.items || [], pricing: p });
            } else {
              // convert booking into payment-like shape if possible
              // fixed reduce bug: correctly sum item amounts
              const fees = res.booking.items ? { total: res.booking.items.reduce((s, i) => s + (Number(i.amount || i.price || 0) || 0), 0) } : null;
              setPayment({ id: res.booking.id, amount: Number(fees?.total || 0), currency: 'USD', items: res.booking.items || [] });
            }
            setStatus('ok');
            return;
          }
          setStatus('error');
        } catch (e) {
          setStatus('error');
        }
      })();
      return;
    }
    if (!sessionId) { setStatus('error'); return; }
    // Confirm and fetch details (local mock)
    const p = confirmMockPayment(sessionId) || getPayment(sessionId);
    if (p) { setPayment(p); setStatus('ok'); }
    else { setStatus('error'); }
  }, [sessionId, bookingId]);

  // payment and pricing are rendered directly below

  return (
    <div className="px-6 py-8 text-brand-brown">
      <h1 className="text-3xl font-bold mb-2">Payment success</h1>
      {status === 'processing' && <p className="text-brand-brown/80">Finalizing your payment…</p>}
      {status === 'ok' && (
        <div className="bg-cream-sand p-4 border border-cream-border rounded">
          <div className="font-semibold mb-1">Thank you! Your payment is confirmed.</div>
          <div className="text-sm text-brand-brown/80">Reference: {payment?.id}</div>
          {payment?.pricing ? (
              <div className="mt-3 text-sm text-brand-brown/80">
              <div className="font-semibold">Pricing breakdown</div>
              <div className="mt-1">Subtotal: {payment.pricing.currency} {Number(payment.pricing.subtotal || 0).toFixed(2)}</div>
              <div>CollEco service fees: {payment.pricing.currency} {Number(payment.pricing.totalServiceFees || 0).toFixed(2)}</div>
              <div>Partner commission ({payment.pricing.commissionTier || ''} @ {Math.round((payment.pricing.commissionRate||0)*100)}%): {payment.pricing.currency} {Number(payment.pricing.commission || 0).toFixed(2)}</div>
              <div className="font-semibold mt-1">Partner receives: {payment.pricing.currency} {Number(payment.pricing.partnerReceives || 0).toFixed(2)}</div>
              <div className="mt-1">Total charged: {payment.pricing.currency} {Number(payment.pricing.total || 0).toFixed(2)}</div>
            </div>
          ) : (
            (payment?.items?.length ? (
              <div className="mt-3">
                <div className="text-sm font-semibold mb-1">Summary</div>
                <ul className="text-sm list-disc list-inside">
                  {payment.items.map((i, idx) => (
                    <li key={idx}>{i.name} — ${Number(i.amount || 0).toFixed(2)}</li>
                  ))}
                </ul>
              </div>
            ) : null)
          )}
          <div className="mt-4">
            <Link to="/bookings" className="px-3 py-2 bg-brand-orange text-white rounded">Back to Bookings</Link>
          </div>
        </div>
      )}
  {status === 'error' && <p className="text-red-600">We couldn&apos;t find your session.</p>}
    </div>
  );
}
