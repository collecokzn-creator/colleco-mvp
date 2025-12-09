/**
 * Sequence Number Generator for CollEco Travel
 * 
 * Manages sequential numbering for quotes and invoices with persistent storage.
 * Format: PREFIX-YYYY-NNNN (e.g., QT-2025-0001, INV-2025-0001)
 * 
 * Features:
 * - Year-based counter reset
 * - Persistent storage in JSON
 * - Thread-safe sequential increments
 * - Custom prefix support
 */

const fs = require('fs');
const path = require('path');

// Sequences file path
const SEQUENCES_FILE = path.join(__dirname, '../data/sequences.json');

/**
 * Default sequences structure
 */
const DEFAULT_SEQUENCES = {
  quote: {
    year: new Date().getFullYear(),
    counter: 0,
    prefix: 'QT'
  },
  invoice: {
    year: new Date().getFullYear(),
    counter: 0,
    prefix: 'INV'
  }
};

/**
 * Load sequences from file or create default
 * @returns {Object} Sequences object
 */
function loadSequences() {
  try {
    if (fs.existsSync(SEQUENCES_FILE)) {
      const data = fs.readFileSync(SEQUENCES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[sequenceGenerator] Error loading sequences:', err.message);
  }
  
  // Return default if file doesn't exist or error occurred
  return JSON.parse(JSON.stringify(DEFAULT_SEQUENCES));
}

/**
 * Save sequences to file
 * @param {Object} sequences - Sequences object to save
 */
function saveSequences(sequences) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(SEQUENCES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(SEQUENCES_FILE, JSON.stringify(sequences, null, 2), 'utf8');
  } catch (err) {
    console.error('[sequenceGenerator] Error saving sequences:', err.message);
  }
}

/**
 * Generate next quote number
 * @param {Object} options - Optional configuration
 * @param {string} options.prefix - Custom prefix (default: 'QT')
 * @returns {string} Quote number in format PREFIX-YYYY-NNNN
 */
function getNextQuoteNumber(options = {}) {
  const sequences = loadSequences();
  const currentYear = new Date().getFullYear();
  
  // Initialize quote sequence if not exists
  if (!sequences.quote) {
    sequences.quote = {
      year: currentYear,
      counter: 0,
      prefix: options.prefix || 'QT'
    };
  }
  
  // Reset counter if year changed
  if (sequences.quote.year !== currentYear) {
    sequences.quote.year = currentYear;
    sequences.quote.counter = 0;
  }
  
  // Increment counter
  sequences.quote.counter += 1;
  
  // Save updated sequences
  saveSequences(sequences);
  
  // Format: QT-2025-0001
  const prefix = options.prefix || sequences.quote.prefix;
  const paddedNumber = String(sequences.quote.counter).padStart(4, '0');
  
  return `${prefix}-${currentYear}-${paddedNumber}`;
}

/**
 * Generate next invoice number
 * @param {Object} options - Optional configuration
 * @param {string} options.prefix - Custom prefix (default: 'INV')
 * @param {string} options.quoteNumber - Quote number to derive from
 * @returns {string} Invoice number in format PREFIX-YYYY-NNNN
 */
function getNextInvoiceNumber(options = {}) {
  // If converting from quote, derive invoice number
  if (options.quoteNumber) {
    // Convert QT-2025-0001 to INV-2025-0001 (same sequence number)
    const match = options.quoteNumber.match(/([A-Z]+)-(\d{4})-(\d{4})/);
    if (match) {
      const [, , year, number] = match;
      const prefix = options.prefix || 'INV';
      return `${prefix}-${year}-${number}`;
    }
  }
  
  const sequences = loadSequences();
  const currentYear = new Date().getFullYear();
  
  // Initialize invoice sequence if not exists
  if (!sequences.invoice) {
    sequences.invoice = {
      year: currentYear,
      counter: 0,
      prefix: options.prefix || 'INV'
    };
  }
  
  // Reset counter if year changed
  if (sequences.invoice.year !== currentYear) {
    sequences.invoice.year = currentYear;
    sequences.invoice.counter = 0;
  }
  
  // Increment counter
  sequences.invoice.counter += 1;
  
  // Save updated sequences
  saveSequences(sequences);
  
  // Format: INV-2025-0001
  const prefix = options.prefix || sequences.invoice.prefix;
  const paddedNumber = String(sequences.invoice.counter).padStart(4, '0');
  
  return `${prefix}-${currentYear}-${paddedNumber}`;
}

/**
 * Get current counter values without incrementing
 * @returns {Object} Current sequences
 */
function getCurrentSequences() {
  return loadSequences();
}

/**
 * Reset sequences (use with caution - primarily for testing)
 * @param {string} type - Type to reset ('quote' or 'invoice' or 'all')
 */
function resetSequences(type = 'all') {
  const sequences = loadSequences();
  const currentYear = new Date().getFullYear();
  
  if (type === 'quote' || type === 'all') {
    sequences.quote = {
      year: currentYear,
      counter: 0,
      prefix: 'QT'
    };
  }
  
  if (type === 'invoice' || type === 'all') {
    sequences.invoice = {
      year: currentYear,
      counter: 0,
      prefix: 'INV'
    };
  }
  
  saveSequences(sequences);
}

/**
 * Validate number format
 * @param {string} number - Number to validate
 * @param {string} type - Type ('quote' or 'invoice')
 * @returns {boolean} True if valid format
 */
function isValidNumberFormat(number, type = 'quote') {
  const prefix = type === 'quote' ? 'QT' : 'INV';
  const pattern = new RegExp(`^${prefix}-\\d{4}-\\d{4}$`);
  return pattern.test(number);
}

/**
 * Parse number to extract components
 * @param {string} number - Number to parse (e.g., QT-2025-0001)
 * @returns {Object|null} Parsed components or null if invalid
 */
function parseNumber(number) {
  const match = number.match(/^([A-Z]+)-(\d{4})-(\d{4})$/);
  if (!match) return null;
  
  const [, prefix, year, sequence] = match;
  return {
    prefix,
    year: parseInt(year, 10),
    sequence: parseInt(sequence, 10),
    full: number
  };
}

module.exports = {
  getNextQuoteNumber,
  getNextInvoiceNumber,
  getCurrentSequences,
  resetSequences,
  isValidNumberFormat,
  parseNumber
};
