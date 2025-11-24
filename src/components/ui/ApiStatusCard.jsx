import React, { useEffect, useState } from 'react';

export default function ApiStatusCard(){
  const [health, setHealth] = useState(null);
  const [providers, setProviders] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState({ health: 0, providers: 0, events: 0 });
  const [lastError, setLastError] = useState(null);

  async function refresh(){
    setLoading(true); setError('');
    try {
      const t0 = performance.now();
      const h = await fetch('/health').then(r=>r.ok?r.json():Promise.reject(new Error('health failed')));
      setLatency(l => ({ ...l, health: Math.round(performance.now() - t0) }));
      setHealth(h);
    } catch(e){ setHealth(null); setError(e.message||'health failed'); setLastError({ at: Date.now(), message: e.message }); }
    try {
      const t0 = performance.now();
      const p = await fetch('/api/providers').then(r=>r.ok?r.json():Promise.reject(new Error('providers failed')));
      setLatency(l => ({ ...l, providers: Math.round(performance.now() - t0) }));
      setProviders(p);
    } catch(e){ setProviders(null); setError(prev=> prev || e.message || 'providers failed'); setLastError(prev => prev || { at: Date.now(), message: e.message }); }
    try {
      const t0 = performance.now();
      const ev = await fetch('/api/events/search?country=ZA&demo=1').then(r=>r.ok?r.json():Promise.reject(new Error('events failed')));
      setLatency(l => ({ ...l, events: Math.round(performance.now() - t0) }));
      setEvents(ev);
    } catch(e){ setEvents(null); setError(prev=> prev || e.message || 'events failed'); setLastError(prev => prev || { at: Date.now(), message: e.message }); }
    setLoading(false);
  }

  useEffect(()=>{ refresh(); }, []);

  const ok = (val)=> !!val;
  const providerList = Array.isArray(providers?.providers) ? providers.providers : (Array.isArray(providers)? providers : []);
  const eventsCount = Array.isArray(events?.events) ? events.events.length : 0;

  return (
    <div className="p-4 border border-cream-border bg-white rounded mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-brand-brown">API Status</h3>
        <button onClick={refresh} disabled={loading} className="text-xs px-2 py-1 border border-cream-border rounded bg-cream hover:bg-cream-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">{loading? 'Refreshing…' : 'Refresh'}</button>
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <ul className="text-sm text-brand-brown/80 space-y-1">
        <li>
          <span className="font-medium">Health:</span> {ok(health) ? <span className="text-green-700">OK</span> : <span className="text-red-600">Unavailable</span>}
          {health?.service ? <span className="ml-2 text-brand-brown/60">{health.service}</span> : null}
          {latency.health ? <span className="ml-2 text-brand-brown/50">{latency.health} ms</span> : null}
        </li>
        <li>
          <span className="font-medium">Providers API:</span> {ok(providers) ? <span className="text-green-700">OK</span> : <span className="text-red-600">Unavailable</span>}
          {providerList?.length>=0 ? <span className="ml-2 text-brand-brown/60">{providerList.length} configured</span> : null}
          {latency.providers ? <span className="ml-2 text-brand-brown/50">{latency.providers} ms</span> : null}
        </li>
        <li>
          <span className="font-medium">Events (demo):</span> {ok(events) ? <span className="text-green-700">OK</span> : <span className="text-red-600">Unavailable</span>}
          {ok(events) ? <span className="ml-2 text-brand-brown/60">{eventsCount} found</span> : null}
          {latency.events ? <span className="ml-2 text-brand-brown/50">{latency.events} ms</span> : null}
        </li>
      </ul>
      {lastError && (
        <div className="text-[11px] text-brand-brown/60 mt-2">Last error at {new Date(lastError.at).toLocaleTimeString()}: {lastError.message}</div>
      )}
    </div>
  );
}
