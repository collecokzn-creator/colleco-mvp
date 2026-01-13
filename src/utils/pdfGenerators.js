// --- Sample Quote PDF Generator ---
export async function generateTestPDF() {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("CollEco Travel - Quote", 14, 20);

  doc.setFontSize(12);
  doc.text("Client: John Doe", 14, 35);
  doc.text("Destination: Durban, South Africa", 14, 45);

  autoTable(doc, {
    startY: 60,
    head: [["Item", "Details", "Price"]],
    body: [
      ["Hotel", "2 nights at Seaside Resort", "$200"],
      ["Car Hire", "Compact vehicle, 3 days", "$90"],
      ["Tour", "Guided city tour", "$50"],
    ],
  });

  doc.text("Total: $340", 14, doc.lastAutoTable.finalY + 10);

  doc.save("quote.pdf");
}
// (keep minimal and exported functions used by pages) // src/utils/pdfGenerators.js
import { formatCurrency } from './currency';

// Public path to the logo in the `public/assets` folder  
const LOGO_PATH = '/assets/colleco-logo.png';

// CollEco Travel Company Details - FULLY EDITABLE
const COMPANY_INFO = {
  name: 'CollEco Travel',
  tagline: 'The Odyssey of Adventure',
  legalName: 'COLLECO SUPPLY & PROJECTS (PTY) Ltd',
  registration: 'Reg: 2013/147893/07',
  taxNumber: 'Tax: 9055225222',
  csd: 'CSD: MAAA07802746',
  // Contact details
  email: 'collecokzn@gmail.com',
  phone: 'Cell: 073 3994 708',
  address: '6 Avenue Umtenweni 4234',
  website: 'www.collecotravel.com',
  // Banking details
  banking: {
    bankName: 'Capitec Business',
    branchName: 'Relationship Suite',
    accountType: 'Capitec Business Account',
    accountNumber: '1052106919',
    branchCode: '450105'
  },
  // Terms and conditions
  terms: [
    'All payments to be done electronically into provided account.',
    'All bookings are subjected to availability.',
    'All bookings are subjected to a non-refund cancelation policy once confirmed by the client.',
    'All flight bookings are standard and if any changes are required there will be an additional cost. Upfront arrangements must be done for flexible bookings.',
    'All car rentals are subject to a returnable deposit payment upon collection.',
    'All damages and extra costs accumulated during the car hire, the driver will be liable for them.'
  ],
  // Brand colors
  colors: {
    orange: '#F47C20',
    brown: '#3A2C1A',
    gold: '#E6B422',
    cream: '#FFF8F1',
    white: '#FFFFFF',
    green: '#4A7C59'  // Natural green - use sparingly as accent/blend
  }
};

// Helper: fetch an image and return a data URL (browser-friendly)
async function fetchImageDataUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    // convert to base64
    let binary = '';
    const bytes = new Uint8Array(buf);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);
    const mime = res.headers.get('content-type') || 'image/png';
    return `data:${mime};base64,${b64}`;
  } catch (e) {
    return null;
  }
}

export function generateMarketingFlyer(pkg = {}) {
  return import("jspdf").then(({ default: jsPDF }) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(pkg.title || "CollEco Package", 20, 30);
    doc.setFontSize(12);
    doc.text(`Price: R${pkg.price || 0}`, 20, 45);
    doc.text(`Ref: ${pkg.id || ""}`, 20, 55);
    doc.save(`${(pkg.title || "package").replace(/\s+/g, "_")}_flyer.pdf`);
  });
}

