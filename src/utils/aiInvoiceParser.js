/**
 * AI-Powered Invoice Item Parser
 * Converts natural language descriptions into structured invoice items
 */

/**
 * Parse natural language prompt into invoice items
 * @param {string} prompt - Natural language description of services/items
 * @returns {Promise<Array>} Array of invoice items
 */
export async function parsePromptToInvoiceItems(prompt) {
  const items = [];
  
  // Split by common delimiters
  const segments = prompt.split(/[,;\n]/).map(s => s.trim()).filter(s => s);
  
  for (const segment of segments) {
    const item = parseSegment(segment);
    if (item) {
      items.push(item);
    }
  }
  
  // If no items parsed, create a generic item
  if (items.length === 0) {
    items.push({
      title: 'Service',
      description: prompt.trim(),
      quantity: 1,
      unitPrice: 0
    });
  }
  
  return items;
}

/**
 * Parse a single segment into an invoice item
 */
function parseSegment(segment) {
  const _lower = segment.toLowerCase();
  
  // Flight patterns
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
        title: 'Flight Booking',
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  
  // Hotel/Accommodation patterns
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
        title: 'Hotel Accommodation',
        description: segment.trim(),
        quantity: quantity,
        unitPrice: price
      };
    }
  }
  
  // Car rental patterns
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
        title: 'Car Rental',
        description: segment.trim(),
        quantity: quantity,
        unitPrice: price
      };
    }
  }
  
  // Tour/Activity patterns
  const tourPatterns = [
    /(?:tour|activity|excursion|safari|cruise).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:tour|activity|excursion|safari|cruise)/i
  ];
  
  for (const pattern of tourPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = match[1] ? extractPrice(match[1]) : 0;
      return {
        title: 'Tour/Activity',
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  
  // Transfer/Transport patterns
  const transferPatterns = [
    /(?:transfer|transport|shuttle|taxi).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:airport|pickup|dropoff|drop-off).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i
  ];
  
  for (const pattern of transferPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = match[1] ? extractPrice(match[1]) : 0;
      return {
        title: 'Transfer Service',
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  
  // Conference/Event patterns
  const eventPatterns = [
    /(?:conference|event|meeting|function|venue).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i
  ];
  
  for (const pattern of eventPatterns) {
    const match = segment.match(pattern);
    if (match) {
      const price = match[1] ? extractPrice(match[1]) : 0;
      return {
        title: 'Event/Conference',
        description: segment.trim(),
        quantity: 1,
        unitPrice: price
      };
    }
  }
  
  // Generic service with price
  const genericPattern = /([a-z\s]+?).*?[r$]?\s*([\d,]+(?:\.\d{2})?)/i;
  const genericMatch = segment.match(genericPattern);
  if (genericMatch && genericMatch[2]) {
    const price = extractPrice(genericMatch[2]);
    return {
      title: genericMatch[1].trim() || 'Service',
      description: segment.trim(),
      quantity: 1,
      unitPrice: price
    };
  }
  
  // Fallback: create item without price if segment has content
  if (segment.length > 5) {
    return {
      title: 'Service',
      description: segment.trim(),
      quantity: 1,
      unitPrice: 0
    };
  }
  
  return null;
}

/**
 * Extract numeric price from string
 */
function extractPrice(str) {
  if (!str) return 0;
  
  // Remove currency symbols and spaces
  const cleaned = str.toString().replace(/[r$\s]/gi, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}

/**
 * Suggest invoice items based on common travel packages
 */
export function suggestCommonItems() {
  return [
    {
      category: 'Flights',
      items: [
        { title: 'Domestic Flight', description: 'One-way domestic flight', unitPrice: 0 },
        { title: 'International Flight', description: 'One-way international flight', unitPrice: 0 },
        { title: 'Return Flight', description: 'Return flight booking', unitPrice: 0 }
      ]
    },
    {
      category: 'Accommodation',
      items: [
        { title: 'Hotel - Standard Room', description: 'Per night', unitPrice: 0 },
        { title: 'Hotel - Deluxe Room', description: 'Per night', unitPrice: 0 },
        { title: 'Guesthouse', description: 'Per night', unitPrice: 0 },
        { title: 'Resort/Lodge', description: 'Per night', unitPrice: 0 }
      ]
    },
    {
      category: 'Transport',
      items: [
        { title: 'Airport Transfer', description: 'One-way transfer', unitPrice: 0 },
        { title: 'Car Rental', description: 'Per day', unitPrice: 0 },
        { title: 'Private Chauffeur', description: 'Per day', unitPrice: 0 }
      ]
    },
    {
      category: 'Activities',
      items: [
        { title: 'City Tour', description: 'Half-day guided tour', unitPrice: 0 },
        { title: 'Safari/Game Drive', description: 'Full-day experience', unitPrice: 0 },
        { title: 'Cultural Experience', description: 'Activity/workshop', unitPrice: 0 }
      ]
    },
    {
      category: 'Services',
      items: [
        { title: 'Travel Insurance', description: 'Per person', unitPrice: 0 },
        { title: 'Visa Assistance', description: 'Processing fee', unitPrice: 0 },
        { title: 'Concierge Service', description: 'Per booking', unitPrice: 0 }
      ]
    }
  ];
}

/**
 * Example usage patterns for AI prompts
 */
export const examplePrompts = [
  "Flight from Durban to Cape Town on FlySafair for R4,500, 3 nights hotel accommodation at R1,200 per night, airport transfer for R450",
  "Return flight Johannesburg to Zanzibar R8,500, 5 nights beachfront resort R2,800 per night, scuba diving tour R1,200",
  "Conference venue hire R15,000, catering for 50 people R350 per person, AV equipment R2,500",
  "3 day car rental at R850 per day, fuel R600, toll fees R120",
  "Safari lodge 4 nights R4,500 per night, 2 game drives R950 each, conservation fee R450"
];
