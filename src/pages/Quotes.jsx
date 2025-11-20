import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { generateQuotePdf } from '../utils/pdfGenerators';
import WorkflowPanel from '../components/WorkflowPanel';
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

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-white text-brand-brown border-2 border-brand-brown',
      sent: 'bg-brand-orange text-white border-2 border-brand-orange',
      accepted: 'bg-white text-brand-gold border-2 border-brand-gold',
      rejected: 'bg-white text-brand-russty border-2 border-brand-russty'
    };
    const icons = {
      draft: '✏️',
      sent: '✈️',
      accepted: '✓',
      rejected: '✕'
    };
    return { 
      className: styles[status?.toLowerCase()] || styles.draft,
      icon: icons[status?.toLowerCase()] || icons.draft
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream-sand">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-5xl font-bold text-brand-brown mb-3">Travel Quotes</h1>
              <p className="text-brand-russty text-lg">Professional quotations for unforgettable journeys</p>
            </div>
            <button 
              onClick={() => navigate('/quote/new')} 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3 justify-center"
            >
              <span className="text-2xl">✈️</span>
              Create New Quote
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border-2 border-brand-brown shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 bg-brand-brown rounded-xl flex items-center justify-center text-3xl">
                  🌍
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-brand-brown">{quotes.length}</p>
                  <p className="text-brand-russty font-medium">Total Quotes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border-2 border-brand-gold shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 bg-brand-gold rounded-xl flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-brand-gold">{quotes.filter(q => q.status === 'accepted').length}</p>
                  <p className="text-brand-russty font-medium">Accepted</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border-2 border-brand-orange shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 bg-brand-orange rounded-xl flex items-center justify-center text-3xl">
                  ✈️
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-brand-orange">{quotes.filter(q => q.status === 'sent').length}</p>
                  <p className="text-brand-russty font-medium">In Transit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Panel */}
        <div className="mb-10">
          <WorkflowPanel currentPage="quotes" basketCount={0} hasQuote={quotes.length > 0} />
        </div>

        {/* Quotes List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-brand-brown text-lg font-medium">Loading your quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-brand-brown p-16 text-center shadow-xl">
            <div className="w-32 h-32 bg-gradient-to-br from-brand-orange to-brand-gold rounded-full mx-auto mb-6 flex items-center justify-center text-6xl shadow-lg">
              🌍
            </div>
            <h3 className="text-3xl font-bold text-brand-brown mb-4">Ready to Start Quoting?</h3>
            <p className="text-brand-russty text-lg mb-8 max-w-md mx-auto">Create professional travel quotes for your clients and watch your business grow</p>
            <button 
              onClick={() => navigate('/quote/new')} 
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all inline-flex items-center gap-3"
            >
              <span className="text-2xl">✈️</span>
              Create Your First Quote
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {quotes.map(q => {
              const { subtotal: _subtotal, tax: _tax, total } = computeTotals(q);
              const statusBadge = getStatusBadge(q.status);
              return (
                <div key={q.id} className="bg-white rounded-2xl border-2 border-cream-border p-8 hover:border-brand-orange hover:shadow-xl transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    
                    {/* Quote Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-gold rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                          🎫
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-brand-brown mb-3">
                            {q.clientName || 'Untitled Quote'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${statusBadge.className} inline-flex items-center gap-2`}>
                              <span>{statusBadge.icon}</span>
                              {q.status || 'Draft'}
                            </span>
                            <div className="flex items-center gap-2 px-4 py-2 bg-cream-sand rounded-lg">
                              <span className="text-lg">🗂️</span>
                              <span className="text-brand-brown font-semibold">
                                {q.items?.length || 0} {q.items?.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold bg-opacity-20 rounded-lg border border-brand-gold">
                              <span className="text-lg">💰</span>
                              <span className="text-brand-brown font-bold text-lg">
                                {formatCurrency(total, q.currency)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-brand-russty">
                            <span className="text-sm">🕒</span>
                            <p className="text-sm font-medium">
                              Updated {new Date(q.updatedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <button 
                        onClick={() => navigate('/quote/new?edit=' + q.id)} 
                        className="px-5 py-3 rounded-xl bg-brand-orange text-white font-bold hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <span className="text-lg">📝</span>
                        Open Quote
                      </button>
                      <button 
                        onClick={() => generateQuotePdf(q)} 
                        className="px-5 py-3 rounded-xl bg-white border-2 border-brand-brown text-brand-brown font-bold hover:bg-cream transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">📄</span>
                        Download PDF
                      </button>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleClone(q.id)} 
                          className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-brand-russty text-brand-russty font-bold hover:bg-cream-sand transition-colors flex items-center justify-center gap-2"
                          title="Duplicate"
                        >
                          <span className="text-lg">📋</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(q.id)} 
                          className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-brand-russty text-brand-russty font-bold hover:bg-cream-sand transition-colors flex items-center justify-center gap-2"
                          title="Delete"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {quotes.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl p-8 border-2 border-brand-brown shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-brown rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                💡
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-brand-brown mb-4">How to Use Your Quotes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="font-bold text-brand-brown">Open Quote</p>
                      <p className="text-sm text-brand-russty">View and edit all quote details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-bold text-brand-brown">Download PDF</p>
                      <p className="text-sm text-brand-russty">Professional PDF for clients</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="font-bold text-brand-brown">Duplicate</p>
                      <p className="text-sm text-brand-russty">Copy quote for similar bookings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🗑️</span>
                    <div>
                      <p className="font-bold text-brand-brown">Delete</p>
                      <p className="text-sm text-brand-russty">Remove unwanted quotes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
