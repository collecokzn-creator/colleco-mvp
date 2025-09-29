import React from "react";
import { listPayments } from "../../utils/payments";

export default function PaymentsHistory() {
  const payments = listPayments().slice().sort((a,b) => (b.paidAt||0) - (a.paidAt||0));
  if (!payments.length) {
    return <div className="text-sm text-brand-brown/70">No payments yet.</div>;
  }
  return (
    <div className="text-brand-brown">
      <ul className="divide-y divide-cream-border">
        {payments.map(p => (
          <li key={p.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Payment {p.id.slice(0,8)}</div>
              <div className="text-xs text-brand-brown/70">{new Date(p.paidAt).toLocaleString()}</div>
            </div>
            <div className="text-sm font-semibold">{p.amount.toFixed(2)} {p.currency}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
