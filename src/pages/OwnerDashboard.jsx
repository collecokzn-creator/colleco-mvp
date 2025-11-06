import React, { useEffect, useState, useCallback } from 'react';
import { getProducts, addProduct } from '../api/mockTravelApi';
import HotelEditor from '../components/productEditors/HotelEditor';
import CarEditor from '../components/productEditors/CarEditor';
import ShuttleEditor from '../components/productEditors/ShuttleEditor';
import TourEditor from '../components/productEditors/TourEditor';
import GenericEditor from '../components/productEditors/GenericEditor';

const PRODUCT_TYPES = [
  { key: 'hotel', label: 'Accommodation (Hotels/Lodges)' },
  { key: 'car', label: 'Car Hire / Vehicles' },
  { key: 'shuttle', label: 'Shuttles / Transfers' },
  { key: 'flight', label: 'Flights' },
  { key: 'tour', label: 'Tours & Activities' },
  { key: 'other', label: 'Other / Add-ons' }
];

export default function OwnerDashboard(){
  const [type, setType] = useState('hotel');
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  // form state removed: per-type editor components manage editing/saving

  const loadItems = useCallback(()=>{
    try{
      const list = getProducts(type) || [];
      setItems(Array.isArray(list) ? list : []);
    } catch(e){ setItems([]); }
  }, [type]);

  useEffect(()=>{ loadItems(); }, [loadItems]);

  function startEdit(item){
    setEditing(item.id);
    // prepare a normalized form for common fields
    // editors read the product directly; we keep a lightweight prepared form only if needed in future
  }

  // saveEdit was removed because editors handle saving via per-type editor components

  function createNew(){
    const base = { name: 'New item', description: '', image: '' };
    if(type === 'hotel') Object.assign(base, { location: 'Unknown', pricePerNight: 0, availableDates: [] });
    if(type === 'car') Object.assign(base, { make: '', model: '', transmission: 'Automatic', seats: 4, pricePerDay: 0, location: 'Unknown' });
    if(type === 'shuttle') Object.assign(base, { route: 'Route', origin: '', destination: '', departTimes: [], price: 0, capacity: 10 });
    if(type === 'flight') Object.assign(base, { from: '', to: '', date: '', time: '', price: 0 });
    const added = addProduct(type, base);
    loadItems();
    if(added) startEdit(added);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner / Partner Product Manager</h1>
      <p className="mb-4 text-sm text-gray-600">Manage products (hotels, cars, shuttles, tours, flights, add-ons). Changes persist to demo storage.</p>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold">Product type</label>
        <select className="border px-3 py-2 rounded" value={type} onChange={e=>setType(e.target.value)}>
          {PRODUCT_TYPES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <button onClick={createNew} className="ml-auto px-3 py-2 bg-brand-orange text-white rounded">Add {type}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(i => (
          <div key={i.id} className="border p-3 rounded bg-white">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{i.name || i.route || i.carName || i.hotelName}</div>
                <div className="text-sm text-gray-600">{i.location || i.origin || i.from || ''}</div>
              </div>
              <div className="text-right">{(type === 'hotel' || type === 'car') ? `ZAR ${i.pricePerNight || i.pricePerDay || i.price || ''}` : (i.price ? `ZAR ${i.price}` : '')}</div>
            </div>
            {type === 'hotel' && <div className="mt-2 text-sm">Available dates: {(i.availableDates || []).join(', ')}</div>}
            <div className="mt-3 flex gap-2">
              <button onClick={() => startEdit(i)} className="px-2 py-1 border rounded">Edit</button>
            </div>

            {editing === i.id && (
              <div className="mt-3 bg-gray-50 p-3 rounded">
                {/* Render a per-type editor component for richer editing */}
                {type === 'hotel' && <HotelEditor product={i} onSaved={(_u)=>{ loadItems(); setEditing(null); }} onCancel={()=>setEditing(null)} />}
                {type === 'car' && <CarEditor product={i} onSaved={(_u)=>{ loadItems(); setEditing(null); }} onCancel={()=>setEditing(null)} />}
                {type === 'shuttle' && <ShuttleEditor product={i} onSaved={(_u)=>{ loadItems(); setEditing(null); }} onCancel={()=>setEditing(null)} />}
                {type === 'tour' && <TourEditor product={i} onSaved={(_u)=>{ loadItems(); setEditing(null); }} onCancel={()=>setEditing(null)} />}
                {['flight','other'].includes(type) && <GenericEditor product={i} type={type} onSaved={(_u)=>{ loadItems(); setEditing(null); }} onCancel={()=>setEditing(null)} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
