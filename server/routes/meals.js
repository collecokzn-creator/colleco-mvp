const express = require('express');
const {
  getMealItem,
  getPackage,
  calculatePackagePrice,
  calculateAlaCarte,
  createCustomMealBundle,
  getAllMealItems,
  getAllPackages,
} = require('../data/mealPackages');

const router = express.Router();

/**
 * GET /api/meals/items
 * Get all available meal items categorized
 */
router.get('/items', (req, res) => {
  try {
    const items = getAllMealItems();
    res.json(items);
  } catch (error) {
    console.error('[meals] Error fetching items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/meals/packages
 * Get all bundled meal packages categorized
 */
router.get('/packages', (req, res) => {
  try {
    const packages = getAllPackages();
    res.json(packages);
  } catch (error) {
    console.error('[meals] Error fetching packages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/meals/item/:itemId
 * Get details for a specific meal item
 */
router.get('/item/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const item = getMealItem(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Meal item not found' });
    }
    
    res.json({ id: itemId, ...item });
  } catch (error) {
    console.error('[meals] Error fetching item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/meals/package/:packageId
 * Get details for a specific meal package
 */
router.get('/package/:packageId', (req, res) => {
  try {
    const { packageId } = req.params;
    const pkg = getPackage(packageId);
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json({ id: packageId, ...pkg });
  } catch (error) {
    console.error('[meals] Error fetching package:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/meals/calculate-package
 * Calculate price for a meal package
 * 
 * Body:
 * {
 *   packageId: string,
 *   headCount?: number (default 1),
 *   nights?: number (default 1)
 * }
 */
router.post('/calculate-package', (req, res) => {
  try {
    const { packageId, headCount = 1, nights = 1 } = req.body;
    
    if (!packageId) {
      return res.status(400).json({ error: 'packageId is required' });
    }
    
    const pricing = calculatePackagePrice(packageId, headCount, nights);
    
    if (!pricing) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(pricing);
  } catch (error) {
    console.error('[meals] Error calculating package:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/meals/calculate-alacarte
 * Calculate price for à la carte meal items
 * 
 * Body:
 * {
 *   itemIds: string[],
 *   headCount: number
 * }
 */
router.post('/calculate-alacarte', (req, res) => {
  try {
    const { itemIds = [], headCount = 1 } = req.body;
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'itemIds array is required' });
    }
    
    const pricing = calculateAlaCarte(itemIds, headCount);
    res.json(pricing);
  } catch (error) {
    console.error('[meals] Error calculating à la carte:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/meals/calculate-custom
 * Create a custom meal bundle with specific requirements
 * 
 * Body:
 * {
 *   mealRequirements: [
 *     {
 *       description: string,
 *       itemId?: string,
 *       quantity: number,
 *       pricePerUnit?: number
 *     }
 *   ],
 *   headCount: number
 * }
 * 
 * Example:
 * {
 *   mealRequirements: [
 *     { description: "Dinner", itemId: "dinner", quantity: 1 },
 *     { description: "Soft drinks", itemId: "soft_drinks", quantity: 2 },
 *     { description: "Lunch voucher", itemId: "lunch_voucher", quantity: 1 }
 *   ],
 *   headCount: 50
 * }
 */
router.post('/calculate-custom', (req, res) => {
  try {
    const { mealRequirements = [], headCount = 1 } = req.body;
    
    if (!Array.isArray(mealRequirements) || mealRequirements.length === 0) {
      return res.status(400).json({ error: 'mealRequirements array is required' });
    }
    
    const pricing = createCustomMealBundle(mealRequirements, headCount);
    res.json(pricing);
  } catch (error) {
    console.error('[meals] Error calculating custom bundle:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
