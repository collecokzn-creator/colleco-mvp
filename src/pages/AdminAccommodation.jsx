import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminAccommodation(){
  const [inventory, setInventory] = useState(null);
  const [holds, setHolds] = useState(null);
  const [editing, setEditing] = useState({});
  const nav = useNavigate();

  async function load(){
    const res = await fetch('/api/accommodation/admin');
    if(!res.ok){ if(res.status===401) return nav('/login'); const txt = await res.text(); throw new Error(txt); }
    const j = await res.json(); setInventory(j.inventory); setHolds(j.holds || {});
  }

  useEffect(()=>{ load().catch(e=>console.error(e)); }, []);

  async function saveRoomTypes(){
    const body = { roomTypes: editing };
    const res = await fetch('/api/accommodation/inventory',{ method:'PUT', headers:{ 'content-type':'application/json' }, body: JSON.stringify(body) });
    if(!res.ok) { const txt = await res.text(); alert('Save failed: '+txt); return; }
    const j = await res.json(); setInventory(j.inventory); setEditing({});
  }

  if(!inventory) return <div className="p-6">Loading admin accommodation…</div>;

  const roomTypes = inventory.roomTypes || {};

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Accommodation Inventory</h2>
      <div className="mb-4">
        <table className="w-full border">
          <thead><tr><th className="p-2">Room Type</th><th className="p-2">Total</th><th className="p-2">Price</th></tr></thead>
          <tbody>
            {Object.entries(roomTypes).map(([k,v]) => (
              <tr key={k} className="border-t">
                <td className="p-2 font-medium">{k}</td>
                <td className="p-2">{v.total}</td>
                <td className="p-2">{v.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Edit Room Types</h3>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <input placeholder="name" onChange={(e)=> setEditing({...editing, [e.target.value]: editing[e.target.value] || { total:0, price:0 }})} className="border p-2" />
          <input placeholder="total" type="number" onChange={(e)=>{ const k = Object.keys(editing)[0]; if(!k) return; editing[k] = { ...(editing[k]||{}), total: Number(e.target.value||0) }; setEditing({...editing}); }} className="border p-2" />
          <input placeholder="price" type="number" step="0.01" onChange={(e)=>{ const k = Object.keys(editing)[0]; if(!k) return; editing[k] = { ...(editing[k]||{}), price: Number(e.target.value||0) }; setEditing({...editing}); }} className="border p-2" />
        </div>
        <div className="mt-2">
          <button onClick={saveRoomTypes} className="px-3 py-2 bg-brand-orange text-white rounded">Save</button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Active Holds</h3>
        <pre className="mt-2 bg-gray-50 p-2 rounded text-sm overflow-auto">{JSON.stringify(holds, null, 2)}</pre>
      </div>
    </div>
  );
}
