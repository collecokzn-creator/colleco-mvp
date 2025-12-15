import { _ as __vitePreload } from "./pdf-DKpnIAzb.js";
import { f as formatCurrency } from "./currency-J2bxD4Bj.js";
const LOGO_PATH = "/src/assets/colleco-logo.png";
const COMPANY_INFO = {
  name: "CollEco Travel",
  tagline: "The Odyssey of Adventure",
  legalName: "COLLECO SUPPLY & PROJECTS (PTY) Ltd",
  registration: "Reg: 2013/147893/07",
  taxNumber: "Tax: 9055225222",
  csd: "CSD: MAAA07802746",
  // Contact details
  email: "collecokzn@gmail.com",
  phone: "Cell: 073 3994 708",
  address: "6 Avenue Umtenweni 4234",
  website: "www.collecotravel.com",
  // Banking details
  banking: {
    bankName: "Capitec Business",
    branchName: "Relationship Suite",
    accountType: "Capitec Business Account",
    accountNumber: "1052106919",
    branchCode: "450105"
  },
  // Terms and conditions
  terms: [
    "All payments to be done electronically into provided account.",
    "All bookings are subjected to availability.",
    "All bookings are subjected to a non-refund cancelation policy once confirmed by the client.",
    "All flight bookings are standard and if any changes are required there will be an additional cost. Upfront arrangements must be done for flexible bookings.",
    "All car rentals are subject to a returnable deposit payment upon collection.",
    "All damages and extra costs accumulated during the car hire, the driver will be liable for them."
  ],
  // Brand colors
  colors: {
    orange: "#F47C20",
    brown: "#3A2C1A",
    gold: "#E6B422",
    cream: "#FFF8F1"
  }
};
async function fetchImageDataUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunkSize = 32768;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);
    const mime = res.headers.get("content-type") || "image/png";
    return `data:${mime};base64,${b64}`;
  } catch (e) {
    return null;
  }
}
const generateQuotePdf = async (a, b, c, d) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    __vitePreload(() => import("./pdf-DKpnIAzb.js").then((n) => n.j), true ? [] : void 0),
    __vitePreload(() => import("./jspdf.plugin.autotable-Dl18A6QZ.js"), true ? [] : void 0)
  ]);
  const doc = new jsPDF();
  const structured = typeof a === "object" && a && Array.isArray(a.items) && (a.currency || a.taxRate !== void 0);
  let safeName;
  let items;
  let ref;
  let showAllInQuote;
  let currency = "R";
  let taxRate = 15;
  let _status = "Draft";
  let createdAt;
  if (structured) {
    safeName = (a.clientName || "Client").trim();
    items = a.items || [];
    ref = a.id || a.reference || "";
    showAllInQuote = true;
    currency = a.currency || currency;
    taxRate = typeof a.taxRate === "number" ? a.taxRate : taxRate;
    _status = a.status || _status;
    a.notes || "";
    createdAt = a.createdAt;
    a.updatedAt;
    var invoiceNumber = a.invoiceNumber || a.quoteNumber || a.referenceNumber || "";
    var orderNumber = a.orderNumber || "";
    var clientAddress = a.clientAddress || "";
    var clientVAT = a.clientVAT || "";
    var clientPhone = a.clientPhone || a.phone || "";
    var clientEmail = a.clientEmail || "";
    a.paymentTerms || "";
    a.validUntil || a.validity || "";
    var companyInfo = a.companyInfo || COMPANY_INFO;
    var banking = a.banking || companyInfo.banking;
    var terms = a.terms || companyInfo.terms;
  } else {
    safeName = a?.trim?.() || "Client";
    items = [];
    ref = c;
    showAllInQuote = d;
    companyInfo = COMPANY_INFO;
    banking = COMPANY_INFO.banking;
    terms = COMPANY_INFO.terms;
  }
  const normalized = items.map((it) => {
    return {
      name: it.title || it.name || "Item",
      description: it.description || it.subtitle || "",
      qty: (it.quantity !== void 0 ? it.quantity : it.qty !== void 0 ? it.qty : 1) || 1,
      unit: (it.unitPrice !== void 0 ? it.unitPrice : it.price !== void 0 ? it.price : 0) || 0
    };
  });
  const filtered = showAllInQuote ? normalized : normalized.filter((i) => i.unit);
  const pageWidth = doc.internal.pageSize.width || 210;
  const pageHeight = doc.internal.pageSize.height || 297;
  const marginLeft = 10;
  const marginRight = 10;
  await fetchImageDataUrl(LOGO_PATH);
  const customLogoData = a.customLogo || null;
  const addHeader = () => {
    if (customLogoData) {
      try {
        const logoW = 45;
        const logoH = 20;
        const logoX = pageWidth - marginRight - logoW;
        doc.addImage(customLogoData, "PNG", logoX, 8, logoW, logoH);
      } catch (e) {
        console.warn("Custom logo add failed:", e);
      }
    }
    doc.setFontSize(16);
    doc.setFont(void 0, "bold");
    const companyName = companyInfo.name || "CollEco Travel";
    const companyWidth = doc.getTextWidth(companyName);
    doc.text(companyName, (pageWidth - companyWidth) / 2, 16);
    doc.setFontSize(24);
    const bird = "🦜";
    doc.setFontSize(11);
    doc.setFont(void 0, "italic");
    const payoffLine = companyInfo.tagline || "The Odyssey of Adventure";
    const payoffWidth = doc.getTextWidth(payoffLine);
    doc.setFontSize(14);
    const globe = "🌍";
    doc.setFontSize(24);
    const birdWidth = doc.getTextWidth(bird);
    doc.setFontSize(14);
    const globeWidth = doc.getTextWidth(globe);
    const spacing = 2;
    const totalWidth = birdWidth + spacing + payoffWidth + spacing + globeWidth;
    const startX = (pageWidth - totalWidth) / 2;
    doc.setFontSize(24);
    doc.text(bird, startX, 26);
    doc.setFontSize(11);
    doc.setFont(void 0, "italic");
    doc.text(payoffLine, startX + birdWidth + spacing, 26);
    doc.setFontSize(14);
    doc.text(globe, startX + birdWidth + spacing + payoffWidth + spacing, 26);
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.line(14, 36, pageWidth - 14, 36);
    doc.setTextColor(0, 0, 0);
  };
  const addFooter = () => {
    doc.setFontSize(10);
    doc.setFont(void 0, "bold");
    doc.setTextColor(255, 140, 0);
    const websiteText = companyInfo.website || "www.travelcolleco.com";
    const websiteWidth = doc.getTextWidth(websiteText);
    const websiteX = (pageWidth - websiteWidth) / 2;
    doc.text(websiteText, websiteX, pageHeight - 10);
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.line(websiteX, pageHeight - 9, websiteX + websiteWidth, pageHeight - 9);
    doc.setTextColor(0, 0, 0);
  };
  addHeader();
  const documentType = a.documentType || "Invoice";
  const issueDate = a.issueDate ? new Date(a.issueDate) : createdAt ? new Date(createdAt) : /* @__PURE__ */ new Date();
  const dueDate = a.dueDate ? new Date(a.dueDate) : null;
  doc.setFontSize(9);
  doc.setFont(void 0, "normal");
  doc.setTextColor(100, 100, 100);
  const dateText = `${documentType} generated on ${issueDate.toLocaleDateString("en-GB")}`;
  doc.text(dateText, 14, 42);
  doc.setTextColor(0, 0, 0);
  let yPos = 48;
  doc.setFontSize(14);
  doc.setTextColor(244, 124, 32);
  doc.setFont(void 0, "bold");
  doc.text(documentType.toUpperCase(), 14, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont(void 0, "normal");
  yPos += 6;
  doc.setFontSize(9);
  if (companyInfo.legalName) {
    doc.text(companyInfo.legalName, 14, yPos);
    yPos += 4;
  }
  if (companyInfo.registration) {
    doc.text(companyInfo.registration, 14, yPos);
    yPos += 4;
  }
  if (companyInfo.taxNumber) {
    doc.text(companyInfo.taxNumber, 14, yPos);
    yPos += 4;
  }
  if (companyInfo.csd) {
    doc.text(companyInfo.csd, 14, yPos);
    yPos += 4;
  }
  if (companyInfo.phone) {
    doc.text(companyInfo.phone, 14, yPos);
    yPos += 4;
  }
  if (companyInfo.email) {
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(companyInfo.email, 14, yPos, { url: `mailto:${companyInfo.email}` });
    doc.setTextColor(0, 0, 0);
    yPos += 4;
  }
  yPos += 2;
  doc.setFontSize(10);
  doc.setFont(void 0, "bold");
  const docLabel = documentType === "Quotation" ? "QUOTE NO" : "INVOICE NO";
  doc.text(docLabel, 14, yPos);
  doc.setFont(void 0, "normal");
  doc.text(invoiceNumber || ref || "001", 14 + 30, yPos);
  yPos += 5;
  doc.setFont(void 0, "bold");
  doc.text("ORDER NO", 14, yPos);
  doc.setFont(void 0, "normal");
  doc.text(orderNumber || "-", 14 + 30, yPos);
  yPos += 5;
  doc.setFont(void 0, "bold");
  doc.text("ISSUE DATE", 14, yPos);
  doc.setFont(void 0, "normal");
  doc.text(issueDate.toLocaleDateString("en-GB"), 14 + 30, yPos);
  if (dueDate && documentType === "Invoice") {
    yPos += 5;
    doc.setFont(void 0, "bold");
    doc.text("DUE DATE", 14, yPos);
    doc.setFont(void 0, "normal");
    doc.text(dueDate.toLocaleDateString("en-GB"), 14 + 30, yPos);
  }
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont(void 0, "bold");
  const clientLabel = documentType === "Quotation" ? "QUOTE FOR" : "INVOICE TO";
  doc.text(clientLabel, 14, yPos);
  doc.setFont(void 0, "normal");
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
  const tableStartY = Math.max(yPos + 10, 110);
  const rows = filtered.map((item, idx) => {
    const itemDesc = item.name + (item.description ? "\n" + item.description : "");
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
    head: [["ITEM NUMBER", "DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL PRICE"]],
    body: rows,
    theme: "grid",
    margin: { left: 14, right: 14 },
    // Consistent margins
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: "bold",
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 9,
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" }
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        addHeader();
      }
    }
  });
  let totalY = doc.lastAutoTable.finalY + 10;
  const totalsX = pageWidth - 70;
  const subtotal = filtered.reduce((s, i) => s + i.unit * i.qty, 0);
  const vatAmount = subtotal * taxRate / 100;
  const grandTotal = subtotal + vatAmount;
  doc.setFontSize(10);
  doc.setFont(void 0, "bold");
  doc.text("COST PRICE", totalsX - 40, totalY);
  doc.rect(totalsX, totalY - 4, 60, 7);
  doc.text(formatCurrency(subtotal, currency), totalsX + 55, totalY, { align: "right" });
  totalY += 7;
  doc.text(`VAT (${taxRate}%)`, totalsX - 40, totalY);
  doc.rect(totalsX, totalY - 4, 60, 7);
  doc.text(formatCurrency(vatAmount, currency), totalsX + 55, totalY, { align: "right" });
  totalY += 7;
  doc.text("TOTAL COST", totalsX - 40, totalY);
  doc.rect(totalsX, totalY - 4, 60, 7);
  doc.text(formatCurrency(grandTotal, currency), totalsX + 55, totalY, { align: "right" });
  totalY += 15;
  doc.setFontSize(10);
  doc.setFont(void 0, "bold");
  doc.text("BANKING DETAILS:", marginLeft, totalY);
  doc.setFont(void 0, "normal");
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
  totalY += 10;
  doc.setFontSize(10);
  doc.setFont(void 0, "bold");
  doc.text("TERMS AND CONDITIONS:", marginLeft, totalY);
  doc.setFont(void 0, "normal");
  doc.setFontSize(8);
  totalY += 5;
  terms.forEach((term) => {
    const lines = doc.splitTextToSize(term, pageWidth - marginLeft - marginRight - 10);
    doc.text(lines, marginLeft, totalY);
    totalY += lines.length * 3.5;
  });
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter();
  }
  const filename = invoiceNumber ? `Invoice_${invoiceNumber}.pdf` : `${safeName.replace(/\\s+/g, "_")}_Quote.pdf`;
  doc.save(filename);
};
export {
  generateQuotePdf as g
};
//# sourceMappingURL=pdfGenerators-Dpk5CIWQ.js.map
