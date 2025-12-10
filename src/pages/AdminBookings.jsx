/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, Filter, Calendar, FileText } from 'lucide-react';
import Button from '../components/ui/Button';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    supplierId: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: ''
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCommission: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  async function loadBookings() {
    setLoading(true);
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.supplierId) params.append('supplierId', filters.supplierId);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        calculateStats(data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
    setLoading(false);
  }

  function calculateStats(bookings) {
    const stats = bookings.reduce((acc, booking) => {
      acc.totalBookings++;
      acc.totalRevenue += booking.pricing.subtotal;
      acc.totalCommission += booking.pricing.commissionAmount;
      if (booking.paymentStatus === 'pending') {
        acc.pendingPayments += booking.pricing.total;
      }
      return acc;
    }, {
      totalBookings: 0,
      totalRevenue: 0,
      totalCommission: 0,
      pendingPayments: 0
    });
    setStats(stats);
  }

  async function exportToCSV() {
    try {
      const response = await fetch('/api/admin/bookings/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export bookings');
    }
  }

  async function downloadInvoice(bookingId) {
    try {
      const response = await fetch(`/api/invoices/${bookingId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${bookingId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download invoice');
      }
    } catch (error) {
      console.error('Invoice download failed:', error);
      alert('Failed to download invoice');
    }
  }

  return (
    <div className="bg-cream min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-brown">Bookings Management</h1>
            <p className="text-sm text-gray-600">Internal monitoring with full commission breakdown</p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-brand-brown">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-brand-brown">ZAR {stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">CollEco Commission</p>
                <p className="text-2xl font-bold text-brand-orange">ZAR {stats.totalCommission.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-cream-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">ZAR {stats.pendingPayments.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-cream-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <h2 className="font-semibold text-brand-brown">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={filters.supplierId}
              onChange={e => setFilters({ ...filters, supplierId: e.target.value })}
              className="border border-cream-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Suppliers</option>
              <option value="beekman">Beekman Holidays</option>
              <option value="premier">Premier Hotels</option>
            </select>

            <select
              value={filters.paymentStatus}
              onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="border border-cream-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              placeholder="From Date"
              className="border border-cream-border rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              placeholder="To Date"
              className="border border-cream-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-cream-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream">
                <tr className="text-left text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Property/Supplier</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Base Price</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-cream-50 text-sm">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600">{booking.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-brown">{booking.metadata?.propertyName || 'N/A'}</p>
                        <p className="text-xs text-gray-500 capitalize">{booking.supplierId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{booking.userId}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{booking.checkInDate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {booking.bookingType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        ZAR {booking.pricing.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-green-600">
                          ZAR {booking.pricing.commissionAmount.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {booking.pricing.commissionPercent}% • {booking.commissionModel}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-brown">
                        ZAR {booking.pricing.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/bookings/${booking.id}`}
                            className="text-brand-orange hover:text-orange-600 text-xs font-semibold"
                          >
                            Details
                          </a>
                          <button
                            onClick={() => downloadInvoice(booking.id)}
                            className="text-brand-orange hover:text-orange-600 flex items-center gap-1"
                            title="Download invoice PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
