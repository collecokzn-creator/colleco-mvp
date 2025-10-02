import { useState, useCallback, useEffect } from 'react';

// Local storage key
const KEY = 'quotes:v1';

// Quote shape example:
// { id, clientName, currency, items: [{ id, title, description, unitPrice, quantity, category, notes }], taxRate, notes, status, createdAt, updatedAt }
// status: Draft | Sent | Accepted | Declined

const newId = () => 'q_' + Math.random().toString(36).slice(2, 10);
const newItemId = () => 'qi_' + Math.random().toString(36).slice(2, 10);

export function useQuotesState() {
  const [quotes, setQuotes] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(quotes)); } catch {}
  }, [quotes]);

  const createQuote = useCallback((data = {}) => {
    const q = {
      id: newId(),
      clientName: data.clientName || '',
      clientEmail: data.clientEmail || '',
      quoteNumber: data.quoteNumber || (()=>{
        const d = new Date();
        const y = d.getFullYear();
        const seq = Math.floor(Math.random()*9000)+1000; // simple non-persistent seq
        return `Q-${y}-${seq}`;
      })(),
      dueDate: data.dueDate || '',
      currency: data.currency || 'USD',
      items: [],
      taxRate: data.taxRate || 0,
      discountRate: data.discountRate || 0,
      notes: data.notes || '',
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setQuotes(qs => [...qs, q]);
    return q.id;
  }, []);

  const updateQuote = useCallback((id, patch) => {
    setQuotes(qs => qs.map(q => q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q));
  }, []);

  const deleteQuote = useCallback((id) => {
    setQuotes(qs => qs.filter(q => q.id !== id));
  }, []);

  const _cloneQuote = useCallback((id) => {
    setQuotes(qs => {
      const src = qs.find(q => q.id === id);
      if (!src) return qs;
      const cloned = {
        ...src,
        id: newId(),
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: src.items.map(i => ({ ...i, id: newItemId() }))
      };
      return [...qs, cloned];
    });
  }, []);

  const addItem = useCallback((quoteId, item) => {
    setQuotes(qs => qs.map(q => {
      if (q.id !== quoteId) return q;
      const newItem = { id: newItemId(), title: '', unitPrice: 0, quantity: 1, ...item };
      return { ...q, items: [...q.items, newItem], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateItem = useCallback((quoteId, itemId, patch) => {
    setQuotes(qs => qs.map(q => {
      if (q.id !== quoteId) return q;
      return {
        ...q,
        items: q.items.map(i => i.id === itemId ? { ...i, ...patch } : i),
        updatedAt: new Date().toISOString()
      };
    }));
  }, []);

  const removeItem = useCallback((quoteId, itemId) => {
    setQuotes(qs => qs.map(q => q.id === quoteId ? { ...q, items: q.items.filter(i => i.id !== itemId), updatedAt: new Date().toISOString() } : q));
  }, []);

  const computeTotals = useCallback((quote) => {
    if (!quote) return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    const rawSubtotal = (quote.items||[]).reduce((sum, i) => sum + (Number(i.unitPrice||0) * Number(i.quantity || 1)), 0);
    const discountRate = Math.max(0, Math.min(100, Number(quote.discountRate||0)));
    const discount = discountRate ? rawSubtotal * (discountRate / 100) : 0;
    const subtotal = rawSubtotal - discount;
    const taxRate = Math.max(0, Number(quote.taxRate||0));
    const tax = taxRate ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + tax;
    return { subtotal, discount, tax, total };
  }, []);

  const setStatus = useCallback((id, status) => {
    const allowed = ['Draft','Sent','Accepted','Declined'];
    if (!allowed.includes(status)) return;
    updateQuote(id, { status });
  }, [updateQuote]);

  return {
    quotes,
    createQuote,
    updateQuote,
    deleteQuote,
    addItem,
    updateItem,
    removeItem,
    computeTotals,
    setStatus
  };
}

export default useQuotesState;
