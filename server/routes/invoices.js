/**
 * Invoice API Routes
 * Endpoints for generating, retrieving, and managing invoices
 */

const express = require('express');
const { getBooking } = require('../utils/bookings');
const {
  generateInvoicePdf,
  saveInvoiceFile,
  getInvoiceFile,
  deleteInvoiceFile,
  listInvoices
} = require('../utils/invoiceGenerator');
const { getNextInvoiceNumber } = require('../utils/sequenceGenerator');

const router = express.Router();

/**
 * POST /api/invoices/generate
 * Generate and save invoice PDF for a booking
 */
router.post('/generate', (req, res) => {
  try {
    const { 
      bookingId, 
      invoiceNumber: customInvoiceNumber, 
      orderNumber,
      dueDate, 
      notes, 
      terms,
      paymentInstructions
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    // Get booking from storage
    const booking = getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ error: `Booking ${bookingId} not found` });
    }

    // Generate invoice number using sequence generator
    // If booking was converted from quote, use quote number to derive invoice number
    const invoiceNumber = customInvoiceNumber || getNextInvoiceNumber({
      quoteNumber: booking.quoteNumber
    });

    // Generate and save PDF
    const invoiceInfo = saveInvoiceFile(booking, {
      invoiceNumber,
      orderNumber,
      dueDate,
      notes,
      terms,
      paymentInstructions
    });

    res.json({
      success: true,
      bookingId,
      invoiceNumber,
      filename: invoiceInfo.filename,
      size: invoiceInfo.size,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[invoices API] Generate error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/invoices/:bookingId/download
 * Download invoice PDF for a booking
 */
router.get('/:bookingId/download', (req, res) => {
  try {
    const { bookingId } = req.params;
    const { invoiceNumber: queryInvoiceNumber } = req.query;

    // Get booking to verify it exists
    const booking = getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ error: `Booking ${bookingId} not found` });
    }

    // Use provided invoice number, or booking's invoice number, or generate from sequence
    const invoiceNumber = queryInvoiceNumber || booking.invoiceNumber || getNextInvoiceNumber({
      quoteNumber: booking.quoteNumber
    });

    // Generate PDF on-the-fly (don't save)
    const pdfBuffer = generateInvoicePdf(booking, {
      invoiceNumber
    });

    // Send as PDF download
    const filename = `Invoice_${bookingId}_${new Date().getTime()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('[invoices API] Download error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/invoices/file/:filename
 * Get specific invoice file by filename
 */
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Get invoice file
    const pdfBuffer = getInvoiceFile(filename);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
  } catch (err) {
    console.error('[invoices API] File error:', err.message);
    res.status(404).json({ error: err.message });
  }
});

/**
 * GET /api/invoices/list
 * List all invoices
 */
router.get('/list', (req, res) => {
  try {
    const invoices = listInvoices();

    res.json({
      success: true,
      count: invoices.length,
      invoices: invoices.map(inv => ({
        filename: inv.filename,
        size: require('fs').statSync(inv.path).size,
        created: require('fs').statSync(inv.path).mtime
      }))
    });
  } catch (err) {
    console.error('[invoices API] List error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/invoices/:filename
 * Delete invoice file
 */
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const deleted = deleteInvoiceFile(filename);

    if (!deleted) {
      return res.status(404).json({ error: 'Invoice file not found' });
    }

    res.json({ success: true, filename });
  } catch (err) {
    console.error('[invoices API] Delete error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/invoices/company
 * Update company information for invoices (admin only)
 */
router.patch('/company', (req, res) => {
  try {
    // TODO: Add admin authentication check
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({ error: 'field and value are required' });
    }

    // Update COMPANY_INFO (in real implementation, persist to database)
    // For now, just acknowledge the request
    res.json({
      success: true,
      message: `Company field updated`,
      field,
      value
    });
  } catch (err) {
    console.error('[invoices API] Company update error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
