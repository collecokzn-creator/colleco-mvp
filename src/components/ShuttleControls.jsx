import React from 'react';

export default function ShuttleControls({ streamMode, setStreamMode, streamStatus, reconnectIn, messageLog = [], clearLog = ()=>{}, sendCommand = null, showLive = true, setShowLive = null }){
  return (
    <div className="absolute top-3 right-3 z-50 text-xs">
      <div className="bg-white/95 rounded-md p-2 shadow-sm flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!showLive} onChange={(e)=> setShowLive && setShowLive(e.target.checked)} />
          <span className="text-[12px]">Show live positions</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-[12px]">Stream:</label>
          <select value={streamMode} onChange={(e)=> setStreamMode && setStreamMode(e.target.value)} className="text-xs border rounded px-2 py-1">
            <option value="auto">Auto (WS → SSE)</option>
            <option value="ws">WebSocket</option>
            <option value="sse">SSE</option>
          </select>
        </div>
        <div className="text-[12px] text-gray-600">Status: <span className="font-semibold ml-1">{streamStatus || 'unknown'}</span></div>
        <div className="text-[12px] text-gray-600">Reconnect: <span className="font-semibold ml-1">{typeof reconnectIn === 'number' ? reconnectIn + 's' : '—'}</span></div>
      </div>

      <div className="mt-2 bg-white/95 rounded-md p-2 shadow-sm text-xs">
        <div className="flex gap-2 items-center">
          <input id="shuttle-cmd-input" placeholder="driver command (whereami)" className="text-xs p-1 border rounded flex-1" />
          <button
            type="button"
            onClick={() => {
              try {
                const el = document.getElementById('shuttle-cmd-input');
                const val = el ? el.value.trim() : '';
                const cmd = val || 'whereami';
                if (sendCommand && typeof sendCommand === 'function'){
                  const ok = sendCommand({ type: 'cmd', cmd });
                  if (!ok) alert('WebSocket not connected');
                } else if (typeof window !== 'undefined' && window.__shuttleSendCommand){
                  const ok = window.__shuttleSendCommand({ type: 'cmd', cmd });
                  if (!ok) alert('WebSocket not connected');
                } else {
                  alert('WebSocket send not available');
                }
              } catch (e) { console.warn('send failed', e); }
            }}
            className="px-2 py-1 bg-brand-orange text-white rounded text-xs"
          >Send</button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-[12px] text-gray-600">Messages <span className="text-[11px] text-gray-400">({messageLog ? messageLog.length : 0})</span></div>
          <div className="flex gap-2">
            <button onClick={()=>{ clearLog && clearLog(); }} className="px-2 py-1 border rounded text-xs">Clear</button>
          </div>
        </div>

        <div className="mt-2 max-h-40 overflow-auto text-[12px] font-mono">
          {(!messageLog || messageLog.length === 0) && <div className="text-gray-500">No messages</div>}
          {messageLog && messageLog.slice(0,20).map((m, idx) => (
            <div key={(m.ts||0) + '-' + idx} className="mb-1">
              <div className="text-[10px] text-gray-500">{m.ts ? new Date(m.ts).toLocaleTimeString() : ''} • {m.dir}</div>
              <div className="break-words">{typeof m.payload === 'string' ? m.payload : JSON.stringify(m.payload)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
