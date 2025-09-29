import React, { useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function usePolling(url, interval=4000){
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  const timerRef = useRef(null);
  useEffect(()=>{
    let mounted = true;
    async function fetchOnce(){
      try {
        const res = await fetch(url);
        if(!res.ok){ throw new Error(await res.text()||'Request failed'); }
        const j = await res.json();
        if(mounted) setData(j);
      } catch(e){ if(mounted) setError(e.message||'Error'); }
    }
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, interval);
    return ()=>{ mounted=false; clearInterval(timerRef.current); };
  }, [url, interval]);
  return { data, error };
}

export default function AIMetricsPage(){
  const { data, error } = usePolling(`${API_BASE}/api/ai/metrics`, 5000);
  const { data: history } = usePolling(`${API_BASE}/api/ai/metrics/history`, 10000);
  const { data: cfg } = usePolling(`${API_BASE}/api/ai/config${import.meta.env.VITE_API_TOKEN?`?token=${import.meta.env.VITE_API_TOKEN}`:''}`, 20000);
  const [series,setSeries] = useState([]);
  const [refineSeries,setRefineSeries] = useState([]);
  const [cacheRatioSeries,setCacheRatioSeries] = useState([]); // percent 0-100
  const [tokenSeries,setTokenSeries] = useState([]); // cumulative total tokens

  useEffect(()=>{
    if(data){
      setSeries(s => [...s.slice(-49), { t: Date.now(), total: data.total, cacheHits: data.cacheHits, cacheMiss: data.cacheMiss }]);
      setRefineSeries(s => [...s.slice(-49), { t: Date.now(), refine: data.refine }]);
      const denom = (data.cacheHits + data.cacheMiss) || 0;
      if(denom){
        const ratio = (data.cacheHits / denom)*100;
        setCacheRatioSeries(s => [...s.slice(-49), { t: Date.now(), ratio }]);
      }
      if(data.tokens && typeof data.tokens.total === 'number'){
        setTokenSeries(s => [...s.slice(-49), { t: Date.now(), tokens: data.tokens.total }]);
      }
    }
  }, [data]);

  // If history file exists, backfill (only once on first load of history)
  const historyLoadedRef = useRef(false);
  useEffect(()=>{
    // Server returns { samples: [...] }
    if(history && Array.isArray(history.samples) && history.samples.length && !historyLoadedRef.current){
      historyLoadedRef.current = true;
      // normalize snapshot objects: expecting fields similar to metrics
      const snapshots = history.samples.slice(-100); // cap
      const mappedTotal = snapshots.map(s=>({ t: s.ts, total: s.total, cacheHits: s.cacheHits, cacheMiss: s.cacheMiss }));
      const mappedRefine = snapshots.map(s=>({ t: s.ts, refine: s.refine }));
      const mappedRatio = snapshots.filter(s=> (s.cacheHits + s.cacheMiss)>0).map(s=>({ t: s.ts, ratio: (s.cacheHits/(s.cacheHits+s.cacheMiss))*100 }));
      const mappedTokens = snapshots.filter(s=> s.tokens && typeof s.tokens.total==='number').map(s=>({ t: s.ts, tokens: s.tokens.total }));
      setSeries(mappedTotal);
      setRefineSeries(mappedRefine);
      setCacheRatioSeries(mappedRatio);
      if(mappedTokens.length) setTokenSeries(mappedTokens);
    }
  }, [history]);

  function spark(values, key='total', color="#c2410c"){
    if(!values.length) return null;
    const max = Math.max(...values.map(v=>v[key]));
    const min = Math.min(...values.map(v=>v[key]));
    const range = max - min || 1;
    const pts = values.map((v,i)=>{
      const x = (i/(values.length-1))*100;
      const y = 100 - ((v[key] - min)/range)*100;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
      </svg>
    );
  }

  function latencyBadge(label, value, thresholds){
    const { warn=300, danger=800 } = thresholds||{};
    let tone = 'bg-emerald-200 text-emerald-900';
    if(value>=danger) tone='bg-red-300 text-red-900';
    else if(value>=warn) tone='bg-amber-300 text-amber-900';
    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${tone}`}>{label} {value}ms</span>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6" aria-labelledby="aiMetricsHeading">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 id="aiMetricsHeading" className="text-2xl font-bold text-brand-brown">AI Metrics</h1>
        <button
          type="button"
          onClick={()=>{ window.open(`${API_BASE}/api/ai/metrics/history/download${import.meta.env.VITE_API_TOKEN?`?token=${import.meta.env.VITE_API_TOKEN}`:''}`,'_blank'); }}
          className="text-[11px] px-3 py-1 rounded bg-brand-brown text-cream-sand font-semibold hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown/50"
        >Download History</button>
      </div>
      <p className="text-sm text-brand-brown/70 leading-snug">Live heuristic AI usage counters (ephemeral, reset on server restart). Polls every 5s.</p>
      {cfg && cfg.llm && (
        <div className="text-[11px] flex flex-wrap gap-2 items-center">
          <span className="px-2 py-0.5 rounded bg-brand-brown/10 text-brand-brown uppercase tracking-wide">LLM: {cfg.llm.provider}</span>
          {cfg.llm.model && <span className="px-2 py-0.5 rounded bg-cream-sand border border-cream-border text-brand-brown">model: {cfg.llm.model}</span>}
          {cfg.hybridLLM ? <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">hybrid on</span> : <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">hybrid off</span>}
        </div>
      )}
      {error && <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-4">
        {data && [
          { label:'Total', value:data.total },
          { label:'Cache Hits', value:data.cacheHits },
          { label:'Cache Miss', value:data.cacheMiss },
          { label:'Refines', value:data.refine },
          { label:'Drafts', value:data.drafts },
          { label:'Rate Limited', value:data.rateLimited }
        ].map(m => (
          <div key={m.label} className="p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col gap-1">
            <div className="text-xs font-semibold text-brand-brown/80 uppercase tracking-wide">{m.label}</div>
            <div className="text-lg font-bold text-brand-brown">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="h-24 border border-cream-border rounded bg-cream-sand/40 p-2">
          <div className="text-[11px] font-semibold mb-1 text-brand-brown/70">Total Requests ({series.length})</div>
          <div className="w-full h-16">{spark(series,'total','#c2410c')}</div>
        </div>
        <div className="h-24 border border-cream-border rounded bg-cream-sand/40 p-2">
          <div className="text-[11px] font-semibold mb-1 text-brand-brown/70">Refine Requests ({refineSeries.length})</div>
          <div className="w-full h-16">{spark(refineSeries,'refine','#92400e')}</div>
        </div>
        <div className="h-24 border border-cream-border rounded bg-cream-sand/40 p-2">
          <div className="text-[11px] font-semibold mb-1 text-brand-brown/70">Cache Hit Ratio (%)</div>
          <div className="w-full h-16">{spark(cacheRatioSeries,'ratio','#065f46')}</div>
        </div>
      </div>
      {tokenSeries.length>0 && (
        <div className="h-24 border border-cream-border rounded bg-cream-sand/40 p-2">
          <div className="text-[11px] font-semibold mb-1 text-brand-brown/70">Total Tokens ({tokenSeries[tokenSeries.length-1].tokens})</div>
          <div className="w-full h-16">{spark(tokenSeries,'tokens','#1d4ed8')}</div>
        </div>
      )}
      {data && data.latencyPercentiles && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] flex flex-col gap-1">
            <div className="font-semibold">Latency (gen)</div>
            <div className="flex flex-wrap gap-1">
              {latencyBadge('P50', data.latencyPercentiles.gen.p50, { warn:300, danger:800 })}
              {latencyBadge('P95', data.latencyPercentiles.gen.p95, { warn:500, danger:1200 })}
              {latencyBadge('P99', data.latencyPercentiles.gen.p99, { warn:700, danger:1500 })}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-brown/10 text-brand-brown font-semibold">Avg {data.avgLatencyMs?.gen}ms</span>
            </div>
          </div>
          <div className="p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] flex flex-col gap-1">
            <div className="font-semibold">Latency (refine)</div>
            <div className="flex flex-wrap gap-1">
              {latencyBadge('P50', data.latencyPercentiles.refine.p50, { warn:300, danger:800 })}
              {latencyBadge('P95', data.latencyPercentiles.refine.p95, { warn:500, danger:1200 })}
              {latencyBadge('P99', data.latencyPercentiles.refine.p99, { warn:700, danger:1500 })}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-brown/10 text-brand-brown font-semibold">Avg {data.avgLatencyMs?.refine}ms</span>
            </div>
          </div>
        </div>
      )}
      {/* Rate limit strategy summary */}
      {data && data.rateLimit && (
        <div className="p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] flex flex-col gap-1">
          <div className="font-semibold mb-1">Rate Limit</div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2 py-0.5 bg-brand-brown/10 rounded text-brand-brown text-[10px] uppercase tracking-wide">{data.rateLimit.strategy}</span>
            {data.rateLimit.strategy === 'token_bucket' && (
              <span>capacity {data.rateLimit.capacity} • refill {data.rateLimit.refillMs}ms</span>
            )}
            {data.rateLimit.strategy === 'sliding_window' && (
              <span>window {data.rateLimit.windowMs}ms • max {data.rateLimit.max}</span>
            )}
          </div>
        </div>
      )}
      {/* Snapshot delta panel (last interval) */}
      {history && Array.isArray(history.samples) && history.samples.length > 0 && (()=>{
        const last = history.samples[history.samples.length-1];
        if(!last) return null;
        const hasDeltas = last.tokensDelta || typeof last.costDelta==='number' || typeof last.totalDelta==='number';
        if(!hasDeltas) return null;
        const reqPerSec = typeof last.totalDelta==='number' ? (last.totalDelta/10).toFixed(2) : '0.00';
        return (
          <div className="p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] grid sm:grid-cols-3 gap-3">
            <div>
              <div className="font-semibold mb-0.5">Last Interval Requests</div>
              <div className="font-bold text-brand-brown text-sm">{last.totalDelta ?? 0 >=0 ? '+' : ''}{last.totalDelta ?? 0}</div>
              <div className="text-[10px] text-brand-brown/60">~10s window • {reqPerSec}/s</div>
            </div>
            <div>
              <div className="font-semibold mb-0.5">Token Delta (total)</div>
              <div className="font-bold text-brand-brown text-sm">{last.tokensDelta ? (last.tokensDelta.total>=0?'+':'')+last.tokensDelta.total : '0'}</div>
              {last.tokensDelta && <div className="text-[10px] text-brand-brown/60">prompt {last.tokensDelta.prompt>=0?'+':''}{last.tokensDelta.prompt} • completion {last.tokensDelta.completion>=0?'+':''}{last.tokensDelta.completion}</div>}
            </div>
            <div>
              <div className="font-semibold mb-0.5">Cost Δ (USD)</div>
              <div className="font-bold text-brand-brown text-sm">{(last.costDelta>=0?'+':'')}{last.costDelta?.toFixed ? last.costDelta.toFixed(6) : last.costDelta}</div>
              <div className="text-[10px] text-brand-brown/60">cumulative {data?.costUsd?.toFixed ? data.costUsd.toFixed(6) : data?.costUsd}</div>
            </div>
          </div>
        );
      })()}
      {data && data.tokens && (
        <div className="grid sm:grid-cols-4 gap-4">
          {[{label:'Prompt Tokens',v:data.tokens.prompt},{label:'Completion Tokens',v:data.tokens.completion},{label:'Total Tokens',v:data.tokens.total},{label:'Est. Cost (USD)',v:data.costUsd?.toFixed? data.costUsd.toFixed(6): data.costUsd}].map(m=> (
            <div key={m.label} className="p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col gap-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-brand-brown/70">{m.label}</div>
              <div className="text-sm font-bold text-brand-brown break-all">{m.v}</div>
            </div>
          ))}
        </div>
      )}
      {data && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold">Raw JSON</summary>
          <pre className="bg-cream-sand border border-cream-border rounded p-2 overflow-auto max-h-64 whitespace-pre-wrap break-all">{JSON.stringify(data,null,2)}</pre>
        </details>
      )}
      <p className="text-[11px] text-brand-brown/60">History-backed visualization (snapshots every ~10s). Includes latency percentiles & token/cost metrics when hybrid mode is active.</p>
    </div>
  );
}
