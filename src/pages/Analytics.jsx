import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Plane, DollarSign, Calendar, CheckCircle2, Palmtree } from "lucide-react";
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
    <div className="space-y-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange/90">
          Analytics workspace
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-brand-brown sm:text-3xl">CollEco Analytics Dashboard</h1>
          <p className="max-w-3xl text-base text-brand-brown/75">
            Track app performance, user engagement, and travel insights
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-cream-border">
        <button
          onClick={() => setActiveTab('user')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'user'
              ? 'border-b-2 border-brand-orange text-brand-orange'
              : 'text-brand-brown/60 hover:text-brand-brown'
          }`}
        >
          User Travel
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'downloads'
              ? 'border-b-2 border-brand-orange text-brand-orange'
              : 'text-brand-brown/60 hover:text-brand-brown'
          }`}
        >
          Downloads
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'usage'
              ? 'border-b-2 border-brand-orange text-brand-orange'
              : 'text-brand-brown/60 hover:text-brand-brown'
          }`}
        >
          Usage
        </button>
      </div>

      {/* Time Range Selector */}
      {(activeTab === 'downloads' || activeTab === 'usage') && (
        <div className="flex gap-2">
          <button onClick={() => setTimeRange('24h')} className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === '24h'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}>24h</button>
          <button onClick={() => setTimeRange('7d')} className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === '7d'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}>7d</button>
          <button onClick={() => setTimeRange('30d')} className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === '30d'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}>30d</button>
          <button onClick={() => setTimeRange('all')} className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === 'all'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}>All</button>
        </div>
      )}

        {/* USER TRAVEL TAB */}
        {activeTab === 'user' && (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-brown/70">Total Trips</p>
                    <p className="mt-1 text-2xl font-bold text-brand-brown">{stats.totalTrips}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
                    <Plane className="h-5 w-5 text-brand-orange" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-brown/70">Total Spent</p>
                    <p className="mt-1 text-2xl font-bold text-brand-brown">R {stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
                    <DollarSign className="h-5 w-5 text-brand-orange" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-brown/70">Upcoming Trips</p>
                    <p className="mt-1 text-2xl font-bold text-brand-brown">{stats.upcomingTrips}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
                    <Calendar className="h-5 w-5 text-brand-orange" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-brown/70">Completed</p>
                    <p className="mt-1 text-2xl font-bold text-brand-brown">{stats.completedTrips}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
                    <CheckCircle2 className="h-5 w-5 text-brand-orange" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cream-border bg-white/85 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-brand-brown/70">Favorite Destination</p>
                  <p className="mt-2 text-3xl font-bold text-brand-brown">{stats.favoriteDestination}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-orange/10">
                  <Palmtree className="h-7 w-7 text-brand-orange" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* DOWNLOADS TAB */}
        {activeTab === 'downloads' && downloadStats && (
          <>
            {/* Download Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Total Downloads</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{downloadStats.totalDownloads}</p>
              </div>
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Unique Countries</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{downloadStats.uniqueCountries}</p>
              </div>
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Unique Devices</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{downloadStats.uniqueDevices}</p>
              </div>
            </div>

            {/* Device & OS Breakdown */}
            {deviceBreakdown && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* By OS */}
                <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-brand-brown">Downloads by OS</h3>
                  <div className="mt-4 space-y-2">
                    {Object.entries(deviceBreakdown.byOS).map(([os, count]) => (
                      <div key={os} className="flex items-center justify-between">
                        <span className="text-sm text-brand-brown/70">{os}</span>
                        <span className="font-medium text-brand-brown">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Device */}
                <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-brand-brown">Downloads by Device</h3>
                  <div className="mt-4 space-y-2">
                    {Object.entries(deviceBreakdown.byDevice).map(([device, count]) => (
                      <div key={device} className="flex items-center justify-between">
                        <span className="text-sm text-brand-brown/70">{device}</span>
                        <span className="font-medium text-brand-brown">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Browser */}
                <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-brand-brown">Downloads by Browser</h3>
                  <div className="mt-4 space-y-2">
                    {Object.entries(deviceBreakdown.byBrowser).map(([browser, count]) => (
                      <div key={browser} className="flex items-center justify-between">
                        <span className="text-sm text-brand-brown/70">{browser}</span>
                        <span className="font-medium text-brand-brown">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* By Source */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-brown">Downloads by Source</h3>
                <div className="mt-4 space-y-2">
                  {Object.entries(downloadStats.bySource).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-brand-brown/70">{source}</span>
                      <span className="font-medium text-brand-brown">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-brown">Top 10 Countries</h3>
                <div className="mt-4 space-y-2">
                  {topCountries.map(({ country, count }, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-brand-brown/70">{country}</span>
                      <span className="font-medium text-brand-brown">{count}</span>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Sessions</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{usageStats.totalSessions}</p>
              </div>
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Page Views</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{usageStats.totalPageViews}</p>
              </div>
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Conversions</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{usageStats.totalConversions}</p>
              </div>
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <p className="text-sm text-brand-brown/70">Conversion Rate</p>
                <p className="mt-1 text-2xl font-bold text-brand-brown">{(usageStats.conversionRate * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Feature Adoption & Funnel */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-brown">Top Features by Adoption</h3>
                <div className="mt-4 space-y-2">
                  {featureAdoption.slice(0, 5).map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-brand-brown/70">{f.feature}</span>
                      <span className="font-medium text-brand-brown">{f.adoptionRate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-brown">Conversion Funnel</h3>
                <div className="mt-4 space-y-2">
                  {conversionFunnel.slice(0, 5).map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-brand-brown/70">{c.conversionType}</span>
                      <span className="font-medium text-brand-brown">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-brown">Most Visited Pages</h3>
              <div className="mt-4 space-y-2">
                {topPages.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-cream-border pb-2 last:border-0 last:pb-0">
                    <span className="text-sm text-brand-brown/70">{p.page}</span>
                    <span className="font-medium text-brand-brown">{p.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      {/* Footer */}
      <footer className="border-t border-cream-border pt-6 text-sm text-brand-brown/70">
        <p>© CollEco Travel – The Odyssey of Adventure</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <NavLink to="/legal/privacy" className="hover:text-brand-brown">Privacy Policy</NavLink>
          <NavLink to="/legal/terms" className="hover:text-brand-brown">Terms</NavLink>
        </div>
      </footer>
    </div>
  );
}
