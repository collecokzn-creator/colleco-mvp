import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon paths (Leaflet expects images relative to CSS)
delete L.Icon.Default.prototype._getIconUrl;
// Use Vite-compatible URL imports so images are bundled correctly
const iconRetinaUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const iconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const shadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

function MarkersManager({ markers = [], animate = true }){
  const map = useMap();
  const refs = useRef(new Map()); // id -> { marker, anim }

  useEffect(() => {
    if (!map) return;

    // Create a snapshot of refs to avoid stale-ref warnings in cleanup
    const refMap = refs.current;

    // Helper to create marker
    function createMarker(m){
      try {
        const marker = L.marker([m.lat, m.lng]);
        marker.addTo(map);
        marker.bindPopup(`<div class="text-sm font-semibold">${(m.name||'')}</div>`);
        refMap.set(m.id, { marker, anim: null, pathAnim: null });
      } catch (e) {}
    }

    function animateAlongPath(id, waypoints = [], durationPerSegment = 800){
      const entry = refs.current.get(id);
      if(!entry || !entry.marker) return;
      try { if(entry.pathAnim) cancelAnimationFrame(entry.pathAnim); } catch(e){}
      if(!Array.isArray(waypoints) || waypoints.length < 2) return;
      const segs = [];
      for(let i=0;i<waypoints.length-1;i++){
        const a = waypoints[i]; const b = waypoints[i+1];
        segs.push({ from: L.latLng(Number(a.lat), Number(a.lng)), to: L.latLng(Number(b.lat), Number(b.lng)) });
      }
      let segIndex = 0;
      let segStart = null;
      const step = (now) => {
        if(!segStart) segStart = now;
        const seg = segs[segIndex];
        const t = Math.min(1, (now - segStart) / durationPerSegment);
        const lat = seg.from.lat + (seg.to.lat - seg.from.lat) * t;
        const lng = seg.from.lng + (seg.to.lng - seg.from.lng) * t;
        try { entry.marker.setLatLng([lat, lng]); } catch(e){}
        if(t >= 1){
          segIndex++;
          if(segIndex >= segs.length){ entry.pathAnim = null; return; }
          segStart = null;
          entry.pathAnim = requestAnimationFrame(step);
        } else {
          entry.pathAnim = requestAnimationFrame(step);
        }
      };
      entry.pathAnim = requestAnimationFrame(step);
    }

    function animateMarker(id, fromLatLng, toLatLng, duration = 1200){
      const entry = refs.current.get(id);
      if(!entry || !entry.marker) return;
      if(entry.anim){ cancelAnimationFrame(entry.anim); entry.anim = null; }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const lat = fromLatLng.lat + (toLatLng.lat - fromLatLng.lat) * t;
        const lng = fromLatLng.lng + (toLatLng.lng - fromLatLng.lng) * t;
        try { entry.marker.setLatLng([lat, lng]); } catch (e) {}
        if(t < 1) entry.anim = requestAnimationFrame(step); else entry.anim = null;
      };
      entry.anim = requestAnimationFrame(step);
    }

    // Sync markers: add new, update existing, remove old
    const existingIds = new Set(refs.current.keys());
    for(const m of markers){
      const id = m.id;
      if(refMap.has(id)){
        existingIds.delete(id);
        const entry = refMap.get(id);
        const curLatLng = entry.marker.getLatLng();
        // If the server provided an explicit path/waypoints, animate along that path
        if(m.waypoints && Array.isArray(m.waypoints) && m.waypoints.length > 1){
          animateAlongPath(id, m.waypoints, 800);
        } else {
          const to = L.latLng(Number(m.lat), Number(m.lng));
          if(animate){
            // cancel any path animation
            try { if(entry.pathAnim) { cancelAnimationFrame(entry.pathAnim); entry.pathAnim = null; } } catch(e){}
            animateMarker(id, curLatLng, to, 1000);
          } else {
            try { entry.marker.setLatLng(to); } catch (e) {}
          }
        }
      } else {
        createMarker(m);
        // if newly created marker has waypoints, kick off path animation
        if(m.waypoints && Array.isArray(m.waypoints) && m.waypoints.length > 1){
          animateAlongPath(m.id, m.waypoints, 800);
        }
      }
    }

    // remove stale markers
    for(const staleId of existingIds){
      const entry = refMap.get(staleId);
      try { if(entry && entry.marker) map.removeLayer(entry.marker); } catch (e) {}
      refMap.delete(staleId);
    }

    return () => {
      // cleanup: remove all markers
      for(const entry of refMap.values()){
        try { if(entry.anim) cancelAnimationFrame(entry.anim); } catch(e){}
        try { if(entry.marker) map.removeLayer(entry.marker); } catch(e){}
      }
      refMap.clear();
    };
  }, [map, markers, animate]);

  return null;
}

export default function MapView({ center = [-29.8587, 31.0436], zoom = 10, markers = [], showLive = true }){
  const containerRef = useRef(null);

  return (
    <div className="h-full w-full relative" ref={containerRef}>
      <div className="absolute top-3 right-3 z-40 bg-white/90 rounded-md p-2 shadow-sm text-xs flex items-center gap-3">
        <div className="pl-2 border-l text-xs text-gray-600">Legend: <span className="ml-1 font-semibold">Shuttles</span></div>
      </div>
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkersManager markers={markers} animate={showLive} />
      </MapContainer>
      {/* no stream controls here; stream UI lives in a dedicated ShuttleControls component */}
    </div>
  );
}
