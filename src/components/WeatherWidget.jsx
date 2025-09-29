import { useEffect, useState } from 'react';
import { getWeatherByCityCountry } from '../utils/weatherApi';

export default function WeatherWidget({ city, country }){
  const [state, setState] = useState({ loading: false, error: '', data: null });

  useEffect(()=>{
    let alive = true;
    async function run(){
      if(!city && !country){ setState({ loading:false, error:'', data:null }); return; }
      setState(s => ({ ...s, loading: true, error: '' }));
      try{
        // Prefer city if present; if only country provided, try capital via name
        const c = city || '';
        const co = country || '';
        const data = await getWeatherByCityCountry(c || co, co || undefined);
        if(!alive) return;
        setState({ loading:false, error:'', data });
      }catch(e){
        if(!alive) return;
        setState({ loading:false, error:'Could not load weather', data:null });
      }
    }
    run();
    return ()=>{ alive = false; };
  }, [city, country]);

  if(!city && !country) return null;

  const { loading, error, data } = state;

  return (
    <div className="mb-4 p-3 rounded border border-cream-border bg-cream flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">
          Weather {data?.locationName ? `• ${data.locationName}` : (city || country || '')}
        </div>
        {loading && <div className="text-[12px] text-brand-brown/60">Loading…</div>}
        {error && <div role="alert" className="text-[12px] text-red-600">{error}</div>}
        {data && (
          <div className="text-[12px] text-brand-brown/80 flex items-center gap-2 flex-wrap">
            <span className="px-1 py-0.5 rounded bg-white border border-cream-border">
              {data.current.icon} {Math.round(data.current.temp)}°C
            </span>
            <span className="hidden sm:inline">
              {data.current.text} • wind {Math.round(data.current.wind)} km/h
            </span>
            {Number.isFinite(data.current.feelsLike) && (
              <span className="px-1 py-0.5 rounded bg-white border border-cream-border">feels {Math.round(data.current.feelsLike)}°C</span>
            )}
            {Number.isFinite(data.current.humidity) && (
              <span className="px-1 py-0.5 rounded bg-white border border-cream-border">humidity {Math.round(data.current.humidity)}%</span>
            )}
          </div>
        )}
      </div>
      {data && (
        <div className="flex items-center gap-2 overflow-x-auto">
          {data.forecast.map(f => (
            <div key={f.date} className="text-center px-2 py-1 rounded bg-white border border-cream-border min-w-[72px]">
              <div className="text-[10px] text-brand-brown/60">{new Date(f.date).toLocaleDateString(undefined,{ weekday:'short'})}</div>
              <div className="text-[16px]">{f.icon}</div>
              <div className="text-[11px] text-brand-brown/70">{Math.round(f.tmin)}–{Math.round(f.tmax)}°C</div>
              <div className="mt-0.5 flex items-center justify-center gap-1">
                {Number.isFinite(f.popMax) && (
                  <span className="text-[10px] text-brand-brown/60 px-1 py-0.5 rounded bg-cream-sand border border-cream-border" title="Max precipitation probability">{Math.round(f.popMax)}%</span>
                )}
                {Number.isFinite(f.uvMax) && (
                  <span className="text-[10px] text-brand-brown/60 px-1 py-0.5 rounded bg-cream-sand border border-cream-border" title="Max UV index">UV {Math.round(f.uvMax)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
