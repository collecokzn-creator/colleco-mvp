import { useEffect, useState } from 'react';
import { getWeatherByCityCountry } from '../utils/weatherApi';

export default function WeatherWidget({ city, country }){
  const [state, setState] = useState({ loading: false, error: '', data: null });
  const [showExtended, setShowExtended] = useState(false);

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
    <div className="mb-4 rounded border border-cream-border bg-cream">
      {/* Current Weather & Quick Forecast */}
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold flex items-center gap-2">
            Weather {data?.locationName ? `• ${data.locationName}` : (city || country || '')}
            {data && (
              <button
                type="button"
                onClick={() => setShowExtended(!showExtended)}
                className="text-[11px] px-2 py-0.5 rounded border border-cream-border bg-white hover:bg-cream-hover"
                aria-expanded={showExtended}
              >
                {showExtended ? 'Simple' : 'Detailed'}
              </button>
            )}
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
        {data && !showExtended && (
          <div className="flex items-center gap-2 overflow-x-auto">
            {data.forecast.slice(0, 3).map(f => (
              <div key={f.date} className="text-center px-2 py-1 rounded bg-white border border-cream-border min-w-[72px]">
                <div className="text-[10px] text-brand-brown/60">{new Date(f.date).toLocaleDateString(undefined,{ weekday:'short'})}</div>
                <div className="text-[16px]">{f.icon}</div>
                <div className="text-[11px] text-brand-brown/70">{Math.round(f.tmin)}–{Math.round(f.tmax)}°C</div>
                {Number.isFinite(f.popMax) && f.popMax > 20 && (
                  <div className="text-[10px] text-brand-brown/60">{Math.round(f.popMax)}%</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extended Forecast View for Travelers */}
      {data && showExtended && (
        <div className="border-t border-cream-border p-3 bg-white/50">
          <div className="text-sm font-semibold mb-3 text-brand-russty/80">Travel Weather Forecast</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {data.forecast.map(f => {
              const date = new Date(f.date);
              const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={f.date} className={`p-3 rounded border ${
                  isToday ? 'bg-brand-sand/20 border-brand-brown/30' : 'bg-white border-cream-border'
                }`}>
                  <div className="text-center mb-2">
                    <div className={`text-xs font-semibold ${
                      isToday ? 'text-brand-brown' : 'text-brand-brown/60'
                    }`}>
                      {isToday ? 'Today' : dayName}
                    </div>
                    <div className="text-[10px] text-brand-brown/50">{dateStr}</div>
                  </div>
                  
                  <div className="text-center mb-2">
                    <div className="text-3xl mb-1">{f.icon}</div>
                    <div className="text-xs text-brand-brown/70">{f.text}</div>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-brown/60">High:</span>
                      <span className="font-semibold text-brand-brown">{Math.round(f.tmax)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-brown/60">Low:</span>
                      <span className="font-semibold text-brand-brown">{Math.round(f.tmin)}°C</span>
                    </div>
                    
                    {Number.isFinite(f.popMax) && (
                      <div className="flex justify-between items-center">
                        <span className="text-brand-brown/60">Rain:</span>
                        <span className={`font-semibold ${
                          f.popMax > 60 ? 'text-blue-600' : 'text-brand-brown'
                        }`}>{Math.round(f.popMax)}%</span>
                      </div>
                    )}
                    
                    {Number.isFinite(f.precipSum) && f.precipSum > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-brand-brown/60">Precip:</span>
                        <span className="font-semibold text-blue-600">{f.precipSum.toFixed(1)}mm</span>
                      </div>
                    )}
                    
                    {Number.isFinite(f.uvMax) && (
                      <div className="flex justify-between items-center">
                        <span className="text-brand-brown/60">UV:</span>
                        <span className={`font-semibold ${
                          f.uvMax >= 8 ? 'text-red-600' : f.uvMax >= 6 ? 'text-orange-600' : 'text-brand-brown'
                        }`}>{Math.round(f.uvMax)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Travel Tips */}
                  <div className="mt-2 pt-2 border-t border-cream-border">
                    {f.popMax > 60 && (
                      <div className="text-[10px] text-blue-700 bg-blue-50 px-2 py-1 rounded mb-1">
                        🌂 Pack an umbrella
                      </div>
                    )}
                    {f.uvMax >= 8 && (
                      <div className="text-[10px] text-orange-700 bg-orange-50 px-2 py-1 rounded mb-1">
                        ☀️ High UV - use sunscreen
                      </div>
                    )}
                    {f.tmax >= 30 && (
                      <div className="text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded mb-1">
                        🌡️ Hot day - stay hydrated
                      </div>
                    )}
                    {f.tmax <= 10 && (
                      <div className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        🧥 Pack warm clothing
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Packing Suggestions */}
          <div className="mt-4 p-3 bg-brand-sand/10 rounded border border-brand-brown/20">
            <div className="text-xs font-semibold mb-2 text-brand-brown">📦 Packing Suggestions</div>
            <div className="text-[11px] text-brand-brown/80 space-y-1">
              {data.forecast.some(f => f.popMax > 40) && (
                <div>• Rain gear recommended (chance of precipitation)</div>
              )}
              {data.forecast.some(f => f.uvMax >= 7) && (
                <div>• Sunscreen and sun protection (high UV expected)</div>
              )}
              {data.forecast.some(f => f.tmax >= 28) && (
                <div>• Light, breathable clothing for warm weather</div>
              )}
              {data.forecast.some(f => f.tmin <= 15) && (
                <div>• Warm layers for cool mornings/evenings</div>
              )}
              {data.forecast.some(f => f.tmax - f.tmin > 15) && (
                <div>• Layers recommended (large temperature variation)</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
