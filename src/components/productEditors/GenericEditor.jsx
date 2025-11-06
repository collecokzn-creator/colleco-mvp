import React, { useState } from 'react';
import { updateProduct } from '../../api/mockTravelApi';

export default function GenericEditor({ product = {}, type = 'other', onSaved = ()=>{}, onCancel = ()=>{} }){
  const [state, setState] = useState({
    name: product.name || product.title || '',
    price: product.price || product.amount || 0,
    description: product.description || '',
    meta: JSON.stringify(product.meta || {}, null, 2)
  });

  function save(){
    let metaObj = {};
    try { metaObj = JSON.parse(state.meta || '{}'); } catch(e) { metaObj = product.meta || {}; }
    const patch = {
      name: state.name,
      price: Number(state.price || 0),
      description: state.description,
      meta: metaObj
    };
    const updated = updateProduct(type, product.id, patch);
    onSaved(updated);
  }

  return (
    <div>
      <label className="block text-sm">Name<input className="w-full p-2 border mt-1" value={state.name} onChange={e=>setState({...state, name: e.target.value})} /></label>
      <label className="block text-sm mt-2">Price<input type="number" className="w-full p-2 border mt-1" value={state.price} onChange={e=>setState({...state, price: e.target.value})} /></label>
      <label className="block text-sm mt-2">Description<textarea className="w-full p-2 border mt-1" value={state.description} onChange={e=>setState({...state, description: e.target.value})} /></label>
      <label className="block text-sm mt-2">Meta (JSON)<textarea className="w-full p-2 border mt-1 font-mono text-xs" value={state.meta} onChange={e=>setState({...state, meta: e.target.value})} /></label>
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="px-3 py-1 bg-brand-orange text-white rounded">Save</button>
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}
