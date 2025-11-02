import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { generateQuotePdf } from '../utils/pdfGenerators';
import * as api from '../api/quotes';

export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getQuotes().then(qs => { if(mounted) setQuotes(qs || []); }).finally(()=>{ if(mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const computeTotals = (_q) => ({ subtotal: 0, tax: 0, total: 0 });

  async function handleDelete(id) {
    if(!window.confirm('Delete this quote?')) return;
    try {
      await api.deleteQuote(id);
      setQuotes(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.warn('delete failed', e); }
  }

  async function handleClone(id) {
    const src = quotes.find(q => q.id === id);
    if(!src) return;
    const copy = { ...src, id: undefined, clientName: `${src.clientName} (Copy)`, createdAt: undefined, updatedAt: undefined };
    try {
      const created = await api.createQuote(copy);
      setQuotes(prev => [created, ...prev]);
    } catch (e) { console.warn('clone failed', e); }
  }

  return (
    <div className="px-6 py-8 text-brand-brown max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Quotes</h1>
          <p className="text-brand-brown/70 text-sm">Manage, export and track client quotations independently of itineraries.</p>
        </div>
        <button onClick={()=>navigate('/quote/new')} className="px-4 py-2 rounded bg-brand-brown text-cream text-sm font-medium hover:bg-brand-brown/90">New Quote</button>
      </div>

      {loading ? <div>Loading…</div> : (quotes.length === 0 && (
        <div className="bg-cream rounded border border-cream-border p-6 text-sm text-brand-brown/70">
          No quotes yet. Create your first using the New Quote button.
        </div>
      ))}

      <ul className="space-y-3">
        {quotes.map(q => {
          const { subtotal: _subtotal, tax: _tax, total } = computeTotals(q);
          return (
            <li key={q.id} className="bg-cream rounded border border-cream-border p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{q.clientName || 'Untitled Quote'}</p>
                <p className="text-[11px] text-brand-brown/60">{q.items.length} items • {formatCurrency(total, q.currency)} • Status: {q.status}</p>
                <p className="text-[11px] text-brand-brown/50">Updated {new Date(q.updatedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={()=>navigate('/quote/new?edit='+q.id)} className="px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover">Open</button>
                <button onClick={()=>generateQuotePdf(q)} className="px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover">PDF</button>
                <button onClick={()=>handleClone(q.id)} className="px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover">Clone</button>
                <button onClick={()=>handleDelete(q.id)} className="px-3 py-1.5 text-xs rounded border border-red-600 text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
