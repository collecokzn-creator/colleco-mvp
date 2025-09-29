import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, SERVICES } from '../data/products';
import { getSuggestion, loadMyLocation, loadSmartSettings } from '../utils/searchIntent';
import { searchEvents as fetchEvents } from '../utils/eventsApi';

export default function SearchBar({ className = '' }){
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef(null);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches')||'[]'); } catch { return []; }
  });

  const navLinks = useMemo(() => ([
    { label: 'Trip Planner', path: '/plan-trip', group: 'Navigate' },
    { label: 'Trip Assist', path: '/ai', group: 'Navigate' },
    { label: 'Quotes', path: '/quotes', group: 'Navigate' },
    { label: 'New Quote', path: '/quote/new', group: 'Navigate' },
    { label: 'Itinerary', path: '/itinerary', group: 'Navigate' },
    { label: 'Bookings', path: '/bookings', group: 'Navigate' },
    { label: 'Partner Dashboard', path: '/partner-dashboard', group: 'Navigate' },
    { label: 'Collaboration', path: '/collaboration', group: 'Navigate' },
  ]), []);

  // Build a blended suggestions list prioritizing products and services, then locations, then nav
  const suggestions = useMemo(() => {
    const productItems = PRODUCTS.map(p => ({
      label: p.title,
      path: `/plan-trip?q=${encodeURIComponent(p.title)}`,
      group: 'Products',
      meta: [p.category, p.city || p.country].filter(Boolean).join(' • '),
    }));
    const serviceItems = SERVICES.map(s => ({
      label: s.title,
      path: s.path,
      group: 'Services',
      meta: s.description,
    }));
  // Derive unique locations from products + counts
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const countBy = (arr) => arr.reduce((acc, v) => { if(!v) return acc; acc[v] = (acc[v]||0) + 1; return acc; }, {});
  const continentCounts = countBy(PRODUCTS.map(p=>p.continent));
  const countryCounts = countBy(PRODUCTS.map(p=>p.country));
  const provinceCounts = countBy(PRODUCTS.map(p=>p.province));
  const cityCounts = countBy(PRODUCTS.map(p=>p.city));
  const areaCounts = countBy(PRODUCTS.map(p=>p.area));
  const labelSort = (a,b)=> a.label.localeCompare(b.label, undefined, {sensitivity:'base'});
  const continents = uniq(PRODUCTS.map(p=>p.continent)).map(v=>({ label: v, path: `/plan-trip?continent=${encodeURIComponent(v)}`, group: 'Locations', meta: `Continent • ${continentCounts[v]||0}` })).sort(labelSort);
  const countries = uniq(PRODUCTS.map(p=>p.country)).map(v=>({ label: v, path: `/plan-trip?country=${encodeURIComponent(v)}`, group: 'Locations', meta: `Country • ${countryCounts[v]||0}` })).sort(labelSort);
  const provinces = uniq(PRODUCTS.map(p=>p.province)).map(v=>({ label: v, path: `/plan-trip?province=${encodeURIComponent(v)}`, group: 'Locations', meta: `Province • ${provinceCounts[v]||0}` })).sort(labelSort);
  const cities = uniq(PRODUCTS.map(p=>p.city)).map(v=>({ label: v, path: `/plan-trip?city=${encodeURIComponent(v)}`, group: 'Locations', meta: `City • ${cityCounts[v]||0}` })).sort(labelSort);
  const areas = uniq(PRODUCTS.map(p=>p.area)).map(v=>({ label: v, path: `/plan-trip?area=${encodeURIComponent(v)}`, group: 'Locations', meta: `Area • ${areaCounts[v]||0}` })).sort(labelSort);
    const locationItems = [...continents, ...countries, ...provinces, ...cities, ...areas];
    const popular = [
      { label: 'Plan Zanzibar', path: '/plan-trip?province=Zanzibar%20North', group: 'Popular' },
      { label: 'Plan Cape Town', path: '/plan-trip?city=Cape%20Town', group: 'Popular' },
      { label: 'Plan Kruger', path: '/plan-trip?area=Kruger%20National%20Park', group: 'Popular' },
    ];
    return [...productItems, ...serviceItems, ...locationItems, ...popular, ...navLinks];
  }, [navLinks]);

  // Helpers for highlighting and icons
  function escapeRegExp(str){ return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlight(text, term){
    if(!term) return text;
    const re = new RegExp(`(${escapeRegExp(term)})`, 'ig');
    const parts = String(text).split(re);
    return parts.map((part, i) => re.test(part)
      ? <mark key={i} className="bg-yellow-100 text-inherit p-0 rounded">{part}</mark>
      : <span key={i}>{part}</span>
    );
  }
  const groupIcon = {
    Products: '🧳',
    Services: '🛠️',
    Locations: '📍',
    Events: '🎫',
    Popular: '⭐',
    Navigate: '🧭',
    Action: '🔎',
    Recent: '🕘',
  };

  // Events fetching with debounce when q >= 3 chars
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const term = q.trim();
    if(term.length < 3){ setEvents([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const { events: ev = [] } = await fetchEvents({ q: term });
        if(!ctrl.signal.aborted){ setEvents(ev.slice(0, 8)); }
      } catch { if(!ctrl.signal.aborted){ setEvents([]); } }
    }, 350);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [q]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let base = suggestions;
  const myLoc = loadMyLocation();
  const { smartAliases } = loadSmartSettings();
  const parsed = q.trim() ? getSuggestion(q.trim(), { products: PRODUCTS, myLocation: myLoc, enableAliases: smartAliases }) : null;
    if (term) {
      base = suggestions.filter(s =>
        s.label.toLowerCase().includes(term) || (s.meta||'').toLowerCase().includes(term)
      );
    } else if (recent.length) {
      const rec = recent.map(r => ({ label: r, path: `/plan-trip?q=${encodeURIComponent(r)}`, group: 'Recent' }));
      // Add a clear action at the very top
      const clear = { label: 'Clear recent searches', path: '#', group: 'Recent' };
      base = [clear, ...rec, ...base];
    }
    // Prepend an action to search products directly with the raw term
    if(term){
      const action = parsed ? { label: parsed.label, path: `/plan-trip?${new URLSearchParams(parsed.params).toString()}`, group: 'Action', meta: `${parsed.count} result${parsed.count===1?'':'s'}` }
        : { label: `Search products for “${q.trim()}”`, path: `/plan-trip?q=${encodeURIComponent(q.trim())}` , group: 'Action' };
      const nearMe = (myLoc && (myLoc.city||myLoc.province||myLoc.country))
        ? [{ label: `Near me${myLoc.city?` • ${myLoc.city}`:myLoc.province?` • ${myLoc.province}`:myLoc.country?` • ${myLoc.country}`:''}`, path: (()=>{
            const params = new URLSearchParams();
            if(myLoc.city) params.set('city', myLoc.city); else if(myLoc.province) params.set('province', myLoc.province); else if(myLoc.country) params.set('country', myLoc.country);
            return `/plan-trip?${params.toString()}`;
          })(), group: 'Action', meta: 'Use my location' }]
        : (/near me|around me|nearby|close by/.test(q.trim().toLowerCase())
            ? [{ label: 'Set my location…', path: '/plan-trip?setLocation=1', group: 'Action', meta: 'Enable Near me' }]
            : []);
      // Append Events group if any fetched
      const evGroup = (events && events.length) ? events.map(e => ({
        label: e.name,
        path: e.url || '#',
        group: 'Events',
        meta: [e.city, e.date && new Date(e.date).toLocaleDateString()].filter(Boolean).join(' • '),
        provider: e.source,
        isDemo: e.source === 'Demo'
      })) : [];
      return [action, ...nearMe, ...evGroup, ...base];
    }
    return base;
  }, [q, suggestions, recent, events]);

  useEffect(() => {
    function onClick(e){ if(wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Optional: '/' focuses the search input
  useEffect(()=>{
    function onKey(e){
      if(e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey){
        const input = wrapRef.current?.querySelector('input');
        if(input){ e.preventDefault(); input.focus(); setOpen(true); }
      }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, []);

  function go(item){
    if(!item) return;
    // Handle clear recent
    if (item.group === 'Recent' && item.label === 'Clear recent searches'){
      setRecent([]);
      try { localStorage.removeItem('recentSearches'); } catch {}
      return;
    }
    if (q.trim()) {
      const next = [q.trim(), ...recent.filter(r => r.toLowerCase() !== q.trim().toLowerCase())].slice(0,5);
      setRecent(next);
      try { localStorage.setItem('recentSearches', JSON.stringify(next)); } catch {}
    }
    setOpen(false); setQ('');
    if (item.path && /^https?:\/\//i.test(item.path)) {
      window.open(item.path, '_blank', 'noopener');
    } else {
      navigate(item.path || '/');
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 border border-cream-border bg-white rounded-md px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-brand-orange/30">
        <span aria-hidden className="text-brand-brown/60">🔎</span>
        <input
          value={q}
          onChange={e=>{ setQ(e.target.value); setOpen(true); setActiveIdx(0); }}
          onFocus={()=>setOpen(true)}
          title="Press / to search"
          onKeyDown={(e)=>{
            if(!open && (e.key==='ArrowDown'||e.key==='Enter')){ setOpen(true); return; }
            if(!filtered.length) return;
            if(e.key==='ArrowDown'){ e.preventDefault(); setActiveIdx(i=> Math.min(i+1, filtered.length-1)); }
            else if(e.key==='ArrowUp'){ e.preventDefault(); setActiveIdx(i=> Math.max(i-1, 0)); }
            else if(e.key==='Enter'){ e.preventDefault(); go(filtered[activeIdx]); }
            else if(e.key==='Escape'){ setOpen(false); }
          }}
          placeholder="Search products and services…"
          className="w-64 sm:w-72 md:w-80 outline-none text-sm bg-transparent placeholder:text-brand-brown/50"
          aria-label="Global search"
        />
      </div>
      {open && (
        <div className="absolute left-0 mt-1 w-[min(20rem,85vw)] bg-cream border border-cream-border rounded-md shadow-lg z-50 max-h-64 overflow-auto">
          {q.trim().length >= 3 && events && events.length > 0 && (
            <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-cream/80 bg-cream/90 border-b border-cream-border px-3 py-1 text-[11px] text-brand-brown/70">
              <span className="mr-1">Sources:</span>
              {Array.from(new Set(events.map(e => e.source || 'Unknown'))).map(src => (
                <span key={src} className="inline-flex items-center gap-1 mr-1">
                  <span className="px-1 py-0.5 rounded bg-cream-sand border border-cream-border">{src}</span>
                </span>
              ))}
            </div>
          )}
          {filtered.length===0 && (
            <div className="px-3 py-2 text-sm text-brand-brown/70">No matches</div>
          )}
          {filtered.length>0 && (
            <ul className="py-1 text-sm">
              {filtered.map((s, idx)=> (
                <li key={s.group + s.label}>
                  <button
                    onMouseEnter={()=>setActiveIdx(idx)}
                    onClick={()=>go(s)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between ${idx===activeIdx? 'bg-cream-sand' : 'hover:bg-cream-hover'}`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span aria-hidden className="text-brand-brown/60">{groupIcon[s.group]||'•'}</span>
                      <span className="truncate">{highlight(s.label, q.trim())}</span>
                    </span>
                    <span className="text-[10px] text-brand-brown/60 ml-2 whitespace-nowrap">
                      {s.group}
                      {s.provider ? <> • <span className="px-1 py-0.5 rounded bg-cream-sand border border-cream-border">{s.provider}{s.isDemo ? ' (Demo)' : ''}</span></> : null}
                      {s.meta? <> • {highlight(s.meta, q.trim())}</> : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
