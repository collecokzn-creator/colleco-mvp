import React from "react";

export default function Payouts() {
  return (
    <div className="text-brand-brown">
      <h2 className="text-xl font-bold mb-4">💳 Payments & Payouts</h2>
      <div className="bg-cream-sand p-4 border border-cream-border rounded">
        <p className="mb-2">Track your earnings and payouts.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="bg-cream border border-cream-border rounded p-3">
            <p className="text-xs uppercase tracking-wide text-brand-brown/60">Pending</p>
            <p className="text-lg font-bold">R 0.00</p>
          </div>
          <div className="bg-cream border border-cream-border rounded p-3">
            <p className="text-xs uppercase tracking-wide text-brand-brown/60">Paid this month</p>
            <p className="text-lg font-bold">R 0.00</p>
          </div>
          <div className="bg-cream border border-cream-border rounded p-3">
            <p className="text-xs uppercase tracking-wide text-brand-brown/60">Next payout</p>
            <p className="text-lg font-bold">—</p>
          </div>
        </div>
        <p className="text-brand-brown/70 text-sm">This is a placeholder. Bank account setup, invoices and statements will appear here.</p>
      </div>
    </div>
  );
}
