import React, { useState } from "react";
import { createMockCheckout } from "../../utils/payments";

export default function PaymentButton({ items = [], currency = "USD" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setError("");
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || "";
      const token = import.meta.env.VITE_API_TOKEN || "";
      if (apiBase) {
        const res = await fetch(`${apiBase}/api/payments/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ items, currency, metadata: { source: 'itinerary' } }),
        });
        if (!res.ok) throw new Error('Failed to create checkout');
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.assign(data.checkoutUrl);
        }
      } else {
        // Local mock: create a mock checkout and redirect to success
        const { checkoutUrl } = createMockCheckout({ items, currency, metadata: { source: 'itinerary' } });
        window.location.assign(checkoutUrl);
      }
    } catch (e) {
      setError(e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={startCheckout} disabled={loading} className="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-95 disabled:opacity-60">
        {loading ? 'Processing…' : 'Pay securely'}
      </button>
      {error ? <div className="text-sm text-red-600 mt-1">{error}</div> : null}
    </div>
  );
}
