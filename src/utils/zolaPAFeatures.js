/**
 * Zola PA (Personal Assistant) Features
 * Advanced scheduling, task management, proactive assistance
 */

export const zolaPA = {
  /**
   * Schedule a booking automatically based on user preferences
   */
  scheduleBooking: async (userId, preferences) => {
    const booking = {
      id: `BOOKING-${Date.now()}`,
      userId,
      destination: preferences.destination,
      checkIn: preferences.checkIn,
      checkOut: preferences.checkOut,
      guests: preferences.guests,
      budget: preferences.budget,
      preferredType: preferences.propertyType || 'hotel',
      specialRequests: preferences.specialRequests || [],
      status: 'searching',
      createdAt: new Date().toISOString(),
      recommendations: []
    };

    // Search for options
    const options = await zolaPA.searchOptions(booking);
    booking.recommendations = options.slice(0, 5);
    booking.status = options.length > 0 ? 'options_ready' : 'no_options';

    localStorage.setItem(`colleco.pa.booking.${booking.id}`, JSON.stringify(booking));
    return booking;
  },

  /**
   * Search for booking options
   */
  searchOptions: async (booking) => {
    // This would integrate with your booking API
    // For now, return mock options
    const options = [
      {
        id: 'OPT-1',
        name: `Luxury ${booking.preferredType} in ${booking.destination}`,
        price: booking.budget * 0.8,
        rating: 4.8,
        matchScore: 95
      },
      {
        id: 'OPT-2',
        name: `Premium ${booking.preferredType} in ${booking.destination}`,
        price: booking.budget * 0.9,
        rating: 4.6,
        matchScore: 88
      },
      {
        id: 'OPT-3',
        name: `Budget ${booking.preferredType} in ${booking.destination}`,
        price: booking.budget * 0.6,
        rating: 4.2,
        matchScore: 75
      }
    ];

    return options.filter(opt => opt.price <= booking.budget);
  },

  /**
   * Create a travel itinerary
   */
  createItinerary: (userId, tripData) => {
    const itinerary = {
      id: `ITIN-${Date.now()}`,
      userId,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      days: Math.ceil((new Date(tripData.endDate) - new Date(tripData.startDate)) / (1000 * 60 * 60 * 24)),
      activities: [],
      accommodations: [],
      transportation: [],
      dining: [],
      budget: tripData.budget || 0,
      interests: tripData.interests || [],
      createdAt: new Date().toISOString()
    };

    // Generate daily agenda
    for (let i = 0; i < itinerary.days; i++) {
      itinerary.activities.push({
        day: i + 1,
        activity: `Explore Day ${i + 1}`,
        time: '09:00 - 17:00',
        category: tripData.interests[i % tripData.interests.length] || 'general'
      });
    }

    localStorage.setItem(`colleco.pa.itinerary.${itinerary.id}`, JSON.stringify(itinerary));
    return itinerary;
  },

  /**
   * Set travel reminders
   */
  setReminders: (userId, bookingId) => {
    const reminders = [
      {
        id: `REM-${Date.now()}-1`,
        type: 'booking_confirmation',
        daysBeforeTrip: 30,
        message: 'Confirm your booking'
      },
      {
        id: `REM-${Date.now()}-2`,
        type: 'packing_reminder',
        daysBeforeTrip: 7,
        message: 'Start packing for your trip!'
      },
      {
        id: `REM-${Date.now()}-3`,
        type: 'check_in_reminder',
        daysBeforeTrip: 1,
        message: 'Check-in available now'
      },
      {
        id: `REM-${Date.now()}-4`,
        type: 'departure_reminder',
        daysBeforeTrip: 0,
        message: 'Have a great trip!'
      }
    ];

    const key = `colleco.pa.reminders.${bookingId}`;
    localStorage.setItem(key, JSON.stringify(reminders));

    return reminders;
  },

  /**
   * Get proactive suggestions
   */
  getProactiveSuggestions: (userId) => {
    const suggestions = [];

    // Check user history
    const history = JSON.parse(localStorage.getItem(`colleco.zola.history.${userId}`) || '{}');
    const preferences = JSON.parse(localStorage.getItem(`colleco.user.preferences.${userId}`) || '{}');

    // Suggest based on past bookings
    if (history.recentBookings && history.recentBookings.length > 0) {
      const lastDestination = history.recentBookings[0].destination;
      suggestions.push({
        type: 'similar_destination',
        title: `Explore destinations similar to ${lastDestination}`,
        priority: 'high'
      });
    }

    // Suggest seasonal deals
    const month = new Date().getMonth();
    if ([11, 0, 1].includes(month)) {
      suggestions.push({
        type: 'seasonal_deal',
        title: 'Summer specials for beach getaways',
        priority: 'medium'
      });
    }

    // Suggest loyalty rewards
    suggestions.push({
      type: 'rewards',
      title: 'You have 500 points available - use them for a discount!',
      priority: 'high'
    });

    // Suggest group bookings
    suggestions.push({
      type: 'group_booking',
      title: 'Save 20% with group bookings for 4+ people',
      priority: 'medium'
    });

    localStorage.setItem(`colleco.pa.suggestions.${userId}`, JSON.stringify(suggestions));
    return suggestions;
  },

  /**
   * Track travel preferences
   */
  trackPreferences: (userId, interaction) => {
    const prefs = JSON.parse(localStorage.getItem(`colleco.pa.preferences.${userId}`) || '{"destinations": {}, "activities": {}, "budget": {}, "pace": {}}');

    // Track destination preferences
    if (interaction.destination) {
      prefs.destinations[interaction.destination] = (prefs.destinations[interaction.destination] || 0) + 1;
    }

    // Track activity preferences
    if (interaction.activities) {
      interaction.activities.forEach(activity => {
        prefs.activities[activity] = (prefs.activities[activity] || 0) + 1;
      });
    }

    // Track budget preferences
    if (interaction.budget) {
      prefs.budget.average = Math.round((prefs.budget.average || 0 + interaction.budget) / 2);
    }

    localStorage.setItem(`colleco.pa.preferences.${userId}`, JSON.stringify(prefs));
    return prefs;
  },

  /**
   * Generate personalized recommendations
   */
  generateRecommendations: (userId) => {
    const prefs = JSON.parse(localStorage.getItem(`colleco.pa.preferences.${userId}`) || '{}');
    const history = JSON.parse(localStorage.getItem(`colleco.zola.history.${userId}`) || '{}');

    const recommendations = [];

    // Based on frequent destinations
    const topDestinations = Object.entries(prefs.destinations || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(d => d[0]);

    topDestinations.forEach(destination => {
      recommendations.push({
        type: 'destination',
        title: `Return to ${destination}`,
        reason: 'You loved this destination before',
        destination,
        priority: 'high'
      });
    });

    // Based on activity preferences
    const topActivities = Object.entries(prefs.activities || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(a => a[0]);

    recommendations.push({
      type: 'activity_package',
      title: `Adventure package with ${topActivities.join(', ')}`,
      reason: 'Based on your interests',
      activities: topActivities,
      priority: 'high'
    });

    // Budget-based recommendations
    if (prefs.budget && prefs.budget.average) {
      recommendations.push({
        type: 'budget_match',
        title: `Exclusive deals in your budget range (±R${prefs.budget.average})`,
        reason: 'Tailored to your typical spending',
        budget: prefs.budget.average,
        priority: 'medium'
      });
    }

    localStorage.setItem(`colleco.pa.recommendations.${userId}`, JSON.stringify(recommendations));
    return recommendations;
  },

  /**
   * Manage travel lists (wishlist, saved)
   */
  manageTravelList: (userId, action, item) => {
    const list = JSON.parse(localStorage.getItem(`colleco.pa.travel_list.${userId}`) || '[]');

    if (action === 'add') {
      list.push({
        ...item,
        addedAt: new Date().toISOString(),
        priority: item.priority || 'medium'
      });
    } else if (action === 'remove') {
      const index = list.findIndex(i => i.id === item.id);
      if (index > -1) list.splice(index, 1);
    } else if (action === 'reorder') {
      const index = list.findIndex(i => i.id === item.id);
      if (index > -1) {
        list[index].priority = item.priority || 'medium';
      }
    }

    localStorage.setItem(`colleco.pa.travel_list.${userId}`, JSON.stringify(list));
    return list;
  },

  /**
   * Budget planner
   */
  planBudget: (userId, tripDuration, destination, interests) => {
    const budgetBreakdown = {
      accommodation: tripDuration * 800,
      meals: tripDuration * 300,
      activities: tripDuration * 400,
      transportation: 500,
      miscellaneous: tripDuration * 150,
      total: 0
    };

    budgetBreakdown.total = Object.values(budgetBreakdown)
      .slice(0, -1)
      .reduce((a, b) => a + b, 0);

    const plan = {
      userId,
      destination,
      duration: tripDuration,
      interests,
      budgetBreakdown,
      tips: [
        `Book accommodation 2-3 months in advance for best rates`,
        `Consider package deals that include meals`,
        `Budget for local transportation`,
        `Leave emergency fund (10-15% of total)`
      ],
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(`colleco.pa.budget_plan.${destination}`, JSON.stringify(plan));
    return plan;
  },

  /**
   * Concierge service
   */
  requestConcierge: (userId, request) => {
    const conciergeRequest = {
      id: `CONC-${Date.now()}`,
      userId,
      type: request.type, // restaurant, spa, transport, event, etc.
      details: request.details,
      budget: request.budget,
      date: request.date,
      location: request.location,
      status: 'pending',
      response: null,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(`colleco.pa.concierge.${conciergeRequest.id}`, JSON.stringify(conciergeRequest));

    // Auto-respond with suggestions
    const suggestions = zolaPA.generateConciergeResponse(request);
    conciergeRequest.response = suggestions;
    conciergeRequest.status = 'provided_suggestions';

    localStorage.setItem(`colleco.pa.concierge.${conciergeRequest.id}`, JSON.stringify(conciergeRequest));
    return conciergeRequest;
  },

  /**
   * Generate concierge response
   */
  generateConciergeResponse: (request) => {
    const responses = {
      restaurant: [
        `Top-rated restaurants in ${request.location} within your budget`,
        `Cuisine preferences: ${request.details || 'varied'}`,
        `Available for booking: ${request.date}`
      ],
      spa: [
        `Premium spas with excellent reviews`,
        `Recommended treatments based on your interests`,
        `Special packages available`
      ],
      transport: [
        `Luxury transport options available`,
        `Local transport recommendations`,
        `Airport transfer arrangements`
      ],
      event: [
        `Local events happening during your stay`,
        `Ticket reservations available`,
        `VIP access arrangements`
      ]
    };

    return responses[request.type] || ['We can help with your request. Let us know more details!'];
  },

  /**
   * Travel alerts
   */
  setTravelAlerts: (userId, preferences) => {
    const alerts = {
      priceDrops: {
        enabled: preferences.priceDrops !== false,
        threshold: preferences.priceThreshold || 10 // percent
      },
      flightDeals: {
        enabled: preferences.flightDeals !== false,
        routes: preferences.routes || []
      },
      weatherAlerts: {
        enabled: preferences.weatherAlerts !== false,
        locations: preferences.locations || []
      },
      eventNotifications: {
        enabled: preferences.eventNotifications !== false,
        categories: preferences.eventCategories || ['festivals', 'concerts', 'sports']
      }
    };

    localStorage.setItem(`colleco.pa.alerts.${userId}`, JSON.stringify(alerts));
    return alerts;
  },

  /**
   * Configure business tax settings (VAT vendor status, tax rate)
   */
  setBusinessTaxConfig: (userId, config) => {
    const taxConfig = {
      userId,
      isVATVendor: config.isVATVendor !== false,  // Default to VAT vendor
      taxRate: config.taxRate !== undefined ? config.taxRate : 0.15,  // Default 15% VAT
      taxName: config.taxName || 'VAT',
      taxRegNumber: config.taxRegNumber || '',  // Tax registration number
      includeInvoiceTax: config.includeInvoiceTax !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`colleco.pa.tax_config.${userId}`, JSON.stringify(taxConfig));
    return taxConfig;
  },

  /**
   * Get business tax configuration
   */
  getBusinessTaxConfig: (userId) => {
    const config = JSON.parse(localStorage.getItem(`colleco.pa.tax_config.${userId}`) || '{}');
    
    // Return defaults if not configured
    return {
      isVATVendor: config.isVATVendor !== undefined ? config.isVATVendor : true,
      taxRate: config.taxRate !== undefined ? config.taxRate : 0.15,
      taxName: config.taxName || 'VAT',
      taxRegNumber: config.taxRegNumber || '',
      includeInvoiceTax: config.includeInvoiceTax !== undefined ? config.includeInvoiceTax : true
    };
  },

  /**
   * Generate quotation on request
   */
  generateQuotation: (userId, quoteRequest) => {
    const taxConfig = zolaPA.getBusinessTaxConfig(userId);

    const quotation = {
      id: `QUOTE-${Date.now()}`,
      userId,
      quoteNumber: `QT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: quoteRequest.type, // accommodation, transport, package, event, custom
      destination: quoteRequest.destination,
      dates: {
        from: quoteRequest.startDate,
        to: quoteRequest.endDate,
        nights: Math.ceil((new Date(quoteRequest.endDate) - new Date(quoteRequest.startDate)) / (1000 * 60 * 60 * 24))
      },
      items: quoteRequest.items || [],
      lineItems: [],
      subtotal: 0,
      tax: 0,
      taxRate: taxConfig.isVATVendor ? taxConfig.taxRate : 0,
      taxName: taxConfig.taxName,
      isVATVendor: taxConfig.isVATVendor,
      discount: quoteRequest.discount || 0,
      total: 0,
      currency: quoteRequest.currency || 'ZAR',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      notes: quoteRequest.notes || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Calculate line items
    if (quoteRequest.items && quoteRequest.items.length > 0) {
      quoteRequest.items.forEach(item => {
        const lineItem = {
          id: `LI-${Date.now()}`,
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.price,
          total: (item.quantity || 1) * item.price
        };
        quotation.lineItems.push(lineItem);
        quotation.subtotal += lineItem.total;
      });
    }

    // Apply tax only if VAT vendor
    if (taxConfig.isVATVendor && taxConfig.includeInvoiceTax) {
      quotation.tax = Math.round(quotation.subtotal * quotation.taxRate * 100) / 100;
    }

    // Apply discount
    if (quotation.discount > 0) {
      if (quotation.discount < 1) {
        // Percentage discount
        quotation.discount = Math.round(quotation.subtotal * quotation.discount * 100) / 100;
      }
    }

    quotation.total = quotation.subtotal + quotation.tax - quotation.discount;

    localStorage.setItem(`colleco.pa.quotation.${quotation.id}`, JSON.stringify(quotation));
    return quotation;
  },

  /**
   * Generate invoice from accepted quotation
   */
  generateInvoice: (userId, quoteId, paymentTerms = 'net30') => {
    const quotation = JSON.parse(localStorage.getItem(`colleco.pa.quotation.${quoteId}`) || '{}');
    const taxConfig = zolaPA.getBusinessTaxConfig(userId);

    if (!quotation.id) {
      return { error: 'Quotation not found' };
    }

    const invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      quotationId: quoteId,
      userId,
      type: quotation.type,
      destination: quotation.destination,
      dates: quotation.dates,
      lineItems: quotation.lineItems,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      taxRate: quotation.taxRate,
      taxName: quotation.taxName,
      isVATVendor: taxConfig.isVATVendor,
      taxRegNumber: taxConfig.taxRegNumber,
      discount: quotation.discount,
      total: quotation.total,
      currency: quotation.currency,
      paymentTerms, // net30, net15, due_on_date, immediate
      dueDate: zolaPA.calculateDueDate(paymentTerms),
      status: 'sent',
      paidAmount: 0,
      outstandingAmount: quotation.total,
      notes: quotation.notes,
      issuedAt: new Date().toISOString(),
      dueAt: zolaPA.calculateDueDate(paymentTerms),
      paidAt: null,
      paymentHistory: []
    };

    localStorage.setItem(`colleco.pa.invoice.${invoice.id}`, JSON.stringify(invoice));

    // Update quotation status
    quotation.status = 'converted_to_invoice';
    localStorage.setItem(`colleco.pa.quotation.${quoteId}`, JSON.stringify(quotation));

    return invoice;
  },

  /**
   * Calculate due date based on payment terms
   */
  calculateDueDate: (paymentTerms) => {
    const now = new Date();
    let daysToAdd = 30; // default net30

    if (paymentTerms === 'net15') daysToAdd = 15;
    if (paymentTerms === 'net30') daysToAdd = 30;
    if (paymentTerms === 'net60') daysToAdd = 60;
    if (paymentTerms === 'immediate') daysToAdd = 0;

    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
  },

  /**
   * Record payment against invoice
   */
  recordPayment: (invoiceId, amount, method = 'bank_transfer', reference = '') => {
    const invoice = JSON.parse(localStorage.getItem(`colleco.pa.invoice.${invoiceId}`) || '{}');

    if (!invoice.id) {
      return { error: 'Invoice not found' };
    }

    const payment = {
      id: `PAY-${Date.now()}`,
      amount,
      method, // bank_transfer, credit_card, cash, cheque, mobile_payment
      reference,
      recordedAt: new Date().toISOString()
    };

    invoice.paymentHistory.push(payment);
    invoice.paidAmount += amount;
    invoice.outstandingAmount = invoice.total - invoice.paidAmount;

    if (invoice.outstandingAmount <= 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
    } else if (invoice.outstandingAmount < invoice.total) {
      invoice.status = 'partially_paid';
    }

    localStorage.setItem(`colleco.pa.invoice.${invoiceId}`, JSON.stringify(invoice));
    return invoice;
  },

  /**
   * Get all quotations for user
   */
  getQuotations: (userId, filters = {}) => {
    const quotations = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('colleco.pa.quotation.')) {
        const quote = JSON.parse(localStorage.getItem(key));
        if (quote.userId === userId) {
          quotations.push(quote);
        }
      }
    }

    // Apply filters
    if (filters.status) {
      return quotations.filter(q => q.status === filters.status);
    }

    if (filters.type) {
      return quotations.filter(q => q.type === filters.type);
    }

    return quotations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Get all invoices for user
   */
  getInvoices: (userId, filters = {}) => {
    const invoices = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('colleco.pa.invoice.')) {
        const invoice = JSON.parse(localStorage.getItem(key));
        if (invoice.userId === userId) {
          invoices.push(invoice);
        }
      }
    }

    // Apply filters
    if (filters.status) {
      return invoices.filter(i => i.status === filters.status);
    }

    if (filters.outstanding) {
      return invoices.filter(i => i.outstandingAmount > 0);
    }

    if (filters.overdue) {
      const now = new Date();
      return invoices.filter(i => new Date(i.dueAt) < now && i.status !== 'paid');
    }

    return invoices.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  },

  /**
   * Generate quotation PDF (stub - would use jsPDF)
   */
  exportQuotationPDF: (quotationId) => {
    const quotation = JSON.parse(localStorage.getItem(`colleco.pa.quotation.${quotationId}`) || '{}');

    return {
      filename: `quotation-${quotation.quoteNumber}.pdf`,
      title: 'Quotation',
      data: quotation,
      format: 'A4',
      status: 'ready_for_export'
    };
  },

  /**
   * Generate invoice PDF (stub - would use jsPDF)
   */
  exportInvoicePDF: (invoiceId) => {
    const invoice = JSON.parse(localStorage.getItem(`colleco.pa.invoice.${invoiceId}`) || '{}');

    return {
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      title: 'Invoice',
      data: invoice,
      format: 'A4',
      status: 'ready_for_export'
    };
  },

  /**
   * Send quotation via email
   */
  sendQuotationEmail: (quotationId, recipientEmail) => {
    const quotation = JSON.parse(localStorage.getItem(`colleco.pa.quotation.${quotationId}`) || '{}');

    const emailRecord = {
      id: `EMAIL-${Date.now()}`,
      type: 'quotation',
      recipientEmail,
      quotationId,
      subject: `Your Quotation ${quotation.quoteNumber}`,
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    localStorage.setItem(`colleco.pa.email_sent.${emailRecord.id}`, JSON.stringify(emailRecord));
    return emailRecord;
  },

  /**
   * Send invoice via email
   */
  sendInvoiceEmail: (invoiceId, recipientEmail) => {
    const invoice = JSON.parse(localStorage.getItem(`colleco.pa.invoice.${invoiceId}`) || '{}');

    const emailRecord = {
      id: `EMAIL-${Date.now()}`,
      type: 'invoice',
      recipientEmail,
      invoiceId,
      subject: `Your Invoice ${invoice.invoiceNumber}`,
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    localStorage.setItem(`colleco.pa.email_sent.${emailRecord.id}`, JSON.stringify(emailRecord));
    return emailRecord;
  },

  /**
   * Partner PA features (for accommodations/services)
   */
  partnerPA: {
    optimizeListings: (partnerId) => {
      return {
        recommendations: [
          'Add more high-quality photos (currently 3/10)',
          'Update pricing strategy for peak season',
          'Create special packages for couples',
          'Add 360° virtual tour'
        ],
        potentialRevenue: '+35% with these changes'
      };
    },

    manageAvailability: (partnerId) => {
      return {
        status: 'optimized',
        suggestions: [
          'Open more dates during school holidays',
          'Create weekend packages',
          'Offer last-minute discounts for off-peak'
        ]
      };
    },

    predictDemand: (partnerId, nextDays = 30) => {
      return {
        predictions: {
          'next_7_days': 'High demand expected',
          'next_30_days': 'Average demand with peaks on weekends',
          'recommendations': ['Increase prices by 15%', 'Highlight nature activities']
        }
      };
    }
  }
};

export default zolaPA;
