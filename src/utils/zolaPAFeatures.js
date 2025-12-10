export const zolaPA = {
  preferences: new Map(),
  travelLists: new Map(),
  quotations: new Map(),
  invoices: new Map(),
  quotationCounter: 1,
  invoiceCounter: 1,
  userTaxConfigs: new Map(),
  bookings: new Map(),
  bookingCounter: 1,
  itineraries: new Map(),
  itineraryCounter: 1,
  reminders: new Map(),
  reminderCounter: 1,

  setBusinessTaxConfig(userId, config) {
    const taxConfig = {
      isVATVendor: config.isVATVendor !== undefined ? config.isVATVendor : true,
      taxRate: config.taxRate !== undefined ? config.taxRate : 0.15,
      taxRegNumber: config.taxRegNumber || config.taxNumber || '',
      region: config.region || 'ZA',
      taxName: config.taxName || config.taxType || 'VAT'
    };
    
    if (taxConfig.taxRate < 0 || taxConfig.taxRate > 1) {
      taxConfig.taxRate = Math.max(0, Math.min(1, taxConfig.taxRate));
    }
    
    this.userTaxConfigs.set(userId, taxConfig);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`colleco.pa.taxConfig.${userId}`, JSON.stringify(taxConfig));
    }
    
    return taxConfig;
  },

  getBusinessTaxConfig(userId) {
    let config = this.userTaxConfigs.get(userId);
    
    if (!config && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`colleco.pa.taxConfig.${userId}`);
      if (stored) {
        config = JSON.parse(stored);
        this.userTaxConfigs.set(userId, config);
      }
    }
    
    if (!config) {
      config = { isVATVendor: true, taxRate: 0.15, taxRegNumber: '', region: 'ZA', taxName: 'VAT' };
    }
    
    return { ...config };
  },

  trackPreferences(userId, prefs) {
    const current = this.preferences.get(userId) || { destinations: {}, activities: [] };
    if (prefs.destination) {
      current.destinations[prefs.destination] = (current.destinations[prefs.destination] || 0) + 1;
    }
    if (prefs.activities) current.activities = [...new Set([...current.activities, ...prefs.activities])];
    if (prefs.budget) current.budget = prefs.budget;
    this.preferences.set(userId, current);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`colleco.pa.preferences.${userId}`, JSON.stringify(current));
    }
    
    return current;
  },

  getPreferences(userId) {
    return this.preferences.get(userId) || { destinations: {}, activities: [], budget: 0 };
  },

  generateRecommendations(userId) {
    const _prefs = this.getPreferences(userId);
    return [
      { title: 'Paris Museums Tour', match: 0.95 },
      { title: 'Budget Hotel in Paris', match: 0.85 }
    ];
  },

  manageTravelList(userId, action, item) {
    let list = this.travelLists.get(userId) || [];
    if (action === 'add') list.push(item);
    if (action === 'remove') list = list.filter(i => i.id !== item.id);
    this.travelLists.set(userId, list);
    return list;
  },

  planBudget(userId, days, _destination, _activities) {
    const dailyRate = 150;
    const total = days * dailyRate;
    return {
      budgetBreakdown: {
        accommodation: total * 0.4,
        meals: total * 0.3,
        activities: total * 0.2,
        transportation: total * 0.1,
        total
      },
      tips: ['Book early for discounts', 'Use public transport', 'Eat local', 'Visit free attractions']
    };
  },

  requestConcierge(userId, request) {
    return {
      id: 'REQ-' + Date.now(),
      userId,
      type: request.type,
      status: 'provided_suggestions',
      response: [
        { name: 'Restaurant A', rating: 4.5 },
        { name: 'Restaurant B', rating: 4.3 }
      ],
      createdAt: new Date().toISOString()
    };
  },

  setTravelAlerts(userId, alertPrefs) {
    const alerts = {};
    Object.keys(alertPrefs).forEach(key => {
      alerts[key] = { enabled: alertPrefs[key], frequency: 'daily' };
    });
    return alerts;
  },

  generateQuotation(userId, data) {
    const taxConfig = this.getBusinessTaxConfig(userId);
    const items = data.lineItems || data.items || [];
    const subtotal = items.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = item.unitPrice || item.price || 0;
      return sum + (quantity * price);
    }, 0);
    
    let discount = 0;
    if (data.discount !== undefined && data.discount !== null) {
      // If discount is between 0 and 1, treat as percentage, else absolute value
      discount = (data.discount > 0 && data.discount < 1) ? subtotal * data.discount : data.discount;
    }
    
    const taxableAmount = subtotal - discount;
    const taxRate = taxConfig.isVATVendor ? taxConfig.taxRate : 0;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    const quotation = {
      id: 'QUO-' + (this.quotationCounter++),
      quoteNumber: 'Q-' + Date.now(),
      userId,
      type: data.type,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      items: data.items || items,
      lineItems: items,
      subtotal,
      tax,
      discount: discount || 0,
      total,
      currency: data.currency || 'ZAR',
      status: 'draft',
      taxConfig: taxConfig,
      isVATVendor: taxConfig.isVATVendor,
      taxRate: taxConfig.taxRate,
      taxName: taxConfig.taxName,
      taxRegNumber: taxConfig.taxRegNumber,
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.quotations.set(quotation.id, quotation);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`colleco.pa.quotation.${quotation.id}`, JSON.stringify(quotation));
    }
    return quotation;
  },

  getQuotations(userId) {
    return Array.from(this.quotations.values()).filter(q => q.userId === userId);
  },

  exportQuotationPDF(quotationId) {
    return {
      filename: `quotation_${quotationId}.pdf`,
      status: 'ready_for_export',
      createdAt: new Date().toISOString()
    };
  },

  sendQuotationEmail(quotationId, email) {
    return {
      status: 'sent',
      recipientEmail: email,
      type: 'quotation',
      sentAt: new Date().toISOString()
    };
  },

  calculateDueDate(terms) {
    const days = terms === 'net30' ? 30 : terms === 'net15' ? 15 : 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  },

  generateInvoice(userId, quotationId, paymentTerms = 'net30') {
    const quotation = this.quotations.get(quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const invoice = {
      id: 'INV-' + (this.invoiceCounter++),
      invoiceNumber: 'I-' + Date.now(),
      userId,
      quotationId,
      items: quotation.items,
      lineItems: quotation.lineItems,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      discount: quotation.discount,
      total: quotation.total,
      currency: quotation.currency,
      paymentTerms,
      dueDate: this.calculateDueDate(paymentTerms),
      status: 'sent',
      paidAmount: 0,
      outstandingAmount: quotation.total,
      taxConfig: quotation.taxConfig,
      isVATVendor: quotation.isVATVendor || quotation.taxConfig?.isVATVendor,
      taxRate: quotation.taxRate || quotation.taxConfig?.taxRate,
      taxName: quotation.taxName || quotation.taxConfig?.taxName,
      taxRegNumber: quotation.taxRegNumber || quotation.taxConfig?.taxRegNumber,
      taxNumber: quotation.taxRegNumber || quotation.taxConfig?.taxRegNumber || '',
      payments: [],
      createdAt: new Date().toISOString()
    };

    this.invoices.set(invoice.id, invoice);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`colleco.pa.invoice.${invoice.id}`, JSON.stringify(invoice));
    }
    return invoice;
  },

  recordPayment(invoiceId, amount, method, txnId) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
    invoice.outstandingAmount = invoice.total - invoice.paidAmount;
    invoice.payments = invoice.payments || [];
    invoice.paymentHistory = invoice.paymentHistory || [];
    
    const payment = {
      amount,
      method,
      transactionId: txnId || 'TXN-' + Date.now(),
      paidAt: new Date().toISOString()
    };
    
    invoice.payments.push(payment);
    invoice.paymentHistory.push(payment);

    if (invoice.outstandingAmount <= 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partially_paid';
    }

    this.invoices.set(invoiceId, invoice);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`colleco.pa.invoice.${invoiceId}`, JSON.stringify(invoice));
    }
  },

  getInvoices(userId, filters = {}) {
    let invoices = Array.from(this.invoices.values()).filter(i => i.userId === userId);
    if (filters.outstanding) invoices = invoices.filter(i => i.outstandingAmount > 0);
    return invoices;
  },

  exportInvoicePDF(invoiceId) {
    return {
      filename: `invoice_${invoiceId}.pdf`,
      status: 'ready_for_export',
      createdAt: new Date().toISOString()
    };
  },

  sendInvoiceEmail(invoiceId, email) {
    return {
      status: 'sent',
      recipientEmail: email,
      type: 'invoice',
      sentAt: new Date().toISOString()
    };
  },

  setTaxConfig(config) {
    console.warn('setTaxConfig is deprecated, use setBusinessTaxConfig instead');
    if (config.rate !== undefined) this.taxConfig.rate = config.rate;
    if (config.region !== undefined) this.taxConfig.region = config.region;
    if (config.type !== undefined) this.taxConfig.type = config.type;
    return this.taxConfig;
  },

  getTaxConfig() {
    console.warn('getTaxConfig is deprecated, use getBusinessTaxConfig instead');
    return { ...this.taxConfig };
  },

  scheduleBooking(userId, bookingDetails) {
    const booking = {
      id: 'BKG-' + (this.bookingCounter++),
      userId,
      type: bookingDetails.type,
      destination: bookingDetails.destination,
      startDate: bookingDetails.startDate || bookingDetails.checkIn,
      endDate: bookingDetails.endDate || bookingDetails.checkOut,
      status: 'options_ready',
      confirmationNumber: 'CONF-' + Date.now(),
      details: bookingDetails.details || {},
      guests: bookingDetails.guests,
      budget: bookingDetails.budget,
      propertyType: bookingDetails.propertyType,
      createdAt: new Date().toISOString()
    };
    this.bookings.set(booking.id, booking);
    return booking;
  },

  createItinerary(userId, itineraryData) {
    const startDate = new Date(itineraryData.startDate);
    const endDate = new Date(itineraryData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const activities = [];
    for (let i = 0; i < days; i++) {
      activities.push({
        day: i + 1,
        date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        morning: `Morning activity ${i + 1}`,
        afternoon: `Afternoon activity ${i + 1}`,
        evening: `Evening activity ${i + 1}`
      });
    }
    
    const itinerary = {
      id: 'ITN-' + (this.itineraryCounter++),
      userId,
      destination: itineraryData.destination,
      startDate: itineraryData.startDate,
      endDate: itineraryData.endDate,
      days,
      activities,
      accommodations: itineraryData.accommodations || [],
      transport: itineraryData.transport || [],
      budget: itineraryData.budget,
      interests: itineraryData.interests || [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    this.itineraries.set(itinerary.id, itinerary);
    return itinerary;
  },

  setReminders(userId, bookingId) {
    const reminderTypes = [
      { type: 'booking_confirmation', message: 'Booking confirmed', scheduledFor: new Date(Date.now() + 1000).toISOString() },
      { type: 'packing_reminder', message: 'Time to pack', scheduledFor: new Date(Date.now() + 2000).toISOString() },
      { type: 'check_in_reminder', message: 'Check-in tomorrow', scheduledFor: new Date(Date.now() + 3000).toISOString() },
      { type: 'trip_feedback', message: 'How was your trip?', scheduledFor: new Date(Date.now() + 4000).toISOString() }
    ];
    
    const reminders = reminderTypes.map(rt => {
      const reminder = {
        id: 'REM-' + (this.reminderCounter++),
        userId,
        type: rt.type,
        message: rt.message,
        scheduledFor: rt.scheduledFor,
        bookingId,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      this.reminders.set(reminder.id, reminder);
      return reminder;
    });
    
    return reminders;
  },

  getProactiveSuggestions(_userId) {
    return [
      { type: 'price_drop', title: 'Price drop on Paris hotels', priority: 'high' },
      { type: 'recommendation', title: 'New restaurant in your favorite city', priority: 'medium' }
    ];
  },

  optimizeListings(partnerId, _listingData) {
    return {
      partnerId,
      suggestions: [
        { field: 'price', recommendation: 'Decrease by 10%', impact: 'high' },
        { field: 'description', recommendation: 'Add more keywords', impact: 'medium' }
      ],
      predictedIncrease: 15,
      createdAt: new Date().toISOString()
    };
  },

  manageAvailability(partnerId, availabilityData) {
    return {
      partnerId,
      listingId: availabilityData?.listingId,
      dates: availabilityData?.dates || [],
      status: 'updated',
      updatedAt: new Date().toISOString()
    };
  },

  predictDemand(partnerId, destination, dateRange) {
    return {
      partnerId,
      destination,
      dateRange,
      prediction: {
        demandLevel: 'high',
        confidence: 0.85,
        recommendedPricing: { min: 100, max: 150, optimal: 125 }
      },
      createdAt: new Date().toISOString()
    };
  },

  partnerPA: {
    optimizeListings(_partnerId) {
      return {
        recommendations: [
          { field: 'price', suggestion: 'Reduce by 10%' },
          { field: 'description', suggestion: 'Add keywords' }
        ],
        potentialRevenue: 15000
      };
    },
    manageAvailability(partnerId) {
      return { 
        status: 'updated', 
        partnerId,
        suggestions: ['Increase weekend availability', 'Add seasonal pricing']
      };
    },
    predictDemand(_partnerId, _days) {
      return { predictions: [{ day: 1, demand: 'high' }] };
    }
  }
};
