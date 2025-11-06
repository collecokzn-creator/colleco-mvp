import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShuttles, updateBookingAssignment } from '../api/mockTravelApi';
import MapView from '../components/MapView';
import ShuttleControls from '../components/ShuttleControls';
import ShuttleRequestModal from '../components/ShuttleRequestModal';
import useShuttleStream from '../hooks/useShuttleStream';

export default function ShuttlesList(){
  const [shuttles, setShuttles] = useState([]);
  const [shuttlePositions, setShuttlePositions] = useState([]);

  // Use the stream hook so the controls work on this page too
  const {
    shuttlePositions: streamedPositions,
    setShuttlePositions: setStreamedPositions,
    streamMode,
    setStreamMode,
    streamStatus,
    reconnectIn,
    messageLog,
    clearLog,
    sendCommand
  } = useShuttleStream({ initialMode: 'auto', initialPositions: [] });
  const [showLive, setShowLive] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestShuttle, setRequestShuttle] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [assignmentMarkers, setAssignmentMarkers] = useState([]);

  useEffect(()=>{
    const p = getShuttles();
    if(p && typeof p.then === 'function'){
      p.then(list=>{
        setShuttles(list||[]);
        const seed = (list||[]).map((sh, i)=>({ id: sh.id, name: sh.route, lat: sh.originLat || -29.85 + i*0.01, lng: sh.originLng || 31.03 + i*0.01, waypoints: sh.waypoints || null }));
        setShuttlePositions(seed);
        try { setStreamedPositions(seed); } catch(e){}
      }).catch(()=>{ setShuttles([]); setShuttlePositions([]); try { setStreamedPositions([]); } catch(e){} });
    } else {
      setShuttles(p||[]);
      const seed = (p||[]).map((sh, i)=>({ id: sh.id, name: sh.route, lat: sh.originLat || -29.85 + i*0.01, lng: sh.originLng || 31.03 + i*0.01, waypoints: sh.waypoints || null }));
      setShuttlePositions(seed);
      try { setStreamedPositions(seed); } catch(e){}
    }
  },[setStreamedPositions]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Shuttles</h1>
      {lastBooking && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded">
          <div className="text-sm">Ride requested — booking <strong>{lastBooking.id}</strong> confirmed for <strong>{lastBooking.pickupTime}</strong>. View it in your bookings.</div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="space-y-4">
            {shuttles.map(s => (
              <article key={s.id} className="border rounded p-4 bg-white">
                <div className="font-semibold">{s.route}</div>
                <div className="text-sm text-gray-600">{s.origin} → {s.destination}</div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/plan-trip?category=Transport&city=${encodeURIComponent(s.origin||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
                  <Link to={`/book?type=shuttle&shuttleId=${encodeURIComponent(s.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
                  <button onClick={()=>{ setRequestShuttle(s); setRequestOpen(true); }} className="text-sm text-white bg-brand-brown px-3 py-1 rounded">Request Ride</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Live shuttle map</h2>
          <div className="relative h-96 border rounded overflow-hidden">
            <MapView
              center={(streamedPositions && streamedPositions.length) ? [streamedPositions[0].lat, streamedPositions[0].lng] : (shuttlePositions.length ? [shuttlePositions[0].lat, shuttlePositions[0].lng] : undefined)}
              markers={(streamedPositions && streamedPositions.length ? streamedPositions : shuttlePositions).concat(assignmentMarkers)}
              showLive={showLive}
            />
            <ShuttleControls
              streamMode={streamMode}
              setStreamMode={setStreamMode}
              streamStatus={streamStatus}
              reconnectIn={reconnectIn}
              messageLog={messageLog}
              clearLog={clearLog}
              sendCommand={sendCommand}
              showLive={showLive}
              setShowLive={setShowLive}
            />
          </div>
        </div>
      </div>
      <ShuttleRequestModal
        open={requestOpen}
        shuttle={requestShuttle}
        onClose={()=>{ setRequestOpen(false); setRequestShuttle(null); }}
        onBooked={(booking) => {
          setLastBooking(booking);
          // simulate assignment lifecycle and persist status updates
          try {
            const sh = requestShuttle || shuttles.find(s => Number(s.id) === Number(booking.shuttleId));
            const originLat = sh && (sh.originLat || sh.originLat === 0) ? Number(sh.originLat) : (shuttlePositions[0] && shuttlePositions[0].lat) || -29.8587;
            const originLng = sh && (sh.originLng || sh.originLng === 0) ? Number(sh.originLng) : (shuttlePositions[0] && shuttlePositions[0].lng) || 31.0436;
            // if booking has pickupCoords (from geocoding), use it; else approximate near origin
            const pickupCoords = (booking && booking.metadata && booking.metadata.pickupCoords) || booking.pickupCoords || null;
            const pickupLat = pickupCoords ? Number(pickupCoords.lat) : (originLat + 0.002);
            const pickupLng = pickupCoords ? Number(pickupCoords.lng) : (originLng + 0.002);
            const assignId = `assign-${booking.id}`;
            const waypoints = [ { lat: originLat, lng: originLng }, { lat: (originLat + pickupLat)/2, lng: (originLng + pickupLng)/2 }, { lat: pickupLat, lng: pickupLng } ];
            const marker = { id: assignId, name: `Driver (${booking.id})`, lat: originLat, lng: originLng, waypoints };
            setAssignmentMarkers(prev => [...prev.filter(m=>m.id !== assignId), marker]);

            // persist requested -> assigned
            updateBookingAssignment(booking.id, { status: 'assigned', driver: { name: 'Demo Driver', vehicle: 'Van', reg: 'DEMO-123' }, etaMinutes: 12 });

            // schedule lifecycle updates
            // after 5s -> enroute
            setTimeout(()=>{
              updateBookingAssignment(booking.id, { status: 'enroute', etaMinutes: 8 });
              setAssignmentMarkers(prev => prev.map(m => m.id === assignId ? { ...m, name: `Driver (${booking.id}) — en route (8m)` } : m));
              setLastBooking(prev => prev ? { ...prev, assignment: { ...(prev.assignment||{}), status: 'enroute', etaMinutes: 8 } } : prev);
            }, 5000);
            // after 12s -> arriving
            setTimeout(()=>{
              updateBookingAssignment(booking.id, { status: 'arriving', etaMinutes: 2 });
              setAssignmentMarkers(prev => prev.map(m => m.id === assignId ? { ...m, name: `Driver (${booking.id}) — arriving (2m)` } : m));
              setLastBooking(prev => prev ? { ...prev, assignment: { ...(prev.assignment||{}), status: 'arriving', etaMinutes: 2 } } : prev);
            }, 12000);
            // after 22s -> picked-up and remove marker
            setTimeout(()=>{
              updateBookingAssignment(booking.id, { status: 'picked-up', etaMinutes: 0 });
              setAssignmentMarkers(prev => prev.filter(m=>m.id !== assignId));
              setLastBooking(prev => prev ? { ...prev, assignment: { ...(prev.assignment||{}), status: 'picked-up', etaMinutes: 0 } } : prev);
            }, 22000);
          } catch(e){}
          setRequestOpen(false);
          setRequestShuttle(null);
        }}
      />
    </div>
  );
}
