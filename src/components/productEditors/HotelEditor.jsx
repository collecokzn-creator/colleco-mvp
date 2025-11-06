import React, { useState } from 'react';
import { updateProduct } from '../../api/mockTravelApi';

export default function HotelEditor({ product = {}, onSaved = ()=>{}, onCancel = ()=>{} }){
  const [state, setState] = useState({
    name: product.name || product.hotelName || '',
    location: product.location || '',
    pricePerNight: product.pricePerNight || 0,
    availableDates: (product.availableDates || []).join(', '),
    image: product.image || '',
    description: product.description || ''
  });

  async function save(){
    const patch = {
      name: state.name,
      location: state.location,
      pricePerNight: Number(state.pricePerNight || 0),
      availableDates: String(state.availableDates || '').split(',').map(s=>s.trim()).filter(Boolean),
      image: state.image,
      description: state.description
    };
    const updated = updateProduct('hotel', product.id, patch);
    onSaved(updated);
  }

  return (
    <div>
      <label className="block text-sm">Name<input className="w-full p-2 border mt-1" value={state.name} onChange={e=>setState({...state, name: e.target.value})} /></label>
      <label className="block text-sm mt-2">Location<input className="w-full p-2 border mt-1" value={state.location} onChange={e=>setState({...state, location: e.target.value})} /></label>
      <label className="block text-sm mt-2">Price per night<input type="number" className="w-full p-2 border mt-1" value={state.pricePerNight} onChange={e=>setState({...state, pricePerNight: e.target.value})} /></label>
      <label className="block text-sm mt-2">Available dates (comma separated)<input className="w-full p-2 border mt-1" value={state.availableDates} onChange={e=>setState({...state, availableDates: e.target.value})} /></label>
      <label className="block text-sm mt-2">Image URL<input className="w-full p-2 border mt-1" value={state.image} onChange={e=>setState({...state, image: e.target.value})} /></label>
      <label className="block text-sm mt-2">Description<textarea className="w-full p-2 border mt-1" value={state.description} onChange={e=>setState({...state, description: e.target.value})} /></label>
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="px-3 py-1 bg-brand-orange text-white rounded">Save</button>
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}
