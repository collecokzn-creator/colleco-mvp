import React, { useEffect, useMemo, useState } from 'react';
import { confirmMockPayment, getPayment } from '../utils/payments';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');
  const [status, setStatus] = useState('processing');
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    // Confirm and fetch details
    const p = confirmMockPayment(sessionId) || getPayment(sessionId);
    if (p) { setPayment(p); setStatus('ok'); }
    else { setStatus('error'); }
  }, [sessionId]);

  const total = useMemo(() => payment?.amount?.toFixed(2), [payment]);

  return (
    <div className="px-6 py-8 text-brand-brown">
      <h1 className="text-3xl font-bold mb-2">Payment success</h1>
      {status === 'processing' && <p className="text-brand-brown/80">Finalizing your payment…</p>}
      {status === 'ok' && (
        <div className="bg-cream-sand p-4 border border-cream-border rounded">
          <div className="font-semibold mb-1">Thank you! Your payment is confirmed.</div>
          <div className="text-sm text-brand-brown/80">Reference: {payment?.id}</div>
          <div className="text-sm text-brand-brown/80">Amount paid: {total} {payment?.currency}</div>
          {(payment?.items?.length ? (
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">Summary</div>
              <ul className="text-sm list-disc list-inside">
                {payment.items.map((i, idx) => (
                  <li key={idx}>{i.name} — ${Number(i.amount || 0).toFixed(2)}</li>
                ))}
              </ul>
            </div>
          ) : null)}
          <div className="mt-4">
            <Link to="/bookings" className="px-3 py-2 bg-brand-orange text-white rounded">Back to Bookings</Link>
          </div>
        </div>
      )}
      {status === 'error' && <p className="text-red-600">We couldn't find your session.</p>}
    </div>
  );
}
