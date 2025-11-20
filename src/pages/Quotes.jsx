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
      draft: 'bg-cream-sand text-brand-russty',
      sent: 'bg-amber-100 text-brand-brown',
      accepted: 'bg-cream-sand text-brand-brown border border-brand-gold',
      rejected: 'bg-cream text-brand-russty'
    };
    return styles[status?.toLowerCase()] || styles.draft;
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-brand-brown mb-2">My Quotes</h1>
              <p className="text-brand-russty text-lg">Create and manage price quotes for your trips</p>
            </div>
            <button 
              onClick={() => navigate('/quote/new')} 
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-brand-orange to-brand-gold text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              + Create New Quote
            </button>
          </div>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 border border-cream-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg flex items-center justify-center text-2xl">
                  📝
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-brown">{quotes.length}</p>
                  <p className="text-sm text-brand-russty">Total Quotes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-cream-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-brown">{quotes.filter(q => q.status === 'accepted').length}</p>
                  <p className="text-sm text-brand-russty">Accepted</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-cream-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg flex items-center justify-center text-2xl">
                  📤
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-brown">{quotes.filter(q => q.status === 'sent').length}</p>
                  <p className="text-sm text-brand-russty">Sent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Panel */}
        <div className="mb-8">
          <WorkflowPanel currentPage="quotes" basketCount={0} hasQuote={quotes.length > 0} />
        </div>

        {/* Quotes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-brand-russty">Loading your quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-border p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-cream-sand rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
              📝
            </div>
            <h3 className="text-xl font-bold text-brand-brown mb-2">No quotes yet</h3>
            <p className="text-brand-russty mb-6">Create your first quote to get started with pricing your trips</p>
            <button 
              onClick={() => navigate('/quote/new')} 
              className="px-6 py-3 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-gold transition-colors"
            >
              Create Your First Quote
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(q => {
              const { subtotal: _subtotal, tax: _tax, total } = computeTotals(q);
              return (
                <div key={q.id} className="bg-white rounded-xl border border-cream-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    
                    {/* Quote Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-brand-brown mb-1 truncate">
                            {q.clientName || 'Untitled Quote'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(q.status)}`}>
                              {q.status || 'Draft'}
                            </span>
                            <span className="text-sm text-brand-russty">
                              {q.items?.length || 0} {q.items?.length === 1 ? 'item' : 'items'}
                            </span>
                            <span className="text-sm font-semibold text-brand-brown">
                              {formatCurrency(total, q.currency)}
                            </span>
                          </div>
                          <p className="text-xs text-brand-russty">
                            Last updated: {new Date(q.updatedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => navigate('/quote/new?edit=' + q.id)} 
                        className="px-4 py-2 rounded-lg bg-brand-orange text-white font-medium hover:bg-brand-gold transition-colors text-sm"
                      >
                        📝 Open
                      </button>
                      <button 
                        onClick={() => generateQuotePdf(q)} 
                        className="px-4 py-2 rounded-lg border-2 border-brand-orange text-brand-orange font-medium hover:bg-cream-sand transition-colors text-sm"
                      >
                        📥 Download PDF
                      </button>
                      <button 
                        onClick={() => handleClone(q.id)} 
                        className="px-4 py-2 rounded-lg border-2 border-brand-russty text-brand-russty font-medium hover:bg-cream-sand transition-colors text-sm"
                      >
                        📋 Copy
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)} 
                        className="px-4 py-2 rounded-lg border-2 border-brand-russty text-brand-russty font-medium hover:bg-amber-100 transition-colors text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {quotes.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-cream-sand to-cream rounded-xl p-6 border border-cream-border">
            <h3 className="text-lg font-bold text-brand-brown mb-2">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-brand-russty">
              <li>• <strong>Open</strong> - View and edit quote details</li>
              <li>• <strong>Download PDF</strong> - Get a professional PDF to send to clients</li>
              <li>• <strong>Copy</strong> - Duplicate a quote to create similar ones faster</li>
              <li>• <strong>Delete</strong> - Remove quotes you no longer need</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
