import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBasketState } from '../utils/useBasketState';
import { useQuotesState } from '../utils/useQuotesState';
import { generateQuotePdf, exportQuotePdfData } from '../utils/pdfGenerators';
import { formatCurrency } from '../utils/currency';
import * as api from '../api/quotes';

export default function NewQuote() {
  const { quotes, createQuote, updateQuote, addItem, updateItem, removeItem, computeTotals, setStatus } = useQuotesState();
  const { paidItems } = useBasketState();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const editingId = params.get('edit');
  const [quoteId, setQuoteId] = useState(editingId || null);
  const [created, setCreated] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!quoteId) {
      const id = createQuote({});
      setQuoteId(id);
      setCreated(true);
      // Prefill with paid basket items if coming from basket and not editing
      if (!editingId && loc.state?.fromBasket && paidItems.length) {
        paidItems.forEach(pi => {
          addItem(id, { title: pi.title, description: pi.description, category: pi.category, unitPrice: pi.price, quantity: pi.quantity || 1 });
        });
      }
    }
  }, [quoteId, createQuote, editingId, loc.state, paidItems, addItem]);

  const quote = quotes.find(q => q.id === quoteId);

  function handleAddItem() {
    if (!quote) return;
    addItem(quote.id, { title: 'New Line Item', unitPrice: 0, quantity: 1 });
  }

  function handleExport() {
    if (!quote) return;
    generateQuotePdf(quote); // structured mode
  }

  if (!quote) return <div className="p-6">Loading Quote...</div>;

  const { subtotal, discount, tax, total } = computeTotals(quote);

  async function handleSave() {
    // clear
    setErrors({});
    const payload = { clientName: quote.clientName, clientEmail: quote.clientEmail, clientPhone: quote.clientPhone, currency: quote.currency, items: quote.items, taxRate: quote.taxRate, discountRate: quote.discountRate, notes: quote.notes, status: quote.status, dueDate: quote.dueDate, validityDays: quote.validityDays, paymentTerms: quote.paymentTerms };
    try {
      let res;
      // detect temp id (created locally)
      const isTmp = String(quote.id||'').startsWith('tmp_') || !quote.id;
      if (isTmp) {
        res = await api.createQuote(payload);
        // update local quote record with server values if available
        if (res && res.id) {
          updateQuote(quote.id, { id: res.id, createdAt: res.createdAt || Date.now(), updatedAt: res.updatedAt || Date.now(), quoteNumber: res.quoteNumber || quote.quoteNumber });
        }
      } else {
        res = await api.updateQuote(quote.id, payload);
        if (res && res.id) updateQuote(quote.id, { ...res });
      }
      // mark saved
      setCreated(false);
    } catch (e) {
      // map validation errors: e.body.details = [{field,message}]
      if (e && e.body && Array.isArray(e.body.details)){
        const map = {};
        for(const d of e.body.details){ map[d.field] = d.message; }
        setErrors(map);
      } else {
        // generic error
        setErrors({ _global: 'Save failed. Try again.' });
      }
    }
  }

  return (
    <div className="px-6 py-8 text-brand-brown max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
  <h1 className="text-3xl font-bold">{editingId ? 'Edit Quote' : 'New Quote'}</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-2 rounded border border-brand-brown text-brand-brown hover:bg-cream-hover">Export PDF</button>
          <button onClick={handleSave} className="px-3 py-2 rounded bg-brand-orange text-white">Save</button>
          <button
            onClick={async ()=>{
              if(!quote || !quote.id) return alert('Please save the quote before sending.');
              if(!quote.clientEmail) return alert('Quote has no client email. Please add recipient.');
              try{
                setSending(true);
                const dataUri = await exportQuotePdfData(quote);
                if(!dataUri) throw new Error('pdf_export_failed');
                const payload = { to: quote.clientEmail, subject: `Quote ${quote.quoteNumber || quote.id}`, text: `Please find your quote attached.`, pdfBase64: dataUri, fileName: `${(quote.quoteNumber||quote.id)}_Quote.pdf` };
                await api.sendQuote(quote.id, payload);
                // mark as Sent locally
                setStatus(quote.id, 'Sent');
                alert('Quote sent successfully');
              }catch(e){
                console.error('send failed', e);
                alert('Send failed: ' + ((e && e.body && e.body.error) ? e.body.error : e.message || 'failed'));
              } finally { setSending(false); }
            }}
            disabled={sending}
            className="px-3 py-2 rounded border bg-white text-brand-brown"
          >{sending ? 'Sending…' : 'Send'}</button>
        </div>
      </div>
      {created && <p className="text-sm text-brand-brown/70 mb-4">A draft quote was created — fill in details below.</p>}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="space-y-4 md:col-span-2">
          <div className="bg-cream rounded border border-cream-border p-4 space-y-3">
            <h2 className="font-semibold mb-2">Quote Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Client Name</span>
                <input value={quote.clientName} onChange={e=>updateQuote(quote.id,{clientName:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white" />
                {errors['clientName'] && <div className="text-red-600 text-sm">{errors['clientName']}</div>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Client Email</span>
                <input type="email" value={quote.clientEmail||''} onChange={e=>updateQuote(quote.id,{clientEmail:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white" />
                {errors['clientEmail'] && <div className="text-red-600 text-sm">{errors['clientEmail']}</div>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Currency</span>
                <select value={quote.currency} onChange={e=>updateQuote(quote.id,{currency:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="ZAR">ZAR</option>
                  <option value="GBP">GBP</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Client Phone</span>
                <input value={quote.clientPhone||''} onChange={e=>updateQuote(quote.id,{clientPhone:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Quote Number</span>
                <input value={quote.quoteNumber||''} readOnly className="px-2 py-1 rounded border border-cream-border bg-white text-brand-brown/60" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Tax Rate (%)</span>
                <input type="number" min="0" value={quote.taxRate} onChange={e=>updateQuote(quote.id,{taxRate: Number(e.target.value)})} className="px-2 py-1 rounded border border-cream-border bg-white" />
                {errors['taxRate'] && <div className="text-red-600 text-sm">{errors['taxRate']}</div>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Discount (%)</span>
                <input type="number" min="0" max="100" value={quote.discountRate||0} onChange={e=>updateQuote(quote.id,{discountRate: Number(e.target.value)})} className="px-2 py-1 rounded border border-cream-border bg-white" />
                {errors['discountRate'] && <div className="text-red-600 text-sm">{errors['discountRate']}</div>}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Status</span>
                <select value={quote.status} onChange={e=>setStatus(quote.id, e.target.value)} className="px-2 py-1 rounded border border-cream-border bg-white">
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Accepted</option>
                  <option>Declined</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Due Date</span>
                <input type="date" value={quote.dueDate||''} onChange={e=>updateQuote(quote.id,{dueDate:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Validity (days)</span>
                <input type="number" min="0" value={quote.validityDays||30} onChange={e=>updateQuote(quote.id,{validityDays: Number(e.target.value)})} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs uppercase tracking-wide text-brand-brown/70">Payment Terms</span>
                <input value={quote.paymentTerms||''} onChange={e=>updateQuote(quote.id,{paymentTerms:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wide text-brand-brown/70">Internal / Client Notes</span>
              <textarea rows={3} value={quote.notes} onChange={e=>updateQuote(quote.id,{notes:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-white" />
            </label>
          </div>

          <div className="bg-cream rounded border border-cream-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Line Items</h2>
              <button onClick={handleAddItem} className="px-2 py-1 text-xs rounded border border-brand-brown text-brand-brown hover:bg-cream-hover">Add Item</button>
            </div>
            {quote.items.length === 0 && <p className="text-sm text-brand-brown/60">No items yet. Add your first line.</p>}
            <ul className="space-y-3">
              {quote.items.map(i => (
                <li key={i.id} className="bg-white rounded border border-cream-border p-3">
                  <div className="grid md:grid-cols-5 gap-3 text-sm">
                    <label className="flex flex-col gap-1 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-wide text-brand-brown/60">Title</span>
                      <input value={i.title} onChange={e=>updateItem(quote.id,i.id,{title:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    </label>
                    <label className="flex flex-col gap-1 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-wide text-brand-brown/60">Description</span>
                      <input value={i.description||''} onChange={e=>updateItem(quote.id,i.id,{description:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-brand-brown/60">Category</span>
                      <input value={i.category||''} onChange={e=>updateItem(quote.id,i.id,{category:e.target.value})} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-brand-brown/60">Unit Price</span>
                      <input type="number" min="0" value={i.unitPrice} onChange={e=>updateItem(quote.id,i.id,{unitPrice:Number(e.target.value)})} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-brand-brown/60">Qty</span>
                      <input type="number" min="1" value={i.quantity} onChange={e=>updateItem(quote.id,i.id,{quantity:Number(e.target.value)})} className="px-2 py-1 rounded border border-cream-border bg-cream-sand" />
                    </label>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wide text-brand-brown/60">Line Total</span>
                      <div className="px-2 py-1 rounded bg-cream-sand border border-cream-border">{formatCurrency(Number(i.unitPrice) * Number(i.quantity || 1), quote.currency)}</div>
                    </div>
                    <div className="flex items-end">
                      <button onClick={()=>removeItem(quote.id,i.id)} className="mt-auto px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-400">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-cream rounded border border-cream-border p-4 text-sm">
            <h2 className="font-semibold mb-2">Summary</h2>
            <div className="flex justify-between py-1"><span className="text-brand-brown/70">Subtotal</span><span>{formatCurrency(subtotal, quote.currency)}</span></div>
            {discount>0 && <div className="flex justify-between py-1"><span className="text-brand-brown/70">Discount ({quote.discountRate||0}%)</span><span>-{formatCurrency(discount, quote.currency)}</span></div>}
            {quote.taxRate > 0 && <div className="flex justify-between py-1"><span className="text-brand-brown/70">Tax ({quote.taxRate}%)</span><span>{formatCurrency(tax, quote.currency)}</span></div>}
            <div className="flex justify-between py-1 font-semibold border-t border-cream-border mt-2 pt-2"><span>Total</span><span>{formatCurrency(total, quote.currency)}</span></div>
            <p className="text-[11px] text-brand-brown/60 mt-3">Status: <span className="font-medium">{quote.status}</span></p>
            <p className="text-[11px] text-brand-brown/60">Created: {new Date(quote.createdAt).toLocaleString()}</p>
            <p className="text-[11px] text-brand-brown/60">Updated: {new Date(quote.updatedAt).toLocaleString()}</p>
            {quote.dueDate && <p className="text-[11px] text-brand-brown/60">Due: {new Date(quote.dueDate).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
