import React from "react";
// DEPRECATED: WishlistPanel retained temporarily for reference; basket replaces wishlist concept.

export default function WishlistPanel({ items = [], onRemove, onMoveToItinerary }) {
  return (
    <div className="rounded border border-brand-gold bg-white p-3 text-brand-orange">
      <div className="font-semibold mb-2 text-brand-orange">Wishlist</div>
      {items.length === 0 ? (
        <p className="text-sm text-brand-gold">No items yet. Add experiences from Quotes.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-center justify-between bg-brand-gold/10 rounded p-2 border border-brand-gold">
              <div>
                <div className="font-medium text-sm text-brand-orange">{it.title}</div>
                {it.subtitle ? <div className="text-xs text-brand-gold">{it.subtitle}</div> : null}
              </div>
              <div className="flex gap-2">
                {onMoveToItinerary ? (
                  <button className="px-2 py-1 text-xs rounded border border-brand-orange text-brand-orange hover:bg-brand-orange/10" onClick={() => onMoveToItinerary(it)}>Add to itinerary</button>
                ) : null}
                {onRemove ? (
                  <button className="px-2 py-1 text-xs rounded border border-brand-gold hover:bg-brand-gold/10 text-brand-gold" onClick={() => onRemove(it)}>Remove</button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
