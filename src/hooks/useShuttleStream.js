import { useEffect, useRef, useState } from 'react';

// Hook to manage shuttle streaming (WS preferred) with SSE fallback,
// reconnect/backoff, message log, and sendCommand bridge.
export default function useShuttleStream({ initialMode = 'auto', initialPositions = [] } = {}){
  const [streamMode, setStreamMode] = useState(initialMode);
  const [streamStatus, setStreamStatus] = useState('disconnected');
  const [shuttlePositions, setShuttlePositions] = useState(initialPositions || []);
  const [messageLog, setMessageLog] = useState([]); // { ts, dir, payload }
  const [nextReconnectAt, setNextReconnectAt] = useState(null);
  const [reconnectIn, setReconnectIn] = useState(0);

  const wsRef = useRef(null);
  const esRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const closedByUserRef = useRef(false);
  function pushLog(dir, payload){
    try {
      setMessageLog((s) => {
        const next = [{ ts: Date.now(), dir, payload }, ...s].slice(0, 60);
        return next;
      });
    } catch(e){}
  }

  // useRef wrapper for handler so effects can reference a stable .current without creating
  // a new function that would otherwise need to be added to effect dependency lists.
  const handlePositionsArrayRef = useRef((arr) => {
    if (!Array.isArray(arr)) return;
    setShuttlePositions(arr.map(d => ({ id: d.id, name: d.name, lat: Number(d.lat), lng: Number(d.lng), waypoints: d.waypoints || d.path || null })));
    try { pushLog('in', Array.isArray(arr) ? JSON.stringify(arr) : String(arr)); } catch(e){}
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    let reconnectAttempts = 0;

    function startSSE(){
      try { if (wsRef.current) { wsRef.current.close(); wsRef.current = null; } } catch(e){}
      if (esRef.current) return;
      try {
        esRef.current = new EventSource('/events/shuttles');
        setStreamStatus('connected-sse');
        const onPositions = (ev) => {
          try {
            const data = ev && ev.data ? JSON.parse(ev.data) : null;
            if (Array.isArray(data)) handlePositionsArrayRef.current(data);
            try { pushLog('in', ev.data); } catch(e){}
          } catch (e) { }
        };
        esRef.current.addEventListener('positions', onPositions);
        esRef.current.onmessage = onPositions;
        esRef.current.onerror = () => { setStreamStatus('error-sse'); pushLog('in', '[sse:error]'); };
      } catch (e) { setStreamStatus('error-sse'); pushLog('in', '[sse:error]'); }
    }

    function connectWS(){
      try { if (esRef.current) { esRef.current.close(); esRef.current = null; } } catch(e){}
      try {
        setStreamStatus('connecting');
        const proto = (location && location.protocol === 'https:') ? 'wss' : 'ws';
        const url = `${proto}://${location.host}/ws/shuttles`;
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen = () => { reconnectAttempts = 0; setStreamStatus('connected');
          // expose send bridge
          try { window.__shuttleSendCommand = (obj) => { try { if(wsRef.current && wsRef.current.readyState===1) { const payload = typeof obj === 'string' ? obj : JSON.stringify(obj); wsRef.current.send(payload); pushLog('out', payload); return true; } return false; } catch(e){ return false; } } } catch(e){}
        };
        ws.onmessage = (ev) => {
          try {
            const msg = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
              if (msg && msg.type === 'positions' && Array.isArray(msg.data)) handlePositionsArrayRef.current(msg.data);
              else if (Array.isArray(msg)) handlePositionsArrayRef.current(msg);
            else {
              // log generic message
              pushLog('in', typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data));
            }
          } catch (e) { try { pushLog('in', ev.data); } catch(e){} }
        };
        ws.onerror = () => { setStreamStatus('error'); pushLog('in', '[ws:error]'); };
        ws.onclose = () => {
          if (closedByUserRef.current) return;
          setStreamStatus('disconnected');
          if (streamMode === 'auto') { startSSE(); return; }
          if (streamMode === 'ws') {
            reconnectAttempts++;
            const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
            const at = Date.now() + delay;
            try { setNextReconnectAt(at); } catch(e){}
            reconnectTimerRef.current = setTimeout(() => { connectWS(); }, delay);
          }
        };
      } catch (e) {
        setStreamStatus('error');
        if (streamMode !== 'ws') startSSE();
      }
    }

    // choose initial connect
    if (streamMode === 'sse') startSSE();
    else connectWS();

    return () => {
      closedByUserRef.current = true;
      try { if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current); } catch(e){}
      try { if (wsRef.current) wsRef.current.close(); } catch(e){}
      try { if (esRef.current) esRef.current.close(); } catch(e){}
      try { if (window && window.__shuttleSendCommand) delete window.__shuttleSendCommand; } catch(e){}
      setStreamStatus('disconnected');
      try { setNextReconnectAt(null); } catch(e){}
    };
  }, [streamMode]);

  // reconnect countdown
  useEffect(()=>{
    let t = null;
    if (nextReconnectAt) {
      const tick = () => {
        const rem = Math.max(0, Math.ceil((nextReconnectAt - Date.now()) / 1000));
        setReconnectIn(rem);
        if (rem <= 0) { try { setNextReconnectAt(null); } catch(e){} }
      };
      tick();
      t = setInterval(tick, 500);
    } else {
      setReconnectIn(0);
    }
    return () => { try { if (t) clearInterval(t); } catch(e){} };
  }, [nextReconnectAt]);

  function clearLog(){ setMessageLog([]); }
  function sendCommand(obj){
    try {
      if (wsRef.current && wsRef.current.readyState === 1){ const payload = typeof obj === 'string' ? obj : JSON.stringify(obj); wsRef.current.send(payload); pushLog('out', payload); return true; }
    } catch(e){}
    return false;
  }

  return {
    shuttlePositions,
    setShuttlePositions,
    streamMode,
    setStreamMode,
    streamStatus,
    reconnectIn,
    messageLog,
    clearLog,
    sendCommand
  };
}
