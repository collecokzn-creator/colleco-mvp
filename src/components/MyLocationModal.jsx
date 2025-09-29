import React, { useState } from 'react';

export default function MyLocationModal({ open, onClose, onSave, initial = {} }){
  const [city, setCity] = useState(initial.city || '');
  const [province, setProvince] = useState(initial.province || '');
  const [country, setCountry] = useState(initial.country || '');
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded shadow-lg border border-cream-border w-[min(28rem,92vw)] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Set My Location</h3>
          <button onClick={onClose} aria-label="Close" className="text-brand-brown/70 hover:text-brand-brown">✕</button>
        </div>
        <p className="text-sm text-brand-brown/70 mb-3">This helps us apply “Near me” filters quickly.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" className="px-2 py-1 border border-cream-border rounded" />
          <input value={province} onChange={e=>setProvince(e.target.value)} placeholder="Province/State" className="px-2 py-1 border border-cream-border rounded" />
          <input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country" className="px-2 py-1 border border-cream-border rounded" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm px-3 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover">Cancel</button>
          <button onClick={()=> onSave({ city: city.trim(), province: province.trim(), country: country.trim() })} className="text-sm px-3 py-1 rounded border border-brand-brown bg-brand-brown text-cream hover:bg-brand-brown/90">Save</button>
        </div>
      </div>
    </div>
  );
}
