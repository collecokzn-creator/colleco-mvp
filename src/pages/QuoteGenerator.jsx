import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateQuotePdf } from '../utils/pdfGenerators';
import { useUser } from '../context/UserContext';
import { parsePromptToInvoiceItems, suggestCommonItems, examplePrompts } from '../utils/aiInvoiceParser';
import { Link } from 'react-router-dom';
import Button from "../components/ui/Button.jsx";

export default function QuoteGenerator() {
  const { user } = useUser();
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [partnerTemplates, setPartnerTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [_showLogoUpload, _setShowLogoUpload] = useState(false); // legacy flag retained for future logo UX
  const autoSaveTimerRef = useRef(null);
  const [quote, setQuote] = useState({
    documentType: 'Invoice', // 'Invoice' or 'Quotation'
    invoiceNumber: '',
    orderNumber: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    clientVAT: '',
    items: [],
    currency: 'R',
    taxRate: 15,
    status: 'Draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: 'Net 30',
    createdAt: new Date(),
    // Optional custom fields
    companyInfo: null,
    banking: null,
    terms: null
  });

  // Auto-save quote changes after 2 seconds of inactivity
  useEffect(() => {
    if (quote.id && quote.clientName) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer for auto-save
      autoSaveTimerRef.current = setTimeout(() => {
        const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        const index = quotes.findIndex(q => q.id === quote.id);
        if (index !== -1) {
          quotes[index] = { ...quote, updatedAt: new Date() };
          localStorage.setItem('quotes', JSON.stringify(quotes));
        }
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [quote]);
  
  // Define getNextDocumentNumber before useEffect to avoid initialization error
  const getNextDocumentNumber = useCallback((type) => {
    const userId = user?.id || 'default';
    const counterKey = `${type.toLowerCase()}_counter_${userId}`;
    const currentCounter = parseInt(localStorage.getItem(counterKey) || '0');
    const nextCounter = currentCounter + 1;
    localStorage.setItem(counterKey, nextCounter.toString());
    const prefix = type === 'Invoice' ? 'INV' : 'QUO';
    return `${prefix}-${String(nextCounter).padStart(4, '0')}`;
  }, [user?.id]);

  const loadPartnerTemplates = useCallback(() => {
    const templates = JSON.parse(localStorage.getItem(`partner_templates_${user?.id}`) || '[]');
    setPartnerTemplates(templates);
    const def = templates.find(t => t.isDefault);
    if (def && !selectedTemplate) setSelectedTemplate(def);
  }, [user?.id, selectedTemplate]);
  
  // Auto-generate invoice/quote number when client name is added
  useEffect(() => {
    if (quote.clientName && !quote.invoiceNumber) {
      const docNum = getNextDocumentNumber(quote.documentType);
      setQuote(prev => ({ ...prev, invoiceNumber: docNum }));
    }
  }, [quote.clientName, quote.invoiceNumber, quote.documentType, getNextDocumentNumber]);
  
  // Auto-update status based on quote state
  useEffect(() => {
    if (quote.items.length > 0 && quote.clientName) {
      if (quote.status === 'Draft') {
        setQuote(prev => ({ ...prev, status: 'Ready' }));
      }
    }
  }, [quote.items.length, quote.clientName, quote.status]);

  // Load saved quotes and partner templates on mount
  useEffect(() => {
    loadSavedQuotes();
    loadPartnerTemplates();
    loadCustomLogo();
  }, [user, loadPartnerTemplates]);

  function loadSavedQuotes() {
    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    setSavedQuotes(quotes);
  }
  
  function loadCustomLogo() {
    const saved = localStorage.getItem('custom_invoice_logo');
    if (saved) {
      setCustomLogo(saved);
    }
  }
  
  // Removed calculateDueDate (unused) – restore when payment terms logic added
  
  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (dataUrl && typeof dataUrl === 'string') {
        setCustomLogo(dataUrl);
        localStorage.setItem('custom_invoice_logo', dataUrl);
        alert('Logo uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  }
  
  function removeCustomLogo() {
    setCustomLogo(null);
    localStorage.removeItem('custom_invoice_logo');
  }

  // AI-powered invoice generation
  async function handleAIGeneration() {
    if (!aiPrompt.trim()) {
      alert('Please enter a description of what you need invoiced');
      return;
    }

    setLoading(true);
    try {
      // Parse the AI prompt to extract invoice items using enhanced parser
      const items = await parsePromptToInvoiceItems(aiPrompt);
      
      // Auto-generate invoice number
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      
      setQuote(prev => ({
        ...prev,
        invoiceNumber: invoiceNum,
        items: items,
        status: 'AI Generated'
      }));
      
      alert(`✨ Generated ${items.length} invoice item(s) successfully! Review and edit as needed.`);
      setAiPrompt(''); // Clear prompt after successful generation
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate invoice. Please try again or add items manually.');
    } finally {
      setLoading(false);
    }
  }

  // Use example prompt
  function applyExample(example) {
    setAiPrompt(example);
    setShowExamples(false);
  }

  // Add suggested item
  function addSuggestedItem(item) {
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, { ...item, quantity: 1 }]
    }));
  }

  // Add new item manually
  function addItem() {
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, {
        title: '',
        description: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  }

  // Remove item
  function removeItem(index) {
    setQuote(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }

  // Update item
  function updateItem(index, field, value) {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  }

  // Calculate totals
  function calculateTotals() {
    const subtotal = quote.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const vat = (subtotal * quote.taxRate) / 100;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }

  // Generate PDF
  async function generatePDF() {
    if (!quote.clientName) {
      alert('Please enter client name');
      return;
    }
    if (quote.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      // Prepare quote with template data if selected
      const quoteData = {
        ...quote,
        updatedAt: new Date(),
        customLogo: customLogo // Pass custom logo to PDF generator
      };

      // Apply partner template if selected
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
      alert('✅ Invoice PDF generated successfully with your branding!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  // Save quote for later
  function saveQuote() {
    if (!quote.clientName) {
      alert('Please enter client name before saving');
      return;
    }
    
    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    const newQuote = {
      ...quote,
      id: quote.id || `Q-${Date.now()}`,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = quotes.findIndex(q => q.id === newQuote.id);
    if (existingIndex >= 0) {
      quotes[existingIndex] = newQuote;
      alert('Quote updated successfully!');
    } else {
      quotes.push(newQuote);
      alert('Quote saved successfully!');
    }
    
    localStorage.setItem('quotes', JSON.stringify(quotes));
    setQuote(prev => ({ ...prev, id: newQuote.id }));
    loadSavedQuotes();
  }

  // Load existing quote
  function loadQuote(savedQuote) {
    setQuote({
      ...savedQuote,
      createdAt: new Date(savedQuote.createdAt),
      updatedAt: savedQuote.updatedAt ? new Date(savedQuote.updatedAt) : new Date()
    });
  }

  // Create new quote
  function newQuote() {
    setQuote({
      documentType: 'Invoice',
      invoiceNumber: '',
      orderNumber: '',
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      clientVAT: '',
      items: [],
      currency: 'R',
      taxRate: 15,
      status: 'Draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentTerms: 'Net 30',
      createdAt: new Date(),
      companyInfo: null,
      banking: null,
      terms: null
    });
  }

  // Delete quote
  function deleteQuote(id) {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    const filtered = quotes.filter(q => q.id !== id);
    localStorage.setItem('quotes', JSON.stringify(filtered));
    loadSavedQuotes();
    
    if (quote.id === id) {
      newQuote();
    }
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-brown mb-2">Quote & Invoice Generator</h1>
            <p className="text-brand-russty text-sm sm:text-base">
              Create professional invoices with AI assistance or manually
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold" title="Auto-save, auto-numbering, and smart status updates enabled">
                ✨ Smart Mode
              </span>
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button as={Link} to="/partner/templates" variant="outline" size="md">Manage Templates</Button>
            <Button variant="secondary" size="md" onClick={newQuote}>+ New Quote</Button>
          </div>
        </div>

        {/* Template Selector */}
        {partnerTemplates.length > 0 && (
          <div className="mb-6 bg-white rounded-xl p-5 border border-cream-border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-brand-brown text-sm">📋 Template:</span>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={e => {
                    const template = partnerTemplates.find(t => t.id === e.target.value);
                    setSelectedTemplate(template || null);
                  }}
                  className="px-4 py-2 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none bg-white"
                >
                  <option value="">CollEco Default</option>
                  {partnerTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} {template.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTemplate && (
                <div className="text-sm text-brand-russty">
                  Using: <span className="font-semibold">{selectedTemplate.companyInfo.name}</span> branding
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Custom Logo Upload */}
        <div className="mb-6 bg-white rounded-xl p-5 border border-cream-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-brand-brown">Custom Logo</h3>
                <p className="text-xs text-brand-russty">Upload your logo for invoices (optional)</p>
              </div>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              {customLogo ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <img src={customLogo} alt="Custom logo" className="h-8 w-auto object-contain" />
                    <span className="text-xs text-green-700 font-semibold">✓ Logo uploaded</span>
                  </div>
                  <button
                    onClick={removeCustomLogo}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label htmlFor="logoUpload" className="cursor-pointer">
                    <Button as="span" variant="primary" size="sm">Upload Logo</Button>
                  </label>
                  <span className="text-xs text-brand-russty">Max 2MB • PNG, JPG, SVG</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Saved Quotes Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky [top:calc(var(--header-h)+var(--banner-h))] border border-cream-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-brown">📂 Saved Quotes</h3>
                <span className="text-xs text-brand-russty bg-cream-sand px-2 py-1 rounded-full">{savedQuotes.length}</span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {savedQuotes.length === 0 ? (
                  <p className="text-sm text-brand-russty text-center py-4">No saved quotes yet</p>
                ) : (
                  savedQuotes.map(sq => (
                    <div
                      key={sq.id}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        quote.id === sq.id 
                          ? 'border-brand-orange bg-brand-orange/5' 
                          : 'border-cream-border hover:border-brand-orange/50'
                      }`}
                      onClick={() => loadQuote(sq)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-semibold text-sm text-brand-brown truncate flex-1">
                          {sq.clientName || 'Unnamed'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuote(sq.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-brand-russty flex items-center gap-1">
                        <span className="font-mono">{sq.invoiceNumber || 'No #'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold text-brand-orange">
                          {sq.items?.length || 0} {(sq.items?.length || 0) === 1 ? 'item' : 'items'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          sq.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          sq.status === 'Sent' ? 'bg-brand-orange/10 text-brand-orange' :
                          sq.status === 'Accepted' ? 'bg-brand-brown/10 text-brand-brown' :
                          'bg-cream-sand text-brand-brown'
                        }`}>
                          {sq.status || 'Draft'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Generation Section */}
            <div className="bg-white rounded-xl p-6 border border-brand-orange/30 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-brown flex items-center gap-2">
                    <span>AI-Powered Generation</span>
                  </h2>
                  <p className="text-sm text-brand-russty mt-2">
                    Describe what you need to invoice and AI will create the items for you
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-brand-orange/30 rounded-lg focus:border-brand-orange focus:outline-none"
                  rows="4"
                  placeholder="Flight from Durban to Cape Town on FlySafair for R4,500, 3 nights hotel accommodation at R1,200 per night, airport transfer for R450"
                />
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="absolute top-2 right-2 text-xs text-brand-orange hover:text-brand-brown"
                >
                  Examples
                </button>
              </div>

              {showExamples && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-brand-orange/20">
                  <h4 className="text-sm font-bold text-brand-brown mb-2">Example Prompts:</h4>
                  <div className="space-y-2">
                    {examplePrompts.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => applyExample(ex)}
                        className="w-full text-left text-xs p-2 rounded border border-cream-border hover:border-brand-orange hover:bg-brand-orange/5 transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <Button fullWidth variant="primary" size="md" onClick={handleAIGeneration} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Invoice Items'}
                  </Button>
                </div>
                <Button variant="outline" size="md" onClick={() => setShowSuggestions(!showSuggestions)}>Quick Add</Button>
              </div>

              {showSuggestions && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-brand-orange/20 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-bold text-brand-brown mb-3">Common Items:</h4>
                  {suggestCommonItems().map((category, idx) => (
                    <div key={idx} className="mb-3">
                      <h5 className="text-xs font-bold text-brand-russty mb-2">{category.category}</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => addSuggestedItem(item)}
                            className="text-left text-xs p-2 rounded border border-cream-border hover:border-brand-orange hover:bg-brand-orange/5 transition-all"
                          >
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-brand-russty">{item.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grid for Invoice Details and Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Invoice Details */}
              <div className="space-y-6">
            {/* Invoice Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-cream-border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                Document Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">Document Type</label>
                  <select
                    value={quote.documentType}
                    onChange={e => setQuote({...quote, documentType: e.target.value, invoiceNumber: ''})}
                    className="w-full px-3 py-2 border-2 border-brand-orange/30 rounded-lg focus:border-brand-orange focus:outline-none bg-white font-semibold"
                  >
                    <option value="Invoice">Invoice</option>
                    <option value="Quotation">Quotation</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">{quote.documentType} Number</label>
                    <input
                      type="text"
                      value={quote.invoiceNumber}
                      onChange={e => setQuote({...quote, invoiceNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Order Number</label>
                    <input
                      type="text"
                      value={quote.orderNumber}
                      onChange={e => setQuote({...quote, orderNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={quote.issueDate}
                      onChange={e => setQuote({...quote, issueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Due Date</label>
                    <input
                      type="date"
                      value={quote.dueDate}
                      onChange={e => setQuote({...quote, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Payment Terms</label>
                    <select
                      value={quote.paymentTerms}
                      onChange={e => setQuote({...quote, paymentTerms: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    >
                      <option>Due on Receipt</option>
                      <option>Net 7</option>
                      <option>Net 15</option>
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>Net 90</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Status</label>
                    <select
                      value={quote.status}
                      onChange={e => setQuote({...quote, status: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    >
                      <option>Draft</option>
                      <option>Sent</option>
                      <option>Accepted</option>
                      <option>Paid</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-cream-border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                <span className="text-brand-orange">👤</span>
                Client Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={quote.clientName}
                    onChange={e => setQuote({...quote, clientName: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    placeholder="e.g., Umzion Municipality"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">Address</label>
                  <textarea
                    value={quote.clientAddress}
                    onChange={e => setQuote({...quote, clientAddress: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    rows="2"
                    placeholder="Full address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Phone</label>
                    <input
                      type="tel"
                      value={quote.clientPhone}
                      onChange={e => setQuote({...quote, clientPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                      placeholder="(039) 976 1202"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-brown mb-1">Email</label>
                    <input
                      type="email"
                      value={quote.clientEmail}
                      onChange={e => setQuote({...quote, clientEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">VAT Number</label>
                  <input
                    type="text"
                    value={quote.clientVAT}
                    onChange={e => setQuote({...quote, clientVAT: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    placeholder="4240193872"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Items */}
          <div className="space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-cream-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-brown flex items-center gap-2">
                  <span className="text-brand-orange">{quote.documentType === 'Invoice' ? '📄' : '💼'}</span>
                  {quote.documentType === 'Invoice' ? 'Invoice' : 'Quotation'} Items
                </h3>
                <Button variant="primary" size="sm" onClick={addItem}>+ Add Item</Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {quote.items.map((item, index) => (
                  <div key={index} className="border-2 border-cream-border rounded-xl p-4 bg-white hover:border-brand-orange/50 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-semibold text-brand-brown bg-cream-sand px-3 py-1 rounded-full">
                        #{index + 1}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => updateItem(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm font-medium focus:ring-2 focus:ring-brand-orange/20"
                        placeholder="Item name (e.g., Flight: FlySafair)"
                      />
                      <textarea
                        value={item.description}
                        onChange={e => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm focus:ring-2 focus:ring-brand-orange/20"
                        rows="2"
                        placeholder="Description..."
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-brand-russty mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm focus:ring-2 focus:ring-brand-orange/20"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-brand-russty mb-1">Unit Price</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none text-sm focus:ring-2 focus:ring-brand-orange/20"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-brand-russty mb-1">Total</label>
                          <div className="px-2 py-2 bg-cream-sand rounded-lg text-sm font-bold text-brand-brown border border-cream-border">
                            {quote.currency}{(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {quote.items.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <div className="mb-4 flex justify-center">
                      <svg className="w-16 h-16 text-brand-orange opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <p className="text-brand-brown font-semibold mb-2">No items added yet</p>
                    <p className="text-sm text-brand-russty mb-4">Use AI generation above or click &quot;+ Add Item&quot; to get started</p>
                    <div className="flex justify-center gap-2">
                      <Button variant="primary" size="sm" onClick={addItem}>+ Add First Item</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-cream-border">
              <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                Totals
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-brand-brown">Subtotal:</span>
                  <span className="font-semibold">{quote.currency}{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown">VAT ({quote.taxRate}%):</span>
                  <span className="font-semibold">{quote.currency}{totals.vat.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-cream-border flex justify-between">
                  <span className="text-brand-brown font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg text-brand-orange">{quote.currency}{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Button fullWidth variant="secondary" size="lg" onClick={saveQuote}>
                  Save Quote
                </Button>
              </div>
              <div className="flex-1">
                <Button fullWidth variant="primary" size="lg" onClick={generatePDF}>
                  Generate PDF
                </Button>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
