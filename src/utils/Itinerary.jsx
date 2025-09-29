import React, { useEffect, useState, useMemo } from 'react';
import { buildGoogleMapsUrl, buildTrailUrl, buildGoogleCalendarUrl, buildSingleICS, buildCombinedICS, downloadICS } from './itineraryLinks';
import { useLocalItinerary } from './useLocalItinerary';
import { mediaFor } from './itineraryMedia';
import useInViewOnce from './useInViewOnce';

const DATA_URL = '/assets/data/itinerary.json';

export default function Itinerary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const { overlay, addCustomItem, removeCustomItem, toggleDone, clearAll } = useLocalItinerary();

  const [form, setForm] = useState({ day: '', title: '', start: '', end: '', location: '' });
  const [dark, setDark] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('itineraryTheme') === 'dark' : false));
  const [activeTags, setActiveTags] = useState(() => {
    try { return JSON.parse(localStorage.getItem('itineraryTags')||'[]'); } catch { return []; }
  });
  // NEW: import/export state
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importMergeMode, setImportMergeMode] = useState('merge'); // 'merge' | 'replace'
  // NEW: focus mode
  const [focusMode, setFocusMode] = useState(() => {
    try { return localStorage.getItem('itineraryFocusMode') === '1'; } catch { return false; }
  });
  useEffect(()=>{ try { localStorage.setItem('itineraryTheme', dark ? 'dark':'light'); } catch{} },[dark]);
  useEffect(()=>{ try { localStorage.setItem('itineraryTags', JSON.stringify(activeTags)); } catch{} },[activeTags]);
  useEffect(()=>{ try { localStorage.setItem('itineraryFocusMode', focusMode ? '1':'0'); } catch{} }, [focusMode]);
  // NEW: background sync hash state (will be used by update badge task)
  const [lastHash, setLastHash] = useState(null);
  const [latestHash, setLatestHash] = useState(null);
  const updateAvailable = latestHash && lastHash && latestHash !== lastHash;

  useEffect(()=>{
    // Capture initial hash after first successful load (derive from items JSON stable string)
    try {
      const current = JSON.stringify(items.map(i=>({id:i.id,start:i.start,end:i.end})));
      let h = 0, idx = 0; while (idx < current.length) { h = (Math.imul(31, h) + current.charCodeAt(idx++))|0; }
      const hash = (h>>>0).toString(16);
      if (!lastHash) { setLastHash(hash); setLatestHash(hash); }
    } catch {}
  }, [items, lastHash]);

  useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async reg => {
        // Register one-off sync
        if ('sync' in reg) {
          try {
            await reg.sync.register('itinerary-sync');
          } catch (e) {
            // ignore
          }
        }
        // Attempt periodic sync
        if ('periodicSync' in reg) {
          try {
            await reg.periodicSync.register('itinerary-sync', { minInterval: 1000 * 60 * 15 });
          } catch (e) {
            // ignore
          }
        }
      });
      // Listen for SW messages
      const handler = (e) => {
        const msg = e.data;
        if (msg && msg.type === 'ITINERARY_SYNC_RESULT' && msg.hash) {
          setLatestHash(msg.hash);
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => navigator.serviceWorker.removeEventListener('message', handler);
    }
  }, [lastHash]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to load itinerary');
        const json = await res.json();
        if (!isMounted) return;
        setItems(json.items || []);
        setMeta(json.meta || null);
        setError(null);
      } catch (e) {
        if (isMounted) setError(e.message || 'Error loading itinerary');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [lastRefreshed]);

  const merged = useMemo(() => {
    const byDay = {};
    for (const it of items) {
      const d = it.day || 0; (byDay[d] = byDay[d] || []).push(it);
    }
    for (const [d, arr] of Object.entries(overlay.custom)) {
      const dayNum = Number(d); (byDay[dayNum] = byDay[dayNum] || []).push(...arr.map(i => ({ ...i, _local: true })));
    }
    Object.keys(byDay).forEach(d => {
      byDay[d].sort((a,b) => new Date(a.start || 0) - new Date(b.start || 0));
    });
    return byDay;
  }, [items, overlay]);

  const flatMerged = useMemo(() => Object.values(merged).flat(), [merged]);
  const dayNumbers = Object.keys(merged).map(Number).sort((a,b) => a-b);

  function handleDownloadItemICS(item) {
    const ics = buildSingleICS(item);
    downloadICS(ics, `${sanitizeFilename(item.title || item.id)}.ics`);
  }
  function handleDownloadAllICS() {
    const ics = buildCombinedICS(flatMerged);
    downloadICS(ics, `${sanitizeFilename(meta?.title || 'itinerary')}.ics`);
  }
  function handleAddCustom(e) {
    e.preventDefault();
    if (!form.day || !form.title) return;
    const day = Number(form.day);
    const start = form.start ? new Date(form.start).toISOString() : undefined;
    const end = form.end ? new Date(form.end).toISOString() : undefined;
    addCustomItem(day, {
      title: form.title,
      start,
      end,
      location: form.location || undefined,
      type: 'custom'
    });
    setForm({ day: '', title: '', start: '', end: '', location: '' });
  }
  function handleRefresh() {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_ITINERARY_CACHE' });
    }
    setLastRefreshed(Date.now());
  }

  // NEW: Export overlay
  function handleExportOverlay() {
    try {
      const data = JSON.stringify(overlay, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `itinerary-local-overlay-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  }

  // NEW: Validate imported overlay shape
  function validateOverlayShape(obj) {
    if (typeof obj !== 'object' || !obj) return false;
    if (typeof obj.custom !== 'object' || typeof obj.done !== 'object') return false;
    // custom days
    for (const [day, arr] of Object.entries(obj.custom)) {
      if (!Array.isArray(arr)) return false;
      for (const it of arr) {
        if (typeof it !== 'object' || !it) return false;
        if (!it.title) return false;
      }
    }
    return true;
  }

  // NEW: Import overlay from file
  async function handleImportOverlayFile(file) {
    setImportError('');
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!validateOverlayShape(json)) throw new Error('Invalid overlay structure');
      // Merge or replace
      if (importMergeMode === 'replace') {
        // Direct replace localStorage key (using clearAll then applying new)
        // We'll simulate replace by clearing then iterating new custom & done
        clearAll();
        // Delay state commit to next tick so clearAll takes effect
        setTimeout(()=>applyImported(json, true), 0);
      } else {
        applyImported(json, false);
      }
      setImporting(false);
    } catch (e) {
      console.error(e);
      setImportError(e.message || 'Import failed');
    }
  }

  function applyImported(json, replacing) {
    try {
      // custom
      for (const [d, arr] of Object.entries(json.custom || {})) {
        for (const item of arr) {
          addCustomItem(Number(d), item);
        }
      }
      // done flags
      for (const [id, val] of Object.entries(json.done || {})) {
        if (val) {
          // ensure done
          if (!overlay.done[id]) toggleDone(id); // toggling only sets true if previously false
        } else if (overlay.done[id]) {
          toggleDone(id); // unset if currently true
        }
      }
    } catch (e) {
      console.error('Apply import error', e);
    }
  }

  const allTags = useMemo(()=>Array.from(new Set(flatMerged.flatMap(i=>i.tags||[]))).sort(), [flatMerged]);
  const filteredMerged = useMemo(()=>{
    let base = merged;
    if (activeTags.length) {
      const out = {};
      for (const [day, arr] of Object.entries(base)) {
        const filt = arr.filter(i => (i.tags||[]).some(t=>activeTags.includes(t)));
        if (filt.length) out[day]=filt;
      }
      base = out;
    }
    if (focusMode) {
      const out2 = {};
      for (const [day, arr] of Object.entries(base)) {
        const remain = arr.filter(i => !overlay.done[i.id]);
        if (remain.length) out2[day] = remain;
      }
      base = out2;
    }
    return base;
  }, [merged, activeTags, focusMode, overlay.done]);
  const filteredDayNumbers = Object.keys(filteredMerged).map(Number).sort((a,b)=>a-b);

  const totalCount = flatMerged.length;
  const doneCount = flatMerged.filter(i=>overlay.done[i.id]).length;
  const percent = totalCount ? Math.round(doneCount/totalCount*100) : 0;

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading itinerary...</div>;
  }
  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className={`p-4 max-w-4xl mx-auto ${dark ? 'dark-itinerary' : ''}`}> 
      <header className="mb-6 flex flex-col gap-4">
        {updateAvailable && (
          <div className="flex items-center justify-between gap-4 bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded text-[11px] shadow-sm animate-fadeIn">
            <span className="font-medium">Itinerary updated in background.</span>
            <div className="flex gap-2">
              <button onClick={()=>{ handleRefresh(); setLastHash(latestHash); }} className="px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-500">Reload</button>
              <button onClick={()=>setLastHash(latestHash)} className="px-2 py-1 rounded border border-amber-400 text-amber-700 hover:bg-amber-200">Dismiss</button>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              {meta?.title || 'Itinerary'}
              <button onClick={()=>setDark(d=>!d)} className="px-2 py-1 text-[11px] rounded border border-gray-300 bg-gray-50 hover:bg-gray-100">
                {dark ? 'Light' : 'Dark'}
              </button>
            </h2>
            {meta?.generated && (
              <p className="text-xs text-gray-500">Generated: {new Date(meta.generated).toLocaleString()}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-[11px] text-gray-600 bg-gray-100 rounded px-2 py-1">
              <span className="font-medium mr-1">Progress:</span>{doneCount}/{totalCount} ({percent}%)
            </div>
            <button onClick={handleDownloadAllICS} className="px-3 py-2 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500">
              Download Full ICS
            </button>
            <button onClick={handleRefresh} className="px-3 py-2 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 relative">
              Refresh
              {updateAvailable && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border border-white" />}
            </button>
            <button onClick={handleExportOverlay} className="px-3 py-2 text-xs font-medium rounded bg-gray-700 text-white hover:bg-gray-600">
              Export Local
            </button>
            <button onClick={()=>{setImportError(''); setImporting(i=>!i);}} className="px-3 py-2 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-500">
              {importing ? 'Cancel Import' : 'Import Local'}
            </button>
            <button onClick={()=>setFocusMode(f=>!f)} className={`px-3 py-2 text-xs font-medium rounded border ${focusMode ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-500':'bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100'}`}>{focusMode ? 'Show All' : 'Focus Mode'}</button>
          </div>
        </div>
        {importing && (
          <div className="w-full border border-indigo-200 rounded p-3 bg-indigo-50/60 flex flex-col gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-indigo-700">Import Overlay</strong>
              <label className="flex items-center gap-1 text-indigo-700">
                <input type="radio" name="mergeMode" value="merge" checked={importMergeMode==='merge'} onChange={()=>setImportMergeMode('merge')} /> Merge
              </label>
              <label className="flex items-center gap-1 text-indigo-700">
                <input type="radio" name="mergeMode" value="replace" checked={importMergeMode==='replace'} onChange={()=>setImportMergeMode('replace')} /> Replace
              </label>
              <input type="file" accept="application/json" onChange={e=>handleImportOverlayFile(e.target.files?.[0])} className="text-[10px]" />
              {importError && <span className="text-red-600 font-medium">{importError}</span>}
            </div>
            <p className="text-[10px] text-indigo-600 leading-snug">Provide a previously exported JSON file. Merge keeps existing local items and adds/matches done flags; Replace discards current local overlay first.</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-medium text-gray-600">Filter tags:</span>
          {allTags.map(tag => {
            const active = activeTags.includes(tag);
            return <button key={tag} onClick={()=>setActiveTags(a=>active? a.filter(t=>t!==tag): [...a, tag])} className={`px-2 py-1 rounded border text-[10px] tracking-wide uppercase ${active ? 'bg-emerald-600 border-emerald-600 text-white':'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{tag}</button>;
          })}
          {activeTags.length>0 && <button onClick={()=>setActiveTags([])} className="px-2 py-1 rounded text-[10px] bg-gray-200 hover:bg-gray-300">Clear</button>}
        </div>
      </header>

      <form onSubmit={handleAddCustom} className="mb-8 grid gap-2 sm:grid-cols-5 bg-gray-50 p-3 rounded border border-gray-200 text-[11px] items-end">
        <div className="flex flex-col gap-1">
          <label className="font-medium">Day</label>
          <input value={form.day} onChange={e=>setForm(f=>({...f, day:e.target.value}))} className="input-xs" type="number" min="1" required />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-medium">Title</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} className="input-xs" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium">Start</label>
          <input value={form.start} onChange={e=>setForm(f=>({...f, start:e.target.value}))} className="input-xs" type="datetime-local" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium">End</label>
          <input value={form.end} onChange={e=>setForm(f=>({...f, end:e.target.value}))} className="input-xs" type="datetime-local" />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="font-medium">Location</label>
          <input value={form.location} onChange={e=>setForm(f=>({...f, location:e.target.value}))} className="input-xs" />
        </div>
        <div className="flex gap-2 sm:col-span-3">
          <button type="submit" className="mt-4 px-3 py-2 text-xs font-medium rounded bg-gray-800 text-white hover:bg-gray-700">Add Custom Item</button>
          <button type="button" onClick={clearAll} className="mt-4 px-3 py-2 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-400">Reset Local</button>
        </div>
      </form>

      {filteredDayNumbers.map(day => (
        <section key={day} className="mb-10 relative">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow">{day}</span>
            <span>Day {day}</span>
          </h3>
          <ul className="space-y-6 border-l border-dashed border-emerald-300 pl-4 ml-4">
            {filteredMerged[day].map((item, idx) => {
              const media = mediaFor(item);
              const [ref, inView] = useInViewOnce();
              return (
                <li ref={ref} key={item.id} className={`relative group ${inView ? 'animate-fadeIn' : 'opacity-0 translate-y-1'}`}>                    
                  <span className="absolute -left-5 top-3 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
                  <div className={`rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${item._local ? 'ring-1 ring-indigo-200' : ''}`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-40 w-full h-28 md:h-auto shrink-0 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {media.srcSet ? (
                          <picture>
                            {media.wide && <source media="(min-width: 768px)" srcSet={media.wide} />}
                            <img loading="lazy" src={media.src} srcSet={media.srcSet} alt={media.alt} className="w-full h-full object-cover object-center select-none pointer-events-none transition filter will-change-transform duration-700 ease-out blur-sm group-[.animate-fadeIn]:blur-0" />
                          </picture>
                        ) : (
                          <img loading="lazy" src={media.src} alt={media.alt} className="w-full h-full object-cover object-center select-none pointer-events-none transition filter will-change-transform duration-700 ease-out blur-sm group-[.animate-fadeIn]:blur-0" />
                        )}
                        {overlay.done[item.id] && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center text-emerald-700 font-semibold text-xs tracking-wide">DONE</div>}
                      </div>
                      <div className="flex-1 p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-medium text-gray-800 text-sm md:text-base ${overlay.done[item.id] ? 'line-through opacity-60' : ''}`}>{item.title}</h4>
                              {item._local && <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[10px] text-indigo-600">LOCAL</span>}
                              {item.type && <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] uppercase tracking-wide text-emerald-700">{item.type}</span>}
                            </div>
                            {item.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>}
                            <p className="text-[11px] text-gray-500 mt-1">
                              {formatTimeRange(item.start, item.end)}{item.location ? ` • ${item.location}` : ''}
                            </p>
                            {item.distanceKm && (
                              <p className="text-[11px] text-gray-400 mt-1">{item.distanceKm} km • {item.elevationGainM || 0} m gain</p>
                            )}
                            {item.notes && (
                              <p className="mt-2 text-[11px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-700">{item.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 items-start justify-end">
                            <button onClick={() => toggleDone(item.id)} className="action-btn">{overlay.done[item.id] ? 'Undo' : 'Done'}</button>
                            {item.trailProvider && (
                              <a href={buildTrailUrl(item)} target="_blank" rel="noopener noreferrer" className="action-btn">Trail</a>
                            )}
                            <a href={buildGoogleMapsUrl(item)} target="_blank" rel="noopener noreferrer" className="action-btn">Map</a>
                            {(item.start && item.end) && (
                              <a href={buildGoogleCalendarUrl(item)} target="_blank" rel="noopener noreferrer" className="action-btn">Add Calendar</a>
                            )}
                            <button onClick={() => handleDownloadItemICS(item)} className="action-btn">ICS</button>
                            {item._local && (
                              <button onClick={() => removeCustomItem(day, item.id)} className="action-btn">Remove</button>
                            )}
                          </div>
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] tracking-wide uppercase text-gray-600">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function formatTimeRange(start, end) {
  try {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const opts = { hour: '2-digit', minute: '2-digit' };
    return `${s.toLocaleTimeString([], opts)} – ${e.toLocaleTimeString([], opts)}`;
  } catch {
    return '';
  }
}
function sanitizeFilename(name) {
  return String(name).replace(/[^a-zA-Z0-9\-_]+/g, '_').slice(0, 64);
}
if (typeof document !== 'undefined' && !document.getElementById('itinerary-inline-styles')) {
  const style = document.createElement('style');
  style.id = 'itinerary-inline-styles';
  style.textContent = `
    .action-btn { @apply px-2.5 py-1 text-[11px] font-medium rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition shadow-sm; }
    .input-xs { @apply border border-gray-300 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-400; }
    .animate-fadeIn { animation: fadeIn .7s cubic-bezier(.16,.84,.44,1) both; }
    @keyframes fadeIn { 0% { opacity:0; transform: translateY(6px);} 100% { opacity:1; transform: translateY(0);} }
    .dark-itinerary { @apply bg-gray-900 text-gray-100; }
    .dark-itinerary .action-btn { @apply bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700; }
    .dark-itinerary .input-xs { @apply bg-gray-800 border-gray-600 text-gray-100; }
    .dark-itinerary .border-gray-200 { border-color: theme('colors.gray.700'); }
    .dark-itinerary .bg-white { background-color: theme('colors.gray.800'); }
    .dark-itinerary .text-gray-800 { color: theme('colors.gray.100'); }
    .dark-itinerary .text-gray-600 { color: theme('colors.gray.300'); }
  `;
  document.head.appendChild(style);
}