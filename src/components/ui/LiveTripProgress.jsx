import React from "react";

export default function LiveTripProgress({ steps = [] }) {
  // steps: [{ label: string, done: boolean }]
  return (
    <div className="rounded border border-cream-border bg-cream p-3 text-brand-brown">
      <div className="font-semibold mb-2">Trip Progress</div>
      <ul className="space-y-1 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.done ? "bg-emerald-500" : "bg-brand-orange"}`} />
            <span className={s.done ? "text-brand-brown" : "text-brand-brown/80"}>{s.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-brand-brown/60 mt-2">Auto-updates as you add quotes, plan days, and confirm bookings.</p>
    </div>
  );
}
