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
import { formatCurrency } from 'file://C:/Users/Bika Collin MKhize/OneDrive/Documents/GitHub/colleco-mvp/src/utils/currency.js';

// Public path to the logo in the `public/assets` folder
const LOGO_PATH = '/assets/colleco-logo.png';

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
  doc.setFontSize(18);
  doc.text('CollEco Travel', 10, 18);
  doc.setFontSize(9);
  doc.text('hello@colleco.travel | +27 31 000 0000', 10, 24);
  doc.text('www.colleco.travel', 10, 28);

  doc.setFontSize(16);
  doc.text('🧾 Quotation', 150, 18, { align: 'right' });
  doc.setFontSize(11);
  // Quote metadata block on the right
  if (structured) {
    if (quoteNumber) doc.text(`Quote #: ${quoteNumber}`, 150, 26, { align: 'right' });
    if (createdAt) doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, 150, 32, { align: 'right' });
    if (validity) {
      const vtext = typeof validity === 'number' ? `Valid for ${validity} days` : `Valid until ${validity}`;
      doc.text(vtext, 150, 38, { align: 'right' });
    }
  } else {
    if (ref) doc.text(`Reference: ${ref}`, 150, 26, { align: 'right' });
  }

  doc.setFontSize(12);
  doc.text(`Quote For: ${safeName}`, 10, 40);
  if (structured && typeof clientPhone === 'string' && clientPhone) doc.text(`Phone: ${clientPhone}`, 10, 46);
  if (structured && a.clientEmail) doc.text(`Email: ${a.clientEmail}`, 10, 52);
  if (structured) {
    doc.text(`Status: ${status}`, 10, 58);
    if (notes) {
      const split = doc.splitTextToSize(`Notes: ${notes}`, 190);
      doc.text(split, 10, 64);
    }
  }

  // Determine starting Y after optional notes block
  let startY = 48;
  if (structured && notes) {
    // estimate height of notes
    const lines = doc.splitTextToSize(`Notes: ${notes}`, 190).length;
    startY = 46 + (lines * 6) + 4; // line height ~6
  }

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
  });

  const subtotal = filtered.reduce((s, i) => s + (i.unit * i.qty), 0);
  const tax = taxRate ? (subtotal * (taxRate / 100)) : 0;
  const grandTotal = subtotal + tax;

  let y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text(`Subtotal: ${formatCurrency(subtotal, currency)}`, 10, y); y += 6;
  if (taxRate) { doc.text(`Tax (${taxRate.toFixed(2)}%): ${formatCurrency(tax, currency)}`, 10, y); y += 6; }
  doc.setFontSize(13);
  doc.text(`Grand Total: ${formatCurrency(grandTotal, currency)}`, 10, y); y += 8;

  if (structured) {
    if (createdAt) { doc.setFontSize(8); doc.text(`Created: ${new Date(createdAt).toLocaleString()}`, 10, y); }
    if (updatedAt) { doc.setFontSize(8); doc.text(`Updated: ${new Date(updatedAt).toLocaleString()}`, 10, y + 4); }
  }

  // Payment terms & contact at bottom
  y += 10;
  doc.setFontSize(10);
  if (paymentTerms) {
    const p = doc.splitTextToSize(`Payment Terms: ${paymentTerms}`, 190);
    doc.text(p, 10, y);
    y += p.length * 6;
  } else {
    doc.text('Payment Terms: 50% deposit, balance due 14 days before travel.', 10, y);
    y += 6;
  }
  doc.text('For questions contact: hello@colleco.travel | +27 31 000 0000', 10, y);

  // If travel/booking info is available, show a small booking reference line
  if (travelInfo) {
    y += 6;
    try {
      const bookingRef = travelInfo.reference || travelInfo.id || travelInfo.bookingRef || '';
      if (bookingRef) doc.setFontSize(9).text(`Booking Ref: ${bookingRef}`, 10, y);
    } catch (e) {}
  }

  // Add logo image (if available) then save. We do this asynchronously so image fetch
  // doesn't block the main flow in environments where fetch is fast. If fetching fails
  // we simply save without the image.
  (async () => {
    try {
      const dataUrl = await fetchImageDataUrl(LOGO_PATH);
      if (dataUrl) {
        try { doc.addImage(dataUrl, 'PNG', 150, 6, 36, 18); } catch (e) { /* ignore image add errors */ }
      }
    } catch (e) {}
    doc.save(`${safeName.replace(/\s+/g, '_')}_Quote.pdf`);
  })();
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

export const generateItineraryPdf = (name, items, ref) => {
  const doc = new jsPDF();
  const safeName = name?.trim() || "Itinerary";

  doc.setFontSize(20);
  doc.text(`🗺️ CollEco Travel – Itinerary`, 10, 18);
  doc.setFontSize(12);
  doc.text(`For: ${safeName}`, 10, 28);
  doc.text(`Reference: ${ref}`, 10, 34);

  const rows = items.map((item, idx) => {
    return [
      idx + 1,
      item.name,
      item.startTime || "N/A",
      item.endTime || "N/A",
      item.description || "",
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [["#", "Activity", "Start", "End", "Description"]],
    body: rows,
    didParseCell: function (data) {
      if (data.column.index === 4) {
        data.cell.styles.cellWidth = "wrap";
      }
    },
  });

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
