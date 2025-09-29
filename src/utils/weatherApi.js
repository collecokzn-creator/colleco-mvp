// Simple weather client using Open-Meteo (no API key required)
// Docs: https://open-meteo.com/

const WEATHER_CODE = {
  0: { text: 'Clear', icon: '☀️' },
  1: { text: 'Mainly clear', icon: '🌤️' },
  2: { text: 'Partly cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Fog', icon: '🌫️' },
  48: { text: 'Depositing rime fog', icon: '🌫️' },
  51: { text: 'Light drizzle', icon: '🌦️' },
  53: { text: 'Moderate drizzle', icon: '🌦️' },
  55: { text: 'Dense drizzle', icon: '🌧️' },
  56: { text: 'Light freezing drizzle', icon: '🌧️' },
  57: { text: 'Dense freezing drizzle', icon: '🌧️' },
  61: { text: 'Slight rain', icon: '🌦️' },
  63: { text: 'Moderate rain', icon: '🌧️' },
  65: { text: 'Heavy rain', icon: '🌧️' },
  66: { text: 'Light freezing rain', icon: '🌧️' },
  67: { text: 'Heavy freezing rain', icon: '🌧️' },
  71: { text: 'Slight snow', icon: '🌨️' },
  73: { text: 'Moderate snow', icon: '🌨️' },
  75: { text: 'Heavy snow', icon: '❄️' },
  77: { text: 'Snow grains', icon: '❄️' },
  80: { text: 'Rain showers (slight)', icon: '🌦️' },
  81: { text: 'Rain showers (moderate)', icon: '🌧️' },
  82: { text: 'Rain showers (violent)', icon: '⛈️' },
  85: { text: 'Snow showers (slight)', icon: '🌨️' },
  86: { text: 'Snow showers (heavy)', icon: '❄️' },
  95: { text: 'Thunderstorm', icon: '⛈️' },
  96: { text: 'Thunderstorm with hail (slight)', icon: '⛈️' },
  99: { text: 'Thunderstorm with hail (heavy)', icon: '⛈️' }
};

function codeToDesc(code){
  return WEATHER_CODE[code] || { text: 'Unknown', icon: '☁️' };
}

// --- Primitive in-memory caches (10 minutes TTL) ---
const TTL = 10 * 60 * 1000;
const geocodeCache = new Map(); // key: `${name}|${country}` -> { data, ts }
const weatherCache = new Map(); // key: `${lat}|${lon}|${days}` -> { data, ts }

export async function geocodeCity(name, country){
  const key = `${(name||'').toLowerCase()}|${(country||'').toLowerCase()}`;
  const cached = geocodeCache.get(key);
  if (cached && (Date.now() - cached.ts) < TTL) return cached.data;
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  if (country) url.searchParams.set('country', country);
  const res = await fetch(url.toString());
  if(!res.ok) throw new Error('Failed to geocode');
  const data = await res.json();
  const r = Array.isArray(data.results) && data.results[0];
  if(!r) throw new Error('Location not found');
  const out = { lat: r.latitude, lon: r.longitude, name: r.name, country_code: r.country_code };
  geocodeCache.set(key, { data: out, ts: Date.now() });
  return out;
}

export async function getWeather(lat, lon, days=5){
  const key = `${lat}|${lon}|${days}`;
  const cached = weatherCache.get(key);
  if (cached && (Date.now() - cached.ts) < TTL) return cached.data;
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,precipitation_sum');
  url.searchParams.set('forecast_days', String(days));
  url.searchParams.set('timezone', 'auto');
  const res = await fetch(url.toString());
  if(!res.ok) throw new Error('Failed to fetch weather');
  const data = await res.json();
  const cur = data.current || {};
  const daily = data.daily || {};
  const out = {
    current: {
      temp: cur.temperature_2m,
      feelsLike: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      wind: cur.wind_speed_10m,
      code: cur.weather_code,
      ...codeToDesc(cur.weather_code)
    },
    forecast: []
  };
  const len = Math.min((daily.time||[]).length, days);
  for(let i=0;i<len;i++){
    const code = (daily.weather_code||[])[i];
    out.forecast.push({
      date: daily.time[i],
      tmin: (daily.temperature_2m_min||[])[i],
      tmax: (daily.temperature_2m_max||[])[i],
      uvMax: (daily.uv_index_max||[])[i],
      popMax: (daily.precipitation_probability_max||[])[i],
      precipSum: (daily.precipitation_sum||[])[i],
      code,
      ...codeToDesc(code)
    });
  }
  weatherCache.set(key, { data: out, ts: Date.now() });
  return out;
}

export async function getWeatherByCityCountry(city, country){
  const { lat, lon, name } = await geocodeCity(city, country);
  const wx = await getWeather(lat, lon, 5);
  return { locationName: name, ...wx };
}
