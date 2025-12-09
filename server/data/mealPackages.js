/**
 * Meal Packages Configuration
 * 
 * Handles all meal package scenarios:
 * 1. À la carte items (breakfast, lunch, dinner, soft drinks, bottled water, tea trolley, etc.)
 * 2. Bundled packages (B&B, Half Board, Full Board, All-Inclusive, etc.)
 * 3. Conference meal packages with per-head pricing
 * 4. Custom meal requirements (e.g., "Dinner R300 + 2 soft drinks + lunch voucher R150")
 */

const MEAL_ITEMS = {
  // Breakfast options
  breakfast: {
    id: 'breakfast',
    name: 'Breakfast',
    category: 'meals',
    description: 'Full breakfast (eggs, bread, coffee, juice, fruit)',
    pricePerHead: 85,
    requiresHeadCount: true,
  },
  
  // Lunch options
  lunch: {
    id: 'lunch',
    name: 'Lunch',
    category: 'meals',
    description: 'Lunch (sandwich, salad, beverage)',
    pricePerHead: 150,
    requiresHeadCount: true,
  },
  
  lunch_voucher: {
    id: 'lunch_voucher',
    name: 'Lunch Voucher',
    category: 'meals',
    description: 'Lunch voucher for external use',
    pricePerHead: 150,
    requiresHeadCount: true,
  },
  
  // Dinner options
  dinner: {
    id: 'dinner',
    name: 'Dinner',
    category: 'meals',
    description: 'Three-course dinner',
    pricePerHead: 300,
    requiresHeadCount: true,
  },
  
  dinner_light: {
    id: 'dinner_light',
    name: 'Light Dinner',
    category: 'meals',
    description: 'Light dinner (salad, soup, dessert)',
    pricePerHead: 180,
    requiresHeadCount: true,
  },
  
  // Beverages
  soft_drinks: {
    id: 'soft_drinks',
    name: 'Soft Drinks',
    category: 'beverages',
    description: 'Assorted soft drinks per person',
    pricePerHead: 25,
    requiresHeadCount: true,
  },
  
  bottled_water: {
    id: 'bottled_water',
    name: 'Bottled Water',
    category: 'beverages',
    description: 'Bottled water per person',
    pricePerHead: 15,
    requiresHeadCount: true,
  },
  
  tea_trolley: {
    id: 'tea_trolley',
    name: 'Tea Trolley',
    category: 'beverages',
    description: 'Tea and coffee service with snacks',
    pricePerHead: 45,
    requiresHeadCount: true,
  },
  
  hot_drinks: {
    id: 'hot_drinks',
    name: 'Hot Drinks',
    category: 'beverages',
    description: 'Tea and coffee service',
    pricePerHead: 30,
    requiresHeadCount: true,
  },
  
  // Snacks
  afternoon_snacks: {
    id: 'afternoon_snacks',
    name: 'Afternoon Snacks',
    category: 'snacks',
    description: 'Assorted snacks per person',
    pricePerHead: 40,
    requiresHeadCount: true,
  },
  
  morning_snacks: {
    id: 'morning_snacks',
    name: 'Morning Snacks',
    category: 'snacks',
    description: 'Morning refreshments per person',
    pricePerHead: 35,
    requiresHeadCount: true,
  },
  
  dessert: {
    id: 'dessert',
    name: 'Dessert',
    category: 'snacks',
    description: 'Dessert service per person',
    pricePerHead: 50,
    requiresHeadCount: true,
  },
};

/**
 * BUNDLED MEAL PACKAGES
 * For clients who want predefined packages
 */
