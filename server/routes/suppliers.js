/**
 * Suppliers API Routes
 * 
 * Provides access to supplier information for the frontend
 */

const express = require('express');
const router = express.Router();
const { getActiveSuppliers } = require('../utils/suppliers');

/**
 * GET /api/suppliers/active
 * Get all active suppliers
 */
router.get('/active', (req, res) => {
  try {
    const suppliers = getActiveSuppliers();
    
    // Return minimal info for dropdown
    const supplierList = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      serviceTypes: Object.keys(s.commission)
    }));
    
    res.json(supplierList);
  } catch (error) {
    console.error('[suppliers API] GET /active error:', error);
    res.status(500).json({ error: 'Failed to load suppliers' });
  }
});

module.exports = router;
