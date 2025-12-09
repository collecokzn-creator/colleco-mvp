/**
 * Professional Invoice Generator for Bookings
 * Generates accounting-quality PDF invoices with proper formatting, branding, and editable fields
 */

const jsPDF = require('jspdf');
require('jspdf-autotable');
const path = require('path');
const fs = require('fs');

/**
 * Company information - FULLY EDITABLE
 */
const COMPANY_INFO = {
  name: 'CollEco Travel',
  legalName: 'COLLECO SUPPLY & PROJECTS (PTY) Ltd',
  registration: 'Reg: 2013/147893/07',
  taxNumber: 'Tax: 9055225222',
  csd: 'CSD: MAAA07802746',
  email: 'collecokzn@gmail.com',
  phone: 'Cell: 073 3994 708',
  website: 'www.colleco.co.za',
  address: 'Durban, South Africa',
  bankName: 'Standard Bank',
  bankCode: '051001',
  accountNumber: '070754208',
  accountHolder: 'COLLECO SUPPLY & PROJECTS (PTY) Ltd'
};

/**
 * Format currency value with proper decimal places
 */
function formatCurrency(value, currency = 'ZAR') {
  if (typeof value !== 'number') value = parseFloat(value) || 0;
  const symbol = currency === 'ZAR' ? 'R' : currency;
  return `${symbol} ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Generate professional invoice PDF from booking data
 * @param {Object} booking - Booking object with pricing, lineItems, etc.
 * @param {Object} options - Invoice customization options
 * @returns {Buffer} PDF buffer
 */
function generateInvoicePdf(booking, options = {}) {
  const {
    invoiceNumber = null,
    orderNumber = booking.orderNumber || booking.poNumber || '',
    companyInfo = COMPANY_INFO,
    dueDate = null,
    notes = '',
    terms = 'Net 30 days',
    currency = 'ZAR',
    paymentInstructions = booking.paymentInstructions || null
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let currentY = marginTop;

  // ===== HEADER: COMPANY BRANDING =====
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(244, 124, 32); // CollEco Orange
  doc.text(companyInfo.name, marginLeft, currentY);
  currentY += 8;

  // Company details (compact format)
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.text(companyInfo.legalName, marginLeft, currentY);
  currentY += 3;
  doc.text(`${companyInfo.registration} | ${companyInfo.taxNumber}`, marginLeft, currentY);
  currentY += 3;
  doc.text(`${companyInfo.address}`, marginLeft, currentY);
  currentY += 4;

  // Decorative line
  doc.setDrawColor(244, 124, 32);
  doc.setLineWidth(1);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 6;

  // ===== INVOICE TITLE & KEY INFO =====
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', marginLeft, currentY);
  currentY += 10;

  // Invoice metadata in two columns
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  // Left column
  const leftColX = marginLeft;
  let detailY = currentY;

  const invoiceNum = invoiceNumber || booking.id || 'N/A';
  doc.text('Invoice Number:', leftColX, detailY);
  doc.setFont(undefined, 'bold');
  doc.text(invoiceNum, leftColX + 35, detailY);
  doc.setFont(undefined, 'normal');
  detailY += 5;

  doc.text('Invoice Date:', leftColX, detailY);
  doc.setFont(undefined, 'bold');
  doc.text(new Date().toLocaleDateString('en-ZA'), leftColX + 35, detailY);
  doc.setFont(undefined, 'normal');
  detailY += 5;

  if (dueDate) {
    doc.text('Due Date:', leftColX, detailY);
    doc.setFont(undefined, 'bold');
    doc.text(new Date(dueDate).toLocaleDateString('en-ZA'), leftColX + 35, detailY);
    doc.setFont(undefined, 'normal');
    detailY += 5;
  }

  // Right column - Reference info
  const rightColX = pageWidth - marginRight - 70;
  doc.setFontSize(9);
  
  // Quote reference (if converted from quote)
  if (booking.quoteNumber || booking.quoteId) {
    doc.text('Quote Reference:', rightColX, currentY);
    doc.setFont(undefined, 'bold');
    doc.text(booking.quoteNumber || booking.quoteId, rightColX, currentY + 5);
    doc.setFont(undefined, 'normal');
    currentY += 10;
  }

  // Order/PO Number (if provided)
  if (orderNumber) {
    doc.text('Order/PO Number:', rightColX, currentY);
    doc.setFont(undefined, 'bold');
    doc.text(orderNumber, rightColX, currentY + 5);
    doc.setFont(undefined, 'normal');
    currentY += 10;
  }
  
  doc.text('Booking Reference:', rightColX, currentY);
  doc.setFont(undefined, 'bold');
  doc.text(booking.id, rightColX, currentY + 5);
  doc.setFont(undefined, 'normal');

  if (booking.checkInDate) {
    doc.text('Check-in:', rightColX, currentY + 12);
    doc.setFont(undefined, 'bold');
    doc.text(new Date(booking.checkInDate).toLocaleDateString('en-ZA'), rightColX, currentY + 17);
    doc.setFont(undefined, 'normal');
  }

  currentY += 20;

  // ===== BILL TO / CUSTOMER DETAILS =====
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('BILL TO:', marginLeft, currentY);
  currentY += 5;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  // Customer name
  const customerName = booking.metadata?.customerName || 'Customer';
  doc.text(customerName, marginLeft, currentY);
  currentY += 4;

  // Customer email
  if (booking.metadata?.customerEmail) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Email: ${booking.metadata.customerEmail}`, marginLeft, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 4;
  }

  // Customer phone
  if (booking.metadata?.customerPhone) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Phone: ${booking.metadata.customerPhone}`, marginLeft, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 4;
  }

  // Customer VAT Number
  if (booking.metadata?.customerVAT || booking.clientVAT) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('VAT Number:', marginLeft, currentY);
    doc.setFont(undefined, 'normal');
    doc.text(booking.metadata?.customerVAT || booking.clientVAT, marginLeft + 25, currentY);
    currentY += 4;
  }

  // VAT number if available
  if (booking.metadata?.vatNumber) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`VAT Number: ${booking.metadata.vatNumber}`, marginLeft, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 4;
  }

  currentY += 2;

  // ===== LINE ITEMS TABLE =====
  const tableData = [];

  // Build table rows from line items
  if (booking.lineItems && Array.isArray(booking.lineItems)) {
    booking.lineItems.forEach((item, index) => {
      const unitPrice = item.retailPrice || item.basePrice || 0;
      const quantity = item.quantity || 1;
      const nights = item.nights || 1;
      const lineTotal = item.totalRetail || (unitPrice * quantity);

      tableData.push([
        index + 1, // Item number
        item.description || item.serviceType || 'Service',
        nights > 1 ? `${nights} nights` : (quantity > 1 ? `${quantity} x` : '1'),
        formatCurrency(unitPrice, currency),
        formatCurrency(lineTotal, currency)
      ]);
    });
  }

  // Draw table with professional styling
  if (tableData.length > 0) {
    doc.autoTable({
      startY: currentY,
      head: [['#', 'Description', 'Qty/Nights', 'Unit Price', 'Total']],
      body: tableData,
      margin: { left: marginLeft, right: marginRight },
      headStyles: {
        fillColor: [244, 124, 32], // Orange
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        padding: 4,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        padding: 3,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 }
      },
      didDrawPage: function(data) {
        // No custom page drawing needed
      }
    });

    currentY = doc.lastAutoTable.finalY + 5;
  }

  // ===== PRICING SUMMARY (Right-aligned) =====
  const summaryX = pageWidth - marginRight - 60;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  const subtotal = booking.pricing?.subtotal || 0;
  const vat = booking.pricing?.vat || 0;
  const total = booking.pricing?.total || 0;

  // Subtotal
  doc.text('Subtotal (excl. VAT):', summaryX, currentY);
  doc.text(formatCurrency(subtotal, currency), pageWidth - marginRight, currentY, { align: 'right' });
  currentY += 5;

  // VAT line (15%)
  doc.setTextColor(100, 100, 100);
  doc.text('VAT (15%):', summaryX, currentY);
  doc.text(formatCurrency(vat, currency), pageWidth - marginRight, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  currentY += 5;

  // Total line (bold, larger font)
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setDrawColor(244, 124, 32);
  doc.setLineWidth(0.5);
  doc.line(summaryX, currentY - 2, pageWidth - marginRight, currentY - 2);
  doc.text('TOTAL:', summaryX, currentY + 3);
  doc.text(formatCurrency(total, currency), pageWidth - marginRight, currentY + 3, { align: 'right' });
  currentY += 10;

  // ===== PAYMENT TERMS & METHODS =====
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  doc.text('Payment Terms:', marginLeft, currentY);
  doc.setFont(undefined, 'bold');
  doc.text(terms, marginLeft + 35, currentY);
  doc.setFont(undefined, 'normal');
  currentY += 6;

  // Payment Instructions (custom or default banking details)
  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  
  if (paymentInstructions) {
    // Custom payment instructions (for government, municipalities, etc.)
    doc.text('PAYMENT INSTRUCTIONS:', marginLeft, currentY);
    doc.setFont(undefined, 'normal');
    currentY += 4;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const instructionLines = doc.splitTextToSize(paymentInstructions, contentWidth);
    instructionLines.forEach(line => {
      doc.text(line, marginLeft, currentY);
      currentY += 3;
    });
    doc.setTextColor(0, 0, 0);
    currentY += 3;
  } else {
    // Default banking details for EFT
    doc.text('BANKING DETAILS (EFT):', marginLeft, currentY);
    doc.setFont(undefined, 'normal');
    currentY += 4;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Bank: ${companyInfo.bankName}`, marginLeft, currentY);
    currentY += 3;
    doc.text(`Code: ${companyInfo.bankCode}`, marginLeft, currentY);
    currentY += 3;
    doc.text(`Account: ${companyInfo.accountNumber}`, marginLeft, currentY);
    currentY += 3;
    doc.text(`Holder: ${companyInfo.accountHolder}`, marginLeft, currentY);
    currentY += 3;
    doc.text('Reference: Use Invoice Number as payment reference', marginLeft, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 6;
  }

  // ===== NOTES / TERMS & CONDITIONS =====
  if (notes) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('NOTES:', marginLeft, currentY);
    doc.setFont(undefined, 'normal');
    currentY += 3;

    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(notes, contentWidth);
    notesLines.forEach(line => {
      doc.text(line, marginLeft, currentY);
      currentY += 3;
    });
    currentY += 3;
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 12;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont(undefined, 'italic');

  const footerText = `For inquiries, please contact ${companyInfo.email} or ${companyInfo.phone}`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

  doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, footerY + 4);
  doc.text(`Invoice #${invoiceNum}`, pageWidth - marginRight, footerY + 4, { align: 'right' });

  // Return PDF as buffer
  return doc.output('arraybuffer');
}

