import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext.jsx';
import { getDownloadStats, getTopDownloadCountries, getDeviceBreakdown } from '../utils/downloadTracker.js';
import { getUsageStats, getFeatureAdoption, getConversionFunnel, getTopPages } from '../utils/usageAnalytics.js';

export default function Analytics() {
  const { user: _user } = useUser(); // _user reserved for future personalization of analytics
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    favoriteDestination: 'None',
    upcomingTrips: 0,
    completedTrips: 0
  });
  
  const [downloadStats, setDownloadStats] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [featureAdoption, setFeatureAdoption] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState('user'); // 'user', 'downloads', 'usage'

  useEffect(() => {
    // Load analytics data from localStorage
    const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
    const travelHistory = JSON.parse(localStorage.getItem('colleco.travel.history') || '[]');
    
    const completed = travelHistory.length;
    const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const totalSpent = travelHistory.reduce((sum, trip) => sum + (trip.amount || 0), 0);
    
    // Find most visited destination
    const destinations = {};
    travelHistory.forEach(trip => {
      const dest = trip.destination || 'Unknown';
      destinations[dest] = (destinations[dest] || 0) + 1;
    });
    const favoriteDestination = Object.keys(destinations).length > 0
      ? Object.keys(destinations).reduce((a, b) => destinations[a] > destinations[b] ? a : b)
      : 'None';

    setStats({
      totalTrips: completed + upcoming,
      totalSpent,
      favoriteDestination,
      upcomingTrips: upcoming,
      completedTrips: completed
    });
    
    // Load download tracking stats
    const downloads = getDownloadStats();
    setDownloadStats(downloads);
    setTopCountries(getTopDownloadCountries(10));
    setDeviceBreakdown(getDeviceBreakdown());
    
    // Load usage analytics
    const usage = getUsageStats(timeRange);
    setUsageStats(usage);
    setFeatureAdoption(getFeatureAdoption(timeRange));
    setConversionFunnel(getConversionFunnel());
    setTopPages(getTopPages(10));
  }, [timeRange]);

  return (
    <div className="overflow-x-hidden bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-brown">CollEco Analytics Dashboard</h1>
          <p className="text-brand-russty mt-2">Track app performance, user engagement, and travel insights</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 font-medium ${activeTab === 'user' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-600'}`}
          >
            User Travel
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-4 py-2 font-medium ${activeTab === 'downloads' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-600'}`}
          >
            📥 Downloads
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-2 font-medium ${activeTab === 'usage' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-600'}`}
          >
            📊 Usage
          </button>
        </div>

        {/* Time Range Selector */}
        {(activeTab === 'downloads' || activeTab === 'usage') && (
          <div className="mb-6 flex gap-2">
            <button onClick={() => setTimeRange('24h')} className={`px-3 py-1 rounded ${timeRange === '24h' ? 'bg-brand-orange text-white' : 'bg-white text-gray-700'}`}>24h</button>
            <button onClick={() => setTimeRange('7d')} className={`px-3 py-1 rounded ${timeRange === '7d' ? 'bg-brand-orange text-white' : 'bg-white text-gray-700'}`}>7d</button>
            <button onClick={() => setTimeRange('30d')} className={`px-3 py-1 rounded ${timeRange === '30d' ? 'bg-brand-orange text-white' : 'bg-white text-gray-700'}`}>30d</button>
            <button onClick={() => setTimeRange('all')} className={`px-3 py-1 rounded ${timeRange === 'all' ? 'bg-brand-orange text-white' : 'bg-white text-gray-700'}`}>All</button>
          </div>
        )}

        {/* USER TRAVEL TAB */}
        {activeTab === 'user' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Trips</p>
                    <p className="text-3xl font-bold text-brand-orange">{stats.totalTrips}</p>
                  </div>
                  <div className="text-4xl">✈️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-3xl font-bold text-brand-orange">R {stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Trips</p>
                    <p className="text-3xl font-bold text-brand-orange">{stats.upcomingTrips}</p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-brand-russty">{stats.completedTrips}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-brand-orange to-brand-gold rounded-lg shadow-md p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Favorite Destination</p>
                  <p className="text-4xl font-bold mt-2">{stats.favoriteDestination}</p>
                </div>
                <div className="text-6xl">🏖️</div>
              </div>
            </div>
          </>
        )}

        {/* DOWNLOADS TAB */}
        {activeTab === 'downloads' && downloadStats && (
          <>
            {/* Download Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-3xl font-bold text-brand-orange">{downloadStats.totalDownloads}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Unique Countries</p>
                <p className="text-3xl font-bold text-brand-orange">{downloadStats.uniqueCountries}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Unique Devices</p>
                <p className="text-3xl font-bold text-brand-orange">{downloadStats.uniqueDevices}</p>
              </div>
            </div>

            {/* Device & OS Breakdown */}
            {deviceBreakdown && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* By OS */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Downloads by OS</h3>
                  <div className="space-y-2">
                    {Object.entries(deviceBreakdown.byOS).map(([os, count]) => (
                      <div key={os} className="flex justify-between items-center">
                        <span className="text-gray-700">{os}</span>
                        <span className="font-bold text-brand-orange">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Device */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Downloads by Device</h3>
                  <div className="space-y-2">
                    {Object.entries(deviceBreakdown.byDevice).map(([device, count]) => (
                      <div key={device} className="flex justify-between items-center">
                        <span className="text-gray-700">{device}</span>
                        <span className="font-bold text-brand-orange">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Browser */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Downloads by Browser</h3>
                  <div className="space-y-2">
                    {Object.entries(deviceBreakdown.byBrowser).map(([browser, count]) => (
                      <div key={browser} className="flex justify-between items-center">
                        <span className="text-gray-700">{browser}</span>
                        <span className="font-bold text-brand-orange">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* By Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Downloads by Source</h3>
                <div className="space-y-2">
                  {Object.entries(downloadStats.bySource).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="text-gray-700">{source}</span>
                      <span className="font-bold text-brand-orange">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Top 10 Countries</h3>
                <div className="space-y-2">
                  {topCountries.map(({ country, count }, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-700">{country}</span>
                      <span className="font-bold text-brand-orange">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* USAGE TAB */}
        {activeTab === 'usage' && usageStats && (
          <>
            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-3xl font-bold text-brand-orange">{usageStats.totalSessions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Page Views</p>
                <p className="text-3xl font-bold text-brand-orange">{usageStats.totalPageViews}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-3xl font-bold text-brand-orange">{usageStats.totalConversions}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-brand-orange">{(usageStats.conversionRate * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Feature Adoption & Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Top Features by Adoption</h3>
                <div className="space-y-2">
                  {featureAdoption.slice(0, 5).map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-700">{f.feature}</span>
                      <span className="font-bold text-brand-orange">{f.adoptionRate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Conversion Funnel</h3>
                <div className="space-y-2">
                  {conversionFunnel.slice(0, 5).map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-700">{c.conversionType}</span>
                      <span className="font-bold text-brand-orange">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-bold text-brand-brown mb-4">Most Visited Pages</h3>
              <div className="space-y-2">
                {topPages.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">{p.page}</span>
                    <span className="font-bold text-brand-orange">{p.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
