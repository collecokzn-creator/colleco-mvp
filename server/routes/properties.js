/**
 * Properties API Routes
 * 
 * Customer-facing property search (hides supplier relationships)
 */

const express = require('express');
const router = express.Router();
const { getAllProperties, getPropertiesByLocation, getPropertyById } = require('../data/properties');

/**
 * GET /api/properties/search?location=X
 * Search properties by location (customer-facing)
 */
router.get('/search', (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      // Return all properties if no location specified
      return res.json(getAllProperties());
    }
    
    const properties = getPropertiesByLocation(location);
    res.json(properties);
  } catch (error) {
    console.error('[properties API] GET /search error:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

/**
 * GET /api/properties/:propertyId
 * Get property details by ID
 */
router.get('/:propertyId', (req, res) => {
  try {
    const property = getPropertyById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    console.error('[properties API] GET /:propertyId error:', error);
    res.status(500).json({ error: 'Failed to get property' });
  }
});

module.exports = router;
