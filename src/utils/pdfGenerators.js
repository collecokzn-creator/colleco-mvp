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
  doc.text('🧾 CollEco Travel – Quotation', 10, 18);
  doc.setFontSize(12);
  doc.text(`Quote For: ${safeName}`, 10, 28);
  if (ref) doc.text(`Reference: ${ref}`, 10, 34);
  if (structured) {
    doc.text(`Status: ${status}`, 10, 40);
    if (notes) {
      const split = doc.splitTextToSize(`Notes: ${notes}`, 190);
      doc.text(split, 10, 46);
    }
  }

  // Determine starting Y after optional notes block
  let startY = 48;
  if (structured && notes) {
    // estimate height of notes
    const lines = doc.splitTextToSize(`Notes: ${notes}`, 190).length;
    startY = 46 + (lines * 6) + 4; // line height ~6
  }

  const rows = filtered.map((item, idx) => [
    idx + 1,
    item.name,
    item.qty,
    formatCurrency(item.unit, currency),
    formatCurrency(item.unit * item.qty, currency),
  ]);

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

  doc.save(`${safeName.replace(/\s+/g, '_')}_Quote.pdf`);
};

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
