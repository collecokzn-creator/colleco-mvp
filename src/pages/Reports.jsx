import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download } from "lucide-react";

export default function Reports() {
  const [timeRange, setTimeRange] = useState('30d');
  const [reportData, setReportData] = useState({
    totalBookings: 0,
    revenue: 0,
    conversionRate: 0,
    activeCustomers: 0,
    destinations: [],
    bookingStatus: { confirmed: 0, pending: 0, cancelled: 0 },
    revenueBreakdown: { accommodation: 0, tours: 0, transport: 0 }
  });

  useEffect(() => {
    console.log('📊 Reports: Time range changed to', timeRange);
    
    // Load data from localStorage
    const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
    const travelHistory = JSON.parse(localStorage.getItem('colleco.travel.history') || '[]');
    
    // Filter by time range
    const now = Date.now();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = now - (daysAgo * 24 * 60 * 60 * 1000);
    
    const recentBookings = bookings.filter(b => {
      const bookingDate = b.date ? new Date(b.date).getTime() : now;
      return bookingDate > cutoffDate;
    });
    
    const recentHistory = travelHistory.filter(t => {
      const tripDate = t.date ? new Date(t.date).getTime() : now;
      return tripDate > cutoffDate;
    });
    
    // If no real data, use demo data that varies by time range
    if (bookings.length === 0 && travelHistory.length === 0) {
      // Scale demo data based on time range for realism
      const scaleFactor = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : 3.5;
      
      setReportData({
        totalBookings: Math.round(234 * scaleFactor),
        revenue: Math.round(156780 * scaleFactor),
        conversionRate: 18.4,
        activeCustomers: Math.round(1842 * scaleFactor * 0.4),
        destinations: [
          { name: 'Cape Town', bookings: Math.round(78 * scaleFactor), percentage: 33 },
          { name: 'Johannesburg', bookings: Math.round(62 * scaleFactor), percentage: 26 },
          { name: 'Durban', bookings: Math.round(45 * scaleFactor), percentage: 19 },
          { name: 'Kruger National Park', bookings: Math.round(34 * scaleFactor), percentage: 15 },
          { name: 'Other', bookings: Math.round(15 * scaleFactor), percentage: 7 }
        ],
        bookingStatus: { 
          confirmed: Math.round(142 * scaleFactor), 
          pending: Math.round(58 * scaleFactor), 
          cancelled: Math.round(34 * scaleFactor) 
        },
        revenueBreakdown: { 
          accommodation: Math.round(89340 * scaleFactor), 
          tours: Math.round(45120 * scaleFactor), 
          transport: Math.round(22320 * scaleFactor) 
        }
      });
      return;
    }
    
    // Calculate actual stats from filtered data
    const confirmed = recentBookings.filter(b => b.status === 'confirmed').length;
    const pending = recentBookings.filter(b => b.status === 'pending').length;
    const cancelled = recentBookings.filter(b => b.status === 'cancelled').length;
    const totalBookings = confirmed + pending + cancelled;
    
    const totalRevenue = [...recentBookings, ...recentHistory].reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate destinations
    const destCount = {};
    [...recentBookings, ...recentHistory].forEach(item => {
      const dest = item.destination || 'Other';
      destCount[dest] = (destCount[dest] || 0) + 1;
    });
    
    const destinations = Object.entries(destCount)
      .map(([name, count]) => ({
        name,
        bookings: count,
        percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
    
    setReportData({
      totalBookings,
      revenue: totalRevenue,
      conversionRate: 18.4, // Could be calculated from actual tracking data
      activeCustomers: new Set([...bookings, ...travelHistory].map(x => x.userId || x.user)).size,
      destinations: destinations.length > 0 ? destinations : [{ name: 'No destinations yet', bookings: 0, percentage: 0 }],
      bookingStatus: { confirmed, pending, cancelled },
      revenueBreakdown: { 
        accommodation: Math.round(totalRevenue * 0.57),
        tours: Math.round(totalRevenue * 0.29),
        transport: Math.round(totalRevenue * 0.14)
      }
    });
  }, [timeRange]);
  
  return (
    <div className="space-y-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange/90">
          Reports workspace
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-brand-brown sm:text-3xl">
            Reports & Performance
          </h1>
          <p className="max-w-3xl text-base text-brand-brown/75">
            View bookings, revenue, conversion, and exposure metrics
          </p>
        </div>
      </header>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === '7d'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === '30d'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange('90d')}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
            timeRange === '90d'
              ? 'bg-brand-orange text-white'
              : 'bg-white/80 text-brand-brown/70 hover:bg-cream-sand'
          }`}
        >
          90 Days
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="Total Bookings"
          value={reportData.totalBookings.toString()}
          change="+12%"
        />
        <MetricCard
          icon={DollarSign}
          label="Revenue"
          value={`R ${reportData.revenue.toLocaleString()}`}
          change="+23%"
        />
        <MetricCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${reportData.conversionRate}%`}
          change="+3.2%"
        />
        <MetricCard
          icon={Users}
          label="Active Customers"
          value={reportData.activeCustomers.toString()}
          change="+8%"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Trends */}
        <div className="rounded-2xl border border-cream-border bg-white/85 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-brown">Booking Trends</h2>
            <button className="rounded-lg border border-cream-border bg-white/80 px-3 py-1 text-sm font-medium text-brand-brown/70 hover:bg-cream-sand">
              <Download className="inline h-4 w-4" /> Export
            </button>
          </div>
          <div className="space-y-3">
            <ReportRow 
              label="Confirmed" 
              value={reportData.bookingStatus.confirmed.toString()} 
              percentage={reportData.totalBookings > 0 ? `${Math.round((reportData.bookingStatus.confirmed / reportData.totalBookings) * 100)}%` : '0%'} 
            />
            <ReportRow 
              label="Pending" 
              value={reportData.bookingStatus.pending.toString()} 
              percentage={reportData.totalBookings > 0 ? `${Math.round((reportData.bookingStatus.pending / reportData.totalBookings) * 100)}%` : '0%'} 
            />
            <ReportRow 
              label="Cancelled" 
              value={reportData.bookingStatus.cancelled.toString()} 
              percentage={reportData.totalBookings > 0 ? `${Math.round((reportData.bookingStatus.cancelled / reportData.totalBookings) * 100)}%` : '0%'} 
            />
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="rounded-2xl border border-cream-border bg-white/85 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-brown">Revenue Breakdown</h2>
            <button className="rounded-lg border border-cream-border bg-white/80 px-3 py-1 text-sm font-medium text-brand-brown/70 hover:bg-cream-sand">
              <Download className="inline h-4 w-4" /> Export
            </button>
          </div>
          <div className="space-y-3">
            <ReportRow label="Accommodation" value={`R ${reportData.revenueBreakdown.accommodation.toLocaleString()}`} percentage="57%" />
            <ReportRow label="Tours & Activities" value={`R ${reportData.revenueBreakdown.tours.toLocaleString()}`} percentage="29%" />
            <ReportRow label="Transport" value={`R ${reportData.revenueBreakdown.transport.toLocaleString()}`} percentage="14%" />
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="rounded-2xl border border-cream-border bg-white/85 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-brand-brown">Popular Destinations</h2>
          <div className="space-y-3">
            {reportData.destinations.map((dest, idx) => (
              <ReportRow 
                key={idx}
                label={dest.name} 
                value={`${dest.bookings} booking${dest.bookings !== 1 ? 's' : ''}`} 
                percentage={`${dest.percentage}%`} 
              />
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="rounded-2xl border border-cream-border bg-white/85 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-brand-brown">Customer Insights</h2>
          <div className="space-y-3">
            <ReportRow label="New Customers" value="428" percentage="23.2%" />
            <ReportRow label="Returning Customers" value="1,414" percentage="76.8%" />
            <ReportRow label="Avg. Booking Value" value="R 670" />
            <ReportRow label="Customer Lifetime Value" value="R 2,340" />
          </div>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="rounded-2xl border border-cream-border bg-white/85 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-brown">
            Performance Timeline
          </h2>
          <div className="flex items-center gap-2 text-sm text-brand-brown/70">
            <Calendar className="h-4 w-4" />
            <span>Last {timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}</span>
          </div>
        </div>
        <p className="text-sm text-brand-brown/70">
          Detailed chart visualization will be implemented here showing bookings, revenue, and conversion trends over time.
        </p>
      </div>

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

function MetricCard({ icon: Icon, label, value, change }) {
  return (
    <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-orange/10">
          <Icon className="h-6 w-6 text-brand-orange" />
        </div>
        {change && (
          <span className="text-sm font-medium text-brand-brown/60">
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-brand-brown">{value}</p>
        <p className="text-sm text-brand-brown/70">{label}</p>
      </div>
    </div>
  );
}

function ReportRow({ label, value, percentage }) {
  return (
    <div className="flex items-center justify-between border-b border-cream-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm font-medium text-brand-brown">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-brand-brown">{value}</span>
        {percentage && (
          <span className="text-xs text-brand-brown/60">{percentage}</span>
        )}
      </div>
    </div>
  );
}
