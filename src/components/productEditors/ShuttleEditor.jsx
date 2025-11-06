import React, { useState } from 'react';
import { updateProduct } from '../../api/mockTravelApi';

export default function ShuttleEditor({ product = {}, onSaved = ()=>{}, onCancel = ()=>{} }){
  const [state, setState] = useState({
    route: product.route || '',
    origin: product.origin || product.origin || '',
    destination: product.destination || '',
    departTimes: (product.departTimes || []).join(', '),
    price: product.price || 0,
    capacity: product.capacity || 10,
    provider: product.provider || '',
    description: product.description || ''
  });

  function save(){
    const patch = {
      route: state.route,
      origin: state.origin,
      destination: state.destination,
      departTimes: String(state.departTimes || '').split(',').map(s=>s.trim()).filter(Boolean),
      price: Number(state.price || 0),
      capacity: Number(state.capacity || 0),
      provider: state.provider,
      description: state.description
    };
    const updated = updateProduct('shuttle', product.id, patch);
    onSaved(updated);
  }

  return (
    <div>
      <label className="block text-sm">Route<input className="w-full p-2 border mt-1" value={state.route} onChange={e=>setState({...state, route: e.target.value})} /></label>
      <label className="block text-sm mt-2">Origin<input className="w-full p-2 border mt-1" value={state.origin} onChange={e=>setState({...state, origin: e.target.value})} /></label>
      <label className="block text-sm mt-2">Destination<input className="w-full p-2 border mt-1" value={state.destination} onChange={e=>setState({...state, destination: e.target.value})} /></label>
      <label className="block text-sm mt-2">Depart times (comma separated)<input className="w-full p-2 border mt-1" value={state.departTimes} onChange={e=>setState({...state, departTimes: e.target.value})} /></label>
      <label className="block text-sm mt-2">Price<input type="number" className="w-full p-2 border mt-1" value={state.price} onChange={e=>setState({...state, price: e.target.value})} /></label>
      <label className="block text-sm mt-2">Capacity<input type="number" className="w-full p-2 border mt-1" value={state.capacity} onChange={e=>setState({...state, capacity: e.target.value})} /></label>
      <label className="block text-sm mt-2">Provider<input className="w-full p-2 border mt-1" value={state.provider} onChange={e=>setState({...state, provider: e.target.value})} /></label>
      <label className="block text-sm mt-2">Description<textarea className="w-full p-2 border mt-1" value={state.description} onChange={e=>setState({...state, description: e.target.value})} /></label>
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="px-3 py-1 bg-brand-orange text-white rounded">Save</button>
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}
