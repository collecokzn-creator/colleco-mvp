/**
 * Admin Bookings API Routes
 * 
 * Internal routes with full commission breakdown and reporting.
 * Requires admin authentication.
 */

const express = require('express');
const router = express.Router();
const { getAllBookings, getBookingsBySupplier, getBookingsByDateRange } = require('../utils/bookings');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/admin/bookings
 * Get all bookings with filters (internal use, full breakdown)
 */
router.get('/', (req, res) => {
  try {
    const { supplierId, paymentStatus, dateFrom, dateTo } = req.query;
    
    let bookings = getAllBookings();
    
    // Apply filters
    if (supplierId) {
      bookings = bookings.filter(b => b.supplierId === supplierId);
    }
    
    if (paymentStatus) {
      bookings = bookings.filter(b => b.paymentStatus === paymentStatus);
    }
    
    if (dateFrom) {
      bookings = bookings.filter(b => new Date(b.checkInDate) >= new Date(dateFrom));
    }
    
    if (dateTo) {
      bookings = bookings.filter(b => new Date(b.checkInDate) <= new Date(dateTo));
    }
    
    res.json({ bookings });
  } catch (err) {
    console.error('[admin bookings API] GET error:', err.message);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

/**
 * POST /api/admin/bookings/export
 * Export bookings to CSV
 */
router.post('/export', (req, res) => {
  try {
    const { supplierId, paymentStatus, dateFrom, dateTo } = req.body;
    
    let bookings = getAllBookings();
    
    // Apply same filters as GET
    if (supplierId) {
      bookings = bookings.filter(b => b.supplierId === supplierId);
    }
    if (paymentStatus) {
      bookings = bookings.filter(b => b.paymentStatus === paymentStatus);
    }
    if (dateFrom) {
      bookings = bookings.filter(b => new Date(b.checkInDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      bookings = bookings.filter(b => new Date(b.checkInDate) <= new Date(dateTo));
    }
    
    // Generate CSV
    const headers = [
      'Booking ID',
      'Supplier',
      'Property',
      'User ID',
      'Booking Type',
      'Check-in',
      'Check-out',
      'Base Price',
      'Commission %',
      'Commission Amount',
      'Commission Model',
      'Total Price',
      'Payment Status',
      'Created At'
    ];
    
    const rows = bookings.map(b => [
      b.id,
      b.supplierId,
      b.metadata?.propertyName || '',
      b.userId,
      b.bookingType,
      b.checkInDate,
      b.checkOutDate,
      b.pricing.subtotal.toFixed(2),
      b.pricing.commissionPercent,
      b.pricing.commissionAmount.toFixed(2),
      b.commissionModel,
      b.pricing.total.toFixed(2),
      b.paymentStatus,
      b.createdAt
    ]);
    
    const csv = [headers.join(',')]
      .concat(rows.map(row => row.map(cell => `"${cell}"`).join(',')))
      .join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings-export.csv');
    res.send(csv);
  } catch (err) {
    console.error('[admin bookings API] POST /export error:', err.message);
    res.status(500).json({ error: 'Failed to export bookings' });
  }
});

/**
 * GET /api/admin/reports/supplier-settlements
 * Generate supplier settlement report
 */
router.get('/reports/supplier-settlements', (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let bookings = getAllBookings().filter(b => b.paymentStatus === 'completed');
    
    if (dateFrom) {
      bookings = bookings.filter(b => new Date(b.checkInDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      bookings = bookings.filter(b => new Date(b.checkInDate) <= new Date(dateTo));
    }
    
    // Group by supplier
    const settlements = {};
    
    bookings.forEach(booking => {
      if (!settlements[booking.supplierId]) {
        settlements[booking.supplierId] = {
          supplierId: booking.supplierId,
          totalBookings: 0,
          totalBaseRevenue: 0,
          totalCommission: 0,
          commissionModel: booking.commissionModel,
          bookings: []
        };
      }
      
      settlements[booking.supplierId].totalBookings++;
      settlements[booking.supplierId].totalBaseRevenue += booking.pricing.subtotal;
      settlements[booking.supplierId].totalCommission += booking.pricing.commissionAmount;
      settlements[booking.supplierId].bookings.push({
        id: booking.id,
        checkInDate: booking.checkInDate,
        basePrice: booking.pricing.subtotal,
        commission: booking.pricing.commissionAmount
      });
    });
    
    res.json({ settlements: Object.values(settlements) });
  } catch (err) {
    console.error('[admin bookings API] GET /reports/supplier-settlements error:', err.message);
    res.status(500).json({ error: 'Failed to generate settlement report' });
  }
});

module.exports = router;
