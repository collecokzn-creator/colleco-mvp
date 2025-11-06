import React, { useState } from 'react';
import { updateProduct } from '../../api/mockTravelApi';

export default function TourEditor({ product = {}, onSaved = ()=>{}, onCancel = ()=>{} }){
  const [state, setState] = useState({
    name: product.name || '',
    location: product.location || '',
    price: product.price || 0,
    duration: product.duration || '',
    itinerary: (product.itinerary || []).join('\n'),
    capacity: product.capacity || 10,
    description: product.description || ''
  });

  function save(){
    const patch = {
      name: state.name,
      location: state.location,
      price: Number(state.price || 0),
      duration: state.duration,
      itinerary: String(state.itinerary || '').split('\n').map(s=>s.trim()).filter(Boolean),
      capacity: Number(state.capacity || 0),
      description: state.description
    };
    const updated = updateProduct('tour', product.id, patch);
    onSaved(updated);
  }

  return (
    <div>
      <label className="block text-sm">Name<input className="w-full p-2 border mt-1" value={state.name} onChange={e=>setState({...state, name: e.target.value})} /></label>
      <label className="block text-sm mt-2">Location<input className="w-full p-2 border mt-1" value={state.location} onChange={e=>setState({...state, location: e.target.value})} /></label>
      <label className="block text-sm mt-2">Price<input type="number" className="w-full p-2 border mt-1" value={state.price} onChange={e=>setState({...state, price: e.target.value})} /></label>
      <label className="block text-sm mt-2">Duration<input className="w-full p-2 border mt-1" value={state.duration} onChange={e=>setState({...state, duration: e.target.value})} /></label>
      <label className="block text-sm mt-2">Itinerary (one item per line)<textarea className="w-full p-2 border mt-1" value={state.itinerary} onChange={e=>setState({...state, itinerary: e.target.value})} /></label>
      <label className="block text-sm mt-2">Capacity<input type="number" className="w-full p-2 border mt-1" value={state.capacity} onChange={e=>setState({...state, capacity: e.target.value})} /></label>
      <label className="block text-sm mt-2">Description<textarea className="w-full p-2 border mt-1" value={state.description} onChange={e=>setState({...state, description: e.target.value})} /></label>
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="px-3 py-1 bg-brand-orange text-white rounded">Save</button>
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}
