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
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-lg backdrop-blur-sm">
      {/* Current Weather - Premium Design */}
      <div className="bg-gradient-to-br from-sky-400/90 via-blue-500/90 to-indigo-600/90 p-5 sm:p-6 text-white relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="relative z-10">
          {loading && <div className="text-white/90 text-sm animate-pulse">Loading weather data...</div>}
          {error && <div role="alert" className="text-white bg-red-500/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-xl text-sm">{error}</div>}
          {data && (
            <div>
              {/* Location */}
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm">
                  {data.locationName || city || country || ''}
                </h3>
                <div className="text-white/80 text-xs sm:text-sm mt-0.5">{data.current.text}</div>
              </div>

              {/* Current Temp & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-7xl sm:text-8xl drop-shadow-lg">{data.current.icon}</div>
                  <div>
                    <div className="text-6xl sm:text-7xl font-extralight tracking-tighter">{Math.round(data.current.temp)}°</div>
                    {Number.isFinite(data.current.feelsLike) && (
                      <div className="text-white/70 text-xs mt-1">Feels {Math.round(data.current.feelsLike)}°</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {(Number.isFinite(data.current.humidity) || Number.isFinite(data.current.windSpeed)) && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
                  {Number.isFinite(data.current.humidity) && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-lg">💧</span>
                      <span className="text-white/90">{Math.round(data.current.humidity)}%</span>
                    </div>
                  )}
                  {Number.isFinite(data.current.windSpeed) && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-lg">💨</span>
                      <span className="text-white/90">{Math.round(data.current.windSpeed)} km/h</span>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowExtended(!showExtended)}
                className="w-full mt-4 text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium transition-all border border-white/30"
                aria-expanded={showExtended}
              >
                {showExtended ? '← 5-Day View' : 'View 7-Day Details →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5-Day Forecast (Simple View) - Premium Compact */}
      {data && !showExtended && (
        <div className="p-4 sm:p-5 bg-white/50 backdrop-blur-sm">
          <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 scrollbar-hide">
            {data.forecast.slice(0, 5).map((f, idx) => {
              const date = new Date(f.date);
              const isToday = date.toDateString() === new Date().toDateString();
              const dayName = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });
              
              return (
                <div 
                  key={f.date} 
                  className={`flex-shrink-0 w-20 sm:w-24 p-3 sm:p-4 rounded-2xl text-center transition-all hover:scale-105 ${
                    isToday 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className={`text-xs font-bold mb-2 uppercase tracking-wide ${
                    isToday ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {dayName}
                  </div>
                  <div className="text-4xl my-2">{f.icon || '☀️'}</div>
                  <div className="space-y-0.5">
                    <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(f.tmax)}°
                    </div>
                    <div className={`text-xs ${isToday ? 'text-white/70' : 'text-gray-500'}`}>
                      {Math.round(f.tmin)}°
                    </div>
                  </div>
                  {Number.isFinite(f.popMax) && f.popMax > 20 && (
                    <div className={`mt-2 text-xs font-medium flex items-center justify-center gap-1 ${
                      isToday ? 'text-white/90' : 'text-blue-600'
                    }`}>
                      <span>💧</span>
                      <span>{Math.round(f.popMax)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extended 7-Day Forecast - Premium */}
      {data && showExtended && (
        <div className="bg-gradient-to-br from-white to-blue-50/20 p-4 sm:p-6">
          <h4 className="text-base font-bold mb-5 text-gray-800 flex items-center gap-2">
            <span className="text-xl">📅</span>
            7-Day Detailed Forecast
          </h4>
          <div className="space-y-3">
            {data.forecast.map((f, idx) => {
              const date = new Date(f.date);
              const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={f.date} 
                  className={`rounded-2xl p-4 transition-all hover:scale-[1.02] ${
                    isToday 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Date & Icon */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-5xl">{f.icon || '☀️'}</div>
                      <div>
                        <div className={`font-bold text-base sm:text-lg ${
                          isToday ? 'text-white' : 'text-gray-900'
                        }`}>
                          {isToday ? 'Today' : dayName}
                        </div>
                        <div className={`text-xs ${isToday ? 'text-white/80' : 'text-gray-500'}`}>
                          {dateStr} • {f.text || 'Clear'}
                        </div>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="text-right">
                      <div className={`text-3xl sm:text-4xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                        {Math.round(f.tmax)}°
                      </div>
                      <div className={`text-sm ${isToday ? 'text-white/70' : 'text-gray-500'}`}>
                        Low {Math.round(f.tmin)}°
                      </div>
                    </div>
                  </div>

                  {/* Weather Details Grid */}
                  {(Number.isFinite(f.popMax) || Number.isFinite(f.precipSum) || Number.isFinite(f.uvMax)) && (
                    <div className={`mt-4 pt-4 grid grid-cols-3 gap-3 text-xs ${
                      isToday ? 'border-t border-white/20' : 'border-t border-gray-200'
                    }`}>
                      {Number.isFinite(f.popMax) && f.popMax > 0 && (
                        <div className="text-center">
                          <div className={`text-lg mb-1 ${isToday ? 'opacity-90' : ''}`}>💧</div>
                          <div className={`font-semibold ${
                            isToday ? 'text-white' : f.popMax > 60 ? 'text-blue-600' : 'text-gray-700'
                          }`}>
                            {Math.round(f.popMax)}%
                          </div>
                          <div className={isToday ? 'text-white/70' : 'text-gray-500'}>Rain</div>
                        </div>
                      )}
                      
                      {Number.isFinite(f.uvMax) && f.uvMax > 0 && (
                        <div className="text-center">
                          <div className={`text-lg mb-1 ${isToday ? 'opacity-90' : ''}`}>☀️</div>
                          <div className={`font-semibold ${
                            isToday ? 'text-white' : 
                            f.uvMax >= 8 ? 'text-red-600' : 
                            f.uvMax >= 6 ? 'text-orange-500' : 'text-gray-700'
                          }`}>
                            {Math.round(f.uvMax)}
                          </div>
                          <div className={isToday ? 'text-white/70' : 'text-gray-500'}>UV Index</div>
                        </div>
                      )}

                      {Number.isFinite(f.precipSum) && f.precipSum > 0 && (
                        <div className="text-center">
                          <div className={`text-lg mb-1 ${isToday ? 'opacity-90' : ''}`}>🌧️</div>
                          <div className={`font-semibold ${isToday ? 'text-white' : 'text-blue-600'}`}>
                            {f.precipSum.toFixed(1)}
                          </div>
                          <div className={isToday ? 'text-white/70' : 'text-gray-500'}>mm</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Travel Tips */}
                  {(f.popMax > 50 || f.uvMax >= 7 || f.tmax >= 30 || f.tmax <= 10) && (
                    <div className={`mt-3 pt-3 flex flex-wrap gap-2 ${
                      isToday ? 'border-t border-white/20' : 'border-t border-gray-200'
                    }`}>
                      {f.popMax > 50 && (
                        <div className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${
                          isToday ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          ☂️ Umbrella
                        </div>
                      )}
                      {f.uvMax >= 7 && (
                        <div className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${
                          isToday ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                        }`}>
                          🧴 Sunscreen
                        </div>
                      )}
                      {f.tmax >= 30 && (
                        <div className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${
                          isToday ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                        }`}>
                          💧 Hydrate
                        </div>
                      )}
                      {f.tmax <= 10 && (
                        <div className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${
                          isToday ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          🧥 Layer up
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Packing Suggestions - Streamlined */}
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎒</span>
              <h5 className="text-sm font-bold text-gray-900">Smart Packing Guide</h5>
            </div>
            <div className="text-xs sm:text-sm text-gray-700 space-y-2">
              {data.forecast.some(f => f.popMax > 40) && (
                <div className="flex items-start gap-2.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Pack rain gear - showers expected</span>
                </div>
              )}
              {data.forecast.some(f => f.uvMax >= 7) && (
                <div className="flex items-start gap-2.5">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>High UV - bring sunscreen & hat</span>
                </div>
              )}
              {data.forecast.some(f => f.tmax >= 28) && (
                <div className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Lightweight clothing recommended</span>
                </div>
              )}
              {data.forecast.some(f => f.tmin <= 15) && (
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Bring layers for cool evenings</span>
                </div>
              )}
              {data.forecast.some(f => f.tmax - f.tmin > 15) && (
                <div className="flex items-start gap-2.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Temperature swings - pack versatile layers</span>
                </div>
              )}
              {!data.forecast.some(f => f.popMax > 40 || f.uvMax >= 7 || f.tmax >= 28 || f.tmin <= 15 || f.tmax - f.tmin > 15) && (
                <div className="text-gray-600 italic text-center py-2">✨ Perfect conditions - standard attire</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
