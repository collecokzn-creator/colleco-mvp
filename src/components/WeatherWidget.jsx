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
    <div className="rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100">
      {/* Current Weather - Professional Design */}
      <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 p-4 sm:p-5 border-b border-gray-100">
        {loading && <div className="text-gray-600 text-sm">Loading weather data...</div>}
        {error && <div role="alert" className="text-gray-700 text-sm bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>}
        {data && (
          <div>
            {/* Location & Current Conditions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-800 text-lg sm:text-xl font-semibold mb-1">
                  {data.locationName || city || country || ''}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-5xl sm:text-6xl">{data.current.icon}</div>
                  <div>
                    <div className="text-gray-700 text-sm mb-1">{data.current.text}</div>
                    {Number.isFinite(data.current.feelsLike) && (
                      <div className="text-gray-500 text-xs">Feels like {Math.round(data.current.feelsLike)}°C</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl sm:text-6xl font-light text-gray-800">{Math.round(data.current.temp)}°</div>
                <div className="text-xs text-gray-500 mt-1">Celsius</div>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowExtended(!showExtended)}
              className="w-full text-sm px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all shadow-sm border border-gray-200"
              aria-expanded={showExtended}
            >
              {showExtended ? '← Simple View' : 'View 7-Day Forecast →'}
            </button>
          </div>
        )}
      </div>

      {/* 5-Day Forecast (Simple View) */}
      {data && !showExtended && (
        <div className="p-4 bg-white">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {data.forecast.slice(0, 5).map((f, idx) => {
              const date = new Date(f.date);
              const isToday = date.toDateString() === new Date().toDateString();
              const dayName = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });
              
              return (
                <div 
                  key={f.date} 
                  className={`p-2.5 rounded-xl text-center transition-all ${
                    isToday 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-xs font-semibold mb-1.5 ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                    {dayName}
                  </div>
                  <div className="text-3xl mb-2">{f.icon || '☀️'}</div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-800">
                      {Math.round(f.tmax)}°
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(f.tmin)}°
                    </div>
                  </div>
                  {Number.isFinite(f.popMax) && f.popMax > 20 && (
                    <div className="mt-1.5 text-xs text-blue-600 font-medium">
                      {Math.round(f.popMax)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extended 7-Day Forecast */}
      {data && showExtended && (
        <div className="bg-white p-4 sm:p-6">
          <h4 className="text-base font-semibold mb-4 text-gray-800">7-Day Detailed Forecast</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {data.forecast.map((f, idx) => {
              const date = new Date(f.date);
              const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={f.date} 
                  className={`p-3.5 rounded-xl border-2 transition-all ${
                    isToday 
                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Date Header */}
                  <div className="text-center mb-3 pb-2 border-b border-gray-200">
                    <div className={`text-sm font-semibold ${
                      isToday ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {isToday ? 'Today' : dayName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{dateStr}</div>
                  </div>
                  
                  {/* Weather Icon & Description */}
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">{f.icon || '☀️'}</div>
                    <div className="text-xs text-gray-600 leading-tight">{f.text || 'Clear'}</div>
                  </div>
                  
                  {/* Temperature & Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">High</span>
                      <span className="font-semibold text-gray-800">{Math.round(f.tmax)}°C</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Low</span>
                      <span className="font-semibold text-gray-800">{Math.round(f.tmin)}°C</span>
                    </div>
                    
                    {Number.isFinite(f.popMax) && f.popMax > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Rain</span>
                        <span className={`font-semibold ${
                          f.popMax > 60 ? 'text-blue-600' : 'text-gray-700'
                        }`}>{Math.round(f.popMax)}%</span>
                      </div>
                    )}
                    
                    {Number.isFinite(f.precipSum) && f.precipSum > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Precip</span>
                        <span className="font-semibold text-blue-600">{f.precipSum.toFixed(1)}mm</span>
                      </div>
                    )}
                    
                    {Number.isFinite(f.uvMax) && f.uvMax > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">UV Index</span>
                        <span className={`font-semibold ${
                          f.uvMax >= 8 ? 'text-red-600' : f.uvMax >= 6 ? 'text-orange-500' : 'text-gray-700'
                        }`}>{Math.round(f.uvMax)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Travel Tips - Refined */}
                  {(f.popMax > 50 || f.uvMax >= 7 || f.tmax >= 30 || f.tmax <= 10) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                      {f.popMax > 50 && (
                        <div className="text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span>☂️</span>
                          <span>Bring umbrella</span>
                        </div>
                      )}
                      {f.uvMax >= 7 && (
                        <div className="text-[11px] text-orange-700 bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span>☀️</span>
                          <span>Sun protection</span>
                        </div>
                      )}
                      {f.tmax >= 30 && (
                        <div className="text-[11px] text-red-700 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span>🌡️</span>
                          <span>Stay hydrated</span>
                        </div>
                      )}
                      {f.tmax <= 10 && (
                        <div className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <span>🧥</span>
                          <span>Warm clothing</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Packing Suggestions - Professional */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎒</span>
              <h5 className="text-sm font-semibold text-gray-800">Packing Recommendations</h5>
            </div>
            <div className="text-xs text-gray-700 space-y-2">
              {data.forecast.some(f => f.popMax > 40) && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Rain gear recommended - precipitation expected during your trip</span>
                </div>
              )}
              {data.forecast.some(f => f.uvMax >= 7) && (
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Sunscreen and protective clothing for high UV exposure</span>
                </div>
              )}
              {data.forecast.some(f => f.tmax >= 28) && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Light, breathable fabrics suitable for warm conditions</span>
                </div>
              )}
              {data.forecast.some(f => f.tmin <= 15) && (
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Layered clothing for cool mornings and evenings</span>
                </div>
              )}
              {data.forecast.some(f => f.tmax - f.tmin > 15) && (
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>Versatile layers due to significant temperature variations</span>
                </div>
              )}
              {!data.forecast.some(f => f.popMax > 40 || f.uvMax >= 7 || f.tmax >= 28 || f.tmin <= 15 || f.tmax - f.tmin > 15) && (
                <div className="text-gray-600 italic">Conditions look favorable - standard travel attire recommended</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
