import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import LiveTripProgress from "../components/ui/LiveTripProgress";
import { useTripState, computeProgress } from "../utils/useTripState";
import { useBasketState } from "../utils/useBasketState";
import { formatCurrency } from "../utils/currency";
import { PRODUCTS } from "../data/products";
import { searchEvents as fetchEvents } from "../utils/eventsApi";
import { sortEvents as sortEventsUtil, mergeAndSort } from "../utils/eventsSort";
import { buildLocationMaps as buildLocMapsUtil, detectCategory, resolveLocationToken, longestLocationMatch, getSuggestion, loadMyLocation, persistMyLocation, loadSmartSettings } from "../utils/searchIntent";
import MyLocationModal from "../components/MyLocationModal";
import WeatherWidget from "../components/WeatherWidget";
import WorkflowPanel from "../components/WorkflowPanel";
import { useClickOutsideAndEscape } from "../hooks/useClickOutside";

export default function PlanTrip() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [directBookingOpen, setDirectBookingOpen] = useState(false);
  // Open Direct Booking via URL query flag
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('direct') === '1') {
        setDirectBookingOpen(true);
      }
    } catch {}
  }, [location.search]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Persist last-used booking date for convenience
  const [bookingDate, setBookingDate] = useState(() => {
    try { return localStorage.getItem('directBooking:lastDate') || ""; } catch { return ""; }
  });
  const [trip] = useTripState();
  const [query, setQuery] = useState("");
  const [searchEl, setSearchEl] = useState(null);
  const { basket, addToBasket, removeFromBasket, updateQuantity, updateDay, paidItems, clearBasket } = useBasketState();
  const [copyLinkStatus, setCopyLinkStatus] = useState(""); // '', 'ok', 'err'

  // Define modal component unconditionally to keep hook order stable
  const DirectBookingModal = () => {
    const modalRef = useRef(null);
    const searchRef = useRef(null);
    useClickOutsideAndEscape(modalRef, () => setDirectBookingOpen(false));
    // Intentionally run once on mount; we read selectedProduct from closure for conditional focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      // Focus search shortly after mount
      const t = setTimeout(() => {
        try {
          if (!selectedProduct) searchRef.current?.focus();
        } catch {}
      }, 0);
      return () => clearTimeout(t);
    }, []);
    // Focus trap
    useEffect(() => {
      function handleTrap(e) {
        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusables.length) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      }
      document.addEventListener('keydown', handleTrap);
      return () => document.removeEventListener('keydown', handleTrap);
    }, []);

    return (
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="direct-booking-title"
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
        tabIndex={-1}
      >
        <button className="absolute top-2 right-2 text-brand-russty" onClick={() => setDirectBookingOpen(false)} aria-label="Close">&times;</button>
        <h2 id="direct-booking-title" className="text-xl font-bold text-brand-rusty mb-3">Direct Booking</h2>
        {!selectedProduct ? (
          <>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products (e.g. flights, hotels...)"
              ref={searchRef}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <div className="max-h-40 overflow-y-auto mb-3">
              {PRODUCTS.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase())
              ).slice(0, 10).map(p => (
                <button
                  key={p.title}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-cream-hover"
                  onClick={() => setSelectedProduct(p)}
                >
                  <span className="font-semibold text-brand-russty">{p.title}</span>
                  <span className="ml-2 text-xs text-brand-russty/70">{p.category}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 font-semibold text-brand-russty">{selectedProduct.title}</div>
            <div className="mb-2 text-sm text-brand-russty/80">{selectedProduct.category}</div>
            <input
              type="date"
              value={bookingDate}
              onChange={e => { const v = e.target.value; setBookingDate(v); try { localStorage.setItem('directBooking:lastDate', v); } catch {} }}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <button
              className="w-full bg-brand-orange text-white font-bold py-2 rounded mb-2"
              onClick={() => {
                try { showToast('Payment initiated', 'success'); } catch {}
                const params = new URLSearchParams({ item: selectedProduct.title, date: bookingDate });
                navigate(`/payment-success?${params.toString()}`);
              }}
              disabled={!bookingDate || !selectedProduct}
            >
              Proceed to Payment
            </button>
            <button className="w-full text-xs text-brand-russty underline" onClick={() => setSelectedProduct(null)}>
              &larr; Back to search
            </button>
          </>
        )}
      </div>
    );
  };
  const [copySummaryStatus, setCopySummaryStatus] = useState(""); // '', 'ok', 'err'
  const [confirmClear, setConfirmClear] = useState(false);
  const [lastCleared, setLastCleared] = useState([]); // snapshot for undo
  const undoTimerRef = useRef(null);
  const [undoMsg, setUndoMsg] = useState("");
  const [presetStatus, setPresetStatus] = useState(""); // '', 'saved', 'applied', 'deleted', 'error'
  const [selectedPreset, setSelectedPreset] = useState("");
  const [presets, setPresets] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('planTripPresets:v1')||'[]'); } catch { return []; }
  });
  const [presetName, setPresetName] = useState("");
  const [recentFilters, setRecentFilters] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('planTripRecentFilters:v1')||'[]'); } catch { return []; }
  });
  // Simple toasts system
  const [toasts, setToasts] = useState([]); // {id, text, type}
  // Simple Mode: reduces UI to core search + filters + results
  const [simpleMode, setSimpleMode] = useState(() => {
    try { return localStorage.getItem('tripSimpleMode') === '1'; } catch { return false; }
  });
  // Catalog sort
  const [catalogSort, setCatalogSort] = useState(() => {
    try { return localStorage.getItem('catalogSort:v1') || 'relevance'; } catch { return 'relevance'; }
  });
  useEffect(()=>{ try { localStorage.setItem('catalogSort:v1', catalogSort); } catch {} }, [catalogSort]);
  // Weather setting (from Settings page)
  const [showWeather, setShowWeather] = useState(() => {
    try { return localStorage.getItem('showWeather') !== '0'; } catch { return true; }
  });
  const [weatherCollapsed, setWeatherCollapsed] = useState(() => {
    try { return localStorage.getItem('weatherCollapsed') === '1'; } catch { return false; }
  });

  // Compact header by default; reveal full filter toolset on demand
  const [showAdvanced, setShowAdvanced] = useState(() => {
    try { return localStorage.getItem('planTrip:showAdvanced:v2') === '1'; } catch { return false; }
  });
  
  // Click outside and escape to close advanced filters
  const advancedFiltersRef = useClickOutsideAndEscape(() => {
    if (showAdvanced) {
      setShowAdvanced(false);
      try { localStorage.setItem('planTrip:showAdvanced:v2', '0'); } catch {}
    }
  }, showAdvanced);
  useEffect(() => {
    function onStorage(e){ if(!e) return; if(e.key === 'showWeather'){ setShowWeather(e.newValue !== '0'); } }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  function toggleSimpleMode(){
    const next = !simpleMode; setSimpleMode(next);
    try { localStorage.setItem('tripSimpleMode', next ? '1' : '0'); } catch {}
  }
  function showToast(text, type='info', ttl=2000){
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(()=> setToasts(prev => prev.filter(t=>t.id!==id)), ttl);
  }
  // Sync query params -> local state
  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q');
    if(qParam) setQuery(qParam);
  }, [location.search]);

  // Build filters from URL params (continent, country, province, city, area)
  const locFilters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      continent: params.get('continent') || '',
      country: params.get('country') || '',
      province: params.get('province') || '',
      city: params.get('city') || '',
      area: params.get('area') || '',
      category: params.get('category') || '',
      priceMin: params.get('priceMin') || '',
      priceMax: params.get('priceMax') || '',
      paidOnly: params.get('paidOnly') === '1',
      freeOnly: params.get('freeOnly') === '1',
    };
  }, [location.search]);

  // Persist filters to localStorage and restore when URL is empty
  useEffect(() => {
    // Save whenever filters change
    try { localStorage.setItem('lastLocFilters', JSON.stringify(locFilters)); } catch {}
  }, [locFilters]);
  // Update recent filters list when filters change (skip when all empty)
  useEffect(()=>{
    // Avoid dynamic property access on the locFilters object directly to satisfy exhaustive-deps
    const { continent, country, province, city, area, category, priceMin, priceMax, paidOnly, freeOnly } = locFilters;
    const keys = ['continent','country','province','city','area','category','priceMin','priceMax','paidOnly','freeOnly'];
    const vals = { continent, country, province, city, area, category, priceMin, priceMax, paidOnly, freeOnly };
    const hasAny = keys.some(k => {
      const v = vals[k];
      const s = typeof v === 'boolean' ? (v ? '1' : '') : String(v || '').trim();
      return s !== '';
    });
    if (!hasAny) return;
    const signature = keys.map(k=>{
      const v = vals[k];
      const s = typeof v === 'boolean' ? (v ? '1' : '') : String(v || '').trim().toLowerCase();
      return `${k}=${encodeURIComponent(s)}`;
    }).join('&');
    setRecentFilters(prev => {
      const next = [signature, ...prev.map(r=>r.signature)].filter((s,i,arr)=>arr.indexOf(s)===i).slice(0,6);
      const detailed = next.map(sig => ({
        signature: sig,
        filters: Object.fromEntries(sig.split('&').map(pair=>{
          const [k,v] = pair.split('=');
          return [k, v ? decodeURIComponent(v) : ''];
        }))
      }));
      try { localStorage.setItem('planTripRecentFilters:v1', JSON.stringify(detailed)); } catch {}
      return detailed;
    });
  }, [
    locFilters.continent,
    locFilters.country,
    locFilters.province,
    locFilters.city,
    locFilters.area,
    locFilters.category,
    locFilters.priceMin,
    locFilters.priceMax,
    locFilters.paidOnly,
    locFilters.freeOnly,
    locFilters
  ]);

  function applyFilters(nextFilters){
    const keys = ['continent','country','province','city','area','category','priceMin','priceMax','paidOnly','freeOnly'];
    const params = new URLSearchParams(location.search);
    keys.forEach(k=>{
      let val = nextFilters?.[k];
      if (k === 'paidOnly') { val = nextFilters?.paidOnly ? '1' : ''; }
      else if (k === 'freeOnly') { val = nextFilters?.freeOnly ? '1' : ''; }
      else { val = (val||'').trim(); }
      if (val) params.set(k, val); else params.delete(k);
    });
    navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }

  function savePreset(){
    const name = (presetName||'').trim();
    if (!name) { showToast('Enter a preset name', 'warn'); return; }
    const record = { name, filters: locFilters };
    setPresets(prev => {
      // replace if same name exists
      const filtered = prev.filter(p => p.name !== name);
      const next = [...filtered, record].sort((a,b)=> a.name.localeCompare(b.name));
      try { localStorage.setItem('planTripPresets:v1', JSON.stringify(next)); } catch {}
      setPresetStatus('saved'); setTimeout(()=>setPresetStatus(''), 1500);
      setSelectedPreset(name);
      showToast(`Preset "${name}" saved`, 'success');
      return next;
    });
  }
  function deletePreset(name){
    setPresets(prev => {
      const next = prev.filter(p => p.name !== name);
      try { localStorage.setItem('planTripPresets:v1', JSON.stringify(next)); } catch {}
      setPresetStatus('deleted'); setTimeout(()=>setPresetStatus(''), 1500);
      if (selectedPreset === name) setSelectedPreset('');
      showToast(`Preset "${name}" deleted`, 'info');
      return next;
    });
  }
  function applyPreset(name){
    const p = presets.find(x=>x.name===name);
    if (!p) return;
    applyFilters(p.filters);
    setPresetStatus('applied'); setTimeout(()=>setPresetStatus(''), 1200);
    showToast(`Applied preset "${name}"`, 'success');
  }
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasAny = ['continent','country','province','city','area','category','priceMin','priceMax','paidOnly','freeOnly'].some(k => params.get(k));
    if (hasAny) return;
    try {
      const raw = localStorage.getItem('lastLocFilters');
      if(!raw) return;
      const saved = JSON.parse(raw);
      if(!saved || typeof saved !== 'object') return;
      const next = new URLSearchParams();
      ['continent','country','province','city','area','category','priceMin','priceMax'].forEach(k => { if (saved[k]) next.set(k, saved[k]); });
      if (saved.paidOnly) next.set('paidOnly','1');
      if (saved.freeOnly) next.set('freeOnly','1');
      if ([...next.keys()].length) {
        navigate({ search: `?${next.toString()}` }, { replace: true });
      }
    } catch {}
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If deep-linked with filters, ensure Catalog tab is active so results are visible
  useEffect(()=>{
    const params = new URLSearchParams(location.search);
  const hasDeepLink = ['continent','country','province','city','area','category','priceMin','priceMax','paidOnly','freeOnly'].some(k => params.get(k));
    const tabParam = params.get('tab');
    if(tabParam === 'events') setActiveTab('events');
    else if(hasDeepLink) setActiveTab('catalog');
  }, [location.search]);

  // Keyboard: focus catalog search on '/'
  useEffect(() => {
    function onKeyDown(e){
      if(e.key !== '/') return;
      // Ignore when typing in inputs/textareas or when meta/ctrl/alt is pressed
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      if (searchEl && typeof searchEl.focus === 'function') {
        searchEl.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchEl]);

  // Cascading location options derived from PRODUCTS and current filters
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const sortAlpha = (arr) => [...arr].sort((a,b)=> String(a).localeCompare(String(b), undefined, {sensitivity:'base'}));
  const continents = useMemo(() => sortAlpha(uniq(PRODUCTS.map(p => p.continent))), []);
  const countries = useMemo(() => sortAlpha(uniq(
    PRODUCTS
      .filter(p => !locFilters.continent || (p.continent||'').toLowerCase() === locFilters.continent.toLowerCase())
      .map(p => p.country)
  )), [locFilters.continent]);
  const provinces = useMemo(() => sortAlpha(uniq(
    PRODUCTS
      .filter(p =>
        (!locFilters.continent || (p.continent||'').toLowerCase() === locFilters.continent.toLowerCase()) &&
        (!locFilters.country || (p.country||'').toLowerCase() === locFilters.country.toLowerCase())
      )
      .map(p => p.province)
  )), [locFilters.continent, locFilters.country]);
  const cities = useMemo(() => sortAlpha(uniq(
    PRODUCTS
      .filter(p =>
        (!locFilters.continent || (p.continent||'').toLowerCase() === locFilters.continent.toLowerCase()) &&
        (!locFilters.country || (p.country||'').toLowerCase() === locFilters.country.toLowerCase()) &&
        (!locFilters.province || (p.province||'').toLowerCase() === locFilters.province.toLowerCase())
      )
      .map(p => p.city)
  )), [locFilters.continent, locFilters.country, locFilters.province]);
  const areas = useMemo(() => sortAlpha(uniq(
    PRODUCTS
      .filter(p =>
        (!locFilters.continent || (p.continent||'').toLowerCase() === locFilters.continent.toLowerCase()) &&
        (!locFilters.country || (p.country||'').toLowerCase() === locFilters.country.toLowerCase()) &&
        (!locFilters.province || (p.province||'').toLowerCase() === locFilters.province.toLowerCase()) &&
        (!locFilters.city || (p.city||'').toLowerCase() === locFilters.city.toLowerCase())
      )
      .map(p => p.area)
  )), [locFilters.continent, locFilters.country, locFilters.province, locFilters.city]);
  const categories = useMemo(() => sortAlpha(uniq(
    PRODUCTS
      .filter(p =>
        (!locFilters.continent || (p.continent||'').toLowerCase() === locFilters.continent.toLowerCase()) &&
        (!locFilters.country || (p.country||'').toLowerCase() === locFilters.country.toLowerCase()) &&
        (!locFilters.province || (p.province||'').toLowerCase() === locFilters.province.toLowerCase()) &&
        (!locFilters.city || (p.city||'').toLowerCase() === locFilters.city.toLowerCase()) &&
        (!locFilters.area || (p.area||'').toLowerCase() === locFilters.area.toLowerCase())
      )
      .map(p => p.category)
  )), [locFilters.continent, locFilters.country, locFilters.province, locFilters.city, locFilters.area]);

  // Counts for options under current upstream filters
  const counts = useMemo(() => {
    // Helper for case-insensitive equality
    const eq = (a,b)=> String(a||'').toLowerCase() === String(b||'').toLowerCase();
    const base = PRODUCTS;
    const by = {
      continent: {}, country: {}, province: {}, city: {}, area: {}, category: {}
    };
    for (const p of base) {
      if (p.continent) by.continent[p.continent] = (by.continent[p.continent]||0) + 1;
    }
    const scopedCountries = base.filter(p => !locFilters.continent || eq(p.continent, locFilters.continent));
    for (const p of scopedCountries) {
      if (p.country) by.country[p.country] = (by.country[p.country]||0) + 1;
    }
    const scopedProvinces = scopedCountries.filter(p => !locFilters.country || eq(p.country, locFilters.country));
    for (const p of scopedProvinces) {
      if (p.province) by.province[p.province] = (by.province[p.province]||0) + 1;
    }
    const scopedCities = scopedProvinces.filter(p => !locFilters.province || eq(p.province, locFilters.province));
    for (const p of scopedCities) {
      if (p.city) by.city[p.city] = (by.city[p.city]||0) + 1;
    }
    const scopedAreas = scopedCities.filter(p => !locFilters.city || eq(p.city, locFilters.city));
    for (const p of scopedAreas) {
      if (p.area) by.area[p.area] = (by.area[p.area]||0) + 1;
    }
    const scopedForCategories = scopedAreas.filter(p => !locFilters.area || eq(p.area, locFilters.area));
    for (const p of scopedForCategories) {
      if (p.category) by.category[p.category] = (by.category[p.category]||0) + 1;
    }
    return by;
  }, [locFilters.continent, locFilters.country, locFilters.province, locFilters.city, locFilters.area]);

  // Events: fetch from trusted providers via server aggregator
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsSourceCounts, setEventsSourceCounts] = useState({});
  const [includePast, setIncludePast] = useState(() => {
    try { return localStorage.getItem('includePastEvents') === '1'; } catch { return false; }
  });
  const [eventsSort, setEventsSort] = useState(() => {
    try { return localStorage.getItem('eventsSort') || 'dateAsc'; } catch { return 'dateAsc'; }
  }); // 'dateAsc' | 'dateDesc'
  function toggleIncludePast(){
    const next = !includePast; setIncludePast(next);
    try { localStorage.setItem('includePastEvents', next ? '1' : '0'); } catch {}
  }
  const [groupByMonth, setGroupByMonth] = useState(() => {
    try { return localStorage.getItem('eventsGroupByMonth') === '1'; } catch { return false; }
  });
  function onChangeSort(val){
    setEventsSort(val);
    try { localStorage.setItem('eventsSort', val); } catch {}
    // Re-sort current list without refetch
    setEvents(prev => sortEventsUtil(prev, val));
  }
  function toggleGroup(){
    const next = !groupByMonth; setGroupByMonth(next);
    try { localStorage.setItem('eventsGroupByMonth', next ? '1' : '0'); } catch {}
  }
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem('planTripTab') || 'catalog'; } catch { return 'catalog'; }
  }); // 'catalog' | 'events'
  useEffect(() => { try { localStorage.setItem('planTripTab', activeTab); } catch {} }, [activeTab]);
  // If entering Simple Mode while Events tab active, force back to Catalog
  useEffect(() => { if(simpleMode && activeTab !== 'catalog') setActiveTab('catalog'); }, [simpleMode, activeTab]);
  useEffect(() => {
    const term = query.trim();
    const city = locFilters.city.trim();
    const country = locFilters.country.trim();
  // In Simple Mode, skip events entirely
  if (simpleMode) { setEvents([]); setEventsError(""); setEventsPage(1); setEventsHasMore(false); return; }
  // Trigger when a country exists, or a city is selected, or a meaningful search term exists
  if (!country && !city && term.length < 3) { setEvents([]); setEventsError(""); setEventsPage(1); setEventsHasMore(false); return; }
    let alive = true;
    setEventsLoading(true); setEventsError("");
    const t = setTimeout(async () => {
  try {
  const { events: list, page, hasMore, countsBySource } = await fetchEvents({ q: term || "", city, country, page: 1, limit: 8, includePast });
        if (!alive) return;
  setEvents(sortEventsUtil(Array.isArray(list) ? list : [], eventsSort));
        setEventsPage(page || 1);
        setEventsHasMore(!!hasMore);
  setEventsSourceCounts(countsBySource || {});
      } catch (e) {
        if (!alive) return; setEvents([]); setEventsError("Could not load events right now."); setEventsPage(1); setEventsHasMore(false);
      } finally {
        if (alive) setEventsLoading(false);
      }
    }, 350);
    return () => { alive = false; clearTimeout(t); };
  }, [locFilters.city, locFilters.country, query, includePast, simpleMode, eventsSort]);

  // Helpers to update URL params and clear deeper-level filters on change
  function updateLocationParam(level, value){
    const order = ['continent','country','province','city','area'];
    const params = new URLSearchParams(location.search);
    if(value){ params.set(level, value); } else { params.delete(level); }
    const idx = order.indexOf(level);
    // Clear deeper filters when parent changes
    for(let i=idx+1; i<order.length; i++) params.delete(order[i]);
    navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }
  function updateParam(key, value){
    const params = new URLSearchParams(location.search);
    if (value) params.set(key, value); else params.delete(key);
    navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }
  function clearLocationFilters(){
    const params = new URLSearchParams(location.search);
    ['continent','country','province','city','area'].forEach(k=>params.delete(k));
    navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = PRODUCTS;
    // Apply location filters if any present
  const { continent, country, province, city, area, category: _category } = locFilters;
    if (continent || country || province || city || area) {
      base = base.filter(p =>
        (!continent || (p.continent||'').toLowerCase() === continent.toLowerCase()) &&
        (!country || (p.country||'').toLowerCase() === country.toLowerCase()) &&
        (!province || (p.province||'').toLowerCase() === province.toLowerCase()) &&
        (!city || (p.city||'').toLowerCase() === city.toLowerCase()) &&
        (!area || (p.area||'').toLowerCase() === area.toLowerCase())
      );
    }
    if (_category) {
      base = base.filter(p => (p.category||'').toLowerCase() === _category.toLowerCase());
    }
    // Price and paid filters
    const min = Number(locFilters.priceMin||'');
    const max = Number(locFilters.priceMax||'');
    const hasMin = !Number.isNaN(min) && locFilters.priceMin!=='';
    const hasMax = !Number.isNaN(max) && locFilters.priceMax!=='';
    if (hasMin) { base = base.filter(p => (Number(p.price)||0) >= min); }
    if (hasMax) { base = base.filter(p => (Number(p.price)||0) <= max); }
  // Mutual exclusivity at UI level, but guard here too: freeOnly takes precedence
  if (locFilters.freeOnly) { base = base.filter(p => (Number(p.price)||0) === 0); }
  else if (locFilters.paidOnly) { base = base.filter(p => (Number(p.price)||0) > 0); }
    if(!q) return base;
    return base.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.continent||'').toLowerCase().includes(q) ||
      (p.country||'').toLowerCase().includes(q) ||
      (p.province||'').toLowerCase().includes(q) ||
      (p.city||'').toLowerCase().includes(q) ||
      (p.area||'').toLowerCase().includes(q)
    );
  }, [query, locFilters]);

  // Apply catalog sorting
  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    const q = query.trim().toLowerCase();
    if(catalogSort === 'alpha'){
      return arr.sort((a,b)=> String(a.title).localeCompare(String(b.title)));
    }
    if(catalogSort === 'priceAsc'){
      return arr.sort((a,b)=> (Number(a.price)||0) - (Number(b.price)||0));
    }
    if(catalogSort === 'priceDesc'){
      return arr.sort((a,b)=> (Number(b.price)||0) - (Number(a.price)||0));
    }
    // relevance: simple heuristic by match position + title boost when a query exists
    if(!q) return arr; // no-op when no query
    const score = (p)=>{
      let s = 0;
      const t = String(p.title||'').toLowerCase();
      const d = String(p.description||'').toLowerCase();
      const c = String(p.category||'').toLowerCase();
      if(t.includes(q)) s += 5 + Math.max(0, 20 - t.indexOf(q));
      if(d.includes(q)) s += 2 + Math.max(0, 10 - d.indexOf(q));
      if(c.includes(q)) s += 3;
      return s;
    };
    return arr.sort((a,b)=> score(b) - score(a));
  }, [filtered, catalogSort, query]);

  // Simple highlighter for query matches
  function highlight(text){
    const term = query.trim();
    if(!term) return text;
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${safe})`, 'ig');
    const parts = String(text).split(re);
    return parts.map((part, i) => re.test(part)
      ? <mark key={i} className="bg-yellow-100 text-inherit p-0 rounded">{part}</mark>
      : <span key={i}>{part}</span>
    );
  }
  // Smart Search: parse natural phrases (e.g., "Hotels in Durban", "Accommodation near Durban North")
  const buildLocMaps = useMemo(() => buildLocMapsUtil(PRODUCTS), []);
  const myLocation = useMemo(() => loadMyLocation(), []);
  const [locModalOpen, setLocModalOpen] = useState(false);
  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    if(params.get('setLocation')==='1'){
      setLocModalOpen(true);
      params.delete('setLocation');
      navigate({ search: params.toString()?`?${params.toString()}`:'' }, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function applySmartSearch() {
    const raw = query.trim();
    if(!raw) return;
    const lower = raw.toLowerCase();
    // Split by connectors, prefer last occurrence
    const connectors = [' in ', ' near ', ' around ', ' at '];
    let pos = -1, conn = '';
    for(const c of connectors){ const i = lower.lastIndexOf(c); if(i > pos){ pos = i; conn = c; } }
    let left = raw, right = '';
    if(pos > 0){ left = raw.slice(0,pos).trim(); right = raw.slice(pos + conn.length).trim(); }
  const cat = detectCategory(left || raw);
  const { smartAliases } = loadSmartSettings();
  let loc = resolveLocationToken(right, buildLocMaps, smartAliases);
  if(Object.keys(loc).length===0){ loc = longestLocationMatch(raw, buildLocMaps, smartAliases); }
    if(!cat && Object.keys(loc).length===0){ return; }
    // Build URL params: clear previous location+category, then set new ones
    const keys = ['continent','country','province','city','area','category','q'];
    const params = new URLSearchParams(location.search);
    keys.forEach(k=> params.delete(k));
    if(cat) params.set('category', cat);
    Object.entries(loc).forEach(([k,v])=>{ if(v) params.set(k, v); });
    setQuery('');
    navigate({ search: `?${params.toString()}` }, { replace: false });
    try { showToast && showToast(`Applied smart filters${cat?` • ${cat}`:''}${Object.values(loc).length?` • ${Object.values(loc)[0]}`:''}`, 'success'); } catch {}
  }

  // Build a smart suggestion with approximate result count
  const smartSuggestion = useMemo(() => {
    const raw = (query || '').trim();
    if(!raw) return null;
    const { smartAliases } = loadSmartSettings();
    const s = getSuggestion(raw, { products: PRODUCTS, myLocation, enableAliases: smartAliases });
    if(!s) return null;
    // Remove category from params for loc without triggering no-unused-vars
    const rest = { ...s.params }; delete rest.category;
    return { text: s.label, count: s.count, cat: s.params.category, loc: rest };
  }, [query, myLocation]);

  // Dynamic Quick Actions: one-click filters derived from top cities
  const quickActions = useMemo(() => {
    if(!Array.isArray(PRODUCTS) || PRODUCTS.length===0) return [];
    const byCity = new Map();
    for(const p of PRODUCTS){
      const c = (p.city||'').trim();
      if(!c) continue;
      byCity.set(c, (byCity.get(c)||0)+1);
    }
    const topCities = Array.from(byCity.entries())
      .sort((a,b)=> b[1]-a[1])
      .slice(0,4)
      .map(([city,count])=>({ city, count }));
    const makeCount = (params)=> PRODUCTS.filter(pr => {
      if(params.category && String(pr.category||'')!==params.category) return false;
      if(params.city && String(pr.city||'')!==params.city) return false;
      if(params.province && String(pr.province||'')!==params.province) return false;
      if(params.country && String(pr.country||'')!==params.country) return false;
      if(params.continent && String(pr.continent||'')!==params.continent) return false;
      if(params.area && String(pr.area||'')!==params.area) return false;
      return true;
    }).length;
    const actions = topCities.map(({ city })=>{
      const params = { category: 'Lodging', city };
      return {
        label: `Hotels in ${city} (${makeCount(params)})`,
        params,
      };
    });
    return actions;
  }, []);
  return (
  <div className="overflow-x-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-brand-russty">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold mb-1">Trip Planner</h2>
          <p className="mb-4 text-brand-russty/80">Plan your trip with simple, powerful filters.</p>
        </div>
        <div className="mt-1">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={simpleMode} onChange={toggleSimpleMode} />
            <span>Simple mode</span>
          </label>
        </div>
      </div>


          {/* Direct Booking as a peer option in the grid */}

          {!simpleMode && (
        <>
          <div className="mb-4"><AutoSyncBanner message="Your quotes, itinerary, and bookings stay in sync in real time." /></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <LiveTripProgress steps={computeProgress(trip, basket.length)} />
            <Link to="/quotes" className="p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition">
              <div className="font-semibold">Quotes</div>
              <p className="text-sm text-brand-brown/80">Generate a proposal from paid basket items.</p>
            </Link>
            <Link to="/itinerary" className="p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition">
              <div className="font-semibold">Itinerary</div>
              <p className="text-sm text-brand-brown/80">All basket items populate your day plan.</p>
            </Link>
            <div className="relative p-4 bg-cream-sand border border-cream-border rounded-md hover:shadow-lg transition flex flex-col items-center text-center space-y-3">
              <div className="w-full h-full flex flex-col justify-between text-left">
                <div>
                  <div className="font-semibold text-base text-brand-brown">Book Direct</div>
                  <p className="text-sm text-brand-brown/80 mt-2 mb-4">Book and pay instantly for any product.</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold shadow hover:bg-brand-highlight transition relative z-10 self-start"
                  onClick={() => navigate('/book')}
                  aria-label="Open Direct Booking"
                  style={{ marginTop: 'auto' }}
                >
                  Book Now
                </button>
              </div>
            </div>
      {/* Toasts aria-live region for accessibility */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {toasts.map(t => t.text).join(' ')}
      </div>
      {/* Direct Booking Modal */}
      {directBookingOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <DirectBookingModal />
        </div>
      )}
          </div>
        </>
      )}

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 min-w-0">
        {/* Catalog */}
        <div className="lg:col-span-2">
          {/* Live Weather — uses current city/country filters; toggleable via Settings */}
          {showWeather && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-brand-russty/80">Weather</span>
                <button
                  type="button"
                  className="text-[11px] px-2 py-0.5 rounded border border-cream-border bg-white hover:bg-cream-hover"
                  onClick={()=>{ const next=!weatherCollapsed; setWeatherCollapsed(next); try{ localStorage.setItem('weatherCollapsed', next?'1':'0'); }catch{} }}
                  aria-expanded={!weatherCollapsed}
                >{weatherCollapsed ? 'Expand' : 'Collapse'}</button>
              </div>
              {!weatherCollapsed && (
                <WeatherWidget city={locFilters.city} country={locFilters.country} />
              )}
            </div>
          )}
          {/* Tabs with ARIA roles (hidden in Simple mode) */}
          {!simpleMode && (
            <div role="tablist" aria-label="Plan Trip sections" className="mb-3 flex border-b border-cream-border gap-2">
              <button role="tab" aria-selected={activeTab==='catalog'} onClick={()=>setActiveTab('catalog')} className={`px-3 py-2 text-sm -mb-px border-b-2 ${activeTab==='catalog'?'border-brand-brown text-brand-brown':'border-transparent text-brand-brown/60 hover:text-brand-brown'}`}>Catalog</button>
              <button role="tab" aria-selected={activeTab==='events'} onClick={()=>setActiveTab('events')} className={`px-3 py-2 text-sm -mb-px border-b-2 ${activeTab==='events'?'border-brand-brown text-brand-brown':'border-transparent text-brand-brown/60 hover:text-brand-brown'}`}>Events</button>
            </div>
          )}
          {(simpleMode || activeTab==='catalog') && (
          <>
          <div className="flex flex-col gap-3 mb-3 sticky [top:calc(var(--header-h)+var(--banner-h))] z-[45] bg-cream/80 backdrop-blur supports-[backdrop-filter]:bg-cream/60 px-3 py-3 rounded border border-cream-border shadow-sm">
            {/* Product Catalog Heading */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xl text-brand-russty">Product Catalog</h3>
              <div className="flex items-center gap-2 text-sm text-brand-russty/60">
                <span>{sortedFiltered.length} results</span>
                {/* Hidden/collapsed sort control - only show on advanced mode */}
                {showAdvanced && (
                  <select
                    aria-label="Sort catalog"
                    className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
                    value={catalogSort}
                    onChange={(e)=> setCatalogSort(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="alpha">A → Z</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                )}
              </div>
            </div>
            
            {/* Search Bar and Controls */}
            <div className="flex flex-col gap-3">
              {/* Search input row */}
              <div className="relative">
                <input
                  ref={setSearchEl}
                  value={query}
                  onChange={e=>{
                    setQuery(e.target.value);
                    const params = new URLSearchParams(location.search);
                    if(e.target.value) params.set('q', e.target.value); else params.delete('q');
                    navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
                  }}
                  placeholder="Search products, destinations, activities…"
                  title="Press / to focus"
                  className="w-full text-sm pl-3 pr-24 py-2.5 border border-cream-border rounded-md bg-white focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange outline-none"
                  aria-label="Search product catalog"
                    onKeyDown={(e)=>{
                      if(e.key==='Escape'){
                        e.preventDefault();
                        const params = new URLSearchParams(location.search);
                        params.delete('q');
                        setQuery('');
                        navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
                      } else if(e.key==='Enter'){
                        e.preventDefault();
                        applySmartSearch();
                      }
                    }}
                  />
                {smartSuggestion && (
                  <button
                    type="button"
                    onClick={applySmartSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-brand-orange text-white hover:bg-brand-orange/90 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 inline-flex items-center gap-1"
                    aria-label="Apply smart filters suggestion"
                  >
                    <span>🔎</span>
                    <span className="hidden sm:inline truncate max-w-[6rem]">{smartSuggestion.text}</span>
                  </button>
                )}
              </div>
              
              {/* Action buttons row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Near Me button */}
                  <button
                    type="button"
                    className="text-xs px-3 py-2 rounded-md border border-cream-border bg-white hover:bg-cream-hover flex items-center gap-1 whitespace-nowrap"
                    title="Use my location"
                    onClick={()=>{
                      const loc = loadMyLocation();
                      if(!loc || (!loc.city && !loc.province && !loc.country)){
                        showToast('Set your location first', 'warn');
                        return;
                      }
                      const params = new URLSearchParams(location.search);
                      ['continent','country','province','city','area','category','q'].forEach(k=> params.delete(k));
                      if(loc.city) params.set('city', loc.city); else if(loc.province) params.set('province', loc.province); else if(loc.country) params.set('country', loc.country);
                      navigate({ search: `?${params.toString()}` }, { replace: false });
                      showToast('Applied filters near your location', 'success');
                    }}
                  >📍 Near me</button>
                  
                  {/* Advanced toggle */}
                  <button
                    type="button"
                    className="text-xs px-3 py-2 rounded-md border border-cream-border bg-white hover:bg-cream-hover flex items-center gap-1 whitespace-nowrap"
                    title="More filters and tools"
                    aria-expanded={showAdvanced}
                    onClick={()=>{ const next=!showAdvanced; setShowAdvanced(next); try{ localStorage.setItem('planTrip:showAdvanced:v2', next?'1':'0'); }catch{} }}
                  >
                    <span>{showAdvanced ? '🔼' : '🔽'}</span>
                    <span>{showAdvanced? 'Hide' : 'More'}</span>
                  </button>
                </div>
                
                {/* Tip text */}
                {!simpleMode && (
                          <span className="text-xs text-brand-russty/60 italic">💡 Try &quot;Hotels in Durban&quot; or &quot;Safari in Kruger&quot;</span>
                )}
              </div>
            </div>
            
            {!simpleMode && (
                      <span className="hidden md:block text-[11px] text-brand-russty/60">Tip: try “Hotels in Durban”, then press Enter</span>
            )}
            {showAdvanced && (
              <div className="border-t border-cream-border pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Quick actions */}
                {quickActions.length>0 && (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Quick actions">
                    {quickActions.map((qa, idx)=> (
                      <button
                        key={idx}
                        type="button"
                                className="text-xs px-2 py-1 rounded border border-cream-border hover:bg-cream-muted focus:outline-none focus:ring-2 focus:ring-brand-russty/30"
                        onClick={()=>{
                          const params = new URLSearchParams(location.search);
                          ['continent','country','province','city','area','category','q'].forEach(k=> params.delete(k));
                          Object.entries(qa.params).forEach(([k,v])=> v && params.set(k, v));
                          navigate({ search: `?${params.toString()}` }, { replace: false });
                          try { showToast && showToast(`Applied ${qa.label.replace(/ \(.*\)$/,'')}`, 'success'); } catch {}
                        }}
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
                {/* Presets */}
                {!simpleMode && (
                  <div className="flex flex-wrap items-center gap-1">
                    <select
                      value={selectedPreset}
                      onChange={(e)=>{ setSelectedPreset(e.target.value); if(e.target.value) applyPreset(e.target.value); }}
                      className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
                      aria-label="Apply preset"
                      title="Apply preset"
                    >
                      <option value="">Presets…</option>
                      {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                    <input
                      value={presetName}
                      onChange={e=>setPresetName(e.target.value)}
                      placeholder="Preset name"
                      className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
                      aria-label="Preset name"
                    />
                    <button onClick={savePreset} className="text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover" title="Save current filters as preset">Save</button>
                    <button disabled={!selectedPreset} onClick={()=>deletePreset(selectedPreset)} className="text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover disabled:opacity-50" title="Delete selected preset">Delete</button>
                  </div>
                )}
                {/* Price / Paid/Free */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[11px] text-brand-brown/70 inline-flex items-center gap-1">
                    <span className="hidden sm:inline">Min</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={locFilters.priceMin}
                      onChange={(e)=> updateParam('priceMin', e.target.value)}
                      className={`w-20 text-[11px] px-2 py-1 border rounded bg-white ${(()=>{ const min=Number(locFilters.priceMin||''); const max=Number(locFilters.priceMax||''); const hasMin=!Number.isNaN(min)&&locFilters.priceMin!==''; const hasMax=!Number.isNaN(max)&&locFilters.priceMax!==''; return (hasMin&&hasMax&&min>max)?'border-red-400':'border-cream-border'; })()}`}
                      aria-label="Minimum price"
                      placeholder="Min"
                    />
                  </label>
                  <label className="text-[11px] text-brand-brown/70 inline-flex items-center gap-1">
                    <span className="hidden sm:inline">Max</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={locFilters.priceMax}
                      onChange={(e)=> updateParam('priceMax', e.target.value)}
                      className={`w-20 text-[11px] px-2 py-1 border rounded bg-white ${(()=>{ const min=Number(locFilters.priceMin||''); const max=Number(locFilters.priceMax||''); const hasMin=!Number.isNaN(min)&&locFilters.priceMin!==''; const hasMax=!Number.isNaN(max)&&locFilters.priceMax!==''; return (hasMin&&hasMax&&min>max)?'border-red-400':'border-cream-border'; })()}`}
                      aria-label="Maximum price"
                      placeholder="Max"
                    />
                  </label>
                  {(() => { const min=Number(locFilters.priceMin||''); const max=Number(locFilters.priceMax||''); const hasMin=!Number.isNaN(min)&&locFilters.priceMin!==''; const hasMax=!Number.isNaN(max)&&locFilters.priceMax!==''; if (hasMin&&hasMax&&min>max) { return (<span role="alert" className="text-[11px] text-red-600">Min is greater than Max</span>); } return null; })()}
                  <label className="text-[11px] text-brand-brown/70 inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!locFilters.paidOnly}
                      onChange={(e)=> { const checked = e.target.checked; updateParam('paidOnly', checked ? '1' : ''); if (checked) { updateParam('freeOnly',''); } }}
                      aria-label="Paid items only"
                      disabled={!!locFilters.freeOnly}
                    />
                    <span>Paid only</span>
                  </label>
                  <label className="text-[11px] text-brand-brown/70 inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!locFilters.freeOnly}
                      onChange={(e)=> { const checked = e.target.checked; updateParam('freeOnly', checked ? '1' : ''); if (checked) { updateParam('paidOnly',''); } }}
                      aria-label="Free items only"
                      disabled={!!locFilters.paidOnly}
                    />
                    <span>Free only</span>
                  </label>
                </div>
                {/* Utilities: copy link, reset, set my location */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={async ()=>{
                      try {
                        const url = window.location.href;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(url);
                        } else {
                          const ta = document.createElement('textarea');
                          ta.value = url;
                          ta.setAttribute('readonly','');
                          ta.style.position = 'absolute';
                          ta.style.left = '-9999px';
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand('copy');
                          document.body.removeChild(ta);
                        }
                        setCopyLinkStatus('ok');
                        showToast('Link copied', 'success');
                        setTimeout(()=> setCopyLinkStatus(''), 1500);
                      } catch {
                        setCopyLinkStatus('err');
                        showToast('Copy failed', 'error');
                        setTimeout(()=> setCopyLinkStatus(''), 2000);
                      }
                    }}
                    className="text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover"
                    title="Copy shareable link"
                    aria-label="Copy shareable link"
                  >Copy link</button>
                  <button
                    onClick={()=>{
                      const params = new URLSearchParams(location.search);
                      ['continent','country','province','city','area','category','priceMin','priceMax','paidOnly','freeOnly','q'].forEach(k=>params.delete(k));
                      setQuery('');
                      navigate({ search: '' }, { replace: true });
                    }}
                    className="text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover"
                    title="Reset filters and search"
                  >Reset</button>
                  <button
                    type="button"
                    className="text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover"
                    title="Set my location"
                    onClick={()=> setLocModalOpen(true)}
                  >Set my location</button>
                  <span aria-live="polite" className="sr-only">{copyLinkStatus==='ok' ? 'Link copied' : (copyLinkStatus==='err' ? 'Copy failed' : '')}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Shareable link button feedback via sr-only region above */}
          {/* Cascading location filter bar */}
          {/* Live region for announcing results count to assistive tech */}
          <div aria-live="polite" role="status" className="sr-only">{sortedFiltered.length} results in catalog</div>
          {showAdvanced && (
          <div ref={advancedFiltersRef} className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 mb-3">
            <select
              value={locFilters.continent}
              onChange={(e)=>updateLocationParam('continent', e.target.value)}
              className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
              aria-label="Filter by continent"
              title="Filter by continent"
            >
              <option value="">All continents</option>
              {continents.map(c => <option key={c} value={c}>{c} {counts.continent[c] ? `(${counts.continent[c]})` : ''}</option>)}
            </select>
            <select
              value={locFilters.country}
              onChange={(e)=>updateLocationParam('country', e.target.value)}
              className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
              aria-label="Filter by country"
              title="Filter by country"
              disabled={!countries.length}
            >
              <option value="">All countries</option>
              {countries.map(c => <option key={c} value={c}>{c} {counts.country[c] ? `(${counts.country[c]})` : ''}</option>)}
            </select>
            <select
              value={locFilters.province}
              onChange={(e)=>updateLocationParam('province', e.target.value)}
              className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
              aria-label="Filter by province"
              title="Filter by province"
              disabled={!provinces.length}
            >
              <option value="">All provinces</option>
              {provinces.map(pv => <option key={pv} value={pv}>{pv} {counts.province[pv] ? `(${counts.province[pv]})` : ''}</option>)}
            </select>
            <select
              value={locFilters.city}
              onChange={(e)=>updateLocationParam('city', e.target.value)}
              className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
              aria-label="Filter by city"
              title="Filter by city"
              disabled={!cities.length}
            >
              <option value="">All cities</option>
              {cities.map(ct => <option key={ct} value={ct}>{ct} {counts.city[ct] ? `(${counts.city[ct]})` : ''}</option>)}
            </select>
            <select
              value={locFilters.area}
              onChange={(e)=>updateLocationParam('area', e.target.value)}
              className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
              aria-label="Filter by area"
              title="Filter by area"
              disabled={!areas.length}
            >
              <option value="">All areas</option>
              {areas.map(ar => <option key={ar} value={ar}>{ar} {counts.area[ar] ? `(${counts.area[ar]})` : ''}</option>)}
            </select>
            <select
              value={locFilters.category}
              onChange={(e)=>updateParam('category', e.target.value)}
              className="text-xs px-2 py-1 border border-cream-border rounded bg-white"
              aria-label="Filter by category"
              title="Filter by category"
              disabled={!categories.length}
            >
              <option value="">All categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat} {counts.category[cat] ? `(${counts.category[cat]})` : ''}</option>)}
            </select>
            {/* Presets moved into Advanced panel */}
          </div>
          )}
          {/* Preset status and recent filters */}
          <span aria-live="polite" className="sr-only">
            {presetStatus==='saved'?'Preset saved':presetStatus==='applied'?'Preset applied':presetStatus==='deleted'?'Preset deleted':''}
          </span>
          {!simpleMode && showAdvanced && recentFilters.length>0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
              <span className="text-[11px] text-brand-brown/60 mr-1">Recent:</span>
              {recentFilters.map((r, idx) => {
                const f = r.filters || {};
                const labelParts = ['city','province','country','area','category','continent'].map(k=>f[k]).filter(Boolean);
                const label = labelParts.join(' • ').slice(0, 40) + (labelParts.join(' • ').length>40?'…':'');
                return (
                  <button
                    key={r.signature||idx}
                    onClick={()=>applyFilters(f)}
                    className="text-[11px] px-2 py-1 rounded-full border border-cream-border bg-white hover:bg-cream-hover"
                    title={labelParts.join(' • ')}
                  >{label || 'Unnamed'}</button>
                );
              })}
              <button
                onClick={()=>{ setRecentFilters([]); try { localStorage.setItem('planTripRecentFilters:v1', '[]'); } catch {} showToast('Recent filters cleared', 'info'); }}
                className="text-[11px] px-2 py-1 rounded-full border border-cream-border bg-white hover:bg-cream-hover"
                title="Clear recent filters"
              >Clear recents</button>
            </div>
          )}
          {/* Active filter chips */}
          {(locFilters.continent || locFilters.country || locFilters.province || locFilters.city || locFilters.area || locFilters.category || locFilters.priceMin || locFilters.priceMax || locFilters.paidOnly || locFilters.freeOnly) && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4">
              {['continent','country','province','city','area'].map((k) => (
                locFilters[k] ? (
                  <button
                    key={k}
                    onClick={() => updateLocationParam(k, '')}
                    className="text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 active:scale-[0.98] transition"
                    title={`Clear ${k}`}
                    aria-label={`Clear ${k} filter: ${locFilters[k]}`}
                  >
                    {k}: {locFilters[k]} ×
                  </button>
                ) : null
              ))}
              {locFilters.category ? (
                <button
                  onClick={() => updateParam('category','')}
                  className="text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 active:scale-[0.98] transition"
                  title={`Clear category`}
                  aria-label={`Clear category filter: ${locFilters.category}`}
                >
                  category: {locFilters.category} ×
                </button>
              ) : null}
              {locFilters.priceMin ? (
                <button
                  onClick={() => updateParam('priceMin','')}
                  className="text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 active:scale-[0.98] transition"
                  title="Clear minimum price"
                  aria-label={`Clear minimum price filter: ${locFilters.priceMin}`}
                >
                  min: {locFilters.priceMin} ×
                </button>
              ) : null}
              {locFilters.priceMax ? (
                <button
                  onClick={() => updateParam('priceMax','')}
                  className="text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 active:scale-[0.98] transition"
                  title="Clear maximum price"
                  aria-label={`Clear maximum price filter: ${locFilters.priceMax}`}
                >
                  max: {locFilters.priceMax} ×
                </button>
              ) : null}
              {locFilters.paidOnly ? (
                <button
                  onClick={() => updateParam('paidOnly','')}
                  className="text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 active:scale-[0.98] transition"
                  title="Clear paid only"
                  aria-label={`Clear paid only filter`}
                >
                  paid only ×
                </button>
              ) : null}
              {locFilters.freeOnly ? (
                <button
                  onClick={() => updateParam('freeOnly','')}
                  className="text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-brown/30 active:scale-[0.98] transition"
                  title="Clear free only"
                  aria-label={`Clear free only filter`}
                >
                  free only ×
                </button>
              ) : null}
              <button
                onClick={clearLocationFilters}
                className="text-[11px] px-2 py-1 rounded-full border border-cream-border bg-white hover:bg-cream-hover text-brand-russty/80 focus:outline-none focus:ring-2 focus:ring-brand-russty/30 active:scale-[0.98] transition"
                title="Clear all location filters"
                aria-label="Clear all location filters"
              >
                Clear filters
              </button>
            </div>
          )}
          <ul className="space-y-3">
            {sortedFiltered.map(p => (
              <li key={p.id} className="p-4 rounded border bg-cream-sand border-cream-border flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                        <span>{sortedFiltered.length} results</span>
                  <div className="text-sm text-brand-russty/70">{highlight(p.description)}</div>
                  <div className="text-[11px] text-brand-russty/50">{p.category} • {p.price > 0 ? `Price: $${p.price}` : 'Included / No charge'}</div>
                  <div className="text-[11px] text-brand-russty/60 mt-0.5">
                    {(p.province || p.country || p.city) ? (
                      <>
                        {p.province ? `${p.province}, ` : ''}{p.city || p.country}
                        {p.area ? ` • ${p.area}` : ''}
                      </>
                    ) : null}
                  </div>
                </div>
                <button onClick={()=>addToBasket(p)} className="px-3 py-1.5 text-xs rounded border border-brand-russty hover:bg-cream-hover">Add</button>
              </li>
            ))}
            {sortedFiltered.length===0 && (
              <li className="text-sm text-brand-russty/60 flex items-center gap-2">
                <span>No results.</span>
                <button onClick={clearLocationFilters} className="text-brand-russty underline hover:no-underline">Clear filters</button>
                <span className="hidden sm:inline">or</span>
                <button onClick={()=>{ const params = new URLSearchParams(location.search); ['continent','country','province','city','area','category','priceMin','priceMax','paidOnly','q'].forEach(k=>params.delete(k)); setQuery(''); navigate({ search: '' }, { replace: true }); }} className="text-brand-russty underline hover:no-underline">Reset all</button>
              </li>
            )}
          </ul>
          </>
          )}

          {/* Events from trusted providers (hidden in Simple mode) */}
          {!simpleMode && activeTab==='events' && (locFilters.country || locFilters.city || query.trim().length >= 3) && (
            <div className="mt-6">
              <div className="flex items-baseline justify-between mb-2">
                <h4 className="font-semibold">Events {locFilters.city ? `• ${locFilters.city}` : (locFilters.country ? `• ${locFilters.country}` : '')}</h4>
                <div className="flex items-center gap-3">
                  <label className="text-[12px] text-brand-brown/70 inline-flex items-center gap-1">
                    <input type="checkbox" checked={includePast} onChange={toggleIncludePast} />
                    <span>Include past</span>
                  </label>
                  <label className="text-[12px] text-brand-brown/70 inline-flex items-center gap-1">
                    <input type="checkbox" checked={groupByMonth} onChange={toggleGroup} />
                    <span>Group by month</span>
                  </label>
                  <label className="text-[12px] text-brand-brown/70 inline-flex items-center gap-1">
                    <span className="hidden sm:inline">Sort</span>
                    <select
                      aria-label="Sort events by date"
                      className="text-[12px] px-1.5 py-0.5 border border-cream-border rounded bg-white"
                      value={eventsSort}
                      onChange={(e)=> onChangeSort(e.target.value)}
                    >
                      <option value="dateAsc">Soonest first</option>
                      <option value="dateDesc">Latest first</option>
                    </select>
                  </label>
                  {eventsLoading && <span className="text-xs text-brand-brown/60">Loading…</span>}
                </div>
              </div>
              {eventsError && <div role="alert" className="text-xs text-red-600 mb-2">{eventsError}</div>}
              {!eventsLoading && events.length === 0 && !eventsError && (
                <div className="text-sm text-brand-brown/70 bg-cream-sand border border-cream-border rounded p-3">
                  <div className="font-medium mb-1">No events found.</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Try a broader search term or clear the search box.</li>
                    <li>Select just a country (and remove city) to widen results.</li>
                    <li>On Settings, enable “Show demo events” to visualize the experience.</li>
                  </ul>
                  <div className="mt-2">
                    <Link
                      to="/settings"
                      className="inline-block px-2.5 py-1 text-xs rounded border border-cream-border bg-white hover:bg-cream-hover"
                    >
                      Open Settings
                    </Link>
                  </div>
                </div>
              )}
              {/* Grouped rendering (optional) */}
              {!groupByMonth && (
                <ul className="space-y-2">
                  {eventsLoading && events.length===0 && (
                    Array.from({ length: 3 }).map((_,i)=> (
                      <li key={`skeleton_${i}`} className="p-3 rounded border border-cream-border bg-white animate-pulse">
                        <div className="h-4 bg-cream-sand/80 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-cream-sand/70 rounded w-1/2"></div>
                      </li>
                    ))
                  )}
                  {events.map(e => (
                    <li key={`ev_${e.source}_${e.id}`} className="p-3 rounded border border-cream-border bg-white flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{e.name} {e.source==='Demo' && <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-cream-sand border border-cream-border align-middle">Demo</span>}</div>
                        <div className="text-[12px] text-brand-brown/70 truncate">
                          {([e.venue, e.city, e.country].filter(Boolean).length > 0)
                            ? (
                              <>
                                {[e.venue, e.city, e.country].filter(Boolean).join(', ')} {e.date ? `• ${new Date(e.date).toLocaleDateString()}` : ''}
                              </>
                            ) : (
                              <>
                                {e.date ? <span className="px-1 py-0.5 mr-1 rounded bg-cream-sand border border-cream-border align-middle">{new Date(e.date).toLocaleDateString()}</span> : null}
                              </>
                            )}
                          {' '}• <span className="px-1 py-0.5 text-[10px] rounded bg-cream-sand border border-cream-border align-middle">{e.source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs rounded border border-cream-border hover:bg-cream-hover">Open</a>}
                        <button
                          onClick={()=> addToBasket({
                            id: `ev_${e.source}_${e.id}`,
                            title: e.name,
                            description: [e.venue, e.city, e.country, e.date && new Date(e.date).toLocaleDateString()].filter(Boolean).join(' • '),
                            category: 'Event',
                            price: 0,
                            url: e.url || '',
                            source: e.source,
                          })}
                          className="px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover"
                        >Add</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {groupByMonth && (
                <div className="space-y-4">
                  {(() => {
                    const byMonth = new Map();
                    for(const e of events){
                      let label = 'Unknown date';
                      if(e?.date){
                        const d = new Date(e.date);
                        if(!Number.isNaN(d.valueOf())){
                          label = d.toLocaleString(undefined, { month:'long', year:'numeric' });
                        }
                      }
                      if(!byMonth.has(label)) byMonth.set(label, []);
                      byMonth.get(label).push(e);
                    }
                    const entries = Array.from(byMonth.entries());
                    return entries.map(([label, list]) => (
                      <section key={label}>
                        <h5 className="text-sm font-semibold text-brand-brown/80 mb-2">{label}</h5>
                        <ul className="space-y-2">
                          {list.map(e => (
                            <li key={`ev_${e.source}_${e.id}`} className="p-3 rounded border border-cream-border bg-white flex flex-col md:flex-row md:items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{e.name} {e.source==='Demo' && <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-cream-sand border border-cream-border align-middle">Demo</span>}</div>
                                <div className="text-[12px] text-brand-brown/70 truncate">
                                  {([e.venue, e.city, e.country].filter(Boolean).length > 0)
                                    ? (
                                      <>
                                        {[e.venue, e.city, e.country].filter(Boolean).join(', ')} {e.date ? `• ${new Date(e.date).toLocaleDateString()}` : ''}
                                      </>
                                    ) : (
                                      <>
                                        {e.date ? <span className="px-1 py-0.5 mr-1 rounded bg-cream-sand border border-cream-border align-middle">{new Date(e.date).toLocaleDateString()}</span> : null}
                                      </>
                                    )}
                                  {' '}• <span className="px-1 py-0.5 text-[10px] rounded bg-cream-sand border border-cream-border align-middle">{e.source}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs rounded border border-cream-border hover:bg-cream-hover">Open</a>}
                                <button
                                  onClick={()=> addToBasket({
                                    id: `ev_${e.source}_${e.id}`,
                                    title: e.name,
                                    description: [e.venue, e.city, e.country, e.date && new Date(e.date).toLocaleDateString()].filter(Boolean).join(' • '),
                                    category: 'Event',
                                    price: 0,
                                    url: e.url || '',
                                    source: e.source,
                                  })}
                                  className="px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover"
                                >Add</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ));
                  })()}
                </div>
              )}
              
              {eventsHasMore && (
                <div className="mt-3">
                  <button
                    onClick={async ()=>{
                      // Load next page and append
                      try {
                        setEventsLoading(true);
                        const term = query.trim();
                        const city = locFilters.city.trim();
                        const country = locFilters.country.trim();
                        const nextPage = (eventsPage || 1) + 1;
                        const { events: more, page, hasMore } = await fetchEvents({ q: term || "", city, country, page: nextPage, limit: 8, includePast });
                        setEvents(prev => mergeAndSort(prev, more, eventsSort));
                        setEventsPage(page || nextPage);
                        setEventsHasMore(!!hasMore);
                      } catch {
                        // keep existing list, surface a soft error
                        setEventsError("Could not load more events.");
                      } finally {
                        setEventsLoading(false);
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded border border-cream-border bg-white hover:bg-cream-hover"
                  >Load more</button>
                </div>
              )}
              {/* Provider contribution summary */}
              {Object.keys(eventsSourceCounts||{}).length>0 && (
                <div className="mt-3 text-[12px] text-brand-brown/60">
                  Sources: {Object.entries(eventsSourceCounts).map(([k,v]) => (
                    <span key={k} className="inline-flex items-center gap-1 mr-2">
                      <span className="px-1 py-0.5 rounded bg-cream-sand border border-cream-border">{k}</span>
                      <span>{v}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
    {/* Basket (hidden in Simple mode) */}
    {!simpleMode && (
  <div className="rounded border border-cream-border bg-cream p-4 h-fit sticky [top:calc(var(--header-h)+var(--banner-h)+2rem)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Basket ({basket.length})</h3>
            {!confirmClear && (
              <button onClick={()=>setConfirmClear(true)} className="text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover">Clear basket</button>
            )}
            {confirmClear && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-brand-brown/70">Confirm?</span>
                <button
                  onClick={()=>{
                    setLastCleared(basket);
                    clearBasket();
                    setConfirmClear(false);
                    setUndoMsg('Basket cleared. Undo available for 10 seconds.');
                    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
                    undoTimerRef.current = setTimeout(()=>{ setUndoMsg(''); setLastCleared([]); }, 10000);
                    showToast('Basket cleared', 'info');
                  }}
                  className="text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover"
                >Yes</button>
                <button onClick={()=>setConfirmClear(false)} className="text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover">No</button>
              </div>
            )}
          </div>
          {undoMsg && (
            <div className="mb-2 text-[12px] bg-cream-sand border border-cream-border rounded p-2 flex items-center justify-between">
              <span>{undoMsg}</span>
              <button
                onClick={()=>{
                  if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
                  // restore order and quantities
                  const snapshot = lastCleared || [];
                  snapshot.forEach(item => addToBasket({ ...item }));
                  setUndoMsg('Restored basket');
                  setTimeout(()=> setUndoMsg(''), 1200);
                  setLastCleared([]);
                  showToast('Basket restored', 'success');
                }}
                className="text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover"
              >Undo</button>
            </div>
          )}
          <span aria-live="polite" className="sr-only">{undoMsg}</span>
          
          {/* Workflow Panel - shows workflow when basket has items */}
          {basket.length > 0 && (
            <div className="mb-4">
              <WorkflowPanel 
                currentPage="plan-trip"
                basketCount={basket.length}
                hasItinerary={false}
                hasQuote={false}
              />
            </div>
          )}
          
          {/* Toasts container */}
          {toasts.length>0 && (
            <div className="fixed right-4 bottom-4 z-50 space-y-2">
              {toasts.map(t => (
                <div key={t.id} className={`px-3 py-2 rounded shadow border text-sm ${t.type==='success'?'bg-green-50 border-green-200 text-green-800': t.type==='error'?'bg-red-50 border-red-200 text-red-800': t.type==='warn'?'bg-yellow-50 border-yellow-200 text-yellow-800':'bg-white border-cream-border text-brand-russty'}`}>{t.text}</div>
              ))}
            </div>
          )}
          {/* Live region: announce basket item count updates */}
          <div aria-live="polite" role="status" className="sr-only">Basket has {basket.length} item{basket.length===1?'':'s'}</div>
          {basket.length === 0 && <p className="text-sm text-brand-russty/60">No items yet. Add from the catalog.</p>}
          <ul className="space-y-2 mb-4">
            {basket.map(item => (
              <li key={item.id} className="bg-white rounded border border-cream-border p-2 text-sm flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{item.title}</span>
                  <button onClick={()=>removeFromBasket(item.id)} className="text-[10px] uppercase tracking-wide text-red-600 hover:text-red-500">Remove</button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-brand-russty/70">
                  <span>{item.price > 0 ? formatCurrency(item.price, 'USD') : 'Included'}</span>
                  <span>• Qty</span>
                  <input type="number" min={1} value={item.quantity} onChange={e=>updateQuantity(item.id, Number(e.target.value))} className="w-14 px-1 py-0.5 border border-cream-border rounded" />
                  <span>• Day</span>
                  <input type="number" min={1} value={item.day || 1} onChange={e=>updateDay(item.id, e.target.value)} className="w-14 px-1 py-0.5 border border-cream-border rounded" />
                </div>
              </li>
            ))}
          </ul>
          {(() => {
            const paidTotal = paidItems.reduce((sum,i)=> sum + (Number(i.price)||0) * (Number(i.quantity)||1), 0);
            return (
              <div className="flex items-center justify-between text-xs text-brand-russty/80 mb-3">
                <span>All items appear in itinerary. Paid items appear in quotes.</span>
                <span className="font-semibold">Paid total: {formatCurrency(paidTotal, 'USD')}</span>
              </div>
            );
          })()}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={async ()=>{
                try {
                  const lines = [];
                  lines.push('Trip Basket Summary');
                  lines.push('');
                  basket.forEach(i => {
                    const qty = Number(i.quantity)||1;
                    const unit = Number(i.price)||0;
                    const _lineTotal = unit * qty; // eslint-disable-line no-unused-vars
                    const loc = [i.city, i.province, i.country].filter(Boolean).join(', ');
                    lines.push(`- ${qty} x ${i.title}${unit>0?` @ ${formatCurrency(unit,'USD')}`:' (Included)'}${loc?` • ${loc}`:''}`);
                  });
                  const paidTotal = paidItems.reduce((sum,i)=> sum + (Number(i.price)||0) * (Number(i.quantity)||1), 0);
                  lines.push('');
                  lines.push(`Paid total: ${formatCurrency(paidTotal,'USD')}`);
                  const text = lines.join('\n');
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                  } else {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly','');
                    ta.style.position = 'absolute';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                  }
                  setCopySummaryStatus('ok');
                  setTimeout(()=> setCopySummaryStatus(''), 1500);
                } catch {
                  setCopySummaryStatus('err');
                  setTimeout(()=> setCopySummaryStatus(''), 2000);
                }
              }}
              className="px-2 py-1 text-xs rounded border border-cream-border bg-white hover:bg-cream-hover"
              title="Copy basket summary"
              aria-label="Copy basket summary"
            >Copy summary</button>
            <span aria-live="polite" className="sr-only">{copySummaryStatus==='ok' ? 'Basket summary copied' : (copySummaryStatus==='err' ? 'Copy failed' : '')}</span>
          </div>
          <Link to="/quote/new" state={{ fromBasket: true }} className={`block text-center px-3 py-2 rounded text-sm font-medium border ${paidItems.length? 'bg-brand-orange text-cream border-brand-orange hover:bg-brand-orange/90':'bg-cream-sand text-brand-russty/50 border-cream-border cursor-not-allowed'}`}>Create Quote ({paidItems.length})</Link>
        </div>
        )}
      </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-[calc(var(--footer-h)+1rem)]">
        <Link to="/bookings" className="p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition">
          <div className="font-semibold">Bookings</div>
          <p className="text-sm text-brand-russty/80">See all confirmations and status in one place.</p>
        </Link>
        <Link to="/terms" className="p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition">
          <div className="font-semibold">Travel Safety & Terms</div>
          <p className="text-sm text-brand-russty/80">Know-before-you-go and policies.</p>
        </Link>
        <Link to="/contact" className="p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition">
          <div className="font-semibold">Concierge</div>
          <p className="text-sm text-brand-russty/80">Need help? Our team is here.</p>
        </Link>
      </div>
      {/* My Location Modal */}
      <MyLocationModal
        open={locModalOpen}
        initial={myLocation}
        onClose={()=> setLocModalOpen(false)}
        onSave={(loc)=>{
          persistMyLocation(loc);
          setLocModalOpen(false);
          showToast('Location saved', 'success');
        }}
      />
    </div>
    </div>
  );
}
