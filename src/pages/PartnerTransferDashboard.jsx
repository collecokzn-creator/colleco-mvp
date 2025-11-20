import React, { useState, useEffect } from 'react';

export default function PartnerTransferDashboard() {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
    
    // Poll for new requests every 5 seconds
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadRequests() {
    try {
      const res = await fetch('/api/transfers/requests');
      const data = await res.json();
      
      if (data.ok) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error('[partner] load requests failed', e);
    }
  }

  async function acceptRequest(requestId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/request/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver: {
            name: 'Your Name', // Would come from partner profile
            vehicle: 'Toyota Quantum',
            plate: 'ABC 123 GP',
            eta: '10 min'
          }
        })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setActiveRequest(data.request);
        loadRequests(); // Refresh list
      }
    } catch (e) {
      console.error('[partner] accept failed', e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(requestId, status) {
    try {
      const res = await fetch(`/api/transfers/request/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setActiveRequest(data.request);
        if (status === 'completed') {
          setActiveRequest(null);
        }
        loadRequests();
      }
    } catch (e) {
      console.error('[partner] status update failed', e);
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'searching' || r.status === 'matched');
  const myActiveRequests = requests.filter(r => 
    r.status === 'accepted' || r.status === 'en-route' || r.status === 'arrived'
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-brand-brown">Partner Transfer Dashboard</h1>

      {/* Active Trip */}
      {activeRequest && (
        <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-500 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-800">🚗 Active Trip</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Pickup</p>
              <p className="font-semibold">{activeRequest.pickup}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dropoff</p>
              <p className="font-semibold">{activeRequest.dropoff}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Passengers</p>
              <p className="font-semibold">{activeRequest.pax}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold">R{activeRequest.price}</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            {activeRequest.status === 'accepted' && (
              <button
                onClick={() => updateStatus(activeRequest.id, 'en-route')}
                className="px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700"
              >
                Start Journey
              </button>
            )}
            {activeRequest.status === 'en-route' && (
              <button
                onClick={() => updateStatus(activeRequest.id, 'arrived')}
                className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
              >
                Mark as Arrived
              </button>
            )}
            {activeRequest.status === 'arrived' && (
              <button
                onClick={() => updateStatus(activeRequest.id, 'completed')}
                className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700"
              >
                Complete Trip
              </button>
            )}
          </div>
        </div>
      )}

      {/* My Active Requests */}
      {myActiveRequests.length > 0 && !activeRequest && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-brand-brown">My Active Requests</h2>
          <div className="space-y-3">
            {myActiveRequests.map(req => (
              <div key={req.id} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{req.pickup} → {req.dropoff}</p>
                    <p className="text-sm text-gray-600">{req.pax} passengers • R{req.price}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: {req.status}</p>
                  </div>
                  <button
                    onClick={() => setActiveRequest(req)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Requests */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-brand-brown">
          Incoming Requests {pendingRequests.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
              {pendingRequests.length} new
            </span>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">No pending requests. We&apos;ll notify you when a customer needs a transfer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-4 bg-white border-2 border-brand-orange rounded-lg shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{req.pickup}</p>
                    <p className="text-sm text-gray-600">↓</p>
                    <p className="font-semibold text-lg">{req.dropoff}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-orange">R{req.price}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Passengers</p>
                    <p className="font-semibold">{req.pax}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-semibold capitalize">{req.bookingType}</p>
                  </div>
                  {req.bookingType === 'prearranged' && (
                    <>
                      <div className="col-span-2">
                        <p className="text-gray-600">Pickup Time</p>
                        <p className="font-semibold">{new Date(req.date).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req.id)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400"
                  >
                    Decline
                  </button>
                </div>

                {req.bookingType === 'instant' && (
                  <p className="text-xs text-red-600 mt-2">⚡ Instant request - respond quickly!</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
