import React from "react";

export default function ExperienceCard({ title, subtitle, time, notes, onAdd, onRemove }) {
  return (
    <div className="rounded-lg bg-cream-sand/30 p-3 w-full overflow-hidden hover:bg-cream-sand/50 transition-colors">
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-brand-brown break-words">{title}</div>
          {subtitle ? <div className="text-sm text-brand-brown/70 break-words">{subtitle}</div> : null}
          {time ? <div className="text-xs text-brand-brown/60 mt-0.5">{time}</div> : null}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {onAdd ? (
            <button className="px-3 py-1.5 text-sm rounded-lg bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 font-medium transition-colors" onClick={onAdd}>Add</button>
          ) : null}
          {onRemove ? (
            <button className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors" onClick={onRemove}>Remove</button>
          ) : null}
        </div>
      </div>
      {notes ? <p className="text-sm text-brand-brown/80 mt-2">{notes}</p> : null}
    </div>
  );
}
