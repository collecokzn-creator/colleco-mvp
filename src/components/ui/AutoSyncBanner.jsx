import React from "react";

export default function AutoSyncBanner({ message = "Auto-sync enabled. Your updates will reflect across quotes and itineraries in real time.", variant = "info" }) {
  const variants = {
    info: "bg-brand-orange/10 border-brand-orange/40",
    ok: "bg-emerald-50 border-emerald-300 text-emerald-700",
    warn: "bg-yellow-50 border-yellow-300 text-yellow-800",
  };
  const cls = variants[variant] || variants.info;
  return (
    <div className={`rounded border px-3 py-2 text-sm text-brand-brown ${cls}`}>
      {message}
    </div>
  );
}
