import React from "react";

export default function FeesBreakdown({ items = [], currency = "USD", fees }) {
  const _subtotal = items.reduce((s, it) => s + Math.max(0, Number(it.amount || 0)), 0);
  const f = fees || computeFeesLocal(items);
  return (
    <div className="border border-cream-border rounded p-3 bg-cream text-brand-brown text-sm">
      <div className="font-semibold mb-2">Price breakdown</div>
      <Row label="Subtotal" value={f.subtotal} currency={currency} />
      <Row label="Payment processing" value={f.paymentProcessor} currency={currency} />
      <Row label="Platform fee" value={f.platformFee} currency={currency} />
      <Row label="Taxes" value={f.taxes} currency={currency} />
      <div className="border-t border-cream-border mt-2 pt-2 font-semibold">
        <Row label="Total" value={f.total} currency={currency} />
      </div>
    </div>
  );
}

function Row({ label, value, currency }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span>{label}</span>
      <span>{formatCurrency(value, currency)}</span>
    </div>
  );
}

function formatCurrency(v, cur) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(v); } catch { return `${cur} ${v.toFixed(2)}`; }
}

function computeFeesLocal(items = []) {
  const subtotal = items.reduce((sum, it) => sum + Math.max(0, Number(it.amount || 0)), 0);
  const paymentProcessor = Math.round(subtotal * 0.029 * 100) / 100 + 0.3; // 2.9% + $0.30
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100; // 5%
  const taxes = Math.round(subtotal * 0.15 * 100) / 100; // 15%
  const total = Math.round((subtotal + paymentProcessor + platformFee + taxes) * 100) / 100;
  return { subtotal, paymentProcessor, platformFee, taxes, total };
}
