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
const LOGO_PATH = '/src/assets/colleco-logo.png';

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
    cream: '#FFF8F1'
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
  
  // Use custom logo if provided
  const customLogoData = a.customLogo || null;
  
  // Helper function to add CollEco header
  const addHeader = () => {
    // Add custom logo if available (top right corner)
    if (customLogoData) {
      try {
        const logoW = 45;
        const logoH = 20;
        const logoX = pageWidth - marginRight - logoW;
        doc.addImage(customLogoData, 'PNG', logoX, 8, logoW, logoH);
      } catch (e) {
        console.warn('Custom logo add failed:', e);
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
  
  // Items table
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
    head: [['ITEM NUMBER', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL PRICE']],
    body: rows,
    theme: 'grid',
    margin: { left: 14, right: 14 }, // Consistent margins
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 9,
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    didDrawPage: (data) => {
      // Add header on each new page
      if (data.pageNumber > 1) {
        addHeader();
      }
    }
  });
  
  // Totals section (right-aligned)
  let totalY = doc.lastAutoTable.finalY + 10;
  const totalsX = pageWidth - 70;
  
  const subtotal = filtered.reduce((s, i) => s + (i.unit * i.qty), 0);
  const vatAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + vatAmount;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  
  // Cost price row
  doc.text('COST PRICE', totalsX - 40, totalY);
  doc.rect(totalsX, totalY - 4, 60, 7);
  doc.text(formatCurrency(subtotal, currency), totalsX + 55, totalY, { align: 'right' });
  
  // VAT row
  totalY += 7;
  doc.text(`VAT (${taxRate}%)`, totalsX - 40, totalY);
  doc.rect(totalsX, totalY - 4, 60, 7);
  doc.text(formatCurrency(vatAmount, currency), totalsX + 55, totalY, { align: 'right' });
  
  // Total row
  totalY += 7;
  doc.text('TOTAL COST', totalsX - 40, totalY);
  doc.rect(totalsX, totalY - 4, 60, 7);
  doc.text(formatCurrency(grandTotal, currency), totalsX + 55, totalY, { align: 'right' });
  
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
  
  // Itinerary title
  doc.setFontSize(18);
  doc.setTextColor(244, 124, 32);
  doc.text('TRAVEL ITINERARY', pageWidth - marginRight, 18, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Client info box
  const clientBoxY = 45;
  doc.setDrawColor(244, 124, 32);
  doc.setLineWidth(0.5);
  doc.rect(10, clientBoxY, 90, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('TRAVELER:', 12, clientBoxY + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text(safeName, 12, clientBoxY + 10);
  if (ref) doc.text(`Reference: ${ref}`, 12, clientBoxY + 15);
  
  // Date and reference info (right side)
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - marginRight, clientBoxY + 5, { align: 'right' });
  
  // Itinerary table
  const rows = items.map((item, idx) => {
    const dayInfo = item.day ? `Day ${item.day}` : '';
    const timeInfo = item.startTime || item.time || '';
    const location = item.location || item.destination || '';
    
    return [
      idx + 1,
      dayInfo,
      timeInfo,
      item.name || item.title || 'Activity',
      location,
      item.description || ''
    ];
  });

  autoTable(doc, {
    startY: clientBoxY + 25,
    head: [["#", "Day", "Time", "Activity", "Location", "Details"]],
    body: rows,
    headStyles: {
      fillColor: [244, 124, 32], // CollEco Orange
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [255, 248, 241] // Cream
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 15 },
      2: { cellWidth: 20 },
      3: { cellWidth: 40 },
      4: { cellWidth: 30 },
      5: { cellWidth: 'auto', cellPadding: 2 }
    },
    didParseCell: function (data) {
      if (data.column.index === 5) {
        data.cell.styles.cellWidth = "wrap";
      }
    },
  });
  
  // Footer
  let y = doc.lastAutoTable.finalY + 10;
  doc.setDrawColor(230, 180, 34); // Gold
  doc.setLineWidth(0.3);
  doc.line(10, y, pageWidth - marginRight, y);
  
  y += 6;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('IMPORTANT INFORMATION:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 4;
  doc.text('• Please arrive 15 minutes before scheduled activities', 10, y); y += 4;
  doc.text('• Bring confirmation email and valid ID', 10, y); y += 4;
  doc.text('• Contact us for any changes or assistance', 10, y); y += 6;
  
  doc.setFont(undefined, 'bold');
  doc.text('CONTACT US:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 4;
  doc.text(`Email: ${COMPANY_INFO.email} | Phone: ${COMPANY_INFO.phone}`, 10, y);
  
  // Timestamp
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 10, y);
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
