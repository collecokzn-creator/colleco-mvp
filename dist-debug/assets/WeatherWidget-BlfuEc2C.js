import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
const WEATHER_CODE = {
  0: { text: "Clear", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Depositing rime fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Moderate drizzle", icon: "🌦️" },
  55: { text: "Dense drizzle", icon: "🌧️" },
  56: { text: "Light freezing drizzle", icon: "🌧️" },
  57: { text: "Dense freezing drizzle", icon: "🌧️" },
  61: { text: "Slight rain", icon: "🌦️" },
  63: { text: "Moderate rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Light freezing rain", icon: "🌧️" },
  67: { text: "Heavy freezing rain", icon: "🌧️" },
  71: { text: "Slight snow", icon: "🌨️" },
  73: { text: "Moderate snow", icon: "🌨️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "❄️" },
  80: { text: "Rain showers (slight)", icon: "🌦️" },
  81: { text: "Rain showers (moderate)", icon: "🌧️" },
  82: { text: "Rain showers (violent)", icon: "⛈️" },
  85: { text: "Snow showers (slight)", icon: "🌨️" },
  86: { text: "Snow showers (heavy)", icon: "❄️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail (slight)", icon: "⛈️" },
  99: { text: "Thunderstorm with hail (heavy)", icon: "⛈️" }
};
function codeToDesc(code) {
  return WEATHER_CODE[code] || { text: "Unknown", icon: "☁️" };
}
const TTL = 10 * 60 * 1e3;
const geocodeCache = /* @__PURE__ */ new Map();
const weatherCache = /* @__PURE__ */ new Map();
async function geocodeCity(name, country) {
  const key = `${(name || "").toLowerCase()}|${(country || "").toLowerCase()}`;
  const cached = geocodeCache.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  if (country) url.searchParams.set("country", country);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to geocode");
  const data = await res.json();
  const r = Array.isArray(data.results) && data.results[0];
  if (!r) throw new Error("Location not found");
  const out = { lat: r.latitude, lon: r.longitude, name: r.name, country_code: r.country_code };
  geocodeCache.set(key, { data: out, ts: Date.now() });
  return out;
}
async function getWeather(lat, lon, days = 5) {
  const key = `${lat}|${lon}|${days}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,precipitation_sum");
  url.searchParams.set("forecast_days", String(days));
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch weather");
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
  const len = Math.min((daily.time || []).length, days);
  for (let i = 0; i < len; i++) {
    const code = (daily.weather_code || [])[i];
    out.forecast.push({
      date: daily.time[i],
      tmin: (daily.temperature_2m_min || [])[i],
      tmax: (daily.temperature_2m_max || [])[i],
      uvMax: (daily.uv_index_max || [])[i],
      popMax: (daily.precipitation_probability_max || [])[i],
      precipSum: (daily.precipitation_sum || [])[i],
      code,
      ...codeToDesc(code)
    });
  }
  weatherCache.set(key, { data: out, ts: Date.now() });
  return out;
}
async function getWeatherByCityCountry(city, country) {
  const { lat, lon, name } = await geocodeCity(city, country);
  const wx = await getWeather(lat, lon, 5);
  return { locationName: name, ...wx };
}
function WeatherWidget({ city, country }) {
  const [state, setState] = reactExports.useState({ loading: false, error: "", data: null });
  const [showExtended, setShowExtended] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let alive = true;
    async function run() {
      if (!city && !country) {
        setState({ loading: false, error: "", data: null });
        return;
      }
      setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const c = city || "";
        const co = country || "";
        const data2 = await getWeatherByCityCountry(c || co, co || void 0);
        if (!alive) return;
        setState({ loading: false, error: "", data: data2 });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: "Could not load weather", data: null });
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [city, country]);
  if (!city && !country) return null;
  const { loading, error, data } = state;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-lg backdrop-blur-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-sky-400/90 via-blue-500/90 to-indigo-600/90 p-5 sm:p-6 text-white relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-10", style: {
        backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
        backgroundSize: "50px 50px"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/90 text-sm animate-pulse", children: "Loading weather data..." }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "text-white bg-red-500/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-xl text-sm", children: error }),
        data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm", children: data.locationName || city || country || "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/80 text-xs sm:text-sm mt-0.5", children: data.current.text })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-7xl sm:text-8xl drop-shadow-lg", children: data.current.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-6xl sm:text-7xl font-extralight tracking-tighter", children: [
                Math.round(data.current.temp),
                "°"
              ] }),
              Number.isFinite(data.current.feelsLike) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white/70 text-xs mt-1", children: [
                "Feels ",
                Math.round(data.current.feelsLike),
                "°"
              ] })
            ] })
          ] }) }),
          (Number.isFinite(data.current.humidity) || Number.isFinite(data.current.windSpeed)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-4 pt-4 border-t border-white/20", children: [
            Number.isFinite(data.current.humidity) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "💧" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/90", children: [
                Math.round(data.current.humidity),
                "%"
              ] })
            ] }),
            Number.isFinite(data.current.windSpeed) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "💨" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/90", children: [
                Math.round(data.current.windSpeed),
                " km/h"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowExtended(!showExtended),
              className: "w-full mt-4 text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium transition-all border border-white/30",
              "aria-expanded": showExtended,
              children: showExtended ? "← 5-Day View" : "View 7-Day Details →"
            }
          )
        ] })
      ] })
    ] }),
    data && !showExtended && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 sm:p-5 bg-white/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex overflow-x-auto gap-2 sm:gap-3 pb-2 scrollbar-hide", children: data.forecast.slice(0, 5).map((f, idx) => {
      const date = new Date(f.date);
      const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
      const dayName = isToday ? "Today" : date.toLocaleDateString(void 0, { weekday: "short" });
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex-shrink-0 w-20 sm:w-24 p-3 sm:p-4 rounded-2xl text-center transition-all hover:scale-105 ${isToday ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg" : "bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs font-bold mb-2 uppercase tracking-wide ${isToday ? "text-white/90" : "text-gray-600"}`, children: dayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl my-2", children: f.icon || "☀️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-lg font-bold ${isToday ? "text-white" : "text-gray-900"}`, children: [
                Math.round(f.tmax),
                "°"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs ${isToday ? "text-white/70" : "text-gray-500"}`, children: [
                Math.round(f.tmin),
                "°"
              ] })
            ] }),
            Number.isFinite(f.popMax) && f.popMax > 20 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-2 text-xs font-medium flex items-center justify-center gap-1 ${isToday ? "text-white/90" : "text-blue-600"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💧" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                Math.round(f.popMax),
                "%"
              ] })
            ] })
          ]
        },
        f.date
      );
    }) }) }),
    data && showExtended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-white to-blue-50/20 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-base font-bold mb-5 text-gray-800 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "📅" }),
        "7-Day Detailed Forecast"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data.forecast.map((f, idx) => {
        const date = new Date(f.date);
        const dayName = date.toLocaleDateString(void 0, { weekday: "long" });
        const dateStr = date.toLocaleDateString(void 0, { month: "short", day: "numeric" });
        const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `rounded-2xl p-4 transition-all hover:scale-[1.02] ${isToday ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg" : "bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl", children: f.icon || "☀️" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold text-base sm:text-lg ${isToday ? "text-white" : "text-gray-900"}`, children: isToday ? "Today" : dayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs ${isToday ? "text-white/80" : "text-gray-500"}`, children: [
                      dateStr,
                      " • ",
                      f.text || "Clear"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-3xl sm:text-4xl font-bold ${isToday ? "text-white" : "text-gray-900"}`, children: [
                    Math.round(f.tmax),
                    "°"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-sm ${isToday ? "text-white/70" : "text-gray-500"}`, children: [
                    "Low ",
                    Math.round(f.tmin),
                    "°"
                  ] })
                ] })
              ] }),
              (Number.isFinite(f.popMax) || Number.isFinite(f.precipSum) || Number.isFinite(f.uvMax)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-4 pt-4 grid grid-cols-3 gap-3 text-xs ${isToday ? "border-t border-white/20" : "border-t border-gray-200"}`, children: [
                Number.isFinite(f.popMax) && f.popMax > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg mb-1 ${isToday ? "opacity-90" : ""}`, children: "💧" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-semibold ${isToday ? "text-white" : f.popMax > 60 ? "text-blue-600" : "text-gray-700"}`, children: [
                    Math.round(f.popMax),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: isToday ? "text-white/70" : "text-gray-500", children: "Rain" })
                ] }),
                Number.isFinite(f.uvMax) && f.uvMax > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg mb-1 ${isToday ? "opacity-90" : ""}`, children: "☀️" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-semibold ${isToday ? "text-white" : f.uvMax >= 8 ? "text-red-600" : f.uvMax >= 6 ? "text-orange-500" : "text-gray-700"}`, children: Math.round(f.uvMax) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: isToday ? "text-white/70" : "text-gray-500", children: "UV Index" })
                ] }),
                Number.isFinite(f.precipSum) && f.precipSum > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg mb-1 ${isToday ? "opacity-90" : ""}`, children: "🌧️" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-semibold ${isToday ? "text-white" : "text-blue-600"}`, children: f.precipSum.toFixed(1) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: isToday ? "text-white/70" : "text-gray-500", children: "mm" })
                ] })
              ] }),
              (f.popMax > 50 || f.uvMax >= 7 || f.tmax >= 30 || f.tmax <= 10) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-3 pt-3 flex flex-wrap gap-2 ${isToday ? "border-t border-white/20" : "border-t border-gray-200"}`, children: [
                f.popMax > 50 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${isToday ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`, children: "☂️ Umbrella" }),
                f.uvMax >= 7 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${isToday ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"}`, children: "🧴 Sunscreen" }),
                f.tmax >= 30 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${isToday ? "bg-white/20 text-white" : "bg-red-100 text-red-700"}`, children: "💧 Hydrate" }),
                f.tmax <= 10 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium ${isToday ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"}`, children: "🧥 Layer up" })
              ] })
            ]
          },
          f.date
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🎒" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-sm font-bold text-gray-900", children: "Smart Packing Guide" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs sm:text-sm text-gray-700 space-y-2", children: [
          data.forecast.some((f) => f.popMax > 40) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pack rain gear - showers expected" })
          ] }),
          data.forecast.some((f) => f.uvMax >= 7) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-600 font-bold", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "High UV - bring sunscreen & hat" })
          ] }),
          data.forecast.some((f) => f.tmax >= 28) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-bold", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Lightweight clothing recommended" })
          ] }),
          data.forecast.some((f) => f.tmin <= 15) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-indigo-600 font-bold", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bring layers for cool evenings" })
          ] }),
          data.forecast.some((f) => f.tmax - f.tmin > 15) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-600 font-bold", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Temperature swings - pack versatile layers" })
          ] }),
          !data.forecast.some((f) => f.popMax > 40 || f.uvMax >= 7 || f.tmax >= 28 || f.tmin <= 15 || f.tmax - f.tmin > 15) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-600 italic text-center py-2", children: "✨ Perfect conditions - standard attire" })
        ] })
      ] })
    ] })
  ] });
}
export {
  WeatherWidget as W
};
//# sourceMappingURL=WeatherWidget-BlfuEc2C.js.map
