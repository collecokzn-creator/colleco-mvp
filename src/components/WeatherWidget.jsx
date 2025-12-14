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
    <div className="mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-blue-500 shadow-lg">
      {/* Current Weather & Quick Forecast */}
      <div className="p-4 sm:p-5">
        {loading && <div className="text-white/90 text-sm">Loading weather…</div>}
        {error && <div role="alert" className="text-white/90 text-sm bg-white/20 px-3 py-2 rounded-lg">{error}</div>}
        {data && (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white text-lg font-bold">Weather</h3>
                <p className="text-white/80 text-sm">{data.locationName || city || country || ''}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExtended(!showExtended)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
                aria-expanded={showExtended}
              >
                {showExtended ? '📊 Simple' : '📅 7-Day'}
              </button>
            </div>

            {/* Current Temperature & Condition */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="text-6xl sm:text-7xl">{data.current.icon}</div>
                <div>
                  <div className="text-5xl sm:text-6xl font-bold text-white">{Math.round(data.current.temp)}°</div>
                  <div className="text-white/90 text-lg">{data.current.text}</div>
                  {Number.isFinite(data.current.feelsLike) && (
                    <div className="text-white/70 text-sm mt-1">Feels like {Math.round(data.current.feelsLike)}°</div>
                  )}
                </div>
              </div>
                  </div>

            {/* Hourly Forecast (Simple View) */}
            {!showExtended && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between overflow-x-auto gap-3 pb-1">
                  {[0, 1, 2, 3, 4, 5].map((hourOffset) => {
                    const now = new Date();
                    const hour = new Date(now.getTime() + hourOffset * 60 * 60 * 1000);
                    const hourStr = hour.getHours();
                    const forecast = data.forecast[0]; // Today's forecast
                    const isNow = hourOffset === 0;
                    
                    return (
                      <div key={hourOffset} className="text-center flex-shrink-0">
                        <div className="text-white text-xs mb-1">{Math.round(data.current.temp)}°</div>
                        <div className="text-2xl mb-1">
                          {hourStr >= 6 && hourStr < 12 ? '🌤️' : 
                           hourStr >= 12 && hourStr < 18 ? (forecast.popMax > 40 ? '⛈️' : '☀️') :
                           hourStr >= 18 && hourStr < 20 ? '🌥️' : '🌙'}
                        </div>
                        {forecast.popMax > 30 && hourStr >= 12 && hourStr < 20 && (
                          <div className="text-white/80 text-xs">{Math.round(forecast.popMax)}%</div>
                        )}
                        <div className="text-white/70 text-xs mt-1">
                          {isNow ? 'Now' : `${String(hourStr).padStart(2, '0')}:00`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weekly Forecast (Simple View) */}
            {!showExtended && (
              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                {data.forecast.slice(0, 5).map(f => {
                  const date = new Date(f.date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={f.date} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 flex-shrink-0 min-w-[70px] text-center">
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <div className="text-white/90 text-xs font-medium">
                          {isToday ? 'Wed' : date.toLocaleDateString(undefined, { weekday: 'short' })}
                        </div>
                        {f.popMax > 30 && (
                          <div className="text-blue-200 text-xs">💧</div>
                        )}
                      </div>
                      <div className="text-2xl mb-1">{f.icon}</div>
                      <div className="text-white text-sm">{Math.round(f.tmax)}°/{Math.round(f.tmin)}°</div>
                      {f.popMax > 30 && (
                        <div className="text-white/70 text-xs mt-0.5">{Math.round(f.popMax)}%</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Trees Illustration (bottom) */}
      {data && !showExtended && (
        <div className="h-16 bg-gradient-to-t from-green-600 via-green-500 to-transparent relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-8 h-10 sm:h-12 bg-green-700 rounded-t-full" style={{ 
                height: `${Math.random() * 20 + 35}px`,
                opacity: 0.7 + Math.random() * 0.3
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Extended Forecast View */}
      {data && showExtended && (
        <div className="bg-white p-4 sm:p-5\">
          <div className="text-base font-semibold mb-4 text-gray-800">📅 7-Day Forecast</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3\">\n            {data.forecast.map(f => {
              const date = new Date(f.date);
              const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={f.date} className={`p-3 rounded-xl border-2 ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-center mb-2">
                    <div className={`text-sm font-semibold ${
                      isToday ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {isToday ? 'Today' : dayName}
                    </div>
                    <div className="text-xs text-gray-500">{dateStr}</div>
                  </div>
                  
                  <div className="text-center mb-2">
                    <div className="text-3xl mb-1">{f.icon}</div>
                    <div className="text-xs text-gray-600">{f.text}</div>
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">High:</span>
                      <span className="font-semibold text-gray-800">{Math.round(f.tmax)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Low:</span>
                      <span className="font-semibold text-gray-800">{Math.round(f.tmin)}°C</span>
                    </div>
                    
                    {Number.isFinite(f.popMax) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rain:</span>
                        <span className={`font-semibold ${
                          f.popMax > 60 ? 'text-blue-600' : 'text-gray-800'
                        }`}>{Math.round(f.popMax)}%</span>
                      </div>
                    )}
                    
                    {Number.isFinite(f.precipSum) && f.precipSum > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Precip:</span>
                        <span className="font-semibold text-blue-600">{f.precipSum.toFixed(1)}mm</span>
                      </div>
                    )}
                    
                    {Number.isFinite(f.uvMax) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">UV:</span>
                        <span className={`font-semibold ${
                          f.uvMax >= 8 ? 'text-red-600' : f.uvMax >= 6 ? 'text-orange-600' : 'text-gray-800'
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
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-sm font-semibold mb-2 text-blue-900">📦 Packing Suggestions</div>
            <div className="text-xs text-blue-800 space-y-1">
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
