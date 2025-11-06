import React, { useEffect, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function AdminPartnerSignups(){
  const [list, setList] = useState([]);

  useEffect(()=>{ load(); }, []);

  function load(){
    try{
      const raw = localStorage.getItem('mock:partnerSignups');
      const arr = raw ? JSON.parse(raw) : [];
      setList(Array.isArray(arr) ? arr.reverse() : []);
    }catch(e){ setList([]); }
  }

  function clearAll(){
    if(!confirm('Clear all partner signup logs? This cannot be undone.')) return;
    try{ localStorage.removeItem('mock:partnerSignups'); }catch(e){}
    load();
  }

  function exportCsv(){
    const rows = [['email','companyName','ref','ts']];
    list.slice().reverse().forEach(r => rows.push([r.email||'', r.companyName||'', r.ref||'', r.ts||'']));
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partner-signups-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="text-brand-brown p-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-2">Partner Signups</h1>
      <p className="text-sm text-gray-600 mb-4">List of partner registrations recorded by the demo site (localStorage key <code>mock:partnerSignups</code>).</p>

      <div className="mb-4 flex gap-2">
        <button onClick={load} className="px-3 py-2 border rounded">Refresh</button>
        <button onClick={exportCsv} className="px-3 py-2 bg-brand-orange text-white rounded">Export CSV</button>
        <button onClick={clearAll} className="px-3 py-2 border rounded text-red-600">Clear all</button>
      </div>

      <div className="overflow-x-auto bg-white rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">When</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">Ref</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-600">No partner signups recorded.</td></tr>
            )}
            {list.map((r, idx) => (
              <tr key={idx} className={idx%2 ? 'bg-gray-50' : ''}>
                <td className="p-2 align-top">{new Date(r.ts).toLocaleString()}</td>
                <td className="p-2 align-top">{r.email}</td>
                <td className="p-2 align-top">{r.companyName}</td>
                <td className="p-2 align-top"><code className="text-xs text-gray-700">{r.ref}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
