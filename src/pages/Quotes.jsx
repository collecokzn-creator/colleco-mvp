import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { generateQuotePdf } from '../utils/pdfGenerators';
import WorkflowPanel from '../components/WorkflowPanel';
import Button from '../components/ui/Button.jsx';
import * as api from '../api/quotes';
import globeIcon from '../assets/Globeicon.png';

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

  const computeTotals = (q) => {
    const subtotal = (q?.items || []).reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
    const taxRate = q?.taxRate || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  async function handleDelete(id) {
    if(!window.confirm('Are you sure you want to delete this quote?')) return;
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
    <div className="overflow-x-hidden bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-brown mb-2">Quotes</h1>
              <p className="text-brand-russty">Manage client quotations and pricing</p>
            </div>
            <Button onClick={() => navigate('/quote/new')} variant="primary" size="md">New Quote</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-russty">Total Quotes</p>
                <p className="text-3xl font-bold text-brand-orange">{quotes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-russty">Accepted</p>
                <p className="text-3xl font-bold text-brand-orange">{quotes.filter(q => q.status === 'accepted').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-russty">Pending</p>
                <p className="text-3xl font-bold text-brand-orange">{quotes.filter(q => q.status === 'sent').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Panel */}
        <div className="mb-6">
          <WorkflowPanel currentPage="quotes" basketCount={0} hasQuote={quotes.length > 0} />
        </div>

        {/* Quotes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-brand-russty">Loading quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-12 text-center">
            <div className="text-6xl mb-4 opacity-20">📋</div>
            <h3 className="text-xl font-semibold text-brand-brown mb-2">No quotes yet</h3>
            <p className="text-brand-russty mb-6">Create your first quote to get started</p>
            <Button onClick={() => navigate('/quote/new')} variant="primary" size="md">Create Quote</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(q => {
              const { subtotal: _subtotal, tax: _tax, total } = computeTotals(q);
              const getStatusStyle = (status) => {
                const s = status?.toLowerCase();
                if (s === 'accepted' || s === 'paid') return 'bg-green-100 text-green-800';
                if (s === 'sent') return 'bg-brand-orange/10 text-brand-orange';
                if (s === 'rejected' || s === 'cancelled') return 'bg-red-100 text-red-800';
                return 'bg-cream-sand text-brand-brown';
              };
              
              return (
                <div key={q.id} className="bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    
                    {/* Quote Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-brown mb-2">
                        {q.clientName || 'Untitled Quote'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(q.status)}`}>
                          {q.status || 'Draft'}
                        </span>
                        <span className="text-sm text-brand-russty">
                          {q.items?.length || 0} {q.items?.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-sm font-semibold text-brand-orange">
                          {formatCurrency(total, q.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-brand-russty">
                        Updated {new Date(q.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => navigate('/quote/new?edit=' + q.id)} variant="primary" size="sm">Open</Button>
                      <Button onClick={() => generateQuotePdf(q)} variant="outline" size="sm">PDF</Button>
                      <Button onClick={() => handleClone(q.id)} variant="secondary" size="sm">Clone</Button>
                      <Button onClick={() => handleDelete(q.id)} variant="danger" size="sm">Delete</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
