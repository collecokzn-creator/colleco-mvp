import React, { useEffect, useState } from 'react';
import * as RDP from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const DateRangeComp = RDP.DateRange || RDP.DateRangePicker || (RDP.default && (RDP.default.DateRange || RDP.default.DateRangePicker)) || null;

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
  const [range, setRange] = useState(undefined);

  useEffect(() => {
    if (startDate || endDate) {
      setRange({ from: startDate ? new Date(startDate) : undefined, to: endDate ? new Date(endDate) : undefined });
    } else {
      setRange(undefined);
    }
  }, [startDate, endDate]);

  const handleSelect = (r) => {
    setRange(r);
    if (r && r.from) onStartChange(r.from.toISOString().slice(0,10));
    if (r && r.to) onEndChange(r.to.toISOString().slice(0,10));
  };

  const nights = (range && range.from && range.to) ? Math.max(0, Math.round((range.to - range.from) / (1000*60*60*24))) : 0;

  const setPreset = (days) => {
    const s = new Date(); s.setDate(s.getDate() + 7);
    const e = new Date(s); e.setDate(s.getDate() + days);
    handleSelect({ from: s, to: e });
  };

  return (
    <div>
      <div className="mb-2">
        {DateRangeComp ? (
          React.createElement(DateRangeComp, { mode: 'range', defaultMonth: new Date(), selected: range, onSelect: handleSelect })
        ) : (
          // Fallback: simple inputs if the component is not available
          React.createElement('div', null, [
            React.createElement('input', { key: 'from-fallback', type: 'date', value: range && range.from ? range.from.toISOString().slice(0,10) : '', onChange: (e)=>handleSelect({ from: new Date(e.target.value), to: range && range.to }) }),
            React.createElement('input', { key: 'to-fallback', type: 'date', value: range && range.to ? range.to.toISOString().slice(0,10) : '', onChange: (e)=>handleSelect({ from: range && range.from, to: new Date(e.target.value) }) })
          ])
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-brand-brown/80">
        <div>Stay: <span className="font-semibold">{nights}</span> night(s)</div>
        <div className="flex gap-2">
          <button type="button" onClick={()=>setPreset(2)} className="text-xs px-2 py-1 rounded bg-cream hover:bg-cream-sand">2 nights</button>
          <button type="button" onClick={()=>setPreset(4)} className="text-xs px-2 py-1 rounded bg-cream hover:bg-cream-sand">4 nights</button>
          <button type="button" onClick={()=>setPreset(6)} className="text-xs px-2 py-1 rounded bg-cream hover:bg-cream-sand">7 nights</button>
        </div>
      </div>
    </div>
  );
}