const BUNDLED_PACKAGES = {
  // Hotel/Accommodation meal plans
  room_only: {
    id: 'room_only',
    name: 'Room Only',
    category: 'accommodation',
    description: 'Accommodation with no meals',
    items: [],
    type: 'package',
    perNight: true,
  },
  
  bed_breakfast: {
    id: 'bed_breakfast',
    name: 'Bed & Breakfast',
    category: 'accommodation',
    description: 'Accommodation with breakfast included',
    items: ['breakfast'],
    type: 'package',
    perNight: true,
  },
  
  half_board: {
    id: 'half_board',
    name: 'Half Board',
    category: 'accommodation',
    description: 'Accommodation, breakfast, and dinner',
    items: ['breakfast', 'dinner'],
    type: 'package',
    perNight: true,
  },
  
  full_board: {
    id: 'full_board',
    name: 'Full Board',
    category: 'accommodation',
    description: 'Accommodation, breakfast, lunch, and dinner',
    items: ['breakfast', 'lunch', 'dinner'],
    type: 'package',
    perNight: true,
  },
  
  all_inclusive: {
    id: 'all_inclusive',
    name: 'All-Inclusive',
    category: 'accommodation',
    description: 'Accommodation, all meals, beverages, and snacks',
    items: ['breakfast', 'lunch', 'dinner', 'soft_drinks', 'bottled_water', 'tea_trolley', 'afternoon_snacks'],
    type: 'package',
    perNight: true,
  },
  
  // Conference meal packages
  conference_half_day: {
    id: 'conference_half_day',
    name: 'Conference Half-Day Package',
    category: 'conference',
    description: 'Morning tea, light lunch, afternoon snacks',
    items: ['hot_drinks', 'lunch', 'afternoon_snacks'],
    type: 'package',
    perHead: true,
  },
  
  conference_full_day: {
    id: 'conference_full_day',
    name: 'Conference Full-Day Package',
    category: 'conference',
    description: 'Breakfast, tea trolley, lunch, afternoon tea, dinner',
    items: ['breakfast', 'tea_trolley', 'lunch', 'afternoon_snacks', 'dinner'],
    type: 'package',
    perHead: true,
  },
  
  conference_light: {
    id: 'conference_light',
    name: 'Conference Light Package',
    category: 'conference',
    description: 'Tea/coffee, mid-morning snacks, light lunch, afternoon tea',
    items: ['hot_drinks', 'morning_snacks', 'lunch', 'tea_trolley'],
    type: 'package',
    perHead: true,
  },
  
  // Custom bundled packages
  custom_bundle: {
    id: 'custom_bundle',
    name: 'Custom Bundle',
    category: 'custom',
    description: 'Client-defined meal combination',
    items: [], // Populated dynamically
    type: 'custom',
  },
};

/**
 * Get meal item details
 * @param {string} itemId - Item ID (e.g., 'breakfast', 'lunch', 'dinner')
 * @returns {Object} Meal item with pricing and details
 */
function getMealItem(itemId) {
  return MEAL_ITEMS[itemId] || null;
}

/**
 * Get bundled package details
 * @param {string} packageId - Package ID (e.g., 'bed_breakfast', 'full_board')
 * @returns {Object} Package with included items
 */
function getPackage(packageId) {
  return BUNDLED_PACKAGES[packageId] || null;
}

/**
 * Calculate price for a meal package
 * @param {string} packageId - Package ID
 * @param {number} headCount - Number of people (for per-head packages)
 * @param {number} nights - Number of nights (for per-night packages)
 * @returns {Object} Price breakdown with total
 */
function calculatePackagePrice(packageId, headCount = 1, nights = 1) {
  const pkg = BUNDLED_PACKAGES[packageId];
  if (!pkg) return null;
  
  let totalPrice = 0;
  const itemBreakdown = [];
  
  // Calculate price for each item in the package
  for (const itemId of pkg.items) {
    const item = MEAL_ITEMS[itemId];
    if (!item) continue;
    
    let itemPrice = item.pricePerHead || 0;
    let quantity = 1;
    
    // Determine quantity multiplier
    if (pkg.perHead) {
      quantity = headCount;
    } else if (pkg.perNight) {
      quantity = nights;
    }
    
    const itemTotal = itemPrice * quantity;
    totalPrice += itemTotal;
    
    itemBreakdown.push({
      itemId,
      name: item.name,
      pricePerHead: itemPrice,
      quantity,
      total: itemTotal,
    });
  }
  
  return {
    packageId,
    packageName: pkg.name,
    description: pkg.description,
    headCount,
    nights,
    items: itemBreakdown,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    type: pkg.type,
  };
}

