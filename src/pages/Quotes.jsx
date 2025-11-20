import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { generateQuotePdf } from '../utils/pdfGenerators';
import WorkflowPanel from '../components/WorkflowPanel';
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

  const computeTotals = (_q) => ({ subtotal: 0, tax: 0, total: 0 });

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
    <div className="overflow-x-hidden bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-brown">Quotes</h1>
              <p className="text-gray-600 mt-2">Manage client quotations and pricing</p>
            </div>
            <button 
              onClick={() => navigate('/quote/new')} 
              className="px-6 py-2.5 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-orange/90 transition-colors shadow-sm"
            >
              + New Quote
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quotes</p>
                <p className="text-3xl font-bold text-brand-orange">{quotes.length}</p>
              </div>
              <img src={globeIcon} alt="" className="w-12 h-12" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-brand-orange">{quotes.filter(q => q.status === 'accepted').length}</p>
              </div>
              <div className="text-4xl">✓</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-brand-orange">{quotes.filter(q => q.status === 'sent').length}</p>
              </div>
              <div className="text-4xl">📤</div>
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
            <p className="mt-4 text-gray-600">Loading quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <img src={globeIcon} alt="" className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-brand-brown mb-2">No quotes yet</h3>
            <p className="text-gray-600 mb-6">Create your first quote to get started</p>
            <button 
              onClick={() => navigate('/quote/new')} 
              className="px-6 py-2.5 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-orange/90 transition-colors"
            >
              Create Quote
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(q => {
              const { subtotal: _subtotal, tax: _tax, total } = computeTotals(q);
              const getStatusStyle = (status) => {
                const s = status?.toLowerCase();
                if (s === 'accepted') return 'bg-green-100 text-green-800';
                if (s === 'sent') return 'bg-blue-100 text-blue-800';
                if (s === 'rejected') return 'bg-red-100 text-red-800';
                return 'bg-gray-100 text-gray-800';
              };
              
              return (
                <div key={q.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                        <span className="text-sm text-gray-600">
                          {q.items?.length || 0} {q.items?.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-sm font-semibold text-brand-orange">
                          {formatCurrency(total, q.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Updated {new Date(q.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => navigate('/quote/new?edit=' + q.id)} 
                        className="px-4 py-2 rounded-lg bg-brand-orange text-white font-medium hover:bg-brand-orange/90 transition-colors text-sm"
                      >
                        Open
                      </button>
                      <button 
                        onClick={() => generateQuotePdf(q)} 
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => handleClone(q.id)} 
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Clone
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)} 
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                      >
                        Delete
                      </button>
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
