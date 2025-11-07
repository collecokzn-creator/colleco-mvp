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

  // Header title and metadata (reserve right area for logo)
  const pageWidth = (doc.internal && doc.internal.pageSize && (doc.internal.pageSize.width || doc.internal.pageSize.getWidth())) || 210;
  const marginRight = 14;
  const logoW = 36;
  const logoH = 18;
  const logoX = pageWidth - marginRight - logoW; // where logo's left edge will be
  const metaX = logoX - 6; // align-right position for metadata (keeps clear of logo)

  doc.setFontSize(16);
  // prefer plain text (some fonts don't render emoji predictably in jsPDF)
  doc.text('Quotation', metaX, 18, { align: 'right' });
  doc.setFontSize(11);
  // Quote metadata block on the right — always display date and a reference/number fallback
  const displayDate = createdAt ? new Date(createdAt) : new Date();
  if (structured) {
    const qnum = quoteNumber || ref || '';
    if (qnum) doc.text(`Quote #: ${qnum}`, metaX, 26, { align: 'right' });
    doc.text(`Date: ${displayDate.toLocaleDateString()}`, metaX, 32, { align: 'right' });
    if (validity) {
      const vtext = typeof validity === 'number' ? `Valid for ${validity} days` : `Valid until ${validity}`;
      doc.text(vtext, metaX, 38, { align: 'right' });
    }
  } else {
    if (ref) doc.text(`Reference: ${ref}`, metaX, 26, { align: 'right' });
    doc.text(`Date: ${displayDate.toLocaleDateString()}`, metaX, 32, { align: 'right' });
  }

  doc.setFontSize(12);
  // Move left column content slightly lower to avoid clashing with header
  doc.text(`Quote For: ${safeName}`, 10, 44);
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
    // --- Layout per CollEco template ---
  const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightColX = pageWidth - margin - 70; // area for company details

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('QUOTATION', margin, 28);

    // Date and Quote Number near top-left
    doc.setFontSize(10);
    const displayDate = structured && a.date ? new Date(a.date) : new Date();
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE`, margin, 36);
    doc.setFont('helvetica', 'bold');
    doc.text(displayDate.toLocaleDateString(), margin, 42);

    // Quotation No centered-ish under header
    doc.setFont('helvetica', 'normal');
    doc.text('QUOTATION NO', 90, 36);
    doc.setFont('helvetica', 'bold');
    const qno = (structured && (a.quoteNumber || a.reference || a.number)) || '';
    doc.text(qno || '', 90, 42);

    // Company details block on right (match template styling)
    const compX = pageWidth - margin - 90;
    let cy = 18;
    // Add logo top-right if present
    try {
      const dataUrl = await fetchImageDataUrl(LOGO_PATH);
      if (dataUrl) {
        try { doc.addImage(dataUrl, 'PNG', pageWidth - margin - 56, 6, 50, 30); } catch (e) {}
      }
    } catch (e) {}
    // Company name in brand red
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 30, 30);
    doc.text('COLLECO TRAVEL', compX, cy, { align: 'right' }); cy += 5;
    doc.setTextColor(0,0,0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const companyLines = [
      'Reg: 2013/147883/07',
      'Tax: 9055225222',
      'CSD: MAAA0708746',
      'Mail: collecokzn@gmail.com',
      'Cell: 073 3994 708'
    ];
    companyLines.forEach(line => { doc.text(line, compX, cy, { align: 'right' }); cy += 4; });

    // Recipient block
    let y = 60;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('QUOTATION TO', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    if (structured && a.recipient) {
      const rLines = [a.recipient.name || '', a.recipient.address || '', `Phone: ${a.recipient.phone || ''}`, `Email: ${a.recipient.email || ''}`].filter(Boolean);
      const split = doc.splitTextToSize(rLines.join('\n'), 100);
      doc.text(split, margin, y);
      y += split.length * 5 + 4;
    } else {
      const split = doc.splitTextToSize((structured && (a.clientName || '')) || safeName, 100);
      doc.text(split, margin, y);
      y += split.length * 5 + 4;
    }

    // Items table — wider description column like template
    const normalized = items.map((it, idx) => ({
      number: idx + 1,
      description: (it.description || it.title || it.name || '').replace(/\r?\n/g, ' '),
      qty: it.quantity ?? it.qty ?? 1,
      unit: Number(it.unitPrice ?? it.price ?? 0) || 0,
    }));

    const tableBody = normalized.map(r => [r.number.toString(), r.description, r.qty.toString(), formatCurrency(r.unit, currency), formatCurrency(r.unit * r.qty, currency)]);

    // Let the table take the full page width (minus margins) and place totals below the table.
    const availTableWidth = pageWidth - margin * 2 - 2; // small gap
    // default column widths
    let idxW = 14, qtyW = 16, unitW = 28, totalW = 28;
  let descW = Math.max(50, Math.floor(availTableWidth - (idxW + qtyW + unitW + totalW)));

    // If the description width is too small, reduce numeric columns conservatively
    if (descW < 60) {
      const deficit = 60 - descW;
      const reduceEach = Math.ceil(deficit / 3);
      unitW = Math.max(20, unitW - reduceEach);
      totalW = Math.max(20, totalW - reduceEach);
      qtyW = Math.max(12, qtyW - Math.max(0, reduceEach - 2));
      descW = Math.max(50, Math.floor(availTableWidth - (idxW + qtyW + unitW + totalW)));
    }

  // Be conservative: shrink description width slightly to avoid tiny overflow
  descW = Math.max(46, descW - 12);

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [['ITEM NUMBER', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL PRICE']],
  body: tableBody,
  styles: { fontSize: 7.0, lineColor: [0,0,0], lineWidth: 0.5, overflow: 'linebreak', cellPadding: 0.5 },
      headStyles: { fillColor: [255,255,255], textColor: 20, halign: 'center', fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: idxW, halign: 'center' },
        1: { cellWidth: descW, overflow: 'linebreak' },
        2: { cellWidth: qtyW, halign: 'center' },
        3: { cellWidth: unitW, halign: 'right' },
        4: { cellWidth: totalW, halign: 'right' }
      }
    });

    const subtotal = normalized.reduce((s, i) => s + (i.unit * i.qty), 0);
    const tax = taxRate ? (subtotal * (taxRate / 100)) : 0;
    const grandTotal = subtotal + tax;

    // Right-side totals box (aligned with table top) matching template style
    const tableBottom = doc.lastAutoTable.finalY;
    const boxX = pageWidth - margin - 70;
    const boxWidth = 70;
    const boxStartY = tableBottom - 12;
    doc.setDrawColor(0);
    doc.setFillColor(255,255,255);
    // small bordered boxes for COST PRICE, VAT and TOTAL COST
    const labelX = boxX + 4;
    const valueX = boxX + boxWidth - 4;
    let boxYpos = boxStartY;
    doc.setFontSize(9);
    doc.text('COST PRICE', labelX, boxYpos);
    doc.text(formatCurrency(subtotal, currency), valueX, boxYpos, { align: 'right' }); boxYpos += 8;
    if (taxRate) {
      doc.text(`VAT (${taxRate}%)`, labelX, boxYpos);
      doc.text(formatCurrency(tax, currency), valueX, boxYpos, { align: 'right' }); boxYpos += 8;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL COST', labelX, boxYpos);
    doc.text(formatCurrency(grandTotal, currency), valueX, boxYpos, { align: 'right' });

    // Banking details and terms (left column below table)
    let leftY = tableBottom + 12;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('BANKING DETAILS:', margin, leftY); leftY += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    const bankLines = [
      'Bank Name: Capitec Business',
      'Branch Name: Relationship Suite',
      'Account Type: Capitec Business Account',
      'Account Number: 1052106919',
      'Branch Code: 450105'
    ];
    bankLines.forEach(l => { doc.text(l, margin, leftY); leftY += 5; });

    leftY += 4;
    doc.setFont('helvetica', 'bold'); doc.text('TERMS AND CONDITIONS:', margin, leftY); leftY += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const terms = `All payments to be done electronically into provided account. All bookings are subject to availability. All bookings are subject to a non-refund cancellation policy once confirmed by the client. All flight bookings are standard and if any changes are required there will be an additional cost. Upfront arrangements must be done for flexible bookings.`;
    const tLines = doc.splitTextToSize(terms, pageWidth - margin * 2 - 80);
    doc.text(tLines, margin, leftY);

    // Signature block on right (include signature image if present, otherwise draw fallback signature + stamp)
    const sigY = tableBottom + 40;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('COLLECO SUPPLY & PROJECTS (PTY) LTD', boxX, sigY, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('REG NO: 2013 147883/07', boxX, sigY + 6, { align: 'right' });
    doc.text('225 CASTLEHILL DRIVE, NEWLANDS WEST, DURBAN, 4037', boxX, sigY + 12, { align: 'right' });
    // try to place a real signature image; if not present, draw a stylized signature and a stamp
    try {
      // Prefer a PNG signature if present
      const sigUrl = await fetchImageDataUrl('/assets/signature.png');
      if (sigUrl) {
        try { doc.addImage(sigUrl, 'PNG', boxX - 40, sigY + 16, 40, 20); } catch (e) {}
      } else {
        // Try SVG signature: fetch raw svg, rasterize on a canvas and add as PNG
        try {
          const resp = await fetch('/assets/signature.svg');
          if (resp && resp.ok) {
            const svgText = await resp.text();
            // create an image from SVG and draw to canvas to get a PNG dataURL
            await new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                try {
                  const c = document.createElement('canvas');
                  const w = 200, h = 60;
                  c.width = w; c.height = h;
                  const ctx = c.getContext('2d');
                  // white background transparent handling
                  ctx.fillStyle = 'rgba(0,0,0,0)';
                  ctx.fillRect(0,0,w,h);
                  // draw centered
                  const scale = Math.min(w / img.width, h / img.height);
                  const dw = img.width * scale; const dh = img.height * scale;
                  ctx.drawImage(img, 0, 0, img.width, img.height, 0, (h - dh) / 2, dw, dh);
                  try {
                    const png = c.toDataURL('image/png');
                    doc.addImage(png, 'PNG', boxX - 40, sigY + 16, 40, 20);
                  } catch (e) {}
                } catch (e) {}
                resolve(null);
              };
              img.onerror = () => resolve(null);
              img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
            });
          } else {
            // Draw a simple vector signature fallback
            const sx = boxX - 42;
            const sy = sigY + 18;
            doc.setLineWidth(0.6);
            doc.setDrawColor(30, 30, 30);
            // a smoother cursive made of small bezier-like segments using lines()
            const s1 = [[0,0],[10,-6],[22,2],[34,-8],[48,2]];
            const s2 = [[52,4],[66,-4],[86,8],[110,-6]];
            doc.lines(s1, sx, sy);
            doc.lines(s2, sx, sy + 6);

            // stamp box
            const stampX = boxX - 10;
            const stampY = sy + 26;
            const stampW = 58;
            doc.setFillColor(255, 240, 240);
            doc.setDrawColor(150, 25, 25);
            doc.setLineWidth(0.7);
            doc.rect(stampX - stampW/2, stampY - 12, stampW, 24, 'FD');
            doc.setFontSize(8);
            doc.setTextColor(150,25,25);
            doc.setFont('helvetica', 'bold');
            doc.text('COLLECO TRAVEL', stampX, stampY - 2, { align: 'center' });
            doc.setFont('helvetica', 'normal'); doc.setFontSize(6);
            doc.text('Reg: 2013/147883/07', stampX, stampY + 7, { align: 'center' });
            doc.setTextColor(0,0,0);
          }
        } catch (e) {
          // drawing fallback if anything fails
          const sx = boxX - 42;
          const sy = sigY + 18;
          doc.setLineWidth(0.6);
          doc.setDrawColor(30, 30, 30);
          doc.lines([[0,0],[12,-6],[24,2],[40,-6]], sx, sy);
        }
      }
    } catch (e) {
      // ignore higher-level errors
    }

    // Footer with address and site
    const footerY = 282;
    doc.setFontSize(8);
    doc.text('6 Avenue Umthwentweni 4234 | www.collecotravel.com | The Odyssey of Adventure', pageWidth / 2, footerY, { align: 'center' });

    // produce data URI
    try {
      const dataUri = doc.output('datauristring');
      return dataUri;
    } catch (e) {
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
