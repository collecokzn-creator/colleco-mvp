import React, { useState, useRef, useEffect } from 'react';
import { dbg } from '../utils/logger';
import WorkflowPanel from './WorkflowPanel';
import { Link } from 'react-router-dom';
import { generateItinerary, streamItinerary, parseFlightIntent, parseIntent } from '../utils/aiClient.js';
import { refineItinerary } from '../utils/aiClient.js';
import { startSession, refineSession, uploadDraft, fetchSession } from '../utils/aiSessionClient.js';

/**
 * AI Itinerary Generator Panel
 * - Accepts natural language prompt
 * - Supports single-shot generation or progressive streaming
 * - Shows phased output (parse, plan, pricing) with accessible live updates
 */
export default function AIGeneratorPanel() {
  const [prompt, setPrompt] = useState(() => {
    try {
      const saved = localStorage.getItem('colleco.lastAIPrompt');
      return saved || 'Family trip to Rome and Florence for 6 nights in June, 2 adults 1 child, budget $4000, love food and history';
    } catch {
      return 'Family trip to Rome and Florence for 6 nights in June, 2 adults 1 child, budget $4000, love food and history';
    }
  });
  const [mode, setMode] = useState('stream'); // 'stream' | 'single'
  const [phases, setPhases] = useState({});
  const [fullData, setFullData] = useState(null);
  const [error, setError] = useState('');
  const [refineText, setRefineText] = useState('');
  const [refining, setRefining] = useState(false);
  const [applied, setApplied] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionMode, setSessionMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState(null);
  const [scoped, setScoped] = useState(false);
  const [history, setHistory] = useState([]); // session snapshots
  const [showDiff, setShowDiff] = useState(false);
  const [flightIntent, setFlightIntent] = useState(null);
  const [intents, setIntents] = useState([]);
  const [, setLastOps] = useState(null);
  const [opsUndo, setOpsUndo] = useState([]);
  const abortRef = useRef(null);
  const liveRef = useRef(null);

  // Persist prompt to localStorage
  useEffect(() => {
    try {
      if (prompt && prompt.trim()) localStorage.setItem('colleco.lastAIPrompt', prompt);
    } catch {}
  }, [prompt]);

  // Intentionally only depend on state slices that change the live message
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ if (liveRef.current) liveRef.current.textContent = liveMessage(); }, [phases, error, loading, active]);

  function liveMessage() {
    if (error) return `Error: ${error}`;
    if (loading && mode === 'single') return 'Generating draft';
    if (active && mode === 'stream') {
      const done = phases.done;
      if (done) return 'Generation complete';
      if (phases.pricing) return 'Pricing phase received';
      if (phases.plan) return 'Plan phase received';
      if (phases.parse) return 'Parse phase received';
      return 'Preparing draft…';
    }
    return '';
  }

  function reset() {
    setPhases({}); setFullData(null); setError(''); setLoading(false); setActive(false); abortRef.current?.cancel(); abortRef.current=null;
    setApplied(false);
    setSessionId(null); setUploadedId(null);
    setHistory([]); setShowDiff(false);
    setFlightIntent(null);
    setIntents([]);
    setLastOps(null);
    setOpsUndo([]);
  }

  async function handleSingle() {
    reset();
    if (!prompt.trim()) { setError('Prompt required'); return; }
    setLoading(true);
    try {
    dbg('[AIGEN] handleSingle: sending generate request', { prompt: prompt && prompt.slice(0,80) });
      const data = await generateItinerary(prompt.trim());
  dbg('[AIGEN] handleSingle: received data', data);
      setFullData(data);
      const parsePhase = baseFrom(data);
  dbg('[AIGEN] handleSingle: parsePhase', parsePhase);
      setPhases({ parse: parsePhase, plan: { itinerary: data.itinerary }, pricing: { pricing: data.pricing }, done: true });
      setActive(false);
    } catch(e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  function handleStream() {
    reset();
    if (!prompt.trim()) { setError('Prompt required'); return; }
  // detect intents first (unified)
  parseIntent(prompt.trim()).then((r)=>{ if(r && Array.isArray(r.intents)) setIntents(r.intents); }).catch(()=>{});
  // keep flight intent for now (backward compatibility/UI card)
  parseFlightIntent(prompt.trim()).then(setFlightIntent).catch(()=>{});
    setActive(true);
    const stream = streamItinerary(prompt.trim(), {
      onEvent: ({ event, data }) => {
        setPhases(prev => {
          const next = { ...prev };
          if (event === 'parse') next.parse = data;
          else if (event === 'plan') next.plan = data;
          else if (event === 'pricing') next.pricing = data;
          else if (event === 'done') next.done = true;
          return next;
        });
        if (event === 'done') setActive(false);
      },
      onError: (err) => { setError(err.message || 'Stream failed'); setActive(false); },
      onDone: () => { setActive(false); }
    });
    abortRef.current = stream;
  }

  function deepClonePhases(p){
    try { return JSON.parse(JSON.stringify(p)); } catch { return { ...p }; }
  }

  function applyExtendShorten(nightsDelta){
    setPhases(prev=>{
      if(!prev || !prev.plan || !prev.plan.itinerary) return prev;
      const snapshot = deepClonePhases(prev);
      setOpsUndo(stack=>[...stack, snapshot]);
      const next = deepClonePhases(prev);
      const currentNights = next.parse?.nights || next.plan.itinerary.length;
      let newNights = Math.max(1, currentNights + nightsDelta);
      // update parse
      if(next.parse) next.parse.nights = newNights;
      // adjust itinerary days
      const days = [...next.plan.itinerary];
      if(newNights > days.length){
        const toAdd = newNights - days.length;
        const last = days[days.length-1] || { destination: next.parse?.destinations?.[0]||'Destination', activities:['Leisure & exploration'] };
        for(let i=0;i<toAdd;i++){
          const dayNum = days.length+1;
          const dest = last.destination || last.title?.replace(/^.*-\s*/,'') || 'Destination';
          days.push({ day: dayNum, title: `Day ${dayNum} - ${dest}`, destination: dest, activities: [...(last.activities||['Leisure & exploration'])] });
        }
      } else if(newNights < days.length){
        days.length = newNights;
      }
      next.plan.itinerary = days.map((d,idx)=> ({ ...d, day: idx+1, title: `Day ${idx+1} - ${d.destination||d.title?.replace(/^.*-\s*/,'')||'Destination'}` }));
      return next;
    });
  }

  function applyBudgetAdjust(percent){
    setPhases(prev=>{
      if(!prev || !prev.pricing || !prev.pricing.pricing) return prev;
      const snapshot = deepClonePhases(prev);
      setOpsUndo(stack=>[...stack, snapshot]);
      const next = deepClonePhases(prev);
      const scale = 1 + (percent/100);
      const p = next.pricing.pricing;
      if(p.total!=null) p.total = Math.round(p.total * scale);
      if(p.breakdown){ Object.keys(p.breakdown).forEach(k=>{ p.breakdown[k] = Math.round(p.breakdown[k] * scale); }); }
      if(p.note){ p.note += percent>=0? ` · increased by ${percent}%` : ` · decreased by ${Math.abs(percent)}%`; }
      return next;
    });
  }

  function applySwapDestination(from, to){
    setPhases(prev=>{
      if(!prev || !prev.plan || !prev.plan.itinerary) return prev;
      const snapshot = deepClonePhases(prev);
      setOpsUndo(stack=>[...stack, snapshot]);
      const next = deepClonePhases(prev);
      // update parse destinations list
      if(next.parse && Array.isArray(next.parse.destinations)){
        next.parse.destinations = next.parse.destinations.map(d=> (d.toLowerCase()===String(from).toLowerCase()? to : d));
      }
      // update each day
      const fromLc = String(from).toLowerCase();
      next.plan.itinerary = next.plan.itinerary.map((d,idx)=>{
        const dest = (d.destination||d.title||'').toString();
        const isMatch = dest.toLowerCase()===fromLc || /-\s*.+$/.test(d.title||'') && (d.title.replace(/^.*-\s*/,'').toLowerCase()===fromLc);
        const newDest = isMatch ? to : (d.destination||d.title?.replace(/^.*-\s*/,'')||dest);
        return { ...d, day: idx+1, destination: newDest, title: `Day ${idx+1} - ${newDest}` };
      });
      return next;
    });
  }

  function applyItineraryOps(ops){
    if(!ops || ops.length===0) return;
    setLastOps(ops);
    for(const op of ops){
      if(op.op==='extend') applyExtendShorten(+Math.abs(op.nightsDelta||1));
      else if(op.op==='shorten') applyExtendShorten(-Math.abs(op.nightsDelta||1));
      else if(op.op==='adjustBudget') applyBudgetAdjust(op.percent||0);
      else if(op.op==='swapDestination' && op.from && op.to) applySwapDestination(op.from, op.to);
    }
    if(liveRef.current){ liveRef.current.textContent = `Applied ${ops.length} itinerary change${ops.length>1?'s':''}.`; setTimeout(()=>{ if(liveRef.current) liveRef.current.textContent=''; },2500); }
  }

  function undoLastOps(){
    setOpsUndo(stack=>{
      if(!stack || stack.length===0) return stack;
      const nextStack = stack.slice(0, -1);
      const snapshot = stack[stack.length-1];
      setPhases(snapshot);
      if(liveRef.current){ liveRef.current.textContent = 'Reverted last itinerary changes.'; setTimeout(()=>{ if(liveRef.current) liveRef.current.textContent=''; },2000); }
      return nextStack;
    });
  }

  function handleCancel() {
    abortRef.current?.cancel();
    setActive(false); setLoading(false);
  }

  async function handleRefine(){
    if(!fullData && !phases.parse) { setError('Generate first'); return; }
    if(!refineText.trim()) { setError('Refine instructions required'); return; }
    setRefining(true); setError('');
    try {
      let refined;
      if(sessionMode && sessionId){
        refined = await refineSession(sessionId, refineText.trim());
        // refresh history
        try { const full = await fetchSession(sessionId); setHistory(full.history||[]); } catch {}
      } else {
        const basePrompt = prompt.trim();
        refined = await refineItinerary(basePrompt, refineText.trim());
      }
  setFullData(refined);
  setPhases({ parse: baseFrom(refined), plan: { itinerary: refined.itinerary }, pricing: { pricing: refined.pricing }, done: true });
       setRefineText('');
     } catch(e){ setError(e.message||'Refine failed'); }
     finally { setRefining(false); }
   }

  async function handleStartSession(){
    if(!prompt.trim()) { setError('Prompt required'); return; }
    try {
  const s = await startSession(prompt.trim());
      setSessionId(s.id);
      setSessionMode(true);
  setFullData(s.data);
  setPhases({ parse: baseFrom(s.data), plan: { itinerary: s.data.itinerary }, pricing: { pricing: s.data.pricing }, done: true });
  setScoped(!!s.scoped);
      setHistory([{ type:'parse', data: s.data, at: Date.now() }]);
      if(liveRef.current){ liveRef.current.textContent = 'Session started'; setTimeout(()=>{ if(liveRef.current) liveRef.current.textContent=''; },1500); }
    } catch(e){ setError(e.message||'Session failed'); }
  }

  async function handleUploadDraft(){
    const data = fullData || (phases.parse && phases.plan && phases.pricing && {
      ...phases.parse,
      itinerary: phases.plan.itinerary,
      pricing: phases.pricing.pricing
    });
    if(!data){ setError('Nothing to upload'); return; }
    setUploading(true); setError('');
    try {
  const r = await uploadDraft(prompt.trim(), data);
  setUploadedId(r.id); if(r.scoped) setScoped(true);
    } catch(e){ setError(e.message||'Upload failed'); }
    finally { setUploading(false); }
  }

  function handleApply(){
    const data = fullData || (phases.parse && phases.plan && phases.pricing && {
      ...phases.parse,
      itinerary: phases.plan.itinerary,
      pricing: phases.pricing.pricing
    });
    if(!data){ setError('Nothing to apply yet'); return; }
    try {
      const draft = {
        appliedAt: Date.now(),
        sourcePrompt: prompt.trim(),
        itinerary: data.itinerary,
        meta: {
          nights: data.nights,
          destinations: data.destinations,
          interests: data.interests,
          budget: data.budget
        }
      };
      localStorage.setItem('aiItineraryDraft:v1', JSON.stringify(draft));
      setApplied(true);
      // Announce via live region
      if(liveRef.current){ liveRef.current.textContent = 'AI draft stored. Open Itinerary page to import.'; setTimeout(()=>{ if(liveRef.current) liveRef.current.textContent=''; }, 3000); }
    } catch(e){ setError('Failed to store draft'); }
  }

  function formatCurrency(v, c) { return new Intl.NumberFormat(undefined, { style: 'currency', currency: c||'USD'}).format(v); }

  // Normalize raw AI data to parse phase shape
  function baseFrom(data) {
    if (!data || typeof data !== 'object') return {};
    const nights = data.nights ?? (Array.isArray(data.itinerary) ? data.itinerary.length : undefined);
    const destinations = Array.isArray(data.destinations) ? data.destinations : Array.isArray(data.itinerary) ? data.itinerary.map(d => d.destination || d.title?.replace(/^.*-\s*/, '')).filter(Boolean) : [];
    const interests = Array.isArray(data.interests) ? data.interests : [];
    const budget = data.budget ?? (data.pricing && data.pricing.total ? { amount: data.pricing.total, currency: (data.pricing.currency || 'USD') } : undefined);
    return { nights, destinations, interests, budget };
  }

  const parse = phases.parse; const plan = phases.plan; const pricing = phases.pricing;

  return (
    <div className="ai-panel max-w-4xl mx-auto flex flex-col gap-4" aria-labelledby="aiGenHeading">
  <h1 id="aiGenHeading" className="text-2xl font-bold text-brand-brown">Trip Assist</h1>
  <p className="text-sm text-brand-brown/80 leading-snug">Describe your trip — budget, vibe, pace, must‑dos. You’ll get a draft with an outline and rough costs. See it build in steps or generate a single draft, then refine until it feels right.</p>

  {/* Workflow Panel */}
  <WorkflowPanel currentPage="ai" />

      {/* Quick start prompt ideas */}
      <div className="rounded border border-cream-border bg-cream p-3">
        <div className="text-xs font-semibold text-brand-brown mb-2">Quick start ideas</div>
        <div className="flex gap-2 overflow-x-auto pb-1 pr-1">
          {[
            'Family-friendly Cape Town long weekend in June, 2 adults 2 kids, budget $2000, nature + beaches + penguins',
            'Romantic Italy 7 nights: Rome, Florence, Amalfi; foodie + history; mid-range; September',
            'Safari + beach 10 days: Kruger + Mauritius; 2 adults; July; budget $5000; photography + relaxation',
            'Backpacking Southeast Asia 14 days: Thailand + Vietnam; budget; nightlife + street food; hostels',
            'Wine and wildlife 5 nights: Stellenbosch + Cape Town; 4 adults; September; wineries + Table Mountain',
          ].map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(s)}
              className="shrink-0 max-w-[22rem] text-left px-2 py-1 rounded border border-cream-border bg-cream-sand hover:bg-cream-hover text-[11px]"
              title="Use this idea"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-brown">
        Prompt
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4} className="w-full p-2 rounded border border-cream-border bg-cream focus:outline-none focus:ring-2 focus:ring-brand-orange/40 text-sm resize-y" />
      </label>
      {/* Intent detections */}
      {intents && intents.length>0 && (
        <div className="rounded border border-cream-border bg-cream-sand/60 p-3 text-xs">
          <div className="font-semibold mb-1">Detected request{intents.length>1?'s':''}</div>
          <div className="flex flex-col gap-2">
            {intents.filter(i=>i.type!=='flight_search').map((i,idx)=>{
              if(i.type==='hotel_search'){
                const href = `/plan-trip?category=Lodging${i.city?`&city=${encodeURIComponent(i.city)}`:''}${i.budget?.amount?`&budget=${encodeURIComponent(i.budget.amount)}`:''}${i.stars?`&stars=${i.stars}`:''}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Hotel search {i.city?`in ${i.city}`:''} {i.nights?`· ${i.nights} nights`:''}</div>
                    <a href={href} className="inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white">Find hotels</a>
                  </div>
                );
              }
              if(i.type==='car_rental'){
                const href = `/plan-trip?category=Transport${i.pickupCity?`&city=${encodeURIComponent(i.pickupCity)}`:''}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Car hire {i.pickupCity?`in ${i.pickupCity}`:''} {i.pickupDate?`· ${i.pickupDate}`:''}</div>
                    <a href={href} className="inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white">Find cars</a>
                  </div>
                );
              }
              if(i.type==='activity_search'){
                const href = `/plan-trip?category=Activity${i.city?`&city=${encodeURIComponent(i.city)}`:''}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Activities {i.city?`in ${i.city}`:''} {i.startDate?`· ${i.startDate}`:''}</div>
                    <a href={href} className="inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white">Find activities</a>
                  </div>
                );
              }
              if(i.type==='dining_search'){
                const href = `/plan-trip?category=Dining${i.city?`&city=${encodeURIComponent(i.city)}`:''}${i.nearMe?'&setLocation=1':''}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Dining {i.city?`in ${i.city}`: i.nearMe? 'near you': ''} {i.time?`· ${i.time}`:''}</div>
                    <a href={href} className="inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white">Find dining</a>
                  </div>
                );
              }
              if(i.type==='transfer_request'){
                const href = `/plan-trip?category=Transport${i.city?`&city=${encodeURIComponent(i.city)}`:''}${i.nearMe?'&setLocation=1':''}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Transfers {i.city?`in ${i.city}`: i.nearMe? 'near you': ''} {i.time?`· ${i.time}`:''}</div>
                    <a href={href} className="inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white">Find transfers</a>
                  </div>
                );
              }
              if(i.type==='event_search'){
                const href = `/plan-trip?tab=events${i.city?`&city=${encodeURIComponent(i.city)}`:''}${i.nearMe?'&setLocation=1':''}`;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Events {i.city?`in ${i.city}`: i.nearMe? 'near you': ''} {i.startDate?`· from ${i.startDate}`:''}</div>
                    <a href={href} className="inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white">Browse events</a>
                  </div>
                );
              }
              if(i.type==='visa_help'){
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Visa help detected</div>
                    <a href={`/compliance`} className="inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white">Open Compliance</a>
                  </div>
                );
              }
              if(i.type==='insurance_help'){
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Insurance help detected</div>
                    <a href={`/compliance`} className="inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white">Open Compliance</a>
                  </div>
                );
              }
              if(i.type==='itinerary_ops'){
                const hasUndo = opsUndo.length>0;
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Itinerary adjustments detected ({i.ops?.length||0})</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={()=>applyItineraryOps(i.ops||[])} className="inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white">Apply now</button>
                      {hasUndo && <button type="button" onClick={undoLastOps} className="text-brand-brown underline">Undo</button>}
                    </div>
                  </div>
                );
              }
              if(i.type==='quote_ops'){
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div>Quote action detected</div>
                    <a href={`/quotes/new`} className="inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white">Open quotes</a>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
      {flightIntent && (
        <div className="rounded border border-cream-border bg-cream-sand/60 p-3 text-xs">
          <div className="font-semibold mb-1">Detected flight request</div>
          <div>From: {flightIntent.from?.city} {flightIntent.from?.code? `(${flightIntent.from.code})`: ''}</div>
          <div>To: {flightIntent.to?.city} {flightIntent.to?.code? `(${flightIntent.to.code})`: ''}</div>
          <div>Date: {flightIntent.date || '—'} {flightIntent.time? `at ${flightIntent.time}`: ''}</div>
          <div>Passengers: {flightIntent.pax} · Cabin: {flightIntent.cabin}</div>
          <div className="mt-2 flex gap-2">
            <a href={`/plan-trip?category=Flights&from=${encodeURIComponent(flightIntent.from?.code||flightIntent.from?.city||'')}&to=${encodeURIComponent(flightIntent.to?.code||flightIntent.to?.city||'')}&date=${encodeURIComponent(flightIntent.date||'')}&time=${encodeURIComponent(flightIntent.time||'')}&pax=${flightIntent.pax}&cabin=${encodeURIComponent(flightIntent.cabin)}`}
               className="inline-flex items-center px-3 py-1.5 rounded bg-brand-orange text-white">
              Search flights
            </a>
            <button onClick={()=>setFlightIntent(null)} className="text-brand-brown underline">Dismiss</button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="inline-flex items-center gap-2 bg-cream-sand px-3 py-1 rounded border border-cream-border text-sm">
          <span className="font-semibold">Mode:</span>
          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="aimode" value="stream" checked={mode==='stream'} onChange={()=>setMode('stream')} /> <span>Stream</span></label>
          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="aimode" value="single" checked={mode==='single'} onChange={()=>setMode('single')} /> <span>Single</span></label>
        </div>
        {mode==='single' && <button onClick={handleSingle} disabled={loading} className="px-4 py-2 rounded bg-brand-orange text-white text-sm font-semibold hover:bg-brand-highlight disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">{loading? 'Generating…':'Generate'}</button>}
        {mode==='stream' && <button onClick={handleStream} disabled={active} className="px-4 py-2 rounded bg-brand-orange text-white text-sm font-semibold hover:bg-brand-highlight disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">{active? 'Streaming…':'Start Stream'}</button>}
        {(active||loading) && <button onClick={handleCancel} className="px-3 py-2 rounded bg-brand-brown text-white text-xs font-semibold hover:bg-brand-brown/80">Cancel</button>}
        <button onClick={reset} className="px-3 py-2 rounded border border-brand-brown text-brand-brown text-xs font-semibold hover:bg-cream-hover">Clear</button>
  <button onClick={handleApply} disabled={applied || !(phases.plan && phases.pricing)} className="px-3 py-2 rounded bg-brand-brown text-white text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">{applied? 'Saved':'Save draft for Itinerary'}</button>
        <button onClick={handleUploadDraft} disabled={uploading || uploadedId || !(phases.plan && phases.pricing)} className="px-3 py-2 rounded bg-brand-orange text-white text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">{uploadedId? 'Uploaded':'Upload Draft'}</button>
        <div className="flex items-center gap-1 ml-2 text-[11px]">
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={sessionMode} onChange={(e)=>{ if(!e.target.checked){ setSessionMode(false); setSessionId(null);} else { handleStartSession(); } }} /> Session</label>
          {sessionId && <span className="text-green-700 flex items-center gap-1">#{sessionId.slice(0,6)} {scoped && <span title="Scoped to token" className="inline-block text-[10px] px-1 py-0.5 rounded bg-brand-orange text-white">LOCK</span>}</span>}
        </div>
      </div>

      {/* Next steps shortcuts */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-brand-brown/70">
        <span className="mr-1">Next:</span>
        <Link to="/itinerary" className="underline hover:text-brand-brown">Open Itinerary to import draft</Link>
        <span aria-hidden>•</span>
        <Link to="/plan-trip" className="underline hover:text-brand-brown">Open Trip Planner</Link>
      </div>
      <div className="mt-2 w-full flex flex-col gap-2 bg-cream-sand/50 border border-cream-border rounded p-3">
        <label className="text-xs font-semibold text-brand-brown flex items-center gap-2">Refine plan
          {refining && <span className="animate-pulse text-[10px] font-normal">Refining…</span>}
          {sessionMode && sessionId && <span className="text-[10px] bg-brand-brown text-white px-1.5 py-0.5 rounded">Session</span>}
        </label>
        <textarea value={refineText} onChange={e=>setRefineText(e.target.value)} placeholder="e.g. slow the pace; add beach and 2 more nights; swap Florence for Venice" rows={2} className="w-full p-2 rounded border border-cream-border bg-cream focus:outline-none focus:ring-1 focus:ring-brand-orange/40 text-xs resize-y" />
        <div className="flex gap-2">
          <button onClick={handleRefine} disabled={refining || !refineText.trim()} className="px-3 py-1.5 rounded bg-brand-orange text-white text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">Refine</button>
          {applied && <span className="text-[11px] text-green-700">Stored draft ready to import.</span>}
        </div>
  <p className="text-[10px] text-brand-brown/60">Tips: Keep it short and actionable — e.g., &quot;add museum&quot;, &quot;add 2 more nights&quot;, &quot;swap to family‑friendly&quot;, &quot;reduce budget by 10%&quot;.</p>
        {uploadedId && <p className="text-[10px] text-green-700">Draft stored on server (id {uploadedId}).</p>}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />
      {error && <div role="alert" className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded text-sm">{error}</div>}

      {/* Phases */}
      <div className="grid md:grid-cols-3 gap-4">
        <section className="p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">Parse {parse ? <span className="text-green-600">✓</span>: active&&mode==='stream'?<span className="animate-pulse">…</span>:null}</h2>
          {!parse && <p className="text-xs text-brand-brown/60">Destinations, dates, travelers, budget, interests.</p>}
          {parse && (
            <div className="text-xs space-y-1">
              <div><span className="font-semibold">Destinations:</span> {parse.destinations.join(', ')||'—'}</div>
              <div><span className="font-semibold">Dates:</span> {parse.startDate||'?' } → {parse.endDate||'?'} ({parse.nights} nights)</div>
              <div>
                <span className="font-semibold">Travelers:</span>
                {parse.travelers?.adults != null ? `${parse.travelers.adults} adults` : '—'}
                {parse.travelers?.children ? `, ${parse.travelers.children} children` : ''}
              </div>
              <div><span className="font-semibold">Budget:</span> {parse.budget.amount? formatCurrency(parse.budget.amount, parse.budget.currency): 'n/a'} {parse.budget.perPerson? '(per person)':''}</div>
              <div><span className="font-semibold">Interests:</span> {parse.interests.join(', ')||'—'}</div>
            </div>
          )}
        </section>
        <section className="p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">Plan {plan ? <span className="text-green-600">✓</span>: parse && active&&mode==='stream'?<span className="animate-pulse">…</span>:null}</h2>
          {!plan && <p className="text-xs text-brand-brown/60">Skeleton itinerary days & activities.</p>}
          {plan && <ol className="text-xs list-decimal ml-4 space-y-1 max-h-60 overflow-auto pr-2">{plan.itinerary.map(d => <li key={d.day}><span className="font-semibold">{d.title}:</span> {d.activities.join('; ')}</li>)}</ol>}
        </section>
        <section className="p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">Pricing {pricing ? <span className="text-green-600">✓</span>: plan && active&&mode==='stream'?<span className="animate-pulse">…</span>:null}</h2>
          {!pricing && <p className="text-xs text-brand-brown/60">Rough heuristic estimate with scaling.</p>}
          {pricing && (
            <div className="text-xs space-y-1">
              <div><span className="font-semibold">Total:</span> {formatCurrency(pricing.pricing.total, pricing.pricing.currency)}</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(pricing.pricing.breakdown).map(([k,v]) => <div key={k}>{k}: {formatCurrency(v, pricing.pricing.currency)}</div>)}
              </div>
              <div className="italic text-[10px] text-brand-brown/70">{pricing.pricing.note}</div>
            </div>
          )}
        </section>
      </div>

      {fullData && mode==='single' && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer font-semibold">Full JSON</summary>
          <pre className="bg-cream-sand border border-cream-border rounded p-2 overflow-auto max-h-72 whitespace-pre-wrap break-all">{JSON.stringify(fullData,null,2)}</pre>
        </details>
      )}

      {sessionMode && sessionId && history.length > 0 && (
        <div className="mt-4 border border-cream-border rounded p-3 bg-cream-sand/40">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">Session History <span className="text-[10px] font-normal text-brand-brown/60">{history.length} snapshot{history.length>1?'s':''}</span></h2>
            <button onClick={()=>setShowDiff(d=>!d)} className="text-[11px] underline">{showDiff? 'Hide Diff':'Show Diff'}</button>
          </div>
          <ol className="text-[11px] space-y-1 max-h-48 overflow-auto pr-2">
            {history.map((h,i)=>(
              <li key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded bg-brand-brown text-white text-[10px] uppercase">{h.type}</span><span className="text-brand-brown/70">{new Date(h.at).toLocaleTimeString()}</span></div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <span>Nights: {h.data.nights}</span>
                  <span>Dests: {h.data.destinations.length}</span>
                  <span>Interests: {h.data.interests.length}</span>
                </div>
              </li>
            ))}
          </ol>
          {showDiff && history.length > 1 && (
            <SessionDiff prev={history[history.length-2].data} curr={history[history.length-1].data} />
          )}
        </div>
      )}
    </div>
  );
}

function SessionDiff({ prev, curr }){
  const addedInterests = curr.interests.filter(i=>!prev.interests.includes(i));
  const nightsDelta = curr.nights - prev.nights;
  const destDelta = curr.destinations.length - prev.destinations.length;
  const badge = (text) => <span className="inline-block px-1.5 py-0.5 rounded bg-brand-orange text-white text-[10px] mr-1">{text}</span>;
  // Day/activity diff (heuristic): compare titles & activity strings if itinerary arrays exist
  const prevDays = (prev.itinerary||[]).reduce((m,d)=>{ m[d.day]=d; return m; },{});
  const currDays = (curr.itinerary||[]).reduce((m,d)=>{ m[d.day]=d; return m; },{});
  const dayAdds = Object.keys(currDays).filter(day=>!prevDays[day]);
  const dayRemovals = Object.keys(prevDays).filter(day=>!currDays[day]);
  const activityAdds = [];
  const activityRemovals = [];
  Object.keys(currDays).forEach(day=>{
    if(prevDays[day]){
      const prevActs = new Set(prevDays[day].activities||[]);
      const currActs = new Set(currDays[day].activities||[]);
      for(const a of currActs){ if(!prevActs.has(a)) activityAdds.push({ day, a }); }
      for(const a of prevActs){ if(!currActs.has(a)) activityRemovals.push({ day, a }); }
    }
  });
  const [expand, setExpand] = React.useState(false);
  return (
    <div className="mt-3 text-[11px] border-t border-cream-border pt-2">
      <h3 className="font-semibold mb-1 flex items-center gap-2">Last Change</h3>
      <div className="space-y-1">
        {nightsDelta!==0 && <div>{badge('NIGHTS')} {nightsDelta>0? `+${nightsDelta}`: nightsDelta} nights (prev {prev.nights} → {curr.nights})</div>}
        {addedInterests.length>0 && <div>{badge('INTERESTS')} Added: {addedInterests.join(', ')}</div>}
        {destDelta!==0 && <div>{badge('DESTS')} {destDelta>0? `+${destDelta}`: destDelta} destinations (count)</div>}
        {dayAdds.length>0 && <div>{badge('DAY+')} Added day(s): {dayAdds.join(', ')}</div>}
        {dayRemovals.length>0 && <div>{badge('DAY-')} Removed day(s): {dayRemovals.join(', ')}</div>}
        {activityAdds.length>0 && <div>{badge('ACT+')} {activityAdds.slice(0,4).map(x=>`D${x.day}:${x.a}`).join(', ')}{activityAdds.length>4? '…':''}</div>}
        {activityRemovals.length>0 && <div>{badge('ACT-')} {activityRemovals.slice(0,4).map(x=>`D${x.day}:${x.a}`).join(', ')}{activityRemovals.length>4? '…':''}</div>}
        {nightsDelta===0 && addedInterests.length===0 && destDelta===0 && <div className="italic text-brand-brown/60">No core field changes detected.</div>}
      </div>
      {(activityAdds.length>4 || activityRemovals.length>4) && (
        <button onClick={()=>setExpand(e=>!e)} className="mt-2 underline text-[10px]">{expand? 'Hide full activity diff':'Show full activity diff'}</button>
      )}
      {expand && (
        <div className="mt-2 grid sm:grid-cols-2 gap-3">
          <div>
            <div className="font-semibold text-[10px] mb-1">Added Activities ({activityAdds.length})</div>
            <ul className="space-y-0.5 max-h-40 overflow-auto pr-1">
              {activityAdds.map((x,i)=><li key={i} className="truncate">D{x.day}: {x.a}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[10px] mb-1">Removed Activities ({activityRemovals.length})</div>
            <ul className="space-y-0.5 max-h-40 overflow-auto pr-1">
              {activityRemovals.map((x,i)=><li key={i} className="truncate">D{x.day}: {x.a}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
