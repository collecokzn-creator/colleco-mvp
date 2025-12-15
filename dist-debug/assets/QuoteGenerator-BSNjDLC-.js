import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { g as generateQuotePdf } from "./pdfGenerators-Dpk5CIWQ.js";
import { c as useUser, L as Link } from "./index-DlOecmR0.js";
import { B as Button } from "./Button-BvBK5int.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./currency-J2bxD4Bj.js";
import "./icons-C4AMPM7L.js";
async function parsePromptToInvoiceItems(prompt) {
  const items = [];
  const segments = prompt.split(/[,;\n]/).map((s) => s.trim()).filter((s) => s);
  for (const segment of segments) {
    const item = parseSegment(segment);
    if (item) {
      items.push(item);
    }
  }
  if (items.length === 0) {
    items.push({
      title: "Service",
      description: prompt.trim(),
      quantity: 1,
      unitPrice: 0
    });
  }
  return items;
}
function parseSegment(segment) {
  segment.toLowerCase();
  const flightPatterns = [
    /flight.*?(from|to)\s+([a-z\s]+?)(?:\s+to\s+|\s+on\s+|\s+for\s+).*?([r$]?\s*[\d,]+(?:\.\d{2})?)/i,
    /([a-z\s]+?)\s*flight.*?([r$]?\s*[\d,]+(?:\.\d{2})?)/i,
    /fly.*?(from|to)\s+([a-z\s]+?).*?([r$]?\s*[\d,]+(?:\.\d{2})?)/i
  ];
  for (const pattern of flightPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = extractPrice(match[match.length - 1]);
      return {
        title: "Flight Booking",
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  const hotelPatterns = [
    /(\d+)\s*(?:night|nite|nites).*?(?:hotel|accommodation|stay).*?(?:at|for|@)\s*[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:hotel|accommodation|stay).*?(\d+)\s*(?:night|nite|nites).*?(?:at|for|@)\s*[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:hotel|accommodation).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i
  ];
  for (const pattern of hotelPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const hasNights = match[1] && /^\d+$/.test(match[1]);
      const quantity = hasNights ? parseInt(match[1]) : 1;
      const priceIndex = hasNights ? 2 : 1;
      const price = extractPrice(match[priceIndex]);
      return {
        title: "Hotel Accommodation",
        description: segment.trim(),
        quantity,
        unitPrice: price
      };
    }
  }
  const carPatterns = [
    /(?:car|vehicle)\s*(?:hire|rental).*?(\d+)\s*days?.*?(?:at|for|@)\s*[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(\d+)\s*days?\s*(?:car|vehicle)\s*(?:hire|rental).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:car|vehicle)\s*(?:hire|rental).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i
  ];
  for (const pattern of carPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const hasDays = match[1] && /^\d+$/.test(match[1]);
      const quantity = hasDays ? parseInt(match[1]) : 1;
      const priceIndex = hasDays ? 2 : 1;
      const price = extractPrice(match[priceIndex]);
      return {
        title: "Car Rental",
        description: segment.trim(),
        quantity,
        unitPrice: price
      };
    }
  }
  const tourPatterns = [
    /(?:tour|activity|excursion|safari|cruise).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:tour|activity|excursion|safari|cruise)/i
  ];
  for (const pattern of tourPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = match[1] ? extractPrice(match[1]) : 0;
      return {
        title: "Tour/Activity",
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  const transferPatterns = [
    /(?:transfer|transport|shuttle|taxi).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:airport|pickup|dropoff|drop-off).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i
  ];
  for (const pattern of transferPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = match[1] ? extractPrice(match[1]) : 0;
      return {
        title: "Transfer Service",
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  const eventPatterns = [
    /(?:conference|event|meeting|function|venue).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i
  ];
  for (const pattern of eventPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = match[1] ? extractPrice(match[1]) : 0;
      return {
        title: "Event/Conference",
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  const genericPattern = /([a-z\s]+?).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i;
  const genericMatch = segment.match(genericPattern);
  if (genericMatch && genericMatch[2]) {
    const price = extractPrice(genericMatch[2]);
    return {
      title: genericMatch[1].trim() || "Service",
      description: segment.trim(),
      quantity: 1,
      unitPrice: price
    };
  }
  if (segment.length > 5) {
    return {
      title: "Service",
      description: segment.trim(),
      quantity: 1,
      unitPrice: 0
    };
  }
  return null;
}
function extractPrice(str) {
  if (!str) return 0;
  const cleaned = str.toString().replace(/[r$\s]/gi, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
function suggestCommonItems() {
  return [
    {
      category: "Flights",
      items: [
        { title: "Domestic Flight", description: "One-way domestic flight", unitPrice: 0 },
        { title: "International Flight", description: "One-way international flight", unitPrice: 0 },
        { title: "Return Flight", description: "Return flight booking", unitPrice: 0 }
      ]
    },
    {
      category: "Accommodation",
      items: [
        { title: "Hotel - Standard Room", description: "Per night", unitPrice: 0 },
        { title: "Hotel - Deluxe Room", description: "Per night", unitPrice: 0 },
        { title: "Guesthouse", description: "Per night", unitPrice: 0 },
        { title: "Resort/Lodge", description: "Per night", unitPrice: 0 }
      ]
    },
    {
      category: "Transport",
      items: [
        { title: "Airport Transfer", description: "One-way transfer", unitPrice: 0 },
        { title: "Car Rental", description: "Per day", unitPrice: 0 },
        { title: "Private Chauffeur", description: "Per day", unitPrice: 0 }
      ]
    },
    {
      category: "Activities",
      items: [
        { title: "City Tour", description: "Half-day guided tour", unitPrice: 0 },
        { title: "Safari/Game Drive", description: "Full-day experience", unitPrice: 0 },
        { title: "Cultural Experience", description: "Activity/workshop", unitPrice: 0 }
      ]
    },
    {
      category: "Services",
      items: [
        { title: "Travel Insurance", description: "Per person", unitPrice: 0 },
        { title: "Visa Assistance", description: "Processing fee", unitPrice: 0 },
        { title: "Concierge Service", description: "Per booking", unitPrice: 0 }
      ]
    }
  ];
}
const examplePrompts = [
  "Flight from Durban to Cape Town on FlySafair for R4,500, 3 nights hotel accommodation at R1,200 per night, airport transfer for R450",
  "Return flight Johannesburg to Zanzibar R8,500, 5 nights beachfront resort R2,800 per night, scuba diving tour R1,200",
  "Conference venue hire R15,000, catering for 50 people R350 per person, AV equipment R2,500",
  "3 day car rental at R850 per day, fuel R600, toll fees R120",
  "Safari lodge 4 nights R4,500 per night, 2 game drives R950 each, conservation fee R450"
];
function QuoteGenerator() {
  const { user } = useUser();
  const [aiPrompt, setAiPrompt] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [showExamples, setShowExamples] = reactExports.useState(false);
  const [showSuggestions, setShowSuggestions] = reactExports.useState(false);
  const [savedQuotes, setSavedQuotes] = reactExports.useState([]);
  const [partnerTemplates, setPartnerTemplates] = reactExports.useState([]);
  const [selectedTemplate, setSelectedTemplate] = reactExports.useState(null);
  const [customLogo, setCustomLogo] = reactExports.useState(null);
  const [_showLogoUpload, _setShowLogoUpload] = reactExports.useState(false);
  const autoSaveTimerRef = reactExports.useRef(null);
  const [quote, setQuote] = reactExports.useState({
    documentType: "Invoice",
    // 'Invoice' or 'Quotation'
    invoiceNumber: "",
    orderNumber: "",
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    clientVAT: "",
    items: [],
    currency: "R",
    taxRate: 15,
    status: "Draft",
    issueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: "",
    paymentTerms: "Net 30",
    createdAt: /* @__PURE__ */ new Date(),
    // Optional custom fields
    companyInfo: null,
    banking: null,
    terms: null
  });
  reactExports.useEffect(() => {
    if (quote.id && quote.clientName) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        const quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
        const index = quotes.findIndex((q) => q.id === quote.id);
        if (index !== -1) {
          quotes[index] = { ...quote, updatedAt: /* @__PURE__ */ new Date() };
          localStorage.setItem("quotes", JSON.stringify(quotes));
        }
      }, 2e3);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [quote]);
  const getNextDocumentNumber = reactExports.useCallback((type) => {
    const userId = user?.id || "default";
    const counterKey = `${type.toLowerCase()}_counter_${userId}`;
    const currentCounter = parseInt(localStorage.getItem(counterKey) || "0");
    const nextCounter = currentCounter + 1;
    localStorage.setItem(counterKey, nextCounter.toString());
    const prefix = type === "Invoice" ? "INV" : "QUO";
    return `${prefix}-${String(nextCounter).padStart(4, "0")}`;
  }, [user?.id]);
  const loadPartnerTemplates = reactExports.useCallback(() => {
    const templates = JSON.parse(localStorage.getItem(`partner_templates_${user?.id}`) || "[]");
    setPartnerTemplates(templates);
    const def = templates.find((t) => t.isDefault);
    if (def && !selectedTemplate) setSelectedTemplate(def);
  }, [user?.id, selectedTemplate]);
  reactExports.useEffect(() => {
    if (quote.clientName && !quote.invoiceNumber) {
      const docNum = getNextDocumentNumber(quote.documentType);
      setQuote((prev) => ({ ...prev, invoiceNumber: docNum }));
    }
  }, [quote.clientName, quote.invoiceNumber, quote.documentType, getNextDocumentNumber]);
  reactExports.useEffect(() => {
    if (quote.items.length > 0 && quote.clientName) {
      if (quote.status === "Draft") {
        setQuote((prev) => ({ ...prev, status: "Ready" }));
      }
    }
  }, [quote.items.length, quote.clientName, quote.status]);
  reactExports.useEffect(() => {
    loadSavedQuotes();
    loadPartnerTemplates();
    loadCustomLogo();
  }, [user, loadPartnerTemplates]);
  function loadSavedQuotes() {
    const quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    setSavedQuotes(quotes);
  }
  function loadCustomLogo() {
    const saved = localStorage.getItem("custom_invoice_logo");
    if (saved) {
      setCustomLogo(saved);
    }
  }
  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (dataUrl && typeof dataUrl === "string") {
        setCustomLogo(dataUrl);
        localStorage.setItem("custom_invoice_logo", dataUrl);
        alert("Logo uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  }
  function removeCustomLogo() {
    setCustomLogo(null);
    localStorage.removeItem("custom_invoice_logo");
  }
  async function handleAIGeneration() {
    if (!aiPrompt.trim()) {
      alert("Please enter a description of what you need invoiced");
      return;
    }
    setLoading(true);
    try {
      const items = await parsePromptToInvoiceItems(aiPrompt);
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      setQuote((prev) => ({
        ...prev,
        invoiceNumber: invoiceNum,
        items,
        status: "AI Generated"
      }));
      alert(`✨ Generated ${items.length} invoice item(s) successfully! Review and edit as needed.`);
      setAiPrompt("");
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("Failed to generate invoice. Please try again or add items manually.");
    } finally {
      setLoading(false);
    }
  }
  function applyExample(example) {
    setAiPrompt(example);
    setShowExamples(false);
  }
  function addSuggestedItem(item) {
    setQuote((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, quantity: 1 }]
    }));
  }
  function addItem() {
    setQuote((prev) => ({
      ...prev,
      items: [...prev.items, {
        title: "",
        description: "",
        quantity: 1,
        unitPrice: 0
      }]
    }));
  }
  function removeItem(index) {
    setQuote((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }
  function updateItem(index, field, value) {
    setQuote((prev) => ({
      ...prev,
      items: prev.items.map(
        (item, i) => i === index ? { ...item, [field]: value } : item
      )
    }));
  }
  function calculateTotals() {
    const subtotal = quote.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const vat = subtotal * quote.taxRate / 100;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }
  async function generatePDF() {
    if (!quote.clientName) {
      alert("Please enter client name");
      return;
    }
    if (quote.items.length === 0) {
      alert("Please add at least one item");
      return;
    }
    try {
      const quoteData = {
        ...quote,
        updatedAt: /* @__PURE__ */ new Date(),
        customLogo
        // Pass custom logo to PDF generator
      };
      if (selectedTemplate) {
        quoteData.companyInfo = {
          name: selectedTemplate.companyInfo.name,
          legalName: selectedTemplate.companyInfo.legalName,
          registration: selectedTemplate.companyInfo.registration,
          taxNumber: selectedTemplate.companyInfo.taxNumber,
          vatNumber: selectedTemplate.companyInfo.vatNumber,
          csd: selectedTemplate.companyInfo.csd,
          address: selectedTemplate.companyInfo.address,
          phone: selectedTemplate.companyInfo.phone,
          email: selectedTemplate.companyInfo.email,
          website: selectedTemplate.companyInfo.website,
          logo: selectedTemplate.companyInfo.logo
        };
        quoteData.banking = selectedTemplate.banking;
        quoteData.terms = selectedTemplate.terms;
        quoteData.styling = selectedTemplate.styling;
        quoteData.layout = selectedTemplate.layout;
      }
      await generateQuotePdf(quoteData);
      alert("✅ Invoice PDF generated successfully with your branding!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  }
  function saveQuote() {
    if (!quote.clientName) {
      alert("Please enter client name before saving");
      return;
    }
    const quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    const newQuote2 = {
      ...quote,
      id: quote.id || `Q-${Date.now()}`,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const existingIndex = quotes.findIndex((q) => q.id === newQuote2.id);
    if (existingIndex >= 0) {
      quotes[existingIndex] = newQuote2;
      alert("Quote updated successfully!");
    } else {
      quotes.push(newQuote2);
      alert("Quote saved successfully!");
    }
    localStorage.setItem("quotes", JSON.stringify(quotes));
    setQuote((prev) => ({ ...prev, id: newQuote2.id }));
    loadSavedQuotes();
  }
  function loadQuote(savedQuote) {
    setQuote({
      ...savedQuote,
      createdAt: new Date(savedQuote.createdAt),
      updatedAt: savedQuote.updatedAt ? new Date(savedQuote.updatedAt) : /* @__PURE__ */ new Date()
    });
  }
  function newQuote() {
    setQuote({
      documentType: "Invoice",
      invoiceNumber: "",
      orderNumber: "",
      clientName: "",
      clientAddress: "",
      clientPhone: "",
      clientEmail: "",
      clientVAT: "",
      items: [],
      currency: "R",
      taxRate: 15,
      status: "Draft",
      issueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      dueDate: "",
      paymentTerms: "Net 30",
      createdAt: /* @__PURE__ */ new Date(),
      companyInfo: null,
      banking: null,
      terms: null
    });
  }
  function deleteQuote(id) {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    const quotes = JSON.parse(localStorage.getItem("quotes") || "[]");
    const filtered = quotes.filter((q) => q.id !== id);
    localStorage.setItem("quotes", JSON.stringify(filtered));
    loadSavedQuotes();
    if (quote.id === id) {
      newQuote();
    }
  }
  const totals = calculateTotals();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-brand-brown mb-2", children: "Quote & Invoice Generator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-brand-russty text-sm sm:text-base", children: [
          "Create professional invoices with AI assistance or manually",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold", title: "Auto-save, auto-numbering, and smart status updates enabled", children: "Smart Mode" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/partner/templates", variant: "outline", size: "md", children: "Manage Templates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "md", onClick: newQuote, children: "New Quote" })
      ] })
    ] }),
    partnerTemplates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-white rounded-xl p-5 border border-cream-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown text-sm", children: "📋 Template:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedTemplate?.id || "",
            onChange: (e) => {
              const template = partnerTemplates.find((t) => t.id === e.target.value);
              setSelectedTemplate(template || null);
            },
            className: "px-4 py-2 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "CollEco Default" }),
              partnerTemplates.map((template) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: template.id, children: [
                template.name,
                " ",
                template.isDefault ? "(Default)" : ""
              ] }, template.id))
            ]
          }
        )
      ] }),
      selectedTemplate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-russty", children: [
        "Using: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: selectedTemplate.companyInfo.name }),
        " branding"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-white rounded-xl p-5 border border-cream-border shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown", children: "Custom Logo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: "Upload your logo for invoices (optional)" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 items-center flex-wrap", children: customLogo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: customLogo, alt: "Custom logo", className: "h-8 w-auto object-contain" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700 font-semibold", children: "✓ Logo uploaded" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: removeCustomLogo,
            className: "px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors",
            children: "Remove"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            id: "logoUpload",
            accept: "image/*",
            onChange: handleLogoUpload,
            className: "hidden"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "logoUpload", className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: "span", variant: "primary", size: "sm", children: "Upload Logo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-brand-russty", children: "Max 2MB • PNG, JPG, SVG" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-5 sticky [top:calc(var(--header-h)+var(--banner-h))] border border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown", children: "📂 Saved Quotes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-brand-russty bg-cream-sand px-2 py-1 rounded-full", children: savedQuotes.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto custom-scrollbar", children: savedQuotes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty text-center py-4", children: "No saved quotes yet" }) : savedQuotes.map((sq) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `border-2 rounded-lg p-3 cursor-pointer transition-all ${quote.id === sq.id ? "border-brand-orange bg-brand-orange/5" : "border-cream-border hover:border-brand-orange/50"}`,
            onClick: () => loadQuote(sq),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-brand-brown truncate flex-1", children: sq.clientName || "Unnamed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      deleteQuote(sq.id);
                    },
                    className: "text-red-500 hover:text-red-700 text-xs ml-2",
                    children: "✕"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: sq.invoiceNumber || "No #" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-brand-orange", children: [
                  sq.items?.length || 0,
                  " ",
                  (sq.items?.length || 0) === 1 ? "item" : "items"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-semibold ${sq.status === "Paid" ? "bg-green-100 text-green-700" : sq.status === "Sent" ? "bg-brand-orange/10 text-brand-orange" : sq.status === "Accepted" ? "bg-brand-brown/10 text-brand-brown" : "bg-cream-sand text-brand-brown"}`, children: sq.status || "Draft" })
              ] })
            ]
          },
          sq.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-3 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl p-6 border border-brand-orange/30 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "AI-Powered Generation" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mt-2", children: "Describe what you need to invoice and AI will create the items for you" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: aiPrompt,
                onChange: (e) => setAiPrompt(e.target.value),
                className: "w-full px-4 py-3 border-2 border-brand-orange/30 rounded-lg focus:border-brand-orange focus:outline-none",
                rows: "4",
                placeholder: "Flight from Durban to Cape Town on FlySafair for R4,500, 3 nights hotel accommodation at R1,200 per night, airport transfer for R450"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setShowExamples(!showExamples),
                className: "absolute top-2 right-2 text-xs text-brand-orange hover:text-brand-brown",
                children: "Examples"
              }
            )
          ] }),
          showExamples && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-4 bg-white rounded-lg border border-brand-orange/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-brand-brown mb-2", children: "Example Prompts:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: examplePrompts.map((ex, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => applyExample(ex),
                className: "w-full text-left text-xs p-2 rounded border border-cream-border hover:border-brand-orange hover:bg-brand-orange/5 transition-all",
                children: ex
              },
              i
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, variant: "primary", size: "md", onClick: handleAIGeneration, disabled: loading, children: loading ? "Generating..." : "Generate Invoice Items" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "md", onClick: () => setShowSuggestions(!showSuggestions), children: "Quick Add" })
          ] }),
          showSuggestions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-4 bg-white rounded-lg border border-brand-orange/20 max-h-64 overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-brand-brown mb-3", children: "Common Items:" }),
            suggestCommonItems().map((category, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-xs font-bold text-brand-russty mb-2", children: category.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: category.items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => addSuggestedItem(item),
                  className: "text-left text-xs p-2 rounded border border-cream-border hover:border-brand-orange hover:bg-brand-orange/5 transition-all",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: item.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-russty", children: item.description })
                  ]
                },
                i
              )) })
            ] }, idx))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-cream-border hover:shadow-md transition-shadow", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4 flex items-center gap-2", children: "Document Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Document Type" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      value: quote.documentType,
                      onChange: (e) => setQuote({ ...quote, documentType: e.target.value, invoiceNumber: "" }),
                      className: "w-full px-3 py-2 border-2 border-brand-orange/30 rounded-lg focus:border-brand-orange focus:outline-none bg-white font-semibold",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Invoice", children: "Invoice" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Quotation", children: "Quotation" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: [
                      quote.documentType,
                      " Number"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        value: quote.invoiceNumber,
                        onChange: (e) => setQuote({ ...quote, invoiceNumber: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                        placeholder: "Auto-generated"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Order Number" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        value: quote.orderNumber,
                        onChange: (e) => setQuote({ ...quote, orderNumber: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                        placeholder: "Optional"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Issue Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "date",
                        value: quote.issueDate,
                        onChange: (e) => setQuote({ ...quote, issueDate: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Due Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "date",
                        value: quote.dueDate,
                        onChange: (e) => setQuote({ ...quote, dueDate: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Payment Terms" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: quote.paymentTerms,
                        onChange: (e) => setQuote({ ...quote, paymentTerms: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Due on Receipt" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net 7" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net 15" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net 30" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net 60" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net 90" })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: quote.status,
                        onChange: (e) => setQuote({ ...quote, status: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Draft" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Sent" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Accepted" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Paid" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Cancelled" })
                        ]
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-cream-border hover:shadow-md transition-shadow", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-orange", children: "👤" }),
                "Client Information"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Client Name *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: quote.clientName,
                      onChange: (e) => setQuote({ ...quote, clientName: e.target.value }),
                      className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                      placeholder: "e.g., Umzion Municipality",
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Address" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: quote.clientAddress,
                      onChange: (e) => setQuote({ ...quote, clientAddress: e.target.value }),
                      className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                      rows: "2",
                      placeholder: "Full address"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Phone" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "tel",
                        value: quote.clientPhone,
                        onChange: (e) => setQuote({ ...quote, clientPhone: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                        placeholder: "(039) 976 1202"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Email" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "email",
                        value: quote.clientEmail,
                        onChange: (e) => setQuote({ ...quote, clientEmail: e.target.value }),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                        placeholder: "client@example.com"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "VAT Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: quote.clientVAT,
                      onChange: (e) => setQuote({ ...quote, clientVAT: e.target.value }),
                      className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                      placeholder: "4240193872"
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-cream-border hover:shadow-md transition-shadow", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-brand-brown flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-orange", children: quote.documentType === "Invoice" ? "📄" : "💼" }),
                  quote.documentType === "Invoice" ? "Invoice" : "Quotation",
                  " Items"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "sm", onClick: addItem, children: "Add Item" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2", children: [
                quote.items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-cream-border rounded-xl p-4 bg-white hover:border-brand-orange/50 transition-all group", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-brand-brown bg-cream-sand px-3 py-1 rounded-full", children: [
                      "#",
                      index + 1
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => removeItem(index),
                        className: "text-red-600 hover:text-red-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors",
                        title: "Remove item",
                        children: "✕"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        value: item.title,
                        onChange: (e) => updateItem(index, "title", e.target.value),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm font-medium focus:ring-2 focus:ring-brand-orange/20",
                        placeholder: "Item name (e.g., Flight: FlySafair)"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "textarea",
                      {
                        value: item.description,
                        onChange: (e) => updateItem(index, "description", e.target.value),
                        className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm focus:ring-2 focus:ring-brand-orange/20",
                        rows: "2",
                        placeholder: "Description..."
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-brand-russty mb-1", children: "Qty" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "number",
                            value: item.quantity,
                            onChange: (e) => updateItem(index, "quantity", parseInt(e.target.value) || 0),
                            className: "w-full px-2 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm focus:ring-2 focus:ring-brand-orange/20",
                            min: "1"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-brand-russty mb-1", children: "Unit Price" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "number",
                            value: item.unitPrice,
                            onChange: (e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0),
                            className: "w-full px-2 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm focus:ring-2 focus:ring-brand-orange/20",
                            step: "0.01"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-brand-russty mb-1", children: "Total" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-2 bg-cream-sand rounded-lg text-sm font-bold text-brand-brown border border-cream-border", children: [
                          quote.currency,
                          (item.quantity * item.unitPrice).toFixed(2)
                        ] })
                      ] })
                    ] })
                  ] })
                ] }, index)),
                quote.items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 px-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-16 h-16 text-brand-orange opacity-20", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-semibold mb-2", children: "No items added yet" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mb-4", children: 'Use AI generation above or click "Add Item" to get started' }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "sm", onClick: addItem, children: "Add First Item" }) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 border border-cream-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4 flex items-center gap-2", children: "Totals" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown", children: "Subtotal:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                    quote.currency,
                    totals.subtotal.toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown", children: [
                    "VAT (",
                    quote.taxRate,
                    "%):"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                    quote.currency,
                    totals.vat.toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-cream-border flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown font-bold text-lg", children: "Total:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-lg text-brand-orange", children: [
                    quote.currency,
                    totals.total.toFixed(2)
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, variant: "secondary", size: "lg", onClick: saveQuote, children: "Save Quote" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, variant: "primary", size: "lg", onClick: generatePDF, children: "Generate PDF" }) })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  QuoteGenerator as default
};
//# sourceMappingURL=QuoteGenerator-BSNjDLC-.js.map
