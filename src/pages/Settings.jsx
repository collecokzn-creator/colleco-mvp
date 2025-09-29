import React, { useEffect, useState } from 'react';
import ApiStatusCard from '../components/ui/ApiStatusCard.jsx';
import { getProviderToggles, updateProviderToggles } from '../utils/providerTogglesApi.js';
import { loadCustomAliases, saveCustomAliases } from '../utils/searchIntent.js';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toggles, setToggles] = useState([
    { name: 'ticketmaster', enabled: true },
    { name: 'seatgeek', enabled: true },
  ]);
  const [demoEvents, setDemoEvents] = useState(() => (localStorage.getItem('demoEvents') === '1'));
  const [smartAliases, setSmartAliases] = useState(() => (localStorage.getItem('smartAliases') !== '0'));
  const [customAliases, setCustomAliases] = useState(() => loadCustomAliases());
  const [newAlias, setNewAlias] = useState({ key: '', kind: 'city', value: '' });
  const [showWeather, setShowWeather] = useState(() => (localStorage.getItem('showWeather') !== '0'));

  async function refresh() {
    setError(''); setSuccess(''); setLoading(true);
    try {
      const list = await getProviderToggles();
      if (Array.isArray(list) && list.length) setToggles(list);
    } catch (e) {
      setError(e.message || 'Failed to load provider toggles');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function save() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await updateProviderToggles(toggles);
      setToggles(updated);
      setSuccess('Provider settings saved');
    } catch (e) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function toggleProvider(name) {
    setToggles(prev => prev.map(p => p.name === name ? { ...p, enabled: !p.enabled } : p));
  }

  function onDemoToggle() {
    const next = !demoEvents;
    setDemoEvents(next);
    localStorage.setItem('demoEvents', next ? '1' : '0');
  }

  function onSmartAliasesToggle(){
    const next = !smartAliases;
    setSmartAliases(next);
    localStorage.setItem('smartAliases', next ? '1' : '0');
  }

  function onShowWeatherToggle(){
    const next = !showWeather;
    setShowWeather(next);
    localStorage.setItem('showWeather', next ? '1' : '0');
    // Signal other tabs/components if open
    try { window.dispatchEvent(new StorageEvent('storage', { key: 'showWeather', newValue: next ? '1' : '0' })); } catch {}
  }

  function addCustomAlias(){
    const key = (newAlias.key||'').trim().toLowerCase();
    const value = (newAlias.value||'').trim();
    const kind = newAlias.kind;
    if(!key || !value){ setError('Alias key and value are required'); return; }
    // Replace existing if same key
    const next = customAliases.filter(a => (a && a.key) !== key);
    const record = { key };
    if(kind === 'area') record.area = value;
    else if(kind === 'city') record.city = value;
    else if(kind === 'province') record.province = value;
    else if(kind === 'country') record.country = value;
    else if(kind === 'continent') record.continent = value;
    next.push(record);
    setCustomAliases(next);
    saveCustomAliases(next);
    setNewAlias({ key: '', kind: kind, value: '' });
    setSuccess('Custom alias added'); setTimeout(()=>setSuccess(''), 1200);
  }

  function removeCustomAlias(key){
    const next = customAliases.filter(a => a.key !== key);
    setCustomAliases(next);
    saveCustomAliases(next);
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-3 text-brand-orange">Settings</h2>
      <ApiStatusCard />
      <div className="bg-cream-sand p-4 border border-cream-border space-y-4">
        <section>
          <h3 className="font-semibold text-brand-brown mb-2">Events Providers</h3>
          <p className="text-sm text-brand-brown/80 mb-3">Enable or disable trusted sources for events aggregation.</p>
          {loading ? (
            <div className="text-sm text-brand-brown">Loading…</div>
          ) : (
            <ul className="divide-y divide-cream-border">
              {toggles.map(p => (
                <li key={p.name} className="py-2 flex items-center justify-between">
                  <span className="capitalize text-brand-brown">{p.name}</span>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={p.enabled} onChange={() => toggleProvider(p.name)} />
                    <span>{p.enabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <button onClick={refresh} className="px-3 py-1.5 bg-white border border-cream-border text-brand-brown hover:bg-cream-sand/70">Refresh</button>
            <button onClick={save} disabled={saving} className="px-3 py-1.5 bg-brand-orange text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-700">{success}</p>}
        </section>

        <section className="pt-4 border-t border-cream-border">
          <h3 className="font-semibold text-brand-brown mb-2">Demo Data</h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={demoEvents} onChange={onDemoToggle} />
            <span>Show demo events (force demo results in Events UI)</span>
          </label>
          <p className="text-xs text-brand-brown/70 mt-1">This sets a local flag only. The server also auto-falls back to demo when no provider keys are configured.</p>
        </section>

        <section className="pt-4 border-t border-cream-border">
          <h3 className="font-semibold text-brand-brown mb-2">Weather</h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showWeather} onChange={onShowWeatherToggle} />
            <span>Show live weather in Planner</span>
          </label>
        </section>

        <section className="pt-4 border-t border-cream-border">
          <h3 className="font-semibold text-brand-brown mb-2">Smart Search</h3>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={smartAliases} onChange={onSmartAliasesToggle} />
            <span>Use location aliases (CPT, JHB, KZN…)</span>
          </label>
          <p className="text-xs text-brand-brown/70 mt-1">When enabled, common shorthand codes and nicknames are recognized in search (e.g., CPT → Cape Town, JHB → Johannesburg, KZN → KwaZulu-Natal).</p>
        </section>

        <section className="pt-4 border-t border-cream-border">
          <h3 className="font-semibold text-brand-brown mb-2">Custom Location Aliases</h3>
          <p className="text-sm text-brand-brown/80 mb-3">Add your own shortcuts (e.g., "PSB" → Port Shepstone). These merge with built-ins and only apply on this device.</p>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-xs text-brand-brown/70 mb-1">Alias key</label>
              <input className="w-full border border-cream-border px-2 py-1.5 bg-white" placeholder="e.g., psb" value={newAlias.key} onChange={e=>setNewAlias(v=>({...v, key:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-brand-brown/70 mb-1">Type</label>
              <select className="border border-cream-border px-2 py-1.5 bg-white" value={newAlias.kind} onChange={e=>setNewAlias(v=>({...v, kind:e.target.value}))}>
                <option value="area">Area</option>
                <option value="city">City</option>
                <option value="province">Province</option>
                <option value="country">Country</option>
                <option value="continent">Continent</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-brand-brown/70 mb-1">Maps to</label>
              <input className="w-full border border-cream-border px-2 py-1.5 bg-white" placeholder="e.g., Port Shepstone" value={newAlias.value} onChange={e=>setNewAlias(v=>({...v, value:e.target.value}))} />
            </div>
            <div>
              <button onClick={addCustomAlias} className="px-3 py-1.5 bg-brand-orange text-white">Add</button>
            </div>
          </div>
          {customAliases && customAliases.length ? (
            <ul className="mt-3 divide-y divide-cream-border">
              {customAliases.map(a => (
                <li key={a.key} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-brand-brown">
                    <span className="font-mono bg-white border border-cream-border px-1 py-0.5 mr-2">{a.key}</span>
                    {a.area ? `Area: ${a.area}` : a.city ? `City: ${a.city}` : a.province ? `Province: ${a.province}` : a.country ? `Country: ${a.country}` : a.continent ? `Continent: ${a.continent}` : ''}
                  </span>
                  <button onClick={()=>removeCustomAlias(a.key)} className="px-2 py-1 border border-cream-border bg-white text-brand-brown">Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-brown/70 mt-2">No custom aliases yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
