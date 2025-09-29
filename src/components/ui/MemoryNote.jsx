import React from "react";

export default function MemoryNote({ value, onChange, placeholder = "Capture a memory… (this saves automatically)", rows = 2 }) {
  return (
    <div className="rounded border border-cream-border bg-cream p-2">
      <textarea
        className="w-full resize-none bg-transparent outline-none text-sm text-brand-brown placeholder:text-brand-brown/50"
        rows={rows}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      <div className="text-[11px] text-brand-brown/60">Memories sync to your itinerary and can be exported to PDF later.</div>
    </div>
  );
}
