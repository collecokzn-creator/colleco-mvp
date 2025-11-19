import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'cancelled'

  useEffect(() => {
    loadTransfers();
  }, []);

  async function loadTransfers() {
    try {
      const res = await fetch('/api/transfers/history');
      const data = await res.json();
      
      if (data.ok) {
        setTransfers(data.transfers || []);
      }
    } catch (e) {
      console.error('[history] load failed', e);
    } finally {
      setLoading(false);
    }
  }

  async function downloadReceipt(transferId) {
    try {
      const res = await fetch(`/api/transfers/request/${transferId}/receipt`);
      const data = await res.json();
      
      if (data.ok && data.receiptUrl) {
        window.open(data.receiptUrl, '_blank');
      }
    } catch (e) {
      console.error('[receipt] download failed', e);
    }
  }

  const filteredTransfers = filter === 'all' 
    ? transfers 
    : transfers.filter(t => t.status === filter);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-brand-brown">Transfer History</h1>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {['all', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-semibold capitalize transition ${
              filter === f 
                ? 'text-brand-orange border-b-2 border-brand-orange' 
                : 'text-gray-600 hover:text-brand-brown'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your transfer history...</p>
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No transfers found</p>
          <Link to="/transfers" className="text-brand-orange hover:underline">
            Book your first transfer →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransfers.map(transfer => (
            <div key={transfer.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{transfer.pickup}</p>
                  <p className="text-sm text-gray-500">↓</p>
                  <p className="font-semibold text-lg">{transfer.dropoff}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-brown">R{transfer.price}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${
                    transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transfer.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(transfer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Time</p>
                  <p className="font-semibold">
                    {new Date(transfer.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {transfer.driver && (
                  <>
                    <div>
                      <p className="text-gray-600">Driver</p>
                      <p className="font-semibold">{transfer.driver.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vehicle</p>
                      <p className="font-semibold">{transfer.driver.vehicle}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => downloadReceipt(transfer.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200 transition text-sm"
                >
                  📄 Receipt
                </button>
                <Link
                  to={`/transfers?rebook=${transfer.id}`}
                  className="px-4 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-gold transition text-sm"
                >
                  🔄 Book Again
                </Link>
                {transfer.status === 'completed' && !transfer.rated && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-sm">
                    ⭐ Rate Driver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-3xl font-bold text-blue-600">{transfers.length}</p>
          <p className="text-sm text-gray-600">Total Trips</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-3xl font-bold text-green-600">
            {transfers.filter(t => t.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-600">
            R{transfers.reduce((sum, t) => sum + (t.price || 0), 0)}
          </p>
          <p className="text-sm text-gray-600">Total Spent</p>
        </div>
      </div>
    </div>
  );
}
