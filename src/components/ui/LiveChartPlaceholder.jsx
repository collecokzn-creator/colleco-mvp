import React from "react";

export default function LiveChartPlaceholder({ title = "Live Chart", height = 160 }) {
  return (
    <div className="rounded border border-cream-border bg-cream p-3 text-brand-brown">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-[11px] text-brand-brown/60">auto-refresh</span>
      </div>
      <div className="bg-cream-hover rounded flex items-center justify-center" style={{ height }}>
        <span className="text-brand-brown/60 text-sm">Chart will render here</span>
      </div>
      <p className="text-[11px] text-brand-brown/60 mt-2">This chart will pull live metrics from the API (no manual refresh).</p>
    </div>
  );
}
