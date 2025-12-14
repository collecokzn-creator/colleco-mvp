/**
 * Professional Quote PDF Generator for CollEco Travel
 * 
 * Generates accounting-quality quotation PDFs with:
 * - Company branding and logo support
 * - Professional A4 layout with proper margins
 * - Line items with quantities and pricing
 * - Tax and discount calculations
 * - Valid until date and payment terms
 * - Customer information section
 * 
 * Dependencies: jsPDF, jspdf-autotable
 */

const jsPDF = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

// Safe path resolver to avoid path traversal when working with filenames
function isValidFilename(name){
  if(!name) return false;
  // Allow letters, numbers, dot, underscore and hyphen only
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

function safeResolve(baseDir, filename){
  if(!isValidFilename(filename)){
    throw new Error('Invalid filename');
  }
  const resolved = path.resolve(baseDir, filename);
  const baseResolved = path.resolve(baseDir) + path.sep;
  if(!resolved.startsWith(baseResolved)){
    throw new Error('Path traversal detected');
  }
  return resolved;
}

/**
 * Company information (editable configuration)
 */
const COMPANY_INFO = {
  name: 'CollEco Travel',
  legalName: 'COLLECO SUPPLY & PROJECTS (PTY) Ltd',
  tagline: 'The Odyssey of Adventure',
  registration: 'Reg: 2013/147893/07',
  taxNumber: 'Tax: 9055225222',
  csd: 'CSD: 1000048892',
  email: 'colletom@hotmail.com',
  phone: 'Cell: 076 9191 995',
  website: 'www.colleco.co.za',
  address: '163 Intersite Avenue, Umbogintwini, 4126',
  bankName: 'Standard Bank',
  bankCode: '051001',
  accountNumber: '261948751',
  accountHolder: 'COLLECO SUPPLY AND PROJECTS PTY LTD'
};

/**
 * Currency formatter
 * @param {number} value - Numeric value to format
 * @param {string} currency - Currency code (default: 'ZAR')
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'ZAR') {
  const num = Number(value) || 0;
  const formatted = num.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Currency prefix mapping
  const symbols = {
    'ZAR': 'R',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol} ${formatted}`;
}

/**
 * Generate professional quote PDF
 * @param {Object} quote - Quote data object
 * @param {Object} options - Generation options
 * @returns {ArrayBuffer} PDF data as buffer
 */
function generateQuotePdf(quote, options = {}) {
  const {
    quoteNumber = quote.quoteNumber || quote.id,
    orderNumber = quote.orderNumber || quote.poNumber || '',
    validUntil = quote.validUntil || addDays(new Date(), 30).toISOString().split('T')[0],
    currency = quote.currency || 'ZAR',
    notes = quote.notes || '',
    terms = quote.terms || 'This quotation is valid for 30 days from the date of issue.',
    paymentInstructions = quote.paymentInstructions || null
  } = options;

  // Create PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPos = margin;

  // ===== HEADER SECTION =====
  // Company name with orange accent
  doc.setFillColor(244, 124, 32); // CollEco orange #F47C20
  doc.rect(margin, yPos, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, margin + 2, yPos + 6);
  yPos += 10;

  // Tagline
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(COMPANY_INFO.tagline, margin, yPos);
  yPos += 8;

  // Company details (left column)
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.legalName, margin, yPos);
  yPos += 4;
  doc.text(COMPANY_INFO.registration, margin, yPos);
  yPos += 4;
  doc.text(COMPANY_INFO.taxNumber, margin, yPos);
  yPos += 4;
  doc.text(COMPANY_INFO.csd, margin, yPos);
  yPos += 8;

  // Contact details
  doc.text(COMPANY_INFO.email, margin, yPos);
  yPos += 4;
  doc.text(COMPANY_INFO.phone, margin, yPos);
  yPos += 4;
  doc.text(COMPANY_INFO.website, margin, yPos);
  yPos += 4;
  doc.text(COMPANY_INFO.address, margin, yPos);
  yPos += 12;

  // ===== QUOTATION TITLE =====
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(244, 124, 32);
  doc.text('QUOTATION', margin, yPos);
  yPos += 12;

  // ===== QUOTE METADATA (Two columns) =====
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  // Left column - Quote details
  const leftCol = margin;
  const rightCol = margin + (contentWidth / 2) + 10;
  let leftY = yPos;
  let rightY = yPos;

  // Quote Number
  doc.setFont('helvetica', 'bold');
  doc.text('Quote Number:', leftCol, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(quoteNumber, leftCol + 35, leftY);
  leftY += 5;

  // Order/PO Number (if provided)
  if (orderNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text('Order/PO Number:', leftCol, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(orderNumber, leftCol + 35, leftY);
    leftY += 5;
  }

  // Quote Date
  doc.setFont('helvetica', 'bold');
  doc.text('Quote Date:', leftCol, leftY);
  doc.setFont('helvetica', 'normal');
  const quoteDate = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('en-ZA') : new Date().toLocaleDateString('en-ZA');
  doc.text(quoteDate, leftCol + 35, leftY);
  leftY += 5;

  // Valid Until
  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until:', leftCol, leftY);
  doc.setFont('helvetica', 'normal');
  const validDate = new Date(validUntil).toLocaleDateString('en-ZA');
  doc.text(validDate, leftCol + 35, leftY);
  leftY += 10;

  // Right column - Customer details (if available)
  if (quote.clientName || quote.clientEmail) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('QUOTE FOR:', rightCol, rightY);
    rightY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (quote.clientName) {
      doc.text(quote.clientName, rightCol, rightY);
      rightY += 5;
    }
    
    if (quote.clientEmail) {
      doc.text(quote.clientEmail, rightCol, rightY);
      rightY += 5;
    }

    if (quote.clientPhone) {
      doc.text(quote.clientPhone, rightCol, rightY);
      rightY += 5;
    }

    if (quote.clientVAT) {
      doc.setFont('helvetica', 'bold');
      doc.text('VAT Number:', rightCol, rightY);
      doc.setFont('helvetica', 'normal');
      doc.text(quote.clientVAT, rightCol + 25, rightY);
      rightY += 5;
    }
  }

  yPos = Math.max(leftY, rightY) + 5;

  // ===== LINE ITEMS TABLE =====
  const items = quote.items || [];
  const tableData = items.map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const total = qty * unitPrice;
    
    return [
      index + 1,
      item.title || item.description || 'Item',
      item.description && item.title !== item.description ? item.description : '',
      qty,
      formatCurrency(unitPrice, currency),
      formatCurrency(total, currency)
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [['#', 'Item', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [244, 124, 32],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45, halign: 'left' },
      2: { cellWidth: 50, halign: 'left', fontSize: 8, textColor: [100, 100, 100] },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      yPos = data.cursor.y;
    }
  });

  yPos += 10;

  // ===== PRICING SUMMARY =====
  const subtotal = items.reduce((sum, item) => {
    return sum + ((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0));
  }, 0);

  const discountRate = Number(quote.discountRate) || 0;
  const discount = discountRate ? subtotal * (discountRate / 100) : 0;
  const subtotalAfterDiscount = subtotal - discount;

  const taxRate = Number(quote.taxRate) || 0;
  const tax = taxRate ? subtotalAfterDiscount * (taxRate / 100) : 0;
  const total = subtotalAfterDiscount + tax;

  // Summary box positioning (right-aligned)
  const summaryX = pageWidth - margin - 70;
  const summaryWidth = 70;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Subtotal
  doc.text('Subtotal:', summaryX, yPos, { align: 'left' });
  doc.text(formatCurrency(subtotal, currency), summaryX + summaryWidth, yPos, { align: 'right' });
  yPos += 5;

  // Discount (if applicable)
  if (discount > 0) {
    doc.text(`Discount (${discountRate}%):`, summaryX, yPos, { align: 'left' });
    doc.text('-' + formatCurrency(discount, currency), summaryX + summaryWidth, yPos, { align: 'right' });
    yPos += 5;
  }

  // Tax (if applicable)
  if (tax > 0) {
    doc.text(`VAT (${taxRate}%):`, summaryX, yPos, { align: 'left' });
    doc.text(formatCurrency(tax, currency), summaryX + summaryWidth, yPos, { align: 'right' });
    yPos += 5;
  }

  // Total (emphasized)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(244, 124, 32);
  doc.text('TOTAL:', summaryX, yPos, { align: 'left' });
  doc.text(formatCurrency(total, currency), summaryX + summaryWidth, yPos, { align: 'right' });
  yPos += 10;

  // ===== TERMS AND NOTES =====
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  // Payment Terms
  if (terms) {
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const termLines = doc.splitTextToSize(terms, contentWidth);
    doc.text(termLines, margin, yPos);
    yPos += (termLines.length * 4) + 5;
  }

  // Additional Notes
  if (notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(notes, contentWidth);
    doc.text(noteLines, margin, yPos);
    yPos += (noteLines.length * 4) + 5;
  }

  // ===== FOOTER (Payment Instructions / Banking Details) =====
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(244, 124, 32);

  if (paymentInstructions) {
    // Custom payment instructions (for government, municipalities, etc.)
    doc.text('PAYMENT INSTRUCTIONS', margin, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const instructionLines = doc.splitTextToSize(paymentInstructions, contentWidth);
    doc.text(instructionLines, margin, yPos);
    yPos += (instructionLines.length * 4) + 4;
  } else {
    // Default banking details for EFT
    doc.text('BANKING DETAILS (EFT Payments)', margin, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Bank: ${COMPANY_INFO.bankName}`, margin, yPos);
    yPos += 4;
    doc.text(`Branch Code: ${COMPANY_INFO.bankCode}`, margin, yPos);
    yPos += 4;
    doc.text(`Account Number: ${COMPANY_INFO.accountNumber}`, margin, yPos);
    yPos += 4;
    doc.text(`Account Holder: ${COMPANY_INFO.accountHolder}`, margin, yPos);
    yPos += 4;
    doc.text('Reference: Use Quote Number as payment reference', margin, yPos);
    yPos += 4;
  }

  // Generated timestamp
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  const timestamp = new Date().toLocaleString('en-ZA');
  doc.text(`Generated: ${timestamp}`, margin, yPos);

  // Thank you message
  doc.text('Thank you for your business!', pageWidth - margin, yPos, { align: 'right' });

  // Return PDF as ArrayBuffer
  return doc.output('arraybuffer');
}

/**
 * Save quote PDF to file
 * @param {Object} quote - Quote data object
 * @param {string} filename - Optional custom filename
 * @returns {Object} File information {filePath, filename, size}
 */
function saveQuoteFile(quote, filename) {
  const pdfBuffer = generateQuotePdf(quote);
  
  const quotesDir = path.join(__dirname, '../data/quotes');
  if (!fs.existsSync(quotesDir)) {
    fs.mkdirSync(quotesDir, { recursive: true });
  }

  const quoteFilename = filename || `Quote_${quote.quoteNumber || quote.id}_${Date.now()}.pdf`;
  const filePath = safeResolve(quotesDir, quoteFilename);

  fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

  return {
    filePath,
    filename: quoteFilename,
    size: fs.statSync(filePath).size
  };
}

/**
 * Retrieve quote PDF file
 * @param {string} quoteFilename - Filename of the quote PDF
 * @returns {Buffer|null} PDF buffer or null if not found
 */
function getQuoteFile(quoteFilename) {
  const quotesDir = path.join(__dirname, '../data/quotes');
  if (!isValidFilename(quoteFilename)) return null;
  const filePath = safeResolve(quotesDir, quoteFilename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

/**
 * Delete quote PDF file
 * @param {string} quoteFilename - Filename of the quote PDF to delete
 * @returns {boolean} True if deleted successfully
 */
function deleteQuoteFile(quoteFilename) {
  const quotesDir = path.join(__dirname, '../data/quotes');
  if (!isValidFilename(quoteFilename)) return false;
  const filePath = safeResolve(quotesDir, quoteFilename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/**
 * List all quote PDF files
 * @returns {Array} Array of quote file information
 */
function listQuotes() {
  const quotesDir = path.join(__dirname, '../data/quotes');
  
  if (!fs.existsSync(quotesDir)) {
    return [];
  }

  const files = fs.readdirSync(quotesDir);
  return files
    .filter(f => f.endsWith('.pdf'))
    .map(f => {
      const fp = safeResolve(quotesDir, f);
      const stats = fs.statSync(fp);
      return {
        filename: f,
        size: stats.size,
        created: stats.birthtime
      };
    });
}

/**
 * Helper: Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = {
  generateQuotePdf,
  saveQuoteFile,
  getQuoteFile,
  deleteQuoteFile,
  listQuotes,
  formatCurrency,
  COMPANY_INFO
};