/**
 * Calculate price for à la carte meal items
 * @param {Array<string>} itemIds - Array of item IDs to include
 * @param {number} headCount - Number of people
 * @returns {Object} Price breakdown
 */
function calculateAlaCarte(itemIds, headCount = 1) {
  let totalPrice = 0;
  const itemBreakdown = [];
  
  for (const itemId of itemIds) {
    const item = MEAL_ITEMS[itemId];
    if (!item) continue;
    
    const itemPrice = item.pricePerHead || 0;
    const itemTotal = itemPrice * headCount;
    totalPrice += itemTotal;
    
    itemBreakdown.push({
      itemId,
      name: item.name,
      pricePerHead: itemPrice,
      quantity: headCount,
      total: itemTotal,
    });
  }
  
  return {
    type: 'a_la_carte',
    headCount,
    items: itemBreakdown,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
}

/**
 * Create a custom meal requirement
 * Handles scenarios like: "Dinner R300 + 2 soft drinks + lunch voucher R150"
 * @param {Array} mealRequirements - Array of meal requirements
 *   Each: { description, itemId, quantity, pricePerUnit }
 * @param {number} headCount - Number of people
 * @returns {Object} Custom meal bundle with pricing
 */
function createCustomMealBundle(mealRequirements, headCount = 1) {
  let totalPrice = 0;
  const breakdown = [];
  
  for (const req of mealRequirements) {
    let itemTotal = 0;
    
    if (req.itemId && MEAL_ITEMS[req.itemId]) {
      // Get price from preset items
      const item = MEAL_ITEMS[req.itemId];
      itemTotal = (item.pricePerHead || 0) * (req.quantity || 1) * headCount;
    } else if (req.pricePerUnit) {
      // Use custom price
      itemTotal = req.pricePerUnit * (req.quantity || 1) * headCount;
    }
    
    totalPrice += itemTotal;
    
    breakdown.push({
      description: req.description || (req.itemId ? getMealItem(req.itemId)?.name : 'Custom item'),
      quantity: req.quantity || 1,
      perUnit: (itemTotal / ((req.quantity || 1) * headCount)).toFixed(2),
      total: parseFloat(itemTotal.toFixed(2)),
    });
  }
  
  return {
    type: 'custom',
    description: mealRequirements.map(r => r.description).join(' + '),
    headCount,
    items: breakdown,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
}

/**
 * Get all available meal items categorized
 */
function getAllMealItems() {
  const categorized = {
    meals: [],
    beverages: [],
    snacks: [],
  };
  
  for (const [id, item] of Object.entries(MEAL_ITEMS)) {
    if (categorized[item.category]) {
      categorized[item.category].push({ id, ...item });
    }
  }
  
  return categorized;
}

/**
 * Get all bundled packages categorized
 */
function getAllPackages() {
  const categorized = {
    accommodation: [],
    conference: [],
    custom: [],
  };
  
  for (const [id, pkg] of Object.entries(BUNDLED_PACKAGES)) {
    if (categorized[pkg.category]) {
      categorized[pkg.category].push({ id, ...pkg });
    }
  }
  
  return categorized;
}

module.exports = {
  MEAL_ITEMS,
  BUNDLED_PACKAGES,
  getMealItem,
  getPackage,
  calculatePackagePrice,
  calculateAlaCarte,
  createCustomMealBundle,
  getAllMealItems,
  getAllPackages,
};