// Enhanced Quote PDF generator matching CollEco invoice template
// Supports both legacy and structured formats
// All fields are editable through the quote object
export const generateQuotePdf = async (a, b, c, d) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  
  const doc = new jsPDF();

  // Detect structured object form
  const structured = typeof a === 'object' && a && Array.isArray(a.items) && (a.currency || a.taxRate !== undefined);

  let safeName;
  let items;
  let ref;
  let showAllInQuote;
  let currency = 'R'; // default Rand
  let taxRate = 15; // default 15% VAT
  let _status = 'Draft';
  let _notes = '';
  let createdAt;
  let _updatedAt;

  // Parse parameters
  if (structured) {
    safeName = (a.clientName || 'Client').trim();
    items = a.items || [];
    ref = a.id || a.reference || '';
    showAllInQuote = true;
    currency = a.currency || currency;
    taxRate = typeof a.taxRate === 'number' ? a.taxRate : taxRate;
    _status = a.status || _status;
    _notes = a.notes || '';
    createdAt = a.createdAt;
    _updatedAt = a.updatedAt;
    
    // Additional editable fields
    var invoiceNumber = a.invoiceNumber || a.quoteNumber || a.referenceNumber || '';
    var orderNumber = a.orderNumber || '';
    var clientAddress = a.clientAddress || '';
    var clientVAT = a.clientVAT || '';
    var clientPhone = a.clientPhone || a.phone || '';
    var clientEmail = a.clientEmail || '';
    var _paymentTerms = a.paymentTerms || '';
    var _validity = a.validUntil || a.validity || '';
    
    // Editable company info override
    var companyInfo = a.companyInfo || COMPANY_INFO;
    var banking = a.banking || companyInfo.banking;
    var terms = a.terms || companyInfo.terms;
  } else {
    safeName = (a?.trim?.() || 'Client');
    items = b || [];
    ref = c;
    showAllInQuote = d;
    companyInfo = COMPANY_INFO;
    banking = COMPANY_INFO.banking;
    terms = COMPANY_INFO.terms;
  }

  // Normalize items
  const normalized = items.map(it => {
    return {
      name: it.title || it.name || 'Item',
      description: it.description || it.subtitle || '',
      qty: (it.quantity !== undefined ? it.quantity : (it.qty !== undefined ? it.qty : 1)) || 1,
      unit: (it.unitPrice !== undefined ? it.unitPrice : (it.price !== undefined ? it.price : 0)) || 0,
    };
  });

  const filtered = showAllInQuote ? normalized : normalized.filter(i => i.unit);

  // Page setup
  const pageWidth = doc.internal.pageSize.width || 210;
  const pageHeight = doc.internal.pageSize.height || 297;
  const marginLeft = 10;
  const marginRight = 10;
  
  // Load logo (for optional use)
  const _logoDataUrl = await fetchImageDataUrl(LOGO_PATH);
  
  // Use custom logo if provided, otherwise use default CollEco logo
  const customLogoData = a.customLogo || null;
  const logoToUse = customLogoData || _logoDataUrl;
  
  // Helper function to add CollEco header
  const addHeader = () => {
    // Add logo if available (top right corner)
    if (logoToUse) {
      try {
        const logoW = 45;
        const logoH = 20;
        const logoX = pageWidth - marginRight - logoW;
        doc.addImage(logoToUse, 'PNG', logoX, 8, logoW, logoH);
      } catch (e) {
        console.warn('Logo add failed:', e);
      }
    }
    
    // Company name at top - centered
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    const companyName = companyInfo.name || "CollEco Travel";
    const companyWidth = doc.getTextWidth(companyName);
    doc.text(companyName, (pageWidth - companyWidth) / 2, 16);
    
    // Letterhead: Bird logo - "The Odyssey of Adventure" - Globe (centered)
    doc.setFontSize(24);
    const bird = "🦜";
    doc.setFontSize(11);
    doc.setFont(undefined, "italic");
    const payoffLine = companyInfo.tagline || "The Odyssey of Adventure";
    const payoffWidth = doc.getTextWidth(payoffLine);
    doc.setFontSize(14);
    const globe = "🌍";
    
    // Calculate total width of bird + payoff + globe
    doc.setFontSize(24);
    const birdWidth = doc.getTextWidth(bird);
    doc.setFontSize(14);
    const globeWidth = doc.getTextWidth(globe);
    const spacing = 2;
    const totalWidth = birdWidth + spacing + payoffWidth + spacing + globeWidth;
    const startX = (pageWidth - totalWidth) / 2;
    
    // Draw centered elements
    doc.setFontSize(24);
    doc.text(bird, startX, 26);
    
    doc.setFontSize(11);
    doc.setFont(undefined, "italic");
    doc.text(payoffLine, startX + birdWidth + spacing, 26);
    
    doc.setFontSize(14);
    doc.text(globe, startX + birdWidth + spacing + payoffWidth + spacing, 26);
    
    // Decorative line
    doc.setDrawColor(255, 140, 0); // Orange color
    doc.setLineWidth(0.5);
    doc.line(14, 36, pageWidth - 14, 36);
    
    doc.setTextColor(0, 0, 0);
  };
  
  // Helper function to add footer
  const addFooter = () => {
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 140, 0); // Orange color
    const websiteText = companyInfo.website || "www.travelcolleco.com";
    const websiteWidth = doc.getTextWidth(websiteText);
    const websiteX = (pageWidth - websiteWidth) / 2;
    doc.text(websiteText, websiteX, pageHeight - 10);
    
    // Underline the website
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.line(websiteX, pageHeight - 9, websiteX + websiteWidth, pageHeight - 9);
    
    doc.setTextColor(0, 0, 0);
  };
  
  // Add header to first page
  addHeader();
  
  // Get document type
  const documentType = a.documentType || 'Invoice';
  const issueDate = a.issueDate ? new Date(a.issueDate) : (createdAt ? new Date(createdAt) : new Date());
  const dueDate = a.dueDate ? new Date(a.dueDate) : null;
  
  // Date section (below header)
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  const dateText = `${documentType} generated on ${issueDate.toLocaleDateString('en-GB')}`;
  doc.text(dateText, 14, 42); // Left margin 14
  doc.setTextColor(0, 0, 0);
  
  // Document details section
  let yPos = 48;
  doc.setFontSize(14);
  doc.setTextColor(244, 124, 32); // Orange
  doc.setFont(undefined, 'bold');
  doc.text(documentType.toUpperCase(), 14, yPos); // Left margin 14
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  
  yPos += 6;
  doc.setFontSize(9);
  if (companyInfo.legalName) { doc.text(companyInfo.legalName, 14, yPos); yPos += 4; }
  if (companyInfo.registration) { doc.text(companyInfo.registration, 14, yPos); yPos += 4; }
  if (companyInfo.taxNumber) { doc.text(companyInfo.taxNumber, 14, yPos); yPos += 4; }
  if (companyInfo.csd) { doc.text(companyInfo.csd, 14, yPos); yPos += 4; }
  if (companyInfo.phone) { doc.text(companyInfo.phone, 14, yPos); yPos += 4; }
  if (companyInfo.email) {
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(companyInfo.email, 14, yPos, { url: `mailto:${companyInfo.email}` });
    doc.setTextColor(0, 0, 0);
    yPos += 4;
  }
  
  // Document and Order numbers
  yPos += 2;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  const docLabel = documentType === 'Quotation' ? 'QUOTE NO' : 'INVOICE NO';
  doc.text(docLabel, 14, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(invoiceNumber || ref || '001', 14 + 30, yPos);
  
  yPos += 5;
  doc.setFont(undefined, 'bold');
  doc.text('ORDER NO', 14, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(orderNumber || '-', 14 + 30, yPos);
  
  yPos += 5;
  doc.setFont(undefined, 'bold');
  doc.text('ISSUE DATE', 14, yPos);
  doc.setFont(undefined, 'normal');
  doc.text(issueDate.toLocaleDateString('en-GB'), 14 + 30, yPos);
  
  if (dueDate && documentType === 'Invoice') {
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text('DUE DATE', 14, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(dueDate.toLocaleDateString('en-GB'), 14 + 30, yPos);
  }
  
  // INVOICE TO / QUOTE FOR section
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  const clientLabel = documentType === 'Quotation' ? 'QUOTE FOR' : 'INVOICE TO';
  doc.text(clientLabel, 14, yPos);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  
  yPos += 5;
  doc.text(safeName, 14, yPos);
  
  if (clientAddress) {
    yPos += 4;
    const addressLines = doc.splitTextToSize(clientAddress, 90);
    doc.text(addressLines, 14, yPos);
    yPos += addressLines.length * 4;
  }
  
  if (clientPhone) {
    yPos += 4;
    doc.text(`Phone: ${clientPhone}`, 14, yPos);
  }
  
  if (clientEmail) {
    yPos += 4;
    doc.text(`Email: ${clientEmail}`, 14, yPos);
  }
  
  if (clientVAT) {
    yPos += 4;
    doc.text(`VAT: ${clientVAT}`, 14, yPos);
  }
  
  // Items table - Professional accounting grid layout
  const tableStartY = Math.max(yPos + 10, 110);
  
  const rows = filtered.map((item, idx) => {
    const itemDesc = item.name + (item.description ? '\n' + item.description : '');
    return [
      idx + 1,
      itemDesc,
      item.qty,
      formatCurrency(item.unit, currency),
      formatCurrency(item.unit * item.qty, currency)
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT']],
    body: rows,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: [244, 124, 32], // CollEco orange
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.5,
      lineColor: [244, 124, 32],
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 9,
      lineWidth: 0.3,
      lineColor: [200, 200, 200], // Light gray borders
      cellPadding: 3,
      valign: 'middle'
    },
    columnStyles: {
      0: { 
        cellWidth: 15, 
        halign: 'center',
        fontStyle: 'bold',
        fillColor: [255, 248, 241] // Light cream
      },
      1: { 
        cellWidth: 'auto',
        halign: 'left',
        cellPadding: { left: 4, right: 4, top: 3, bottom: 3 }
      },
      2: { 
        cellWidth: 20, 
        halign: 'center',
        fontStyle: 'bold'
      },
      3: { 
        cellWidth: 35, 
        halign: 'right',
        cellPadding: { right: 5 }
      },
      4: { 
        cellWidth: 35, 
        halign: 'right',
        fontStyle: 'bold',
        fillColor: [255, 248, 241], // Light cream for totals column
        cellPadding: { right: 5 }
      }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250] // Very light gray for alternating rows
    },
    didDrawPage: (data) => {
      // Add header on each new page
      if (data.pageNumber > 1) {
        addHeader();
      }
    },
    didParseCell: function(data) {
      // Add extra padding to description cells with multiline content
      if (data.column.index === 1 && data.cell.text.length > 1) {
        data.cell.styles.cellPadding = { top: 4, bottom: 4, left: 4, right: 4 };
      }
    }
  });
  
  // Professional accounting totals section (right-aligned grid)
  let totalY = doc.lastAutoTable.finalY + 8;
  const totalsStartX = pageWidth - 90; // Start position for totals section
  const labelWidth = 45;
  const amountWidth = 45;
  
  const subtotal = filtered.reduce((s, i) => s + (i.unit * i.qty), 0);
  const vatAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + vatAmount;
  
  // Subtotal row
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setDrawColor(200, 200, 200); // Light gray border
  doc.setLineWidth(0.3);
  
  // Label cell
  doc.rect(totalsStartX, totalY - 5, labelWidth, 8);
  doc.text('Subtotal:', totalsStartX + 2, totalY);
  
  // Amount cell
  doc.rect(totalsStartX + labelWidth, totalY - 5, amountWidth, 8);
  doc.setFont(undefined, 'bold');
  doc.text(formatCurrency(subtotal, currency), totalsStartX + labelWidth + amountWidth - 3, totalY, { align: 'right' });
  
  // VAT row
  totalY += 8;
  doc.setFont(undefined, 'normal');
  doc.rect(totalsStartX, totalY - 5, labelWidth, 8);
  doc.text(`VAT (${taxRate}%):`, totalsStartX + 2, totalY);
  
  doc.rect(totalsStartX + labelWidth, totalY - 5, amountWidth, 8);
  doc.setFont(undefined, 'bold');
  doc.text(formatCurrency(vatAmount, currency), totalsStartX + labelWidth + amountWidth - 3, totalY, { align: 'right' });
  
  // Total row (highlighted)
  totalY += 8;
  doc.setFillColor(244, 124, 32); // Orange background
  doc.setDrawColor(244, 124, 32); // Orange border
  doc.setLineWidth(0.5);
  
  // Label cell with orange background
  doc.rect(totalsStartX, totalY - 5, labelWidth, 10, 'FD');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', totalsStartX + 2, totalY);
  
  // Amount cell with orange background
  doc.rect(totalsStartX + labelWidth, totalY - 5, amountWidth, 10, 'FD');
  doc.text(formatCurrency(grandTotal, currency), totalsStartX + labelWidth + amountWidth - 3, totalY, { align: 'right' });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  
  totalY += 10;
  
  // Banking details section
  totalY += 15;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('BANKING DETAILS:', marginLeft, totalY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  
  totalY += 5;
  doc.text(`Bank Name: ${banking.bankName}`, marginLeft, totalY);
  totalY += 4;
  doc.text(`Branch Name: ${banking.branchName}`, marginLeft, totalY);
  totalY += 4;
  doc.text(`Account Type: ${banking.accountType}`, marginLeft, totalY);
  totalY += 4;
  doc.text(`Account Number: ${banking.accountNumber}`, marginLeft, totalY);
  totalY += 4;
  doc.text(`Branch Code: ${banking.branchCode}`, marginLeft, totalY);
  
  // Terms and conditions
  totalY += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('TERMS AND CONDITIONS:', marginLeft, totalY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  
  totalY += 5;
  terms.forEach(term => {
    const lines = doc.splitTextToSize(term, pageWidth - marginLeft - marginRight - 10);
    doc.text(lines, marginLeft, totalY);
    totalY += lines.length * 3.5;
  });
  
  // Add footer to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter();
  }
  
  // Save the PDF
  const filename = invoiceNumber ? `Invoice_${invoiceNumber}.pdf` : `${safeName.replace(/\\s+/g, '_')}_Quote.pdf`;
  doc.save(filename);
};

// Export a quote as a data URI (async) suitable for emailing. Returns
// a string like 'data:application/pdf;base64,...' or null on failure.
export async function exportQuotePdfData(a) {
  try {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);
    const doc = new jsPDF();
    const structured = typeof a === 'object' && a && Array.isArray(a.items);

    const safeName = (structured ? (a.clientName || 'Quote') : (a?.trim?.() || 'Quote'));
    const items = structured ? (a.items || []) : (Array.isArray(a) ? a : []);
    const currency = structured ? (a.currency || 'R') : 'R';
    const taxRate = structured ? (typeof a.taxRate === 'number' ? a.taxRate : 0) : 0;
  // notes variable referenced in generateQuotePdf; not required here
    const paymentTerms = structured ? (a.paymentTerms || '') : '';

    doc.setFontSize(18);
    doc.text('CollEco Travel', 10, 18);
    doc.setFontSize(9);
    doc.text('hello@colleco.travel | +27 31 000 0000', 10, 24);
    doc.text('www.colleco.travel', 10, 28);
    doc.setFontSize(16);
    doc.text('🧾 Quotation', 150, 18, { align: 'right' });

    doc.setFontSize(12);
    doc.text(`Quote For: ${safeName}`, 10, 40);
    if (structured && a.clientEmail) doc.text(`Email: ${a.clientEmail}`, 10, 46);
    if (structured && a.clientPhone) doc.text(`Phone: ${a.clientPhone}`, 10, 52);

    const normalized = items.map(it => ({
      name: it.title || it.name || 'Item',
      description: it.description || it.subtitle || '',
      qty: (it.quantity !== undefined ? it.quantity : (it.qty !== undefined ? it.qty : 1)) || 1,
      unit: Number(it.unitPrice ?? it.price ?? 0) || 0,
    }));

    const rows = normalized.map((item, idx) => [idx + 1, `${item.name}${item.description ? '\n' + item.description : ''}`, item.qty, formatCurrency(item.unit, currency), formatCurrency(item.unit * item.qty, currency)]);

    autoTable(doc, { startY: 60, head: [['#', 'Item', 'Qty', 'Unit', 'Total']], body: rows });

    const subtotal = normalized.reduce((s, i) => s + (i.unit * i.qty), 0);
    const tax = taxRate ? (subtotal * (taxRate / 100)) : 0;
    const grandTotal = subtotal + tax;

    let y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.text(`Subtotal: ${formatCurrency(subtotal, currency)}`, 10, y); y += 6;
    if (taxRate) { doc.text(`Tax (${taxRate.toFixed(2)}%): ${formatCurrency(tax, currency)}`, 10, y); y += 6; }
    doc.setFontSize(13);
    doc.text(`Grand Total: ${formatCurrency(grandTotal, currency)}`, 10, y); y += 8;

    if (paymentTerms) {
      const p = doc.splitTextToSize(`Payment Terms: ${paymentTerms}`, 190);
      doc.setFontSize(10);
      doc.text(p, 10, y);
      y += p.length * 6;
    }

    // try add logo
    try {
      const dataUrl = await fetchImageDataUrl(LOGO_PATH);
      if (dataUrl) {
        try { doc.addImage(dataUrl, 'PNG', 150, 6, 36, 18); } catch (e) {}
      }
    } catch (e) {}

    // return data URI
    try {
      const dataUri = doc.output('datauristring');
      return dataUri;
    } catch (e) {
      // fallback to blob->base64
      try {
        const blob = doc.output('blob');
        const arrayBuffer = await blob.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const b64 = btoa(binary);
        return 'data:application/pdf;base64,' + b64;
      } catch (e2) {
        return null;
      }
    }
  } catch (e) {
    return null;
  }
}

export const generateItineraryPdf = async (name, items, ref) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  const doc = new jsPDF();
  const safeName = name?.trim() || "Itinerary";
  
  // Get page dimensions
  const pageWidth = doc.internal.pageSize.width || 210;
  const marginRight = 14;
  
  // Try to load logo
  const _logoDataUrl = await fetchImageDataUrl(LOGO_PATH);

  // Header with CollEco branding
  doc.setFontSize(20);
  doc.setTextColor(244, 124, 32); // CollEco Orange
  doc.text(COMPANY_INFO.name, 10, 18);
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text(COMPANY_INFO.tagline, 10, 23);
  doc.setFont(undefined, 'normal');
  
  doc.setFontSize(9);
  doc.text(`${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, 10, 28);
  doc.text(COMPANY_INFO.website, 10, 32);
  
  // Add logo if available
  if (_logoDataUrl) {
    try {
      const logoW = 40;
      const logoH = 40;
      const logoX = pageWidth - marginRight - logoW;
      doc.addImage(_logoDataUrl, 'PNG', logoX, 6, logoW, logoH);
    } catch (e) {
      /* logo add failed */
    }
  }
  
  // Exciting title banner with gradient effect
  doc.setFillColor(244, 124, 32); // Orange
  doc.rect(0, 35, pageWidth, 16, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont(undefined, 'bold');
  doc.text('🌴 YOUR ADVENTURE AWAITS! 🌴', pageWidth / 2, 44, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Client info box with excitement
  const clientBoxY = 58;
  doc.setFillColor(255, 248, 241); // Cream background
  doc.rect(10, clientBoxY, 95, 28, 'F');
  doc.setDrawColor(244, 124, 32); // Orange border
  doc.setLineWidth(0.8);
  doc.rect(10, clientBoxY, 95, 28);
  
  doc.setFontSize(9);
  doc.setTextColor(244, 124, 32);
  doc.setFont(undefined, 'bold');
  doc.text('✈️ PREPARED FOR:', 12, clientBoxY + 6);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(safeName, 12, clientBoxY + 12);
  doc.setFont(undefined, 'normal');
  
  doc.setFontSize(9);
  if (ref) {
    doc.setTextColor(100, 100, 100);
    doc.text(`Booking Ref: ${ref}`, 12, clientBoxY + 18);
  }
  doc.setTextColor(244, 124, 32);
  doc.text(`🗓️ Created: ${new Date().toLocaleDateString()}`, 12, clientBoxY + 24);
  doc.setTextColor(0, 0, 0);
  
  // Trip highlights box (right side)
  const highlightBoxX = 110;
  doc.setFillColor(230, 180, 34); // Gold
  doc.rect(highlightBoxX, clientBoxY, pageWidth - highlightBoxX - marginRight, 28, 'F');
  doc.setDrawColor(230, 180, 34);
  doc.setLineWidth(0.8);
  doc.rect(highlightBoxX, clientBoxY, pageWidth - highlightBoxX - marginRight, 28);
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('🎉 YOUR TRIP HIGHLIGHTS', highlightBoxX + 2, clientBoxY + 6);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(`📍 ${items.length} Amazing Experience${items.length !== 1 ? 's' : ''}`, highlightBoxX + 2, clientBoxY + 12);
  
  // Calculate trip duration
  const days = items.reduce((max, item) => {
    const day = item.day || 0;
    return day > max ? day : max;
  }, 0);
  if (days > 0) {
    doc.text(`🌞 ${days} Day${days !== 1 ? 's' : ''} of Adventure`, highlightBoxX + 2, clientBoxY + 18);
  }
  doc.text(`🏆 Unforgettable Memories`, highlightBoxX + 2, clientBoxY + 24);
  doc.setTextColor(0, 0, 0);
  
  // Group items by day for better organization
  const itemsByDay = {};
  items.forEach(item => {
    const day = item.day || 0;
    if (!itemsByDay[day]) itemsByDay[day] = [];
    itemsByDay[day].push(item);
  });
  
  let currentY = clientBoxY + 35;
  const sortedDays = Object.keys(itemsByDay).sort((a, b) => Number(a) - Number(b));
  
  // Generate day-by-day itinerary with exciting headings
  sortedDays.forEach((dayNum, dayIndex) => {
    const dayItems = itemsByDay[dayNum];
    const isFirstDay = dayIndex === 0;
    
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    // Day heading banner
    if (!isFirstDay || Number(dayNum) > 0) {
      doc.setFillColor(58, 44, 26); // Brand brown
      doc.rect(10, currentY, pageWidth - 24, 10, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      const dayLabel = Number(dayNum) > 0 ? `DAY ${dayNum}` : 'ADDITIONAL ACTIVITIES';
      doc.text(`🌟 ${dayLabel} 🌟`, pageWidth / 2, currentY + 7, { align: 'center' });
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      currentY += 12;
    }
    
    // Activities for this day
    dayItems.forEach((item, itemIndex) => {
      // Check page break for each activity
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      // Activity card with border
      const cardHeight = 20 + (item.description ? 8 : 0);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(12, currentY, pageWidth - 28, cardHeight);
      
      // Time badge (if available)
      const timeInfo = item.startTime || item.time || '';
      if (timeInfo) {
        doc.setFillColor(230, 180, 34); // Gold
        doc.rect(14, currentY + 2, 28, 6, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`⏰ ${timeInfo}`, 15, currentY + 5.5);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
      }
      
      // Activity name
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(244, 124, 32); // Orange
      const activityName = item.name || item.title || 'Activity';
      doc.text(activityName, 16, currentY + (timeInfo ? 12 : 6));
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Location
      const location = item.location || item.destination || '';
      if (location) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`📍 ${location}`, 16, currentY + (timeInfo ? 17 : 11));
        doc.setTextColor(0, 0, 0);
      }
      
      // Description
      if (item.description) {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(item.description, pageWidth - 36);
        doc.text(descLines, 16, currentY + (timeInfo ? 22 : 16));
        doc.setTextColor(0, 0, 0);
      }
      
      currentY += cardHeight + 3;
    });
    
    currentY += 2; // Space after day section
  });
  
  // Footer with excitement and contact info
  let footerY = currentY + 8;
  
  // Check if footer fits on current page
  if (footerY > 250) {
    doc.addPage();
    footerY = 20;
  }
  
  // Decorative line
  doc.setDrawColor(244, 124, 32); // Orange
  doc.setLineWidth(1);
  doc.line(10, footerY, pageWidth - marginRight, footerY);
  
  footerY += 8;
  
  // Important information section with icons
  doc.setFillColor(255, 248, 241); // Cream
  doc.rect(10, footerY, pageWidth - 24, 26, 'F');
  doc.setDrawColor(230, 180, 34); // Gold
  doc.setLineWidth(0.5);
  doc.rect(10, footerY, pageWidth - 24, 26);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(244, 124, 32);
  doc.text('✨ IMPORTANT TRAVEL TIPS ✨', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(8);
  doc.text('⏰ Arrive 15 minutes early for all scheduled activities', 12, footerY + 10);
  doc.text('📧 Keep your confirmation email handy', 12, footerY + 14);
  doc.text('🆔 Bring valid ID and booking reference', 12, footerY + 18);
  doc.text('📞 Contact us anytime for assistance or changes', 12, footerY + 22);
  
  footerY += 30;
  
  // Contact banner
  doc.setFillColor(58, 44, 26); // Brown
  doc.rect(10, footerY, pageWidth - 24, 14, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('📞 24/7 SUPPORT:', 12, footerY + 5);
  doc.setFont(undefined, 'normal');
  doc.text(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, 12, footerY + 10);
  
  // Timestamp and branding
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated with ❤️ by ${COMPANY_INFO.name} | ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`${safeName.replace(/\s+/g, "_")}_Itinerary.pdf`);
};

// Invoice PDF generator
// Accepts either structured invoice object or (name, items, ref)
export const generateInvoicePdf = async (a, b, c) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  const doc = new jsPDF();
  const structured = typeof a === 'object' && a && Array.isArray(a.items);

  let invoiceNum = '';
  let safeName = 'Invoice';
  let items = [];
  let ref = c || '';
  let currency = 'R';
  let taxRate = 0;
  let notes = '';
  let dueDate;

  if (structured) {
    invoiceNum = a.invoiceNumber || a.number || '';
    safeName = (a.clientName || 'Client').trim();
    items = a.items || [];
    ref = a.id || a.reference || ref;
    currency = a.currency || currency;
    taxRate = typeof a.taxRate === 'number' ? a.taxRate : 0;
    notes = a.notes || '';
    dueDate = a.dueDate;
  } else {
    safeName = (a?.trim?.() || 'Client');
    items = b || [];
    ref = c || '';
  }

  const normalized = items.map(it => ({
    name: it.title || it.name || 'Item',
    desc: it.description || it.subtitle || '',
    qty: Number(it.quantity ?? it.qty ?? 1) || 1,
    unit: Number(it.unitPrice ?? it.price ?? it.amount ?? 0) || 0,
  }));

  doc.setFontSize(20);
  doc.text('💳 CollEco Travel – Invoice', 10, 18);
  doc.setFontSize(12);
  doc.text(`Invoice To: ${safeName}`, 10, 28);
  if (invoiceNum) doc.text(`Invoice #: ${invoiceNum}`, 10, 34);
  if (ref) doc.text(`Ref: ${ref}`, 10, 40);
  if (dueDate) doc.text(`Due: ${new Date(dueDate).toLocaleDateString()}`, 10, 46);

  const rows = normalized.map((it, idx) => [idx + 1, it.name, it.qty, formatCurrency(it.unit, currency), formatCurrency(it.unit * it.qty, currency)]);

  autoTable(doc, {
    startY: 54,
    head: [['#', 'Item', 'Qty', 'Unit', 'Total']],
    body: rows,
  });

  const subtotal = normalized.reduce((s, i) => s + (i.unit * i.qty), 0);
  const tax = taxRate ? (subtotal * (taxRate / 100)) : 0;
  const grandTotal = subtotal + tax;

  let y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.text(`Subtotal: ${formatCurrency(subtotal, currency)}`, 10, y); y += 6;
  if (taxRate) { doc.text(`Tax (${taxRate.toFixed(2)}%): ${formatCurrency(tax, currency)}`, 10, y); y += 6; }
  doc.setFontSize(13);
  doc.text(`Amount Due: ${formatCurrency(grandTotal, currency)}`, 10, y); y += 8;

  if (notes) {
    const split = doc.splitTextToSize(`Notes: ${notes}`, 190);
    doc.setFontSize(10);
    doc.text(split, 10, y);
  }

  // Add logo (if available) and then save asynchronously
  (async () => {
    try {
      const dataUrl = await fetchImageDataUrl(LOGO_PATH);
      if (dataUrl) {
        try { doc.addImage(dataUrl, 'PNG', 150, 6, 36, 18); } catch (e) { /* ignore */ }
      }
    } catch (e) {}
    doc.save(`${(invoiceNum || safeName).toString().replace(/\s+/g, '_')}_Invoice.pdf`);
  })();
};

// ============================================================================
// BLOB-RETURNING VERSIONS FOR SHARING
// These return Blob objects instead of auto-downloading
// Used by pdfShare.js for Web Share API compatibility
// ============================================================================

/**
 * Generate itinerary PDF and return as Blob (for sharing)
 * @param {string} name - Traveler name
 * @param {Array} items - Itinerary items
 * @param {string} ref - Booking reference
 * @returns {Promise<Blob>} PDF blob
 */
export const generateItineraryPdfBlob = async (name, items, ref) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  const doc = new jsPDF();
  const safeName = name?.trim() || "Itinerary";
  
  // Get page dimensions
  const pageWidth = doc.internal.pageSize.width || 210;
  const marginRight = 14;
  
  // Try to load logo
  const _logoDataUrl = await fetchImageDataUrl(LOGO_PATH);

  // Header with CollEco branding
  doc.setFontSize(20);
  doc.setTextColor(244, 124, 32); // CollEco Orange
  doc.text(COMPANY_INFO.name, 10, 18);
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text(COMPANY_INFO.tagline, 10, 23);
  doc.setFont(undefined, 'normal');
  
  doc.setFontSize(9);
  doc.text(`${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, 10, 28);
  doc.text(COMPANY_INFO.website, 10, 32);
  
  // Add logo if available
  if (_logoDataUrl) {
    try {
      const logoW = 40;
      const logoH = 40;
      const logoX = pageWidth - marginRight - logoW;
      doc.addImage(_logoDataUrl, 'PNG', logoX, 6, logoW, logoH);
    } catch (e) {
      /* logo add failed */
    }
  }
  
  // Exciting title banner with gradient effect
  doc.setFillColor(244, 124, 32); // Orange
  doc.rect(0, 35, pageWidth, 16, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont(undefined, 'bold');
  doc.text('🌴 YOUR ADVENTURE AWAITS! 🌴', pageWidth / 2, 44, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Client info box with excitement
  const clientBoxY = 58;
  doc.setFillColor(255, 248, 241); // Cream background
  doc.rect(10, clientBoxY, 95, 28, 'F');
  doc.setDrawColor(244, 124, 32); // Orange border
  doc.setLineWidth(0.8);
  doc.rect(10, clientBoxY, 95, 28);
  
  doc.setFontSize(9);
  doc.setTextColor(244, 124, 32);
  doc.setFont(undefined, 'bold');
  doc.text('✈️ PREPARED FOR:', 12, clientBoxY + 6);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(safeName, 12, clientBoxY + 12);
  doc.setFont(undefined, 'normal');
  
  doc.setFontSize(9);
  if (ref) {
    doc.setTextColor(100, 100, 100);
    doc.text(`Booking Ref: ${ref}`, 12, clientBoxY + 18);
  }
  doc.setTextColor(244, 124, 32);
  doc.text(`🗓️ Created: ${new Date().toLocaleDateString()}`, 12, clientBoxY + 24);
  doc.setTextColor(0, 0, 0);
  
  // Trip highlights box (right side)
  const highlightBoxX = 110;
  doc.setFillColor(230, 180, 34); // Gold
  doc.rect(highlightBoxX, clientBoxY, pageWidth - highlightBoxX - marginRight, 28, 'F');
  doc.setDrawColor(230, 180, 34);
  doc.setLineWidth(0.8);
  doc.rect(highlightBoxX, clientBoxY, pageWidth - highlightBoxX - marginRight, 28);
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('🎉 YOUR TRIP HIGHLIGHTS', highlightBoxX + 2, clientBoxY + 6);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(`📍 ${items.length} Amazing Experience${items.length !== 1 ? 's' : ''}`, highlightBoxX + 2, clientBoxY + 12);
  
  // Calculate trip duration
  const days = items.reduce((max, item) => {
    const day = item.day || 0;
    return day > max ? day : max;
  }, 0);
  if (days > 0) {
    doc.text(`🌞 ${days} Day${days !== 1 ? 's' : ''} of Adventure`, highlightBoxX + 2, clientBoxY + 18);
  }
  doc.text(`🏆 Unforgettable Memories`, highlightBoxX + 2, clientBoxY + 24);
  doc.setTextColor(0, 0, 0);
  
  // Group items by day for better organization
  const itemsByDay = {};
  items.forEach(item => {
    const day = item.day || 0;
    if (!itemsByDay[day]) itemsByDay[day] = [];
    itemsByDay[day].push(item);
  });
  
  let currentY = clientBoxY + 35;
  const sortedDays = Object.keys(itemsByDay).sort((a, b) => Number(a) - Number(b));
  
  // Generate day-by-day itinerary with exciting headings
  sortedDays.forEach((dayNum, dayIndex) => {
    const dayItems = itemsByDay[dayNum];
    const isFirstDay = dayIndex === 0;
    
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    // Day heading banner
    if (!isFirstDay || Number(dayNum) > 0) {
      doc.setFillColor(58, 44, 26); // Brand brown
      doc.rect(10, currentY, pageWidth - 24, 10, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      const dayLabel = Number(dayNum) > 0 ? `DAY ${dayNum}` : 'ADDITIONAL ACTIVITIES';
      doc.text(`🌟 ${dayLabel} 🌟`, pageWidth / 2, currentY + 7, { align: 'center' });
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      currentY += 12;
    }
    
    // Activities for this day
    dayItems.forEach((item, itemIndex) => {
      // Check page break for each activity
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      // Activity card with border
      const cardHeight = 20 + (item.description ? 8 : 0);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(12, currentY, pageWidth - 28, cardHeight);
      
      // Time badge (if available)
      const timeInfo = item.startTime || item.time || '';
      if (timeInfo) {
        doc.setFillColor(230, 180, 34); // Gold
        doc.rect(14, currentY + 2, 28, 6, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`⏰ ${timeInfo}`, 15, currentY + 5.5);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
      }
      
      // Activity name
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(244, 124, 32); // Orange
      const activityName = item.name || item.title || 'Activity';
      doc.text(activityName, 16, currentY + (timeInfo ? 12 : 6));
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Location
      const location = item.location || item.destination || '';
      if (location) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`📍 ${location}`, 16, currentY + (timeInfo ? 17 : 11));
        doc.setTextColor(0, 0, 0);
      }
      
      // Description
      if (item.description) {
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(item.description, pageWidth - 36);
        doc.text(descLines, 16, currentY + (timeInfo ? 22 : 16));
        doc.setTextColor(0, 0, 0);
      }
      
      currentY += cardHeight + 3;
    });
    
    currentY += 2; // Space after day section
  });
  
  // Footer with excitement and contact info
  let footerY = currentY + 8;
  
  // Check if footer fits on current page
  if (footerY > 250) {
    doc.addPage();
    footerY = 20;
  }
  
  // Decorative line
  doc.setDrawColor(244, 124, 32); // Orange
  doc.setLineWidth(1);
  doc.line(10, footerY, pageWidth - marginRight, footerY);
  
  footerY += 8;
  
  // Important information section with icons
  doc.setFillColor(255, 248, 241); // Cream
  doc.rect(10, footerY, pageWidth - 24, 26, 'F');
  doc.setDrawColor(230, 180, 34); // Gold
  doc.setLineWidth(0.5);
  doc.rect(10, footerY, pageWidth - 24, 26);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(244, 124, 32);
  doc.text('✨ IMPORTANT TRAVEL TIPS ✨', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(8);
  doc.text('⏰ Arrive 15 minutes early for all scheduled activities', 12, footerY + 10);
  doc.text('📧 Keep your confirmation email handy', 12, footerY + 14);
  doc.text('🆔 Bring valid ID and booking reference', 12, footerY + 18);
  doc.text('📞 Contact us anytime for assistance or changes', 12, footerY + 22);
  
  footerY += 30;
  
  // Contact banner
  doc.setFillColor(58, 44, 26); // Brown
  doc.rect(10, footerY, pageWidth - 24, 14, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('📞 24/7 SUPPORT:', 12, footerY + 5);
  doc.setFont(undefined, 'normal');
  doc.text(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, 12, footerY + 10);
  
  // Timestamp and branding
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated with ❤️ by ${COMPANY_INFO.name} | ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Return as Blob instead of saving
  return doc.output('blob');
};

/**
 * Generate invoice PDF and return as Blob (for sharing)
 */
export const generateInvoicePdfBlob = async (a, b, c) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  const doc = new jsPDF();
  const structured = typeof a === 'object' && a && Array.isArray(a.items);

  let invoiceNum = '';
  let safeName = 'Invoice';
  let items = [];
  let ref = c || '';
  let currency = 'R';
  let taxRate = 0;
  let notes = '';
  let dueDate;

  if (structured) {
    invoiceNum = a.invoiceNumber || a.number || '';
    safeName = (a.clientName || 'Client').trim();
    items = a.items || [];
    ref = a.id || a.reference || ref;
    currency = a.currency || currency;
    taxRate = typeof a.taxRate === 'number' ? a.taxRate : 0;
    notes = a.notes || '';
    dueDate = a.dueDate;
  } else {
    safeName = (a?.trim?.() || 'Client');
    items = b || [];
    ref = c || '';
  }

  const normalized = items.map(it => ({
    name: it.title || it.name || 'Item',
    desc: it.description || it.subtitle || '',
    qty: Number(it.quantity ?? it.qty ?? 1) || 1,
    unit: Number(it.unitPrice ?? it.price ?? it.amount ?? 0) || 0,
  }));

  doc.setFontSize(20);
  doc.text('💳 CollEco Travel – Invoice', 10, 18);
  doc.setFontSize(12);
  doc.text(`Invoice To: ${safeName}`, 10, 28);
  if (invoiceNum) doc.text(`Invoice #: ${invoiceNum}`, 10, 34);
  if (ref) doc.text(`Ref: ${ref}`, 10, 40);
  if (dueDate) doc.text(`Due: ${new Date(dueDate).toLocaleDateString()}`, 10, 46);

  const rows = normalized.map((it, idx) => [idx + 1, it.name, it.qty, formatCurrency(it.unit, currency), formatCurrency(it.unit * it.qty, currency)]);

  autoTable(doc, {
    startY: 54,
    head: [['#', 'Item', 'Qty', 'Unit', 'Total']],
    body: rows,
  });

  const subtotal = normalized.reduce((s, i) => s + (i.unit * i.qty), 0);
  const tax = taxRate ? (subtotal * (taxRate / 100)) : 0;
  const grandTotal = subtotal + tax;

  let y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.text(`Subtotal: ${formatCurrency(subtotal, currency)}`, 10, y); y += 6;
  if (taxRate) { doc.text(`Tax (${taxRate.toFixed(2)}%): ${formatCurrency(tax, currency)}`, 10, y); y += 6; }
  doc.setFontSize(13);
  doc.text(`Amount Due: ${formatCurrency(grandTotal, currency)}`, 10, y); y += 8;

  if (notes) {
    const split = doc.splitTextToSize(`Notes: ${notes}`, 190);
    doc.setFontSize(10);
    doc.text(split, 10, y);
  }

  // Add logo if available
  try {
    const dataUrl = await fetchImageDataUrl(LOGO_PATH);
    if (dataUrl) {
      try { doc.addImage(dataUrl, 'PNG', 150, 6, 36, 18); } catch (e) { /* ignore */ }
    }
  } catch (e) {}

  // Return as Blob instead of saving
  return doc.output('blob');
};

/**
 * Generate booking confirmation PDF and return as Blob (for sharing)
 */
export const generateBookingConfirmationPdfBlob = async (bookingData) => {
  const [{ default: jsPDF }] = await Promise.all([import("jspdf")]);
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.width || 210;
  const marginRight = 14;
  
  // Try to load logo
  const _logoDataUrl = await fetchImageDataUrl(LOGO_PATH);
  
  // Header with CollEco branding
  doc.setFontSize(20);
  doc.setTextColor(244, 124, 32);
  doc.text(COMPANY_INFO.name, 10, 18);
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text(COMPANY_INFO.tagline, 10, 23);
  doc.setFont(undefined, 'normal');
  
  doc.setFontSize(9);
  doc.text(`${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, 10, 28);
  
  // Add logo
  if (_logoDataUrl) {
    try {
      const logoW = 40;
      const logoH = 40;
      const logoX = pageWidth - marginRight - logoW;
      doc.addImage(_logoDataUrl, 'PNG', logoX, 6, logoW, logoH);
    } catch (e) {}
  }
  
  // Confirmation banner
  doc.setFillColor(46, 125, 50); // Green
  doc.rect(0, 35, pageWidth, 16, 'F');
  
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('✅ BOOKING CONFIRMED', pageWidth / 2, 44, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Confirmation details
  let currentY = 60;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Confirmation Number:', 10, currentY);
  doc.setFont(undefined, 'normal');
  doc.text(bookingData.confirmationId || bookingData.id || 'N/A', 70, currentY);
  
  currentY += 7;
  doc.setFont(undefined, 'bold');
  doc.text('Booking ID:', 10, currentY);
  doc.setFont(undefined, 'normal');
  doc.text(bookingData.bookingId || bookingData.id || 'N/A', 70, currentY);
  
  currentY += 7;
  doc.setFont(undefined, 'bold');
  doc.text('Service Type:', 10, currentY);
  doc.setFont(undefined, 'normal');
  doc.text(bookingData.serviceType || 'Travel Service', 70, currentY);
  
  currentY += 7;
  doc.setFont(undefined, 'bold');
  doc.text('Booked On:', 10, currentY);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleString(), 70, currentY);
  
  // Booking details section
  currentY += 15;
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(244, 124, 32);
  doc.text('Booking Details', 10, currentY);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  
  currentY += 8;
  doc.setFontSize(10);
  
  // Add custom booking details if provided
  if (bookingData.details) {
    Object.entries(bookingData.details).forEach(([key, value]) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(`${key}:`, 12, currentY);
      doc.setFont(undefined, 'normal');
      doc.text(String(value), 70, currentY);
      currentY += 6;
    });
  }
  
  // Footer
  currentY += 10;
  if (currentY > 260) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setDrawColor(244, 124, 32);
  doc.setLineWidth(0.5);
  doc.line(10, currentY, pageWidth - marginRight, currentY);
  
  currentY += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Thank you for choosing CollEco Travel!', pageWidth / 2, currentY, { align: 'center' });
  doc.setFont(undefined, 'normal');
  
  currentY += 6;
  doc.setFontSize(8);
  doc.text(`For assistance: ${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 5;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(7);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, currentY, { align: 'center' });
  
  // Return as Blob
  return doc.output('blob');
};