/**
 * Save invoice to file and return file path
 */
function saveInvoiceFile(booking, filename = null) {
  const pdfBuffer = generateInvoicePdf(booking);
  const invoiceDir = path.join(__dirname, '..', 'data', 'invoices');

  // Create directory if it doesn't exist
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

  const invoiceFilename = filename || `Invoice_${booking.id}_${Date.now()}.pdf`;
  const filePath = path.join(invoiceDir, invoiceFilename);

  fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

  return {
    filePath,
    filename: invoiceFilename,
    size: pdfBuffer.byteLength
  };
}

/**
 * Get invoice file as buffer
 */
function getInvoiceFile(invoiceFilename) {
  const invoiceDir = path.join(__dirname, '..', 'data', 'invoices');
  const filePath = path.join(invoiceDir, invoiceFilename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Invoice file not found: ${invoiceFilename}`);
  }

  return fs.readFileSync(filePath);
}

/**
 * Delete invoice file
 */
function deleteInvoiceFile(invoiceFilename) {
  const invoiceDir = path.join(__dirname, '..', 'data', 'invoices');
  const filePath = path.join(invoiceDir, invoiceFilename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }

  return false;
}

/**
 * List all invoices
 */
function listInvoices() {
  const invoiceDir = path.join(__dirname, '..', 'data', 'invoices');

  if (!fs.existsSync(invoiceDir)) {
    return [];
  }

  return fs.readdirSync(invoiceDir)
    .filter(f => f.endsWith('.pdf'))
    .map(f => ({
      filename: f,
      path: path.join(invoiceDir, f)
    }));
}

module.exports = {
  generateInvoicePdf,
  saveInvoiceFile,
  getInvoiceFile,
  deleteInvoiceFile,
  listInvoices,
  COMPANY_INFO,
  formatCurrency
};
