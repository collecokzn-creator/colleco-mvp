import React from 'react';

export default function Modal({ title, children, onClose, actions }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-5 animate-fadeIn border border-cream-border text-brand-brown">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-cream-sand">✕</button>
        </div>
        <div className="mb-4 max-h-[60vh] overflow-y-auto pr-1">
          {children}
        </div>
        <div className="flex justify-end gap-2">
          {actions}
        </div>
      </div>
    </div>
  );
}
