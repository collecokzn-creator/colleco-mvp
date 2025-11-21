// --- Sample Quote PDF Generator ---
export function generateTestPDF() {
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from './currency';

// Public path to the logo in the `public/assets` folder  
const LOGO_PATH = '/src/assets/colleco-logo.png';

// CollEco Travel Company Details
const COMPANY_INFO = {
  name: 'CollEco Travel',
  tagline: 'The Odyssey of Adventure',
  email: 'hello@travelcolleco.com',
  phone: '+27 31 000 0000',
  website: 'www.travelcolleco.com',
  address: 'Durban, KwaZulu-Natal, South Africa',
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
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(pkg.title || "CollEco Package", 20, 30);
  doc.setFontSize(12);
  doc.text(`Price: R${pkg.price || 0}`, 20, 45);
  doc.text(`Ref: ${pkg.id || ""}`, 20, 55);
  doc.save(`${(pkg.title || "package").replace(/\s+/g, "_")}_flyer.pdf`);
}

// Enhanced Quote PDF generator (backward compatible)
// Usage patterns supported:
// 1) generateQuotePdf(name, items, ref, showAllInQuote)
//    where items = [{ name, price, qty }]
// 2) generateQuotePdf(quoteObject)
//    where quoteObject = { clientName, currency, taxRate, status, notes, items:[{title, description, unitPrice, quantity, category}], createdAt, updatedAt }
export const generateQuotePdf = (a, b, c, d) => {
  const doc = new jsPDF();

  // Detect structured object form
  const structured = typeof a === 'object' && a && Array.isArray(a.items) && (a.currency || a.taxRate !== undefined);

  let safeName;
  let items;
  let ref;
  let showAllInQuote;
  let currency = 'R'; // legacy default (Rand) from earlier implementation
  let taxRate = 0;
  let status = 'Draft';
  let notes = '';
  let createdAt;
  let updatedAt;

  if (structured) {
    safeName = (a.clientName || 'Quote').trim();
    items = a.items || [];
    ref = a.id || a.reference || '';
    showAllInQuote = true; // always include all structured items
    currency = a.currency || currency;
    taxRate = typeof a.taxRate === 'number' ? a.taxRate : 0;
    status = a.status || status;
    notes = a.notes || '';
    createdAt = a.createdAt;
    updatedAt = a.updatedAt;
    // additional structured fields
  var clientPhone = a.clientPhone || a.phone || '';
  var quoteNumber = a.quoteNumber || a.referenceNumber || a.number || '';
  var paymentTerms = a.paymentTerms || a.paymentInstructions || '';
  var validity = a.validUntil || a.validity || a.validityDays || '';
  var travelInfo = a.travelInfo || a.bookingDetails || null;
  } else {
    safeName = (a?.trim?.() || 'Quote');
    items = b || [];
    ref = c;
    showAllInQuote = d;
  }

  // Normalise items for table rendering
  const normalized = items.map(it => {
    return {
      name: it.title || it.name || 'Item',
      description: it.description || it.subtitle || '',
      qty: (it.quantity !== undefined ? it.quantity : (it.qty !== undefined ? it.qty : 1)) || 1,
      unit: (it.unitPrice !== undefined ? it.unitPrice : (it.price !== undefined ? it.price : 0)) || 0,
      category: it.category || '',
    };
  });

  const filtered = showAllInQuote ? normalized : normalized.filter(i => i.unit);

  doc.setFontSize(20);
  // Header: Brand + contact (logo will be loaded and added asynchronously below)
  doc.setFontSize(20);
  doc.setTextColor(244, 124, 32); // CollEco Orange
  doc.text(COMPANY_INFO.name, 10, 18);
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text(COMPANY_INFO.tagline, 10, 23);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(`${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, 10, 28);
  doc.text(COMPANY_INFO.website, 10, 32);

  // Header title and metadata (reserve right area for logo)
  const pageWidth = (doc.internal && doc.internal.pageSize && (doc.internal.pageSize.width || doc.internal.pageSize.getWidth())) || 210;
  const marginRight = 14;
  const logoW = 40;
  const logoH = 40;
  const logoX = pageWidth - marginRight - logoW; // where logo's left edge will be
  const metaX = logoX - 6; // align-right position for metadata (keeps clear of logo)

  // Quotation Title with orange color
  doc.setFontSize(18);
  doc.setTextColor(244, 124, 32); // CollEco Orange
  doc.text('QUOTATION', metaX, 18, { align: 'right' });
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFontSize(10);
  doc.setFontSize(11);
  // Quote metadata block on the right — always display date and a reference/number fallback
  const displayDate = createdAt ? new Date(createdAt) : new Date();
  if (structured) {
    const qnum = quoteNumber || ref || 'DRAFT';
    doc.text(`Quote #: ${qnum}`, metaX, 26, { align: 'right' });
    doc.text(`Date: ${displayDate.toLocaleDateString()}`, metaX, 32, { align: 'right' });
    doc.text(`Status: ${status.toUpperCase()}`, metaX, 38, { align: 'right' });
    if (validity) {
      const vtext = typeof validity === 'number' ? `Valid for ${validity} days` : `Valid until ${validity}`;
      doc.text(vtext, metaX, 44, { align: 'right' });
    }
  } else {
    if (ref) doc.text(`Reference: ${ref}`, metaX, 26, { align: 'right' });
    doc.text(`Date: ${displayDate.toLocaleDateString()}`, metaX, 32, { align: 'right' });
  }

  // Client Information Box with border
  const clientBoxY = 50;
  doc.setDrawColor(244, 124, 32); // Orange border
  doc.setLineWidth(0.5);
  doc.rect(10, clientBoxY, 90, 25); // Client info box
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('BILL TO:', 12, clientBoxY + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text(safeName, 12, clientBoxY + 10);
  if (structured && typeof clientPhone === 'string' && clientPhone) doc.text(`Phone: ${clientPhone}`, 12, clientBoxY + 15);
  if (structured && a.clientEmail) doc.text(`Email: ${a.clientEmail}`, 12, clientBoxY + 20);

  // Notes section if available
  let notesHeight = 0;
  if (structured && notes) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 12, clientBoxY + 28);
    doc.setFont(undefined, 'normal');
    const split = doc.splitTextToSize(notes, 180);
    doc.text(split, 12, clientBoxY + 33);
    notesHeight = split.length * 4;
  }

  // Determine starting Y after optional notes block
  let startY = clientBoxY + 30 + notesHeight;

  // Include richer service details: description and booking attributes
  const rows = filtered.map((item, idx) => {
    const details = [];
    if (item.description) details.push(item.description);
    if (item.destination) details.push(`Dest: ${item.destination}`);
    if (item.startDate || item.endDate) details.push(`Dates: ${item.startDate||''} - ${item.endDate||''}`);
    if (item.roomType) details.push(`Room: ${item.roomType}`);
    const itemLabel = `${item.name}${details.length ? '\n' + details.join(' | ') : ''}`;
    return [idx + 1, itemLabel, item.qty, formatCurrency(item.unit, currency), formatCurrency(item.unit * item.qty, currency)];
  });

  autoTable(doc, {
    startY,
    head: [["#", "Item", "Qty", "Unit Price", "Total"]],
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
      0: { cellWidth: 10 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 }
    }
  });

  const subtotal = filtered.reduce((s, i) => s + (i.unit * i.qty), 0);
  const tax = taxRate ? (subtotal * (taxRate / 100)) : 0;
  const grandTotal = subtotal + tax;

  // Totals section with right alignment
  let y = doc.lastAutoTable.finalY + 10;
  const totalsX = pageWidth - marginRight - 60;
  
  doc.setFontSize(11);
  doc.text('Subtotal:', totalsX, y);
  doc.text(formatCurrency(subtotal, currency), pageWidth - marginRight, y, { align: 'right' });
  y += 6;
  
  if (taxRate) {
    doc.text(`Tax (${taxRate.toFixed(2)}%):`, totalsX, y);
    doc.text(formatCurrency(tax, currency), pageWidth - marginRight, y, { align: 'right' });
    y += 6;
  }
  
  // Grand total with orange background
  doc.setFillColor(244, 124, 32); // Orange
  doc.rect(totalsX - 5, y - 5, 70, 8, 'F');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', totalsX, y);
  doc.text(formatCurrency(grandTotal, currency), pageWidth - marginRight, y, { align: 'right' });
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFont(undefined, 'normal');
  y += 12;

  // Footer section with payment terms and contact
  const footerY = pageWidth > 250 ? 250 : pageWidth - 40; // Position near bottom
  
  // Separator line
  doc.setDrawColor(230, 180, 34); // Gold
  doc.setLineWidth(0.3);
  doc.line(10, y, pageWidth - marginRight, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('PAYMENT TERMS:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 4;
  if (paymentTerms) {
    const p = doc.splitTextToSize(paymentTerms, 190);
    doc.text(p, 10, y);
    y += p.length * 4;
  } else {
    doc.text('• 50% deposit required to confirm booking', 10, y); y += 4;
    doc.text('• Balance due 14 days before travel date', 10, y); y += 4;
    doc.text('• Accepted payment methods: Bank transfer, Credit card', 10, y); y += 4;
  }
  
  y += 4;
  doc.setFont(undefined, 'bold');
  doc.text('CONTACT US:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 4;
  doc.text(`Email: ${COMPANY_INFO.email}`, 10, y); y += 4;
  doc.text(`Phone: ${COMPANY_INFO.phone}`, 10, y); y += 4;
  doc.text(`Website: ${COMPANY_INFO.website}`, 10, y);
  
  // Timestamps at bottom
  if (structured) {
    y += 6;
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    if (createdAt) doc.text(`Created: ${new Date(createdAt).toLocaleString()}`, 10, y);
    if (updatedAt) doc.text(`Last updated: ${new Date(updatedAt).toLocaleString()}`, 10, y + 3);
    doc.setTextColor(0, 0, 0);
  }

  // If travel/booking info is available, show a small booking reference line
  if (travelInfo) {
    y += 6;
    try {
      const bookingRef = travelInfo.reference || travelInfo.id || travelInfo.bookingRef || '';
      if (bookingRef) {
        doc.setFontSize(9);
        doc.text(`Booking Reference: ${bookingRef}`, 10, y);
      }
    } catch (e) {}
  }

  // Add logo image (if available) then save. Add image synchronously here (await the fetch)
  // fetch image but do not block: attach then/catch and save once done (matches previous behaviour)
  fetchImageDataUrl(LOGO_PATH).then((dataUrl) => {
    if (dataUrl) {
      try { doc.addImage(dataUrl, 'PNG', logoX, 6, logoW, logoH); } catch (e) { /* ignore image add errors */ }
    }
  }).catch(() => {/* ignore */}).finally(() => {
    doc.save(`${safeName.replace(/\s+/g, '_')}_Quote.pdf`);
  });
};

// Export a quote as a data URI (async) suitable for emailing. Returns
// a string like 'data:application/pdf;base64,...' or null on failure.
export async function exportQuotePdfData(a) {
  try {
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
  const doc = new jsPDF();
  const safeName = name?.trim() || "Itinerary";
  
  // Get page dimensions
  const pageWidth = doc.internal.pageSize.width || 210;
  const marginRight = 14;
  
  // Try to load logo
  const logoDataUrl = await fetchImageDataUrl(LOGO_PATH);

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
  if (logoDataUrl) {
    try {
      const logoW = 40;
      const logoH = 40;
      const logoX = pageWidth - marginRight - logoW;
      doc.addImage(logoDataUrl, 'PNG', logoX, 6, logoW, logoH);
    } catch (e) {
      console.warn('Logo add failed:', e);
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
export const generateInvoicePdf = (a, b, c) => {
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
