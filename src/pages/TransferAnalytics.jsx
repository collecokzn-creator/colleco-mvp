import React, { useState, useEffect } from 'react';

export default function TransferAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  async function loadMetrics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/analytics?range=${timeRange}`);
      const data = await res.json();
      
      if (data.ok) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('[analytics] load failed', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Transfer Analytics</h1>
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-brown">Transfer Analytics</h1>
        
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded font-semibold capitalize transition ${
                timeRange === range
                  ? 'bg-brand-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Total Transfers</p>
          <p className="text-4xl font-bold">{metrics?.totalTransfers || 0}</p>
          <p className="text-xs opacity-80 mt-2">
            +{metrics?.transferGrowth || 0}% vs last {timeRange}
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Revenue</p>
          <p className="text-4xl font-bold">R{metrics?.totalRevenue || 0}</p>
          <p className="text-xs opacity-80 mt-2">
            +{metrics?.revenueGrowth || 0}% vs last {timeRange}
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Active Partners</p>
          <p className="text-4xl font-bold">{metrics?.activePartners || 0}</p>
          <p className="text-xs opacity-80 mt-2">
            {metrics?.partnerUtilization || 0}% utilization
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
          <p className="text-sm opacity-90 mb-1">Avg Rating</p>
          <p className="text-4xl font-bold">{metrics?.avgRating || 0} ⭐</p>
          <p className="text-xs opacity-80 mt-2">
            {metrics?.totalRatings || 0} reviews
          </p>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-brand-brown">Popular Routes</h2>
        <div className="space-y-3">
          {(metrics?.popularRoutes || []).slice(0, 5).map((route, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                <div>
                  <p className="font-semibold">{route.pickup} → {route.dropoff}</p>
                  <p className="text-sm text-gray-600">{route.count} trips</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-orange">R{route.avgPrice}</p>
                <p className="text-xs text-gray-500">avg price</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Performance */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-brand-brown">Top Partners</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Partner</th>
                <th className="text-right py-3 px-4">Trips</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Rating</th>
                <th className="text-right py-3 px-4">Acceptance Rate</th>
              </tr>
            </thead>
            <tbody>
              {(metrics?.topPartners || []).slice(0, 10).map((partner, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold">{partner.name}</p>
                      <p className="text-xs text-gray-500">{partner.vehicle}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">{partner.trips}</td>
                  <td className="text-right py-3 px-4 font-semibold text-green-600">
                    R{partner.revenue}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className="inline-flex items-center gap-1">
                      {partner.rating} ⭐
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-semibold ${
                      partner.acceptanceRate >= 80 ? 'text-green-600' :
                      partner.acceptanceRate >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {partner.acceptanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4 text-brand-brown">Peak Hours</h2>
        <div className="grid grid-cols-12 gap-2">
          {(metrics?.hourlyDistribution || Array(24).fill(0)).map((count, hour) => {
            const maxCount = Math.max(...(metrics?.hourlyDistribution || [1]));
            const height = (count / maxCount) * 100;
            
            return (
              <div key={hour} className="flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded h-32 flex items-end">
                  <div 
                    className="w-full bg-brand-orange rounded"
                    style={{ height: `${height}%` }}
                    title={`${hour}:00 - ${count} trips`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{hour}h</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
