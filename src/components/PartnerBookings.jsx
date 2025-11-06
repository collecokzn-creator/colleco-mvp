import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingAssignment, updateBookingStatus } from '../api/mockTravelApi';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

export default function PartnerBookings({ currentUser }){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    try {
      const all = getBookings() || [];
      // For the demo show all bookings; a real app would filter to partner-owned bookings
      setBookings(all.sort((a,b)=> (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0))));
    } catch(e){ setBookings([]); }
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const setAssignment = (bookingId, patch) => {
    const updated = updateBookingAssignment(bookingId, patch);
    if(updated) load();
    return updated;
  };

  const setStatus = (bookingId, status) => {
    const updated = updateBookingStatus(bookingId, status);
    if(updated) load();
    return updated;
  };

  if(loading) return <div className="p-3">Loading bookings…</div>;
  if(!bookings.length) return <div className="p-3">No demo bookings yet.</div>;

  return (
    <div className="space-y-3">
      {bookings.map(b => (
        <div key={b.id} className="border rounded p-3 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold">{b.type === 'car' ? `Car: ${b.carName}` : b.hotelName || b.route || b.name || b.id}</div>
              <div className="text-xs text-gray-600">{b.passenger || b.guest || b.passenger || ''} · {b.currency ? b.currency + ' ' : ''}{b.amount ?? b.total ?? ''}</div>
              <div className="text-xs text-gray-500">Created {b.createdAt ? formatDistanceToNowStrict(parseISO(b.createdAt)) + ' ago' : ''}</div>
            </div>
            <div className="text-right">
              <div className="text-sm">Status</div>
              <div className="font-semibold">{b.status || (b.assignment && b.assignment.status) || '—'}</div>
            </div>
          </div>

          {/* Assignment controls for shuttle bookings */}
          {b.shuttleId || b.assignment ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="px-2 py-1 bg-brand-orange text-white rounded" onClick={()=>{
                const driverName = (currentUser && currentUser.name) || 'Partner';
                setAssignment(b.id, { driver: driverName, status: 'assigned', etaMinutes: 12 });
              }}>Assign to me</button>
              <button className="px-2 py-1 border rounded" onClick={()=>setAssignment(b.id, { status: 'enroute', etaMinutes: 8 })}>Mark enroute</button>
              <button className="px-2 py-1 border rounded" onClick={()=>setAssignment(b.id, { status: 'arriving', etaMinutes: 2 })}>Mark arriving</button>
              <button className="px-2 py-1 border rounded" onClick={()=>{ setAssignment(b.id, { status: 'picked-up', etaMinutes: 0 }); setStatus(b.id, 'Completed'); }}>Mark picked up</button>
              <button className="px-2 py-1 border rounded text-red-600" onClick={()=>setStatus(b.id, 'Cancelled')}>Cancel</button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={()=>setStatus(b.id, 'Completed')}>Mark completed</button>
              <button className="px-2 py-1 border rounded text-red-600" onClick={()=>setStatus(b.id, 'Cancelled')}>Cancel</button>
            </div>
          )}

          {/* Show assignment details */}
          {b.assignment && (
            <div className="mt-3 text-sm text-gray-600">
              <div>Assignment: {b.assignment.id} — {b.assignment.status}</div>
              <div>Driver: {b.assignment.driver || '—' } · ETA: {b.assignment.etaMinutes ?? '—'} mins</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
