import React, { useState } from 'react';
import { updateProduct } from '../../api/mockTravelApi';

export default function CarEditor({ product = {}, onSaved = ()=>{}, onCancel = ()=>{} }){
  const [state, setState] = useState({
    make: product.make || '',
    model: product.model || '',
    vehicleType: product.vehicleType || product.type || '',
    transmission: product.transmission || 'Automatic',
    seats: product.seats || 4,
    pricePerDay: product.pricePerDay || product.price || 0,
    location: product.location || '',
    image: product.image || '',
    description: product.description || ''
  });

  function save(){
    const patch = {
      make: state.make,
      model: state.model,
      vehicleType: state.vehicleType,
      transmission: state.transmission,
      seats: Number(state.seats || 0),
      pricePerDay: Number(state.pricePerDay || 0),
      location: state.location,
      image: state.image,
      description: state.description
    };
    const updated = updateProduct('car', product.id, patch);
    onSaved(updated);
  }

  return (
    <div>
      <label className="block text-sm">Make<input className="w-full p-2 border mt-1" value={state.make} onChange={e=>setState({...state, make: e.target.value})} /></label>
      <label className="block text-sm mt-2">Model<input className="w-full p-2 border mt-1" value={state.model} onChange={e=>setState({...state, model: e.target.value})} /></label>
      <label className="block text-sm mt-2">Vehicle type<input className="w-full p-2 border mt-1" value={state.vehicleType} onChange={e=>setState({...state, vehicleType: e.target.value})} /></label>
      <label className="block text-sm mt-2">Transmission<select className="w-full p-2 border mt-1" value={state.transmission} onChange={e=>setState({...state, transmission: e.target.value})}><option>Automatic</option><option>Manual</option></select></label>
      <label className="block text-sm mt-2">Seats<input type="number" className="w-full p-2 border mt-1" value={state.seats} onChange={e=>setState({...state, seats: e.target.value})} /></label>
      <label className="block text-sm mt-2">Price per day<input type="number" className="w-full p-2 border mt-1" value={state.pricePerDay} onChange={e=>setState({...state, pricePerDay: e.target.value})} /></label>
      <label className="block text-sm mt-2">Location<input className="w-full p-2 border mt-1" value={state.location} onChange={e=>setState({...state, location: e.target.value})} /></label>
      <label className="block text-sm mt-2">Image URL<input className="w-full p-2 border mt-1" value={state.image} onChange={e=>setState({...state, image: e.target.value})} /></label>
      <label className="block text-sm mt-2">Description<textarea className="w-full p-2 border mt-1" value={state.description} onChange={e=>setState({...state, description: e.target.value})} /></label>
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="px-3 py-1 bg-brand-orange text-white rounded">Save</button>
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}
