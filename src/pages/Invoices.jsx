import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInvoicePdf } from '../utils/pdfGenerators';
import * as api from '../api/invoices';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.getInvoices().then(list => { if(mounted) { setInvoices(list); setLoading(false); } }).catch(()=>setLoading(false));
    return () => { mounted = false; };
  }, []);

  function handleNew() { navigate('/invoice/new'); }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <button onClick={handleNew} className="px-3 py-2 rounded bg-brand-orange text-white">New Invoice</button>
        </div>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && invoices.length===0 && <div className="text-sm text-brand-brown/60">No invoices yet.</div>}
      <ul className="space-y-3">
        {invoices.map(inv => (
          <li key={inv.id} className="bg-cream p-3 rounded border border-cream-border flex items-center justify-between">
            <div>
              <div className="font-medium">{inv.invoiceNumber || inv.id}</div>
              <div className="text-sm text-brand-brown/60">{inv.clientName} • {inv.currency} • {inv.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>generateInvoicePdf(inv)} className="px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover">PDF</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}