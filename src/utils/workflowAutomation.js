/**
 * AI-Powered Workflow Automation
 * Simplifies business processes with intelligent automation
 */

// Smart booking recommendation engine
export const getBookingRecommendations = async (travelerProfile, travelHistory) => {
  const preferences = analyzePreferences(travelHistory);
  
  return {
    suggestedDestinations: preferences.topDestinations,
    preferredAccommodationType: preferences.accommodationType,
    budgetRange: preferences.avgBudget,
    bestTravelDays: preferences.commonDays,
    aiInsights: generateInsights(travelerProfile, preferences)
  };
};

// Analyze traveler preferences from history
const analyzePreferences = (history) => {
  if (!history || history.length === 0) {
    return {
      topDestinations: [],
      accommodationType: 'hotel',
      avgBudget: 0,
      commonDays: []
    };
  }

  const destinations = {};
  let totalBudget = 0;
  const accommodationTypes = {};
  const travelDays = {};

  history.forEach(trip => {
    // Track destinations
    destinations[trip.destination] = (destinations[trip.destination] || 0) + 1;
    
    // Track budget
    totalBudget += trip.totalAmount || 0;
    
    // Track accommodation preferences
    if (trip.accommodationType) {
      accommodationTypes[trip.accommodationType] = 
        (accommodationTypes[trip.accommodationType] || 0) + 1;
    }
    
    // Track common travel days
    if (trip.startDate) {
      const day = new Date(trip.startDate).getDay();
      travelDays[day] = (travelDays[day] || 0) + 1;
    }
  });

  return {
    topDestinations: Object.entries(destinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dest]) => dest),
    accommodationType: Object.entries(accommodationTypes)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'hotel',
    avgBudget: totalBudget / history.length,
    commonDays: Object.entries(travelDays)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => parseInt(day))
  };
};

// Generate AI insights
const generateInsights = (profile, preferences) => {
  const insights = [];
  
  if (preferences.topDestinations.length > 0) {
    insights.push({
      type: 'destination_preference',
      message: `You frequently visit ${preferences.topDestinations[0]}. We've found similar destinations that might interest you.`,
      actionable: true,
      action: 'view_similar_destinations'
    });
  }
  
  if (preferences.avgBudget > 0) {
    insights.push({
      type: 'budget_optimization',
      message: `Based on your average spend of R${Math.round(preferences.avgBudget)}, we can help you save up to 15% with early bookings.`,
      actionable: true,
      action: 'view_deals'
    });
  }
  
  return insights;
};

// Auto-populate booking forms with smart defaults
export const getSmartBookingDefaults = (travelerData, pastBookings) => {
  const recent = pastBookings[0];
  
  return {
    contactInfo: {
      email: travelerData.email,
      phone: travelerData.phone,
      name: travelerData.name
    },
    preferences: {
      accommodationType: recent?.accommodationType || 'hotel',
      roomType: recent?.roomType || 'standard',
      mealPlan: recent?.mealPlan || 'bed_breakfast',
      specialRequests: recent?.specialRequests || ''
    },
    suggestedDuration: calculateOptimalDuration(pastBookings),
    suggestedBudget: calculateOptimalBudget(pastBookings)
  };
};

// Calculate optimal trip duration based on history
const calculateOptimalDuration = (bookings) => {
  if (!bookings || bookings.length === 0) return 3;
  
  const durations = bookings.map(b => {
    if (!b.startDate || !b.endDate) return 3;
    const days = Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24));
    return days;
  });
  
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
};

// Calculate optimal budget based on history
const calculateOptimalBudget = (bookings) => {
  if (!bookings || bookings.length === 0) return { min: 5000, max: 15000 };
  
  const amounts = bookings.map(b => b.totalAmount || 0).filter(a => a > 0);
  if (amounts.length === 0) return { min: 5000, max: 15000 };
  
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  return {
    min: Math.round(avg * 0.8),
    max: Math.round(avg * 1.2)
  };
};

// Smart approval workflow automation
export const autoRouteApproval = (booking, businessAccount) => {
  const rules = businessAccount.approvalRules || getDefaultApprovalRules();
  
  // Auto-approve if within limits
  if (booking.totalAmount <= rules.autoApproveThreshold) {
    return {
      status: 'auto_approved',
      approver: 'system',
      reason: 'Within auto-approval threshold',
      requiresNotification: true
    };
  }
  
  // Route to appropriate approver
  const approver = determineApprover(booking, rules);
  
  return {
    status: 'pending_approval',
    approver: approver.email,
    approverName: approver.name,
    approverRole: approver.role,
    escalationPath: getEscalationPath(booking, rules),
    deadline: calculateApprovalDeadline(booking)
  };
};

const getDefaultApprovalRules = () => ({
  autoApproveThreshold: 5000,
  managerThreshold: 15000,
  seniorManagerThreshold: 50000,
  executiveThreshold: 100000
});

