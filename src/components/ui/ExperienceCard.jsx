import React from "react";

export default function ExperienceCard({ title, subtitle, time, notes, onAdd, onRemove }) {
  return (
    <div className="rounded border border-cream-border bg-cream-sand p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-brand-brown">{title}</div>
          {subtitle ? <div className="text-sm text-brand-brown/70">{subtitle}</div> : null}
          {time ? <div className="text-xs text-brand-brown/60 mt-0.5">{time}</div> : null}
        </div>
        <div className="flex gap-2">
          {onAdd ? (
            <button className="px-2 py-1 text-sm rounded border border-brand-brown text-brand-brown hover:bg-brand-brown/10" onClick={onAdd}>Add</button>
          ) : null}
          {onRemove ? (
            <button className="px-2 py-1 text-sm rounded border border-cream-border text-brand-brown hover:bg-cream-hover" onClick={onRemove}>Remove</button>
          ) : null}
        </div>
      </div>
      {notes ? <p className="text-sm text-brand-brown/80 mt-2">{notes}</p> : null}
    </div>
  );
}
