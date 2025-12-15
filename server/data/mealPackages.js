// Minimal mealPackages stub for tests

const MEAL_ITEMS = {
  breakfast: { id: 'breakfast', name: 'Breakfast', pricePerPerson: 10 },
  dinner: { id: 'dinner', name: 'Dinner', pricePerPerson: 20 },
  lunch: { id: 'lunch', name: 'Lunch', pricePerPerson: 15 }
};

const PACKAGES = {
  pkg_basic: { id: 'pkg_basic', name: 'Basic Package', items: ['breakfast'], basePrice: 8 },
  pkg_full: { id: 'pkg_full', name: 'Full Package', items: ['breakfast','lunch','dinner'], basePrice: 40 }
};

function getMealItem(itemId) {
  return MEAL_ITEMS[itemId] || null;
}

function getPackage(packageId) {
  return PACKAGES[packageId] || null;
}

function calculatePackagePrice(packageId, headCount = 1, nights = 1) {
  const pkg = getPackage(packageId);
  if (!pkg) return null;
  // Simple calc: basePrice * headCount * nights
  return { packageId, total: pkg.basePrice * headCount * nights };
}

function calculateAlaCarte(itemIds = [], headCount = 1) {
  const items = itemIds.map(id => MEAL_ITEMS[id] || { id, pricePerPerson: 0 });
  const total = items.reduce((s, it) => s + (it.pricePerPerson || 0) * headCount, 0);
  return { items: itemIds, total };
}

function createCustomMealBundle(mealRequirements = [], headCount = 1) {
  const total = mealRequirements.reduce((s, r) => s + ((r.pricePerUnit || 0) * r.quantity || 0), 0) * headCount;
  return { total, requirements: mealRequirements };
}

function getAllMealItems() {
  return Object.values(MEAL_ITEMS);
}

function getAllPackages() {
  return Object.values(PACKAGES);
}

module.exports = {
  getMealItem,
  getPackage,
  calculatePackagePrice,
  calculateAlaCarte,
  createCustomMealBundle,
  getAllMealItems,
  getAllPackages,
};