const determineApprover = (booking, rules) => {
  const amount = booking.totalAmount;
  
  if (amount <= rules.managerThreshold) {
    return { role: 'manager', name: booking.travelerManager, email: booking.travelerManagerEmail };
  } else if (amount <= rules.seniorManagerThreshold) {
    return { role: 'senior_manager', name: 'Senior Manager', email: 'senior@company.com' };
  } else {
    return { role: 'executive', name: 'Executive', email: 'exec@company.com' };
  }
};

const getEscalationPath = (booking, rules) => {
  return [
    { level: 1, role: 'manager', deadline: 24 },
    { level: 2, role: 'senior_manager', deadline: 48 },
    { level: 3, role: 'executive', deadline: 72 }
  ];
};

const calculateApprovalDeadline = (booking) => {
  const tripDate = new Date(booking.startDate);
  const now = new Date();
  const daysUntilTrip = Math.ceil((tripDate - now) / (1000 * 60 * 60 * 24));
  
  // Urgent if trip is within 7 days
  if (daysUntilTrip <= 7) return 4; // 4 hours
  if (daysUntilTrip <= 14) return 24; // 24 hours
  return 48; // 48 hours
};

// Smart invoice generation
export const generateSmartInvoice = async (bookings, businessAccount) => {
  const grouped = groupBookingsByPeriod(bookings, businessAccount.billingPeriod || 'monthly');
  
  return {
    invoiceNumber: generateInvoiceNumber(businessAccount),
    billingPeriod: businessAccount.billingPeriod || 'monthly',
    accountDetails: {
      businessName: businessAccount.businessName,
      registrationNumber: businessAccount.registrationNumber,
      taxNumber: businessAccount.taxNumber,
      billingAddress: formatAddress(businessAccount)
    },
    lineItems: grouped.map(group => ({
      period: group.period,
      bookings: group.bookings,
      subtotal: group.subtotal,
      tax: group.subtotal * 0.15,
      total: group.subtotal * 1.15
    })),
    paymentTerms: businessAccount.paymentTerms || '30 days',
    dueDate: calculateDueDate(businessAccount.paymentTerms),
    aiOptimizations: suggestCostOptimizations(grouped)
  };
};

const groupBookingsByPeriod = (bookings, period) => {
  const groups = {};
  
  bookings.forEach(booking => {
    const date = new Date(booking.bookedAt);
    let key;
    
    if (period === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'weekly') {
      const weekNum = Math.ceil(date.getDate() / 7);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else {
      key = date.getFullYear().toString();
    }
    
    if (!groups[key]) {
      groups[key] = { period: key, bookings: [], subtotal: 0 };
    }
    
    groups[key].bookings.push(booking);
    groups[key].subtotal += booking.totalAmount || 0;
  });
  
  return Object.values(groups);
};

const generateInvoiceNumber = (account) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const accountPrefix = account.id.substring(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `INV-${accountPrefix}-${year}${month}-${random}`;
};

const formatAddress = (account) => {
  return `${account.billingAddress}, ${account.city}, ${account.province}, ${account.postalCode}, ${account.country}`;
};

const calculateDueDate = (terms) => {
  const days = parseInt(terms) || 30;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate.toISOString();
};

const suggestCostOptimizations = (groups) => {
  const suggestions = [];
  
  const totalSpend = groups.reduce((sum, g) => sum + g.subtotal, 0);
  
  if (totalSpend > 50000) {
    suggestions.push({
      type: 'volume_discount',
      message: 'Qualify for 10% volume discount on bookings over R50k/month',
      potentialSaving: totalSpend * 0.1
    });
  }
  
  return suggestions;
};

// Smart traveler assignment
export const suggestTravelerForTrip = (trip, businessTravelers) => {
  const scores = businessTravelers.map(traveler => ({
    traveler,
    score: calculateMatchScore(trip, traveler)
  }));
  
  scores.sort((a, b) => b.score - a.score);
  
  return {
    recommended: scores[0]?.traveler,
    alternatives: scores.slice(1, 4).map(s => s.traveler),
    reasoning: generateRecommendationReasoning(trip, scores[0])
  };
};

const calculateMatchScore = (trip, traveler) => {
  let score = 0;
  
  // Match by department (e.g., Sales trips for Sales staff)
  if (trip.purpose === 'business' && traveler.department === trip.department) {
    score += 40;
  }
  
  // Match by past experience with destination
  if (traveler.visitedDestinations?.includes(trip.destination)) {
    score += 30;
  }
  
  // Match by seniority for high-value trips
  if (trip.estimatedCost > 30000 && traveler.seniority === 'senior') {
    score += 20;
  }
  
  // Availability
  if (traveler.availability === 'available') {
    score += 10;
  }
  
  return score;
};

const generateRecommendationReasoning = (trip, topMatch) => {
  if (!topMatch) return 'No matching travelers found';
  
  const reasons = [];
  
  if (topMatch.traveler.department === trip.department) {
    reasons.push('Department match');
  }
  
  if (topMatch.traveler.visitedDestinations?.includes(trip.destination)) {
    reasons.push('Familiar with destination');
  }
  
  return reasons.join(', ');
};

// Export all utilities
export default {
  getBookingRecommendations,
  getSmartBookingDefaults,
  autoRouteApproval,
  generateSmartInvoice,
  suggestTravelerForTrip
};
