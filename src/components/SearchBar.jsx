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
  const activeItemRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches')||'[]'); } catch { return []; }
  });
  
  // Smart search features
  const searchHistoryRef = useRef([]);
  const lastSearchTimeRef = useRef(null);
  
  // Auto-save search history (max 10 recent searches)
  useEffect(() => {
    if (q.trim() && q.length >= 3) {
      const now = Date.now();
      // Only track if 5 seconds passed since last search
      if (!lastSearchTimeRef.current || (now - lastSearchTimeRef.current) > 5000) {
        searchHistoryRef.current = [q.trim(), ...searchHistoryRef.current.slice(0, 9)];
        try {
          localStorage.setItem('searchHistory', JSON.stringify(searchHistoryRef.current));
        } catch {}
        lastSearchTimeRef.current = now;
      }
    }
  }, [q]);
  
  // Smart query suggestions based on typing patterns
  const _smartSuggestion = useMemo(() => { // currently not rendered; reserved for UX enhancement
    const query = q.toLowerCase().trim();
    
    if (query.includes('beach') || query.includes('ocean')) {
      return { text: 'Cape Town beaches', icon: '🏖️' };
    }
    if (query.includes('safari') || query.includes('wildlife')) {
      return { text: 'Kruger National Park', icon: '🦁' };
    }
    if (query.includes('mountain') || query.includes('hik')) {
      return { text: 'Table Mountain hike', icon: '⛰️' };
    }
    if (query.includes('cheap') || query.includes('budget')) {
      return { text: 'Budget-friendly packages', icon: '💰' };
    }
    if (query.includes('luxury') || query.includes('premium')) {
      return { text: 'Premium experiences', icon: '✨' };
    }
    
    return null;
  }, [q]);

  // Scroll active item into view when keyboard navigating
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current && open) {
      const container = scrollContainerRef.current;
      const activeItem = activeItemRef.current;
      const containerRect = container.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      // Check if item is above visible area
      if (itemRect.top < containerRect.top) {
        container.scrollTop -= (containerRect.top - itemRect.top);
      }
      // Check if item is below visible area
      else if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += (itemRect.bottom - containerRect.bottom);
      }
    }
  }, [activeIdx, open]);

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
        const { events: ev = [] } = await fetchEvents({ q: term, signal: ctrl.signal });
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
      <div className="flex items-center gap-2 border border-cream-border bg-white rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-brand-orange/40 focus-within:border-brand-orange/50 transition-all">
        <span aria-hidden className="text-brand-orange/70 text-base">🔎</span>
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
          placeholder="Search: Cape Town, Safari, Hotels, Beach Resorts… (press / to focus)"
          className="flex-1 outline-none text-sm bg-transparent placeholder:text-brand-russty/50 text-brand-brown"
          aria-label="Global search"
        />
      </div>
      {open && (
        <div ref={scrollContainerRef} className="absolute left-0 mt-2 w-full min-w-[20rem] max-w-xl bg-white border border-cream-border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
          {q.trim().length >= 3 && events && events.length > 0 && (
            <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/90 bg-white border-b border-brand-gold/20 px-4 py-2 text-[11px] text-brand-russty/70">
              <span className="mr-1 font-semibold">Sources:</span>
              {Array.from(new Set(events.map(e => e.source || 'Unknown'))).map(src => (
                <span key={src} className="inline-flex items-center gap-1 mr-1">
                  <span className="px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-medium">{src}</span>
                </span>
              ))}
            </div>
          )}
          {filtered.length===0 && (
            <div className="px-4 py-3 text-sm text-brand-russty/70">No matches found</div>
          )}
          {filtered.length>0 && (
            <ul className="py-2 text-sm">
              {filtered.map((s, idx)=> (
                <li key={s.group + s.label} ref={idx === activeIdx ? activeItemRef : null}>
                  <button
                    onMouseEnter={()=>{ setActiveIdx(idx); try { if (s.path && s.path.startsWith('/')) { import('../utils/routePrefetch').then(m=>m.prefetchRouteByPath && m.prefetchRouteByPath(s.path)).catch(()=>{}); } } catch {} }}
                    onClick={()=>go(s)}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${idx===activeIdx? 'bg-brand-orange/5' : 'hover:bg-cream'}`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span aria-hidden className="text-brand-russty/60">{groupIcon[s.group]||'•'}</span>
                      <span className="truncate">{highlight(s.label, q.trim())}</span>
                    </span>
                    <span className="text-[10px] text-brand-russty/60 ml-2 whitespace-nowrap">
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
