import React, { useMemo, useState, useEffect, useRef } from 'react';
import Modal from '../components/ui/Modal';
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import ItineraryDay from "../components/ui/ItineraryDay";
import ExperienceCard from "../components/ui/ExperienceCard";
import MemoryNote from "../components/ui/MemoryNote";
import LiveTripProgress from "../components/ui/LiveTripProgress";
import jsPDF from "jspdf";
import { useTripState, setMemory, computeProgress } from "../utils/useTripState";
import { useBasketState } from "../utils/useBasketState";
import { useLocalStorageState } from "../useLocalStorageState";
import FeesBreakdown from "../components/payments/FeesBreakdown";
import PaymentButton from "../components/payments/PaymentButton";
import { useClickOutsideAndEscape } from "../hooks/useClickOutside";

export default function Itinerary() {
  const [trip, setTrip] = useTripState();
  const [linkQuotes, setLinkQuotes] = useLocalStorageState('basketAutoSync:v1', true);
  const { basket, updateDay: updateBasketDay, removeFromBasket, reorderWithin } = useBasketState();
  const dragItem = useRef(null); // { day, index }
  const dragOverItem = useRef(null);
  const [reorderingDay, setReorderingDay] = useLocalStorageState('itineraryReorderDay:v1', null);
  const [bulkModeDay, setBulkModeDay] = useLocalStorageState('itineraryBulkModeDay:v1', null);
  const [bulkSelected, setBulkSelected] = useState({}); // { day: Set(ids) }
  const [repeatModal, setRepeatModal] = useState(null); // { item, originDay }
  const [repeatDaysInput, setRepeatDaysInput] = useState('');
  const liveRef = useRef(null); // aria-live region for announcements
  const [highContrastFocus, setHighContrastFocus] = useLocalStorageState('itineraryHighContrastFocus:v1', false);
  const [enableToasts, setEnableToasts] = useLocalStorageState('itineraryEnableToasts:v1', true);
  // Toast state (preferences stored above)
  const [toasts, setToasts] = useState([]); // [{id, msg}]
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorageState('itineraryAnimations:v1', true);
  const [hideAI, setHideAI] = useLocalStorageState('itineraryHideAI:v1', false);
  const [aiDraft, setAiDraft] = useState(null);
  const [showAiImport, setShowAiImport] = useState(false);
  // Quick search across visible items
  const [search, setSearch] = useState("");
  // Undo / Redo stacks (simple LIFO of full trip snapshots)
  const undoStackRef = useRef([]); // past states
  const redoStackRef = useRef([]); // future states after undo
  const [_historyVersion, setHistoryVersion] = useState(0); // bump to rerender buttons
  const [showHistory, setShowHistory] = useState(false);
  // Coalescing state for rapid keyboard reorders
  const _coalesceRef = useRef({ active:false, timer:null, baseSnapshot:null });
  // Stable refs for undo/redo to avoid effect dependency churn
  const undoRef = useRef(() => {});
  const redoRef = useRef(() => {});

  function pushUndo(prevTrip, label){
    const snapshot = JSON.parse(JSON.stringify(prevTrip));
    undoStackRef.current.push({ trip: snapshot, label });
    // clear redo stack on new action
    redoStackRef.current = [];
    if(undoStackRef.current.length > 50){ undoStackRef.current.shift(); }
    setHistoryVersion(v=>v+1);
  }
  function undo(){
    if(!undoStackRef.current.length) return;
    const current = JSON.parse(JSON.stringify(trip));
    const last = undoStackRef.current.pop();
    redoStackRef.current.push({ trip: current, label: 'redo-of-'+(last.label||'change') });
    setTrip(last.trip);
    setHistoryVersion(v=>v+1);
  }
  function redo(){
    if(!redoStackRef.current.length) return;
    const current = JSON.parse(JSON.stringify(trip));
    const next = redoStackRef.current.pop();
    undoStackRef.current.push({ trip: current, label: 'undo-of-'+(next.label||'change') });
    setTrip(next.trip);
    setHistoryVersion(v=>v+1);
  }
  // Keep refs updated with latest functions
  undoRef.current = undo;
  redoRef.current = redo;
  // Global keyboard listener (Ctrl/Cmd+Z / Shift+Z) without re-subscribing every render
  useEffect(()=>{
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if((e.ctrlKey||e.metaKey) && key==='z' && !e.shiftKey){ e.preventDefault(); undoRef.current(); }
      else if((e.ctrlKey||e.metaKey) && key==='z' && e.shiftKey){ e.preventDefault(); redoRef.current(); }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, []);

  // Detect AI draft in localStorage
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('aiItineraryDraft:v1');
      if(raw){
        const parsed = JSON.parse(raw);
        setAiDraft(parsed);
      }
    } catch{/* ignore */}
  }, [trip.days]);

  // Suspend reorder/bulk when a search is active
  const searching = search.trim().length > 0;
  useEffect(()=>{
    if(searching){ setReorderingDay(null); setBulkModeDay(null); }
  }, [searching, setReorderingDay, setBulkModeDay]);

  function importAiDraft(mode){
    if(!aiDraft) return;
    const draftDays = {};
    // Map draft itinerary array -> day keyed arrays; assumes sequential days starting at 1
    (aiDraft.itinerary||[]).forEach(d => {
      const key = String(d.day || d.dayNumber || d.dayIndex || d.day || d.day === 0 ? d.day : d.day || d.dayNumber || 1);
      if(!draftDays[key]) draftDays[key] = [];
      draftDays[key].push({ id: 'ai-'+d.day+'-'+Math.random().toString(36).slice(2), title: d.title || `Day ${d.day}`, time: 'Flexible', subtitle: (d.activities||[]).join(', '), _aiSource: true });
    });
    if(mode==='replace'){
      pushUndo(trip, 'ai-replace');
      setTrip(prev => ({ ...prev, days: draftDays }));
    } else if(mode==='merge') {
      pushUndo(trip, 'ai-merge');
      setTrip(prev => {
        const merged = { ...prev.days };
        Object.keys(draftDays).forEach(k => {
          merged[k] = [...(merged[k]||[]), ...draftDays[k]];
        });
        return { ...prev, days: merged };
      });
    }
    try { localStorage.removeItem('aiItineraryDraft:v1'); } catch{}
  setAiDraft(null); setShowAiImport(false);
  announce('Draft imported');
  }

  // Helper to wrap trip mutations with undo snapshot
  function safeSetTrip(mutator, label){
    setTrip(prev => {
      pushUndo(prev, label);
      return mutator(prev);
    });
  }

  function bulkMove(fromDay, toDay){
    if(!bulkSelected[fromDay] || !bulkSelected[fromDay].size) return;
    const movingIds = bulkSelected[fromDay];
    const movingItems = (trip.days[fromDay]||[]).filter(it => movingIds.has(it.id));
    if(!movingItems.length) return;
    safeSetTrip(t => {
      const srcArr = (t.days[fromDay]||[]).filter(it => !movingIds.has(it.id));
      const destArr = [...(t.days[toDay]||[]), ...movingItems];
      return { ...t, days: { ...t.days, [fromDay]: srcArr, [toDay]: destArr } };
    }, 'bulkMove');
    movingItems.forEach(it => { if(it._basketSource) updateBasketDay(it.id, Number(toDay)); });
    setBulkSelected(prev => ({ ...prev, [fromDay]: new Set() }));
    setBulkModeDay(null);
  }

  function toggleBulkMode(day){
    if(bulkModeDay===day){ setBulkModeDay(null); return; }
    setBulkModeDay(day); setReorderingDay(null);
    setBulkSelected(s=>({ ...s, [day]: new Set(s[day]||[]) }));
  }

  function toggleBulkSelect(day,id){
    setBulkSelected(prev=>{
      const set = new Set(prev[day]||[]);
      if(set.has(id)) set.delete(id); else set.add(id);
      return { ...prev, [day]: set };
    });
  }

  function beginReorder(day) {
    setReorderingDay(reorderingDay === day ? null : day);
    // Exiting reorder mode clears persisted bulk mode (optional design)
    if(reorderingDay === day){ return; }
  }

  // Cleanup persisted reorderingDay / bulkModeDay if the referenced day no longer exists
  useEffect(()=>{
    if(reorderingDay && !trip.days[reorderingDay]) setReorderingDay(null);
    if(bulkModeDay && !trip.days[bulkModeDay]) setBulkModeDay(null);
  }, [trip.days, reorderingDay, bulkModeDay, setReorderingDay, setBulkModeDay]);

  function onDragStart(e, day, index) {
    dragItem.current = { day, index };
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragEnter(_e, day, index) {
    dragOverItem.current = { day, index };
  }
  const onDragEnd = () => {
    const from = dragItem.current; const to = dragOverItem.current;
    if (!from || !to || from.day !== to.day || from.index === to.index) { dragItem.current = dragOverItem.current = null; return; }
    let newOrderIds = [];
    safeSetTrip(t => {
      const dayArr = [...(t.days[from.day] || [])];
      const [moved] = dayArr.splice(from.index, 1);
      dayArr.splice(to.index, 0, moved);
      newOrderIds = dayArr.filter(x=>x._basketSource).map(x=>x.id);
      return { ...t, days: { ...t.days, [from.day]: dayArr } };
    }, 'reorder');
    if(newOrderIds.length){
      reorderWithin(newOrderIds);
    }
    announce(`Reordered to position ${to.index+1} in day ${to.day}`);
    dragItem.current = dragOverItem.current = null;
  };

  function announce(msg){
    // Screen reader live region update
    if(liveRef.current){
      liveRef.current.textContent = msg;
      setTimeout(()=>{ if(liveRef.current && liveRef.current.textContent===msg) liveRef.current.textContent=''; }, 2000);
    }
    // Visual toast queue (non-blocking)
    if(enableToasts){
      const id = Date.now() + Math.random().toString(36).slice(2);
      setToasts(prev => {
        const next = [...prev, { id, msg }];
        // Queue limit
        if(next.length > 4) next.shift();
        return next;
      });
      // Auto dismiss after 3.5s
      setTimeout(()=>{
        setToasts(prev => prev.filter(t=>t.id!==id));
      }, 3500);
    }
  }

  // Auto-sync basket items into Day 1 (simple strategy) when enabled
  useEffect(() => {
    if (!linkQuotes) return;
    setTrip(t => {
      let next = { ...t, days: { ...t.days } };
      let mutated = false;
      const basketIds = new Set(basket.map(b => b.id));

      // Remove previously synced items no longer in basket
      Object.keys(next.days).forEach(d => {
        const filtered = (next.days[d] || []).filter(it => !(it._basketSource && !basketIds.has(it.id)));
        if (filtered.length !== (next.days[d] || []).length) {
          next.days[d] = filtered;
          mutated = true;
        }
      });

      // Add / move items according to their assigned day
      basket.forEach(bItem => {
        const targetDay = String(bItem.day || 1);
        const existingInTarget = (next.days[targetDay] || []).find(it => it.id === bItem.id);
        // If item exists in a different day, remove from that day
        Object.keys(next.days).forEach(d => {
          if (d !== targetDay) {
            if ((next.days[d] || []).some(it => it.id === bItem.id && it._basketSource)) {
              next.days[d] = next.days[d].filter(it => it.id !== bItem.id);
              mutated = true;
            }
          }
        });
        if (!existingInTarget) {
          const arr = next.days[targetDay] || [];
            next.days[targetDay] = [...arr, { ...bItem, time: bItem.time || 'Flexible', _basketSource: true }];
            mutated = true;
        }
      });

      return mutated ? next : t;
    });
  }, [basket, linkQuotes, setTrip]);

  // Auto-link disabled: itinerary progress only counts current basket length passed to computeProgress
  const paymentItems = useMemo(() => {
    // Derive simple demo amounts from items (e.g., 50 per card) for transparency demo
    const items = [];
    Object.keys(trip.days).forEach((d) => {
      (trip.days[d] || []).forEach((item) => items.push({ name: item.title, amount: 50 }));
    });
    return items.length ? items : [{ name: 'Itinerary deposit', amount: 100 }];
  }, [trip]);

  // Day options for selects: always include a small range beyond existing days so users can
  // assign items to day 2/3 (or create new days) even if those days aren't yet present.
  const dayOptions = useMemo(() => {
    try {
      const existing = Object.keys(trip.days || {}).map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);
      const maxExisting = existing.length ? Math.max(...existing) : 1;
      const upto = Math.max(3, maxExisting + 2); // show at least days 1..3, and a couple ahead
      return Array.from({ length: upto }, (_, i) => String(i + 1));
    } catch (e) {
      return ['1','2','3'];
    }
  }, [trip.days]);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Your CollEco Itinerary", 14, 20);
    doc.setFontSize(11);
    doc.text("This PDF export includes your day plan and memories.", 14, 28);
    let y = 40;
    const days = Object.keys(trip.days).sort((a, b) => Number(a) - Number(b));
    days.forEach((d) => {
      doc.setFont(undefined, "bold");
      doc.text(`Day ${d}`, 14, y); y += 8;
      doc.setFont(undefined, "normal");
      (trip.days[d] || []).forEach((item) => {
        doc.text(`• ${item.title}${item.subtitle ? " — " + item.subtitle : ""}`, 18, y);
        y += 6;
      });
      const mem = trip.memories?.[d];
      if (mem) { doc.text(`Notes: ${mem}`, 18, y); y += 8; }
      y += 4;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("itinerary.pdf");
  };

  return (
    <>
    <div className={"px-6 py-8 text-brand-brown " + (highContrastFocus ? 'focus-visible:outline-none [&_*:focus-visible]:outline [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-2 [&_*:focus-visible]:outline-brand-brown' : '')}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Itinerary</h1>
        <div className="flex items-center gap-2 relative">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search itinerary…"
              aria-label="Search itinerary items"
              className="px-2 py-1 text-sm border border-cream-border rounded bg-white w-48"
            />
            {searching && (
              <button onClick={()=>setSearch("")} className="text-xs underline text-brand-brown/70 hover:text-brand-brown">Clear</button>
            )}
          </div>
          {/* Integrated undo/redo controls */}
          {(undoStackRef.current.length > 0 || redoStackRef.current.length > 0) && (
            <div className="flex items-center gap-1 bg-white border border-cream-border rounded-lg px-2 py-1 shadow-sm">
              <button disabled={!undoStackRef.current.length}
                onClick={undo}
                className={"px-2 py-1 rounded text-xs font-medium transition-colors " + (undoStackRef.current.length ? 'text-brand-brown hover:bg-cream' : 'text-gray-400 cursor-not-allowed')}
                title={undoStackRef.current.length ? `Undo (${undoStackRef.current[undoStackRef.current.length-1].label||'change'}) – Ctrl/Cmd+Z` : 'Nothing to undo'}>
                ↶
              </button>
              <div className="w-px h-4 bg-cream-border"></div>
              <button disabled={!redoStackRef.current.length}
                onClick={redo}
                className={"px-2 py-1 rounded text-xs font-medium transition-colors " + (redoStackRef.current.length ? 'text-brand-brown hover:bg-cream' : 'text-gray-400 cursor-not-allowed')}
                title={redoStackRef.current.length ? `Redo (${redoStackRef.current[redoStackRef.current.length-1].label||'change'}) – Ctrl/Cmd+Shift+Z` : 'Nothing to redo'}>
                ↷
              </button>
              <div className="w-px h-4 bg-cream-border"></div>
              <button onClick={()=>setShowHistory(s=>!s)} 
                className="px-2 py-1 rounded text-xs font-medium text-brand-brown hover:bg-cream"
                title="View change history">
                📋
              </button>
            </div>
          )}
          {/* History dropdown positioned relative to header controls */}
          {showHistory && (
            <div className="absolute right-0 top-full mt-2 w-56 max-h-60 overflow-auto bg-white border border-cream-border rounded shadow text-xs p-2 space-y-1 z-50">
              <div className="font-semibold mb-1">Undo Stack (latest first)</div>
              {undoStackRef.current.slice().reverse().slice(0,10).map((entry,idx)=>{
                const absoluteIndex = undoStackRef.current.length-1-idx;
                return (
                  <button key={absoluteIndex}
                    onClick={()=>{
                      // jump: restore snapshot and push current into redo stack
                      const current = JSON.parse(JSON.stringify(trip));
                      redoStackRef.current.push({ trip: current, label: 'jump-from-history' });
                      const target = undoStackRef.current[absoluteIndex];
                      // remove all entries above selected
                      undoStackRef.current = undoStackRef.current.slice(0, absoluteIndex);
                      setTrip(target.trip);
                      setHistoryVersion(v=>v+1);
                      setShowHistory(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-cream focus:outline-none focus:ring-1 focus:ring-brand-brown">
                    {absoluteIndex+1}. {entry.label||'change'}
                  </button>
                );
              })}
              {!undoStackRef.current.length && <div className="text-brand-brown/60 italic">Empty</div>}
            </div>
          )}
          {aiDraft && (
            <div className="relative">
              <button onClick={()=>setShowAiImport(s=>!s)} className="px-3 py-2 rounded bg-brand-brown text-white text-sm font-medium hover:bg-brand-brown/90">Draft</button>
              {showAiImport && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-cream-border rounded shadow p-3 text-xs space-y-2 z-50">
                  <div className="font-semibold text-brand-brown mb-1">Draft detected</div>
                  <p className="text-brand-brown/70">A stored draft is available. Import it into your current itinerary.</p>
                  <div className="flex gap-2">
                    <button onClick={()=>importAiDraft('merge')} className="px-2 py-1 rounded bg-brand-orange text-white hover:bg-brand-highlight">Merge</button>
                    <button onClick={()=>importAiDraft('replace')} className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500">Replace</button>
                    <button onClick={()=>{ try{ localStorage.removeItem('aiItineraryDraft:v1'); }catch{} setAiDraft(null); setShowAiImport(false); }} className="px-2 py-1 rounded border border-cream-border hover:bg-cream-sand">Dismiss</button>
                  </div>
                  <p className="text-[10px] text-brand-brown/50">Merge appends new days/items. Replace discards current days.</p>
                </div>
              )}
            </div>
          )}
          <PreferencesMenu highContrastFocus={highContrastFocus} setHighContrastFocus={setHighContrastFocus}
            enableToasts={enableToasts} setEnableToasts={setEnableToasts}
            animationsEnabled={animationsEnabled} setAnimationsEnabled={setAnimationsEnabled} />
          <button onClick={handleExport} className="px-3 py-2 rounded border border-brand-brown text-brand-brown hover:bg-brand-brown/10">Export PDF</button>
          <button onClick={() => {
              // add an explicit empty day (next sequential)
              const existing = Object.keys(trip.days||{}).map(n=>Number(n)).filter(n=>Number.isFinite(n) && n>0);
              const next = existing.length ? Math.max(...existing) + 1 : 2;
              safeSetTrip(t => ({ ...t, days: { ...t.days, [String(next)]: [] } }), 'add-empty-day');
              try{ announce(`Added Day ${next}`); }catch(e){}
            }} title="Add an empty day to the itinerary" className="px-3 py-2 rounded border border-cream-border text-brand-brown hover:bg-cream ml-2">Add Day</button>
        </div>
      </div>
      <p className="mb-2 text-brand-brown/80">Plan each day and capture memories — everything stays in sync.</p>
      <div className="sm:hidden mb-3">
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search itinerary…"
          aria-label="Search itinerary items"
          className="w-full px-2 py-1 text-sm border border-cream-border rounded bg-white"
        />
      </div>
      {searching && (
        <div className="mb-3 text-xs bg-white/60 border border-cream-border rounded p-2 text-brand-brown/70" role="status" aria-live="polite">
          Filtering items by “{search}”. Reorder and bulk select are disabled while searching.
        </div>
      )}
      {reorderingDay && (
        <div className="mb-4 text-xs bg-white/60 border border-cream-border rounded p-2 text-brand-brown/70" role="status" aria-live="polite">
          Reorder mode: Use the drag handles with mouse, or keyboard – Tab to item, Space to pick up, Arrow Up/Down to move, Enter to drop, Esc to cancel.
        </div>
      )}

      <div className="mb-4"><AutoSyncBanner message="Itinerary updates will reflect in quotes and bookings automatically." /></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <LiveTripProgress steps={computeProgress(trip, linkQuotes ? basket.length : 0)} />
        <div className="md:col-span-2 rounded border border-cream-border bg-cream p-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(trip.days).length === 0 ? (
              <div className="text-brand-brown/70">No items yet. {linkQuotes ? 'Add products to your basket on Trip Planner.' : 'Basket auto-sync disabled.'}</div>
            ) : (
              Object.keys(trip.days)
                .sort((a,b) => Number(a) - Number(b))
                .map((d) => (
                  <ItineraryDay key={d} day={d}
                    onDragOver={e=>{ if(reorderingDay){ e.preventDefault(); }}}
                    onDrop={_e=>{
                      if(!reorderingDay) return;
                      const from = dragItem.current; if(!from) return;
                      if(from.day===d) return; // handled by in-day logic
                      safeSetTrip(t=>{
                        const srcArr = [...(t.days[from.day]||[])];
                        const [moved] = srcArr.splice(from.index,1);
                        const destArr = [...(t.days[d]||[]), moved];
                        return { ...t, days: { ...t.days, [from.day]: srcArr, [d]: destArr } };
                      }, 'move-day');
                      if(trip.days[from.day]?.[from.index]?._basketSource){
                        updateBasketDay(trip.days[from.day][from.index].id, Number(d));
                      }
                      dragItem.current = dragOverItem.current = null;
                    }}
                  >
                    <div className="flex justify-between gap-3 mb-1 text-xs">
                      {bulkModeDay===d && (
                        <div className="flex items-center gap-2">
                          <span className="text-brand-brown/70">Move selected to:</span>
                          <select className="border border-cream-border rounded px-1 py-0.5" onChange={(e)=>{ const td=e.target.value; if(td) bulkMove(d, td); }} defaultValue="">
                            <option value="" disabled>Day...</option>
                            {dayOptions.filter(dayKey=>dayKey!==d).map(dayKey => (
                              <option key={dayKey} value={dayKey}>{dayKey}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="flex gap-3">
                        {!searching && (
                          <>
                            <button onClick={()=>toggleBulkMode(d)} className="underline text-brand-brown/70 hover:text-brand-brown">{bulkModeDay===d? 'Exit bulk select' : 'Bulk select'}</button>
                            <button onClick={()=>beginReorder(d)} className="underline text-brand-brown/70 hover:text-brand-brown">{reorderingDay===d? 'Finish reorder' : 'Reorder'}</button>
                          </>
                        )}
                        {searching && (
                          <span className="text-brand-brown/50">Actions disabled in search</span>
                        )}
                      </div>
                    </div>
                    {(trip.days[d] || [])
                      .filter(it => !(hideAI && it._aiSource))
                      .filter(it => {
                        if(!searching) return true;
                        const q = search.trim().toLowerCase();
                        return (it.title||'').toLowerCase().includes(q) || (it.subtitle||'').toLowerCase().includes(q);
                      })
                      .map((item, i) => {
                      const isLinked = item._basketSource;
                      const dragging = reorderingDay===d && dragItem.current && dragItem.current.day===d && dragItem.current.index===i;
                      return (
                        <div
                          key={i}
                          role="listitem"
                          aria-label={item.title}
                          aria-grabbed={reorderingDay===d ? dragging : undefined}
                          tabIndex={reorderingDay===d ? 0 : -1}
                          className={'relative group outline-none ' + (reorderingDay===d ? 'ring-1 ring-transparent ' : '') + (dragging ? ' opacity-40' : '')}
                          onKeyDown={(e)=>{
                            if(reorderingDay!==d) return;
                            const key = e.key;
                            if(key===' '){
                              e.preventDefault();
                              if(dragItem.current && dragItem.current.day===d && dragItem.current.index===i){
                                dragItem.current = null; announce('Cancelled drag'); return;
                              }
                              dragItem.current = { day:d, index:i }; announce(`Picked up ${item.title}`);
                            } else if(key==='Escape'){
                              if(dragItem.current){ dragItem.current=null; announce('Cancelled drag'); e.preventDefault(); }
                            } else if(key==='Enter'){
                              if(dragItem.current && dragOverItem.current && dragOverItem.current.day===d){ onDragEnd(); e.preventDefault(); }
                            } else if(key==='ArrowUp' || key==='ArrowDown'){
                              if(!dragItem.current || dragItem.current.day!==d) return;
                              e.preventDefault();
                              const currentIndex = dragItem.current.index;
                              const arrLen = (trip.days[d]||[]).length;
                              const delta = key==='ArrowUp' ? -1 : 1;
                              const targetIndex = currentIndex + delta;
                              if(targetIndex<0 || targetIndex>=arrLen) return;
                              dragOverItem.current = { day:d, index: targetIndex };
                              safeSetTrip(t=>{
                                const dayArr = [...(t.days[d]||[])];
                                const [mv] = dayArr.splice(currentIndex,1);
                                dayArr.splice(targetIndex,0,mv);
                                dragItem.current = { day:d, index: targetIndex };
                                const newOrderIds = dayArr.filter(x=>x._basketSource).map(x=>x.id);
                                if(newOrderIds.length) reorderWithin(newOrderIds);
                                return { ...t, days: { ...t.days, [d]: dayArr } };
                              }, 'keyboard-drag');
                              announce(`Moved to position ${targetIndex+1} in day ${d}`);
                            }
                          }}
                          onDragEnter={(e)=>onDragEnter(e,d,i)}
                          onDragEnd={onDragEnd}
                        >
                          {reorderingDay===d && (
                            <div
                              draggable
                              onDragStart={(e)=>onDragStart(e,d,i)}
                              className="absolute -left-5 top-2 w-3 h-3 cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] text-brand-brown/60"
                              title="Drag to reorder"
                            >
                              ☰
                            </div>
                          )}
                          {bulkModeDay===d && (
                            <div className="absolute -left-6 top-2">
                              <input type="checkbox" checked={bulkSelected[d]?.has(item.id)||false} onChange={()=>toggleBulkSelect(d,item.id)} />
                            </div>
                          )}
                          <ExperienceCard title={item.title} subtitle={item.subtitle} time={item.time} />
                          {item._aiSource && (
                            <span className="absolute right-1 bottom-1 text-[9px] tracking-wide px-1.5 py-0.5 rounded bg-brand-orange text-white/95 font-semibold uppercase shadow-sm">Suggested</span>
                          )}
                          {dragItem.current && reorderingDay===d && dragOverItem.current && dragOverItem.current.day===d && dragOverItem.current.index===i && dragItem.current.index!==i && (
                            <div className="absolute -inset-1 border-2 border-dashed border-brand-brown rounded pointer-events-none" aria-hidden="true" />
                          )}
                          <div className="absolute left-1 top-1 text-[10px] px-1 py-0.5 rounded bg-white/80 border border-cream-border text-brand-brown/70">
                            {item.price > 0 ? 'PAID' : 'INCLUDED'}
                          </div>
                          {reorderingDay===d && (
                            <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-70 group-hover:opacity-100">
                              <button aria-label="Move up" className="text-[10px] px-1 py-0.5 rounded bg-white border border-cream-border" onClick={()=>{
                                safeSetTrip(t=>{
                                  const arr = [...(t.days[d]||[])];
                                  if(i===0) return t;
                                  const tmp = arr[i-1]; arr[i-1]=arr[i]; arr[i]=tmp;
                                  // reorder basket subset order
                                  const basketIds = arr.filter(x=>x._basketSource).map(x=>x.id);
                                  reorderWithin(basketIds);
                                  return { ...t, days: { ...t.days, [d]: arr } };
                                }, 'keyboard-reorder-up');
                              }}>↑</button>
                              <button aria-label="Move down" className="text-[10px] px-1 py-0.5 rounded bg-white border border-cream-border" onClick={()=>{
                                safeSetTrip(t=>{
                                  const arr = [...(t.days[d]||[])];
                                  if(i===arr.length-1) return t;
                                  const tmp = arr[i+1]; arr[i+1]=arr[i]; arr[i]=tmp;
                                  const basketIds = arr.filter(x=>x._basketSource).map(x=>x.id);
                                  reorderWithin(basketIds);
                                  return { ...t, days: { ...t.days, [d]: arr } };
                                }, 'keyboard-reorder-down');
                              }}>↓</button>
                            </div>
                          )}
                          {isLinked && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-brand-brown/70">
                              <label>Day:</label>
                              <select
                                className="border border-cream-border rounded px-1 py-0.5 bg-white"
                                value={item.day || d}
                                onChange={(e) => {
                                  const newDay = e.target.value;
                                  // Update basket (authoritative) so effect re-syncs
                                  pushUndo(trip, 'change-item-day');
                                  updateBasketDay(item.id, Number(newDay));
                                }}
                              >
                                {dayOptions.map(dayKey => (
                                  <option key={dayKey} value={dayKey}>{dayKey}</option>
                                ))}
                              </select>
                              <button
                                className="ml-2 text-red-600 hover:underline"
                                onClick={() => {
                                  pushUndo(trip, 'remove-linked');
                                  removeFromBasket(item.id);
                                }}
                                title="Remove from itinerary (removes from basket)"
                              >Remove</button>
                            </div>
                          )}
                          {!isLinked && (
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-brand-brown/60">
                              <button className="underline" onClick={()=> setRepeatModal({ item, originDay: d })}>Repeat on days…</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <MemoryNote value={trip.memories?.[d] || ""} onChange={(v) => {
                      setTrip(prev => { pushUndo(prev, 'memory-edit'); return setMemory(prev, d, v); });
                    }} />
                  </ItineraryDay>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 mt-4 bg-cream rounded border border-cream-border p-4 text-sm flex items-start gap-4">
        <div className="flex items-center gap-2">
          <input id="toggleLink" type="checkbox" checked={linkQuotes} onChange={e=>setLinkQuotes(e.target.checked)} />
          <label htmlFor="toggleLink" className="cursor-pointer select-none">Automatically reflect selected quote experiences in itinerary progress</label>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input id="toggleAIHide" type="checkbox" checked={hideAI} onChange={e=>setHideAI(e.target.checked)} />
          <label htmlFor="toggleAIHide" className="cursor-pointer select-none text-xs">Hide suggested items</label>
        </div>
      </div>

      {/* Transparent pricing and payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <FeesBreakdown items={paymentItems} currency="USD" />
        </div>
        <div className="flex items-start">
          <PaymentButton items={paymentItems} currency="USD" />
        </div>
      </div>
  </div>
  <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef}></div>
  {/* Toast notifications */}
  {enableToasts && toasts.length>0 && (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-sm">
      {toasts.map(t=> (
        <div key={t.id} className={"pointer-events-auto bg-brand-brown text-white text-sm rounded shadow px-3 py-2 flex items-start gap-3 " + (animationsEnabled ? 'toast-fade' : '')} aria-live="off" aria-hidden="true">
          <div className="flex-1 break-words">{t.msg}</div>
          <button onClick={()=> setToasts(prev=>prev.filter(x=>x.id!==t.id))} className="text-white/70 hover:text-white focus:outline-none focus:ring-1 focus:ring-white rounded" aria-label="Dismiss notification">×</button>
        </div>
      ))}
    </div>
  )}

    {showHistory && (
      <div className="mt-1 w-56 max-h-60 overflow-auto bg-white border border-cream-border rounded shadow text-xs p-2 space-y-1">
        <div className="font-semibold mb-1">Undo Stack (latest first)</div>
        {undoStackRef.current.slice().reverse().slice(0,10).map((entry,idx)=>{
          const absoluteIndex = undoStackRef.current.length-1-idx;
          return (
            <button key={absoluteIndex}
              onClick={()=>{
                // jump: restore snapshot and push current into redo stack
                const current = JSON.parse(JSON.stringify(trip));
                redoStackRef.current.push({ trip: current, label: 'jump-from-history' });
                const target = undoStackRef.current[absoluteIndex];
                // remove all entries above selected
                undoStackRef.current = undoStackRef.current.slice(0, absoluteIndex);
                setTrip(target.trip);
                setHistoryVersion(v=>v+1);
              }}
              className="w-full text-left px-2 py-1 rounded hover:bg-cream focus:outline-none focus:ring-1 focus:ring-brand-brown">
              {absoluteIndex+1}. {entry.label||'change'}
            </button>
          );
        })}
      </div>
    )}
  {repeatModal && (
      <Modal title="Repeat Item on Additional Days" onClose={()=>{ setRepeatModal(null); setRepeatDaysInput(''); }}
        actions={[
          <button key="cancel" onClick={()=>{ setRepeatModal(null); setRepeatDaysInput(''); }} className="px-3 py-1 rounded border border-cream-border hover:bg-cream-sand text-sm">Cancel</button>,
          <button key="apply" onClick={()=>{
            const raw = repeatDaysInput.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
            const uniqueDays = Array.from(new Set(raw));
            if(!uniqueDays.length){ return; }
            safeSetTrip(t=>{
              const next = { ...t, days: { ...t.days } };
              uniqueDays.forEach(dayStr=>{
                const num = Number(dayStr);
                if(!Number.isFinite(num) || num<=0) return;
                const key = String(num);
                const arr = next.days[key] || [];
                if(!arr.some(x=>x.id===repeatModal.item.id)){
                  next.days[key] = [...arr, { ...repeatModal.item }];
                }
              });
              return next;
            }, 'repeat-multi-day');
            setRepeatModal(null); setRepeatDaysInput('');
          }} className="px-3 py-1 rounded bg-brand-brown text-white text-sm hover:bg-brand-brown/90">Apply</button>
        ]}
      >
        <p className="text-sm mb-3">Enter additional day numbers (comma or space separated). Existing occurrences are skipped.</p>
        <input autoFocus value={repeatDaysInput} onChange={e=>setRepeatDaysInput(e.target.value)} placeholder="e.g. 2, 4 5" className="w-full border border-cream-border rounded px-2 py-1 text-sm mb-3" />
        <p className="text-xs text-brand-brown/60">Invalid or duplicate day values are ignored. Original day: {repeatModal.originDay}</p>
      </Modal>
    )}
    </>
  );
}

// Lightweight in-file preferences dropdown to avoid extra files (can be extracted later)
function PreferencesMenu({ highContrastFocus, setHighContrastFocus, enableToasts, setEnableToasts, animationsEnabled, setAnimationsEnabled }){
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  
  // Combined click-outside and escape key handling
  const panelRef = useClickOutsideAndEscape(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, open);
  function resetPrefs(){
    try{
      localStorage.removeItem('itineraryHighContrastFocus:v1');
      localStorage.removeItem('itineraryEnableToasts:v1');
      localStorage.removeItem('itineraryReorderDay:v1');
      localStorage.removeItem('itineraryBulkModeDay:v1');
      localStorage.removeItem('itineraryAnimations:v1');
      setHighContrastFocus(false);
      setEnableToasts(true);
      setAnimationsEnabled(true);
  }catch(_err){ /* ignore */ }
  }
  // Focus trap when open (escape key is handled by useClickOutsideAndEscape hook)
  useEffect(()=>{
    if(open && panelRef.current){
      const focusable = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable?.[0];
      const last = focusable?.[focusable.length-1];
      first && first.focus();
      const onKey = (e) => {
        if(e.key==='Tab' && focusable && focusable.length){
          if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
          else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener('keydown', onKey);
      return ()=> document.removeEventListener('keydown', onKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <div className="relative">
      <button ref={triggerRef} onClick={()=>setOpen(o=>!o)} aria-haspopup="dialog" aria-expanded={open}
        className="px-3 py-2 rounded border border-brand-brown text-brand-brown hover:bg-brand-brown/10 text-sm">
        Preferences
      </button>
      {open && (
        <div ref={panelRef} role="dialog" aria-label="Itinerary preferences" className="absolute right-0 mt-2 w-64 bg-white border border-cream-border rounded shadow p-3 z-50 text-sm space-y-3">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={highContrastFocus} onChange={e=>setHighContrastFocus(e.target.checked)} />
              <span>High contrast focus outlines</span>
            </label>
            <p className="text-[11px] text-brand-brown/60 mt-1">Improves keyboard navigability.</p>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableToasts} onChange={e=>setEnableToasts(e.target.checked)} />
              <span>Enable visual toasts</span>
            </label>
            <p className="text-[11px] text-brand-brown/60 mt-1">Mirrors screen reader announcements.</p>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={animationsEnabled} onChange={e=>setAnimationsEnabled(e.target.checked)} />
              <span>Motion animations</span>
            </label>
            <p className="text-[11px] text-brand-brown/60 mt-1">Disable to reduce visual motion.</p>
          </div>
          <div className="flex justify-end">
            <button onClick={resetPrefs} className="mr-auto text-[10px] underline text-brand-brown/60 hover:text-brand-brown" title="Reset all itinerary preferences to defaults">Reset</button>
            <button onClick={()=>setOpen(false)} className="text-xs underline text-brand-brown/70 hover:text-brand-brown">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
