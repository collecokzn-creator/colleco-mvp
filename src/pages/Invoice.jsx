import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateInvoicePdf } from '../utils/pdfGenerators';
import { formatCurrency } from '../utils/currency';
import * as api from '../api/invoices';

function emptyInvoice() {
  return {
    clientName: '',
    clientEmail: '',
    currency: 'ZAR',
    taxRate: 0,
    notes: '',
    status: 'Draft',
    items: [],
  };
}

export default function Invoice() {
  const loc = useLocation();
  const [invoice, setInvoice] = useState(() => ({ ...emptyInvoice() }));
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    // If navigating with a draft/invoice in state, prefill
    if(loc.state && loc.state.invoice){ setInvoice({ ...emptyInvoice(), ...loc.state.invoice }); }
  }, [loc.state]);

  function updateField(path, value){
    setInvoice(i => ({ ...i, [path]: value }));
  }

  function addItem(){
    setInvoice(i => ({ ...i, items: [...(i.items||[]), { id: 'l_' + Math.random().toString(36).slice(2,8), title: 'New Item', unitPrice: 0, quantity: 1 }] }));
  }

  function updateItem(id, patch){
    setInvoice(i => ({ ...i, items: (i.items||[]).map(it => it.id === id ? { ...it, ...patch } : it) }));
  }

  function removeItem(id){ setInvoice(i => ({ ...i, items: (i.items||[]).filter(it => it.id !== id) })); }

  function computeTotals(inv){
    const subtotal = (inv.items||[]).reduce((s,it)=> s + (Number(it.unitPrice||0) * Number(it.quantity||1)), 0);
    const tax = inv.taxRate ? (subtotal * (Number(inv.taxRate||0)/100)) : 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }

  async function handleSave(){
    setSaving(true);
    try{
      const payload = { ...invoice };
      const res = await api.createInvoice(payload);
  if(res && res.id){ setInvoice(prev => ({ ...prev, id: res.id, createdAt: res.createdAt || Date.now(), updatedAt: res.updatedAt || Date.now() })); }
    }catch(e){ console.error('save invoice failed', e); }
    setSaving(false);
  }

  function handleExport(){ generateInvoicePdf(invoice); }

  const { subtotal, tax, total } = computeTotals(invoice);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto text-brand-brown">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">New Invoice</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={!invoice} className="px-3 py-2 rounded border border-brand-brown">Export PDF</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded bg-brand-orange text-white">Save</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-cream p-4 rounded border border-cream-border">
            <h2 className="font-semibold mb-2">Invoice Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-brand-brown/70">Client Name</span>
                <input value={invoice.clientName} onChange={e=>updateField('clientName', e.target.value)} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-brand-brown/70">Client Email</span>
                <input value={invoice.clientEmail||''} onChange={e=>updateField('clientEmail', e.target.value)} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-brand-brown/70">Currency</span>
                <select value={invoice.currency} onChange={e=>updateField('currency', e.target.value)} className="px-2 py-1 rounded border border-cream-border bg-white">
                  <option value="ZAR">ZAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-brand-brown/70">Tax Rate (%)</span>
                <input type="number" min="0" value={invoice.taxRate} onChange={e=>updateField('taxRate', Number(e.target.value))} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
            </div>
            <label className="flex flex-col gap-1 mt-3">
              <span className="text-xs text-brand-brown/70">Notes</span>
              <textarea rows={3} value={invoice.notes} onChange={e=>updateField('notes', e.target.value)} className="px-2 py-1 rounded border border-cream-border bg-white" />
            </label>
          </div>

          <div className="bg-cream p-4 rounded border border-cream-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Line Items</h2>
              <button onClick={addItem} className="px-2 py-1 text-xs rounded border">Add Item</button>
            </div>
            <ul className="space-y-3">
              {(invoice.items||[]).map(it => (
                <li key={it.id} className="bg-white p-3 rounded border border-cream-border">
                  <div className="grid md:grid-cols-5 gap-3 text-sm">
                    <input value={it.title} onChange={e=>updateItem(it.id,{ title: e.target.value })} className="px-2 py-1 rounded border border-cream-border bg-cream-sand md:col-span-2" />
                    <input value={it.description||''} onChange={e=>updateItem(it.id,{ description: e.target.value })} className="px-2 py-1 rounded border border-cream-border bg-cream-sand md:col-span-2" />
                    <input type="number" min="1" value={it.quantity||1} onChange={e=>updateItem(it.id,{ quantity: Number(e.target.value) })} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    <input type="number" min="0" value={it.unitPrice||0} onChange={e=>updateItem(it.id,{ unitPrice: Number(e.target.value) })} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    <div className="flex items-center gap-2">
                      <div className="text-sm">{formatCurrency(Number(it.unitPrice||0) * Number(it.quantity||1), invoice.currency)}</div>
                      <button onClick={()=>removeItem(it.id)} className="px-2 py-1 text-xs rounded bg-red-500 text-white">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-cream p-4 rounded border border-cream-border">
            <h2 className="font-semibold mb-2">Summary</h2>
            <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatCurrency(subtotal, invoice.currency)}</span></div>
            {invoice.taxRate > 0 && <div className="flex justify-between py-1"><span>Tax ({invoice.taxRate}%)</span><span>{formatCurrency(tax, invoice.currency)}</span></div>}
            <div className="flex justify-between py-1 font-semibold border-t mt-2 pt-2"><span>Total</span><span>{formatCurrency(total, invoice.currency)}</span></div>
            <p className="text-sm text-brand-brown/60">Status: <strong>{invoice.status}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
