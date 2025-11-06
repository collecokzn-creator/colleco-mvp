import React, { useState } from 'react';

export default function SeatSelector({ rows=6, cols=4, occupied = [], onConfirm, initialSelection=[] }){
  const [selected, setSelected] = useState(initialSelection);
  function toggle(r,c){
    const id = `${r}-${c}`;
    if(selected.includes(id)) setSelected(selected.filter(s=>s!==id));
    else setSelected([...selected, id]);
  }
  const grid = [];
  for(let r=1;r<=rows;r++){
    const row = [];
    for(let c=1;c<=cols;c++){
      const id = `${r}-${c}`;
      const isOcc = occupied.includes(id);
      const isSel = selected.includes(id);
      row.push(<button key={id} disabled={isOcc} onClick={()=>toggle(r,c)} className={`w-10 h-8 m-1 text-xs rounded ${isOcc? 'bg-gray-300 text-gray-600':'border' } ${isSel? 'bg-brand-orange text-white':''}`}>{String.fromCharCode(64+c)}{r}</button>);
    }
    grid.push(<div key={r} className="flex">{row}</div>);
  }
  return (
    <div>
      <div className="text-sm mb-2">Select seats</div>
      <div>{grid}</div>
      <div className="mt-3 flex gap-2">
        <button onClick={()=>onConfirm && onConfirm(selected)} className="px-3 py-1 bg-brand-orange text-white rounded">Confirm</button>
      </div>
    </div>
  );
}
