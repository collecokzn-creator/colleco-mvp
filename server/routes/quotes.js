/**
 * Quote PDF API Routes for CollEco Travel
 * 
 * These routes handle professional quote PDF generation and management
 * Endpoints:
 * - POST /api/quotes/pdf/generate - Generate quote PDF
 * - GET /api/quotes/pdf/:quoteId/download - Download quote PDF
 * - GET /api/quotes/pdf/file/:filename - Get specific quote file
 * - GET /api/quotes/pdf/list - List all quotes
 * - DELETE /api/quotes/pdf/:filename - Delete quote file
 * - POST /api/quotes/:quoteId/convert-to-invoice - Convert quote to invoice
 * - PATCH /api/quotes/pdf/company - Update company information
 */

const express = require('express');
const router = express.Router();
const { generateQuotePdf, saveQuoteFile, getQuoteFile, deleteQuoteFile, listQuotes, COMPANY_INFO } = require('../utils/quoteGenerator');
const { getNextQuoteNumber, parseNumber } = require('../utils/sequenceGenerator');
const { getBookingById } = require('../utils/bookings');

/**
 * POST /api/quotes/pdf/generate
 * Generate and save quote PDF
 * 
 * Request body:
 * {
 *   quoteId?: string,
 *   quoteNumber?: string,
 *   clientName: string,
 *   clientEmail?: string,
 *   clientPhone?: string,
 *   items: [{ title, description?, quantity, unitPrice }],
 *   taxRate?: number,
 *   discountRate?: number,
 *   currency?: string,
 *   validUntil?: string (ISO date),
 *   notes?: string,
 *   terms?: string
 * }
 */
router.post('/pdf/generate', async (req, res) => {
  try {
    const {
      quoteId,
      quoteNumber: customQuoteNumber,
      clientName,
      clientEmail,
      clientPhone,
      items = [],
      taxRate = 15,
      discountRate = 0,
      currency = 'ZAR',
      validUntil,
      notes,
      terms
    } = req.body;

    // Validation
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Client name is required'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'At least one item is required'
      });
    }

    // Generate quote number if not provided
    const quoteNumber = customQuoteNumber || getNextQuoteNumber();

    // Build quote object
    const quote = {
      id: quoteId || `QT-${Date.now()}`,
      quoteNumber,
      clientName,
      clientEmail,
      clientPhone,
      items,
      taxRate,
      discountRate,
      currency,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
      terms,
      createdAt: new Date().toISOString()
    };

    // Generate and save PDF
    const fileInfo = saveQuoteFile(quote);

    res.status(201).json({
      success: true,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      filename: fileInfo.filename,
      size: fileInfo.size,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[quotes] Error generating quote:', error);
    res.status(500).json({
      error: 'generation_error',
      message: 'Failed to generate quote PDF'
    });
  }
});

/**
 * GET /api/quotes/pdf/:quoteId/download
 * Download quote PDF (generates on-the-fly if not exists)
 * 
 * Query params:
 * - quoteNumber?: string - Custom quote number for display
 */
router.get('/pdf/:quoteId/download', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { quoteNumber: customQuoteNumber } = req.query;

    // Try to find quote in server store first
    // This assumes quotes are stored in the main server store
    // You may need to adjust this based on your actual quote storage
    const store = req.app.get('store') || global.store || {};
    const quotes = store._quotes || [];
    let quote = quotes.find(q => q.id === quoteId);

    // If not found in store, try to construct from request or booking data
    if (!quote) {
      // Try to find as booking (some quotes might be stored as bookings)
      const booking = getBookingById(quoteId);
      
      if (!booking) {
        return res.status(404).json({
          error: 'not_found',
          message: `Quote ${quoteId} not found`
        });
      }

      // Convert booking to quote format
      quote = {
        id: booking.id,
        quoteNumber: customQuoteNumber || getNextQuoteNumber(),
        clientName: booking.customer?.name || 'Customer',
        clientEmail: booking.customer?.email,
        clientPhone: booking.customer?.phone,
        items: booking.items || [],
        taxRate: 15,
        discountRate: 0,
        currency: booking.currency || 'ZAR',
        createdAt: booking.createdAt
      };
    }

    // Generate quote number if not present
    if (!quote.quoteNumber) {
      quote.quoteNumber = customQuoteNumber || getNextQuoteNumber();
    }

    // Generate PDF
    const pdfBuffer = generateQuotePdf(quote);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Quote_${quote.quoteNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);

    // Send PDF
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('[quotes] Error downloading quote:', error);
    res.status(500).json({
      error: 'download_error',
      message: 'Failed to generate quote PDF'
    });
  }
});

/**
 * GET /api/quotes/pdf/file/:filename
 * Retrieve specific quote file
 */
