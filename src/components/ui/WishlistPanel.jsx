import React from "react";
// DEPRECATED: WishlistPanel retained temporarily for reference; basket replaces wishlist concept.

export default function WishlistPanel({ items = [], onRemove, onMoveToItinerary }) {
  return (
    <div className="rounded border border-cream-border bg-cream p-3 text-brand-brown">
      <div className="font-semibold mb-2">Wishlist</div>
      {items.length === 0 ? (
        <p className="text-sm text-brand-brown/70">No items yet. Add experiences from Quotes.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-center justify-between bg-cream-sand rounded p-2 border border-cream-border">
              <div>
                <div className="font-medium text-sm">{it.title}</div>
                {it.subtitle ? <div className="text-xs text-brand-brown/70">{it.subtitle}</div> : null}
              </div>
              <div className="flex gap-2">
                {onMoveToItinerary ? (
                  <button className="px-2 py-1 text-xs rounded border border-brand-brown text-brand-brown hover:bg-brand-brown/10" onClick={() => onMoveToItinerary(it)}>Add to itinerary</button>
                ) : null}
                {onRemove ? (
                  <button className="px-2 py-1 text-xs rounded border border-cream-border hover:bg-cream-hover" onClick={() => onRemove(it)}>Remove</button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
