import React, { useEffect, useState } from 'react';

// Lightweight itinerary item enhancer: geocodes a location, fetches a daily
// weather forecast (via Open-Meteo, no API key) and shows an illustrative image
// via Unsplash Source. Caches results in localStorage to avoid repeated network calls.

function cacheGet(key){ try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null;}catch(e){return null;} }
function cacheSet(key, val, ttlMs = 1000 * 60 * 60 * 24){ try{ const payload = { ts: Date.now(), ttl: ttlMs, v: val }; localStorage.setItem(key, JSON.stringify(payload)); }catch(e){} }
function cacheValid(raw){ if(!raw) return false; try{ return (Date.now() - (raw.ts||0)) < (raw.ttl||0); }catch(e){ return false; } }

export default function ItineraryItem({ item, day = 1 }){
  const [geo, setGeo] = useState(null);
  const [weather, setWeather] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const locationQuery = (item.location || item.subtitle || item.title || '').trim();

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true);
      const keyBase = `it:item:${(locationQuery||item.title||'').toLowerCase().slice(0,80)}`;

      // 1) Geocode via Nominatim (cache key)
      try{
        const geoKey = keyBase+':geo';
        const cachedGeo = cacheGet(geoKey);
        if(cachedGeo && cacheValid(cachedGeo)){
          setGeo(cachedGeo.v);
        } else if(locationQuery){
          const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationQuery)}`;
          const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
          const js = await res.json();
          const first = Array.isArray(js) && js.length ? js[0] : null;
          const g = first ? { lat: Number(first.lat), lon: Number(first.lon), display_name: first.display_name } : null;
          if(g){ cacheSet(geoKey, g, 1000*60*60*24*7); setGeo(g); }
        }
      }catch(e){}

      // 2) Weather via Open-Meteo (no key). Use day offset from today.
      try{
        const weatherKey = keyBase+`:weather:${day}`;
        const cachedWx = cacheGet(weatherKey);
        if(cachedWx && cacheValid(cachedWx)){
          setWeather(cachedWx.v);
        } else {
          const lat = (geo && geo.lat) || null;
          const lon = (geo && geo.lon) || null;
          if(lat && lon){
            const targetDate = new Date(); targetDate.setDate(targetDate.getDate() + (Number(day||1)-1));
            const dstr = targetDate.toISOString().slice(0,10);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&start_date=${dstr}&end_date=${dstr}`;
            const res = await fetch(url);
            if(res.ok){
              const js = await res.json();
              const dayIdx = 0;
              const wx = js && js.daily ? {
                tempMax: js.daily.temperature_2m_max?.[dayIdx],
                tempMin: js.daily.temperature_2m_min?.[dayIdx],
                precipitation: js.daily.precipitation_sum?.[dayIdx],
                weathercode: js.daily.weathercode?.[dayIdx],
                source: 'open-meteo'
              } : null;
              if(wx){ cacheSet(weatherKey, wx, 1000*60*60); setWeather(wx); }
            }
          }
        }
      }catch(e){}

      // 3) Image via Unsplash Source (no API key). Use title + location to search.
      try{
        const imgKey = keyBase+':img';
        const cachedImg = cacheGet(imgKey);
        if(cachedImg && cacheValid(cachedImg)){
          setImgUrl(cachedImg.v);
        } else {
          const q = `${item.title || ''} ${locationQuery}`.trim() || 'travel';
          // unsplash source returns a redirecting image; we can use the URL directly for demo
          const src = `https://source.unsplash.com/600x360/?${encodeURIComponent(q)}`;
          // store the generated URL (note: the image will be unique per request)
          cacheSet(imgKey, src, 1000*60*60*24*7);
          setImgUrl(src);
        }
      }catch(e){}

      if(mounted) setLoading(false);
    }
    load();
    return ()=>{ mounted = false; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery, item.title, day]);

  // small helper to map weathercode to human text (Open-Meteo codes)
  function weatherLabel(code){
    if(code===null || code===undefined) return null;
    const map = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Heavy showers', 82: 'Violent showers'
    };
    return map[code] || 'Weather';
  }

  return (
    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
      <div className="md:col-span-2">
        {/* Image */}
        <div className="w-full h-40 bg-gray-100 border border-cream-border rounded overflow-hidden">
          {imgUrl ? (
            // Unsplash source redirects; using <img> is fine for demo
            <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No image</div>
          )}
        </div>
      </div>
      <div className="md:col-span-1">
        <div className="rounded border border-cream-border bg-white p-2 text-sm text-brand-brown">
          <div className="font-semibold text-sm mb-1">Weather</div>
          {loading && <div className="text-xs text-gray-500">Loading…</div>}
          {!loading && !weather && <div className="text-xs text-gray-500">No forecast available</div>}
          {!loading && weather && (
            <div className="space-y-1">
              <div className="text-sm">{weatherLabel(weather.weathercode)}</div>
              <div className="text-xs text-brand-brown/70">High {weather.tempMax?.toFixed?.(0)}° • Low {weather.tempMin?.toFixed?.(0)}°</div>
              <div className="text-xs text-brand-brown/70">Precip: {typeof weather.precipitation==='number' ? `${weather.precipitation} mm` : '–'}</div>
              <div className="text-[10px] text-gray-400 mt-1">Source: {weather.source||'open-meteo'}</div>
            </div>
          )}
          {geo && (
            <div className="mt-2 text-xs text-gray-500">{geo.display_name}</div>
          )}
        </div>
      </div>
    </div>
  );
}