router.get('/pdf/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        error: 'invalid_filename',
        message: 'Invalid filename'
      });
    }

    const pdfBuffer = getQuoteFile(filename);

    if (!pdfBuffer) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Quote file not found'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[quotes] Error retrieving quote file:', error);
    res.status(500).json({
      error: 'retrieval_error',
      message: 'Failed to retrieve quote file'
    });
  }
});

/**
 * GET /api/quotes/pdf/list
 * List all stored quote files
 */
router.get('/pdf/list', (req, res) => {
  try {
    const quotes = listQuotes();
    res.json({
      success: true,
      count: quotes.length,
      quotes
    });
  } catch (error) {
    console.error('[quotes] Error listing quotes:', error);
    res.status(500).json({
      error: 'list_error',
      message: 'Failed to list quotes'
    });
  }
});

/**
 * DELETE /api/quotes/pdf/:filename
 * Delete quote file
 */
router.delete('/pdf/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        error: 'invalid_filename',
        message: 'Invalid filename'
      });
    }

    const deleted = deleteQuoteFile(filename);

    if (!deleted) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Quote file not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('[quotes] Error deleting quote:', error);
    res.status(500).json({
      error: 'delete_error',
      message: 'Failed to delete quote'
    });
  }
});

/**
 * POST /api/quotes/:quoteId/convert-to-invoice
 * Convert quote to invoice with proper number sequencing
 * 
 * Request body:
 * {
 *   dueDate?: string (ISO date),
 *   notes?: string,
 *   terms?: string
 * }
 */
router.post('/:quoteId/convert-to-invoice', async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { dueDate, notes, terms } = req.body;

    // Find quote in store
    const store = req.app.get('store') || global.store || {};
    const quotes = store._quotes || [];
    const quote = quotes.find(q => q.id === quoteId);

    if (!quote) {
      return res.status(404).json({
        error: 'not_found',
        message: `Quote ${quoteId} not found`
      });
    }

    // Generate invoice number from quote number (maintains sequence)
    const { getNextInvoiceNumber } = require('../utils/sequenceGenerator');
    const invoiceNumber = getNextInvoiceNumber({ quoteNumber: quote.quoteNumber });

    // Parse quote number to extract details
    const quoteDetails = parseNumber(quote.quoteNumber);

    // Create booking/invoice object
    const booking = {
      id: `BK-${Date.now()}`,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      invoiceNumber,
      customer: {
        name: quote.clientName,
        email: quote.clientEmail,
        phone: quote.clientPhone
      },
      items: quote.items.map(item => ({
        type: 'service',
        name: item.title,
        description: item.description || '',
        quantity: item.quantity || 1,
        amount: item.unitPrice || 0,
        total: (item.quantity || 1) * (item.unitPrice || 0)
      })),
      currency: quote.currency || 'ZAR',
      taxRate: quote.taxRate || 15,
      discountRate: quote.discountRate || 0,
      notes: notes || quote.notes || '',
      terms: terms || quote.terms || '',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      createdAt: new Date().toISOString(),
      convertedFrom: 'quote',
      quoteConvertedAt: new Date().toISOString()
    };

    // Update quote status to 'Accepted' (converted)
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex !== -1) {
      quotes[quoteIndex] = {
        ...quotes[quoteIndex],
        status: 'Accepted',
        convertedToInvoice: invoiceNumber,
        convertedAt: new Date().toISOString()
      };
    }

    // Add booking to store (this will trigger invoice generation)
    const bookings = store.bookings || [];
    bookings.push(booking);
    store.bookings = bookings;

    // Save store if saveStore function is available
    const saveStore = req.app.get('saveStore');
    if (typeof saveStore === 'function') {
      saveStore();
    }

    res.status(201).json({
      success: true,
      message: 'Quote converted to invoice successfully',
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      invoiceNumber,
      bookingId: booking.id,
      convertedAt: booking.quoteConvertedAt
    });
  } catch (error) {
    console.error('[quotes] Error converting quote to invoice:', error);
    res.status(500).json({
      error: 'conversion_error',
      message: 'Failed to convert quote to invoice'
    });
  }
});

/**
 * PATCH /api/quotes/pdf/company
 * Update company information for quotes
 * 
 * Request body:
 * {
 *   field: string (name, legalName, email, etc.),
 *   value: string
 * }
 */
router.patch('/pdf/company', (req, res) => {
  try {
    const { field, value } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Both field and value are required'
      });
    }

    // Validate field exists
    if (!(field in COMPANY_INFO)) {
      return res.status(400).json({
        error: 'invalid_field',
        message: `Field '${field}' does not exist in company information`
      });
    }

    // Update company info (in-memory - you may want to persist this)
    COMPANY_INFO[field] = value;

    res.json({
      success: true,
      message: 'Company information updated',
      field,
      value
    });
  } catch (error) {
    console.error('[quotes] Error updating company info:', error);
    res.status(500).json({
      error: 'update_error',
      message: 'Failed to update company information'
    });
  }
});

module.exports = router;
