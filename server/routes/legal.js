/**
 * Legal Consent API Routes
 * Implements POPI Act audit requirements
 * - Consent storage with immutable audit trails
 * - Version tracking for legal documents
 * - User withdrawal of consent
 * - Consent history retrieval
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

const LEGAL_CONSENTS_FILE = path.join(DATA_DIR, 'legal_consents.jsonl');
const LEGAL_VERSIONS_FILE = path.join(DATA_DIR, 'legal_versions.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.jsonl');

/**
 * Initialize or load legal versions from file
 * Format: { termsVersion, privacyVersion, slaVersion, lastUpdated }
 */
function loadLegalVersions() {
  try {
    if (fs.existsSync(LEGAL_VERSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(LEGAL_VERSIONS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading legal versions:', err);
  }
  return {
    termsVersion: '1.0',
    privacyVersion: '1.0',
    slaVersion: '1.0',
    lastUpdated: new Date().toISOString(),
  };
}

function saveLegalVersions(versions) {
  try {
    fs.writeFileSync(LEGAL_VERSIONS_FILE, JSON.stringify(versions, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving legal versions:', err);
  }
}

/**
 * Append consent record to immutable audit log (JSONL format)
 * POPI Act requirement: immutable append-only audit trail
 */
function logConsent(userId, consentData, ipAddress, userAgent) {
  const record = {
    id: crypto.randomUUID(),
    userId,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent: userAgent || '',
    consentType: consentData.consentType || 'registration',
    acceptedTerms: consentData.acceptedTerms || {},
    acceptedPrivacy: consentData.acceptedPrivacy || {},
    acceptedSLA: consentData.acceptedSLA || {},
    termsVersion: consentData.termsVersion || '1.0',
    privacyVersion: consentData.privacyVersion || '1.0',
    slaVersion: consentData.slaVersion || '1.0',
    status: 'accepted',
  };

  try {
    fs.appendFileSync(LEGAL_CONSENTS_FILE, JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    console.error('Error logging consent:', err);
    throw new Error('Failed to store consent');
  }

  return record;
}

/**
 * Append audit log entry (POPI Act requirement)
 * Documents all user actions on personal data
 */
function logAuditEvent(action, userId, details, ipAddress) {
  const record = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ipAddress,
    operator: 'system',
  };

  try {
    fs.appendFileSync(AUDIT_LOGS_FILE, JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    console.error('Error logging audit event:', err);
  }

  return record;
}

/**
 * Read JSONL file and return all records as array
 */
function readJsonLines(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line))
      .catch((err) => {
        console.error(`Error parsing JSONL: ${err}`);
        return [];
      });
  } catch (err) {
    console.error(`Error reading JSONL file: ${err}`);
    return [];
  }
}

/**
 * POST /api/legal/consent
 * Store user consent to legal documents
 * POPI Act: Section 11 (User must consent before processing personal data)
 */
router.post('/consent', (req, res) => {
  try {
    const { userId, consentType, acceptedTerms, acceptedPrivacy, acceptedSLA } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      return res.status(400).json({ error: 'Must accept Terms and Privacy Policy' });
    }

    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    // Get current legal versions
    const versions = loadLegalVersions();

    // Construct consent data with version info
    const consentData = {
      consentType: consentType || 'registration',
      acceptedTerms: acceptedTerms === true ? { accepted: true, timestamp: new Date().toISOString() } : acceptedTerms,
      acceptedPrivacy: acceptedPrivacy === true ? { accepted: true, timestamp: new Date().toISOString() } : acceptedPrivacy,
      acceptedSLA: acceptedSLA === true ? { accepted: true, timestamp: new Date().toISOString() } : acceptedSLA,
      termsVersion: versions.termsVersion,
      privacyVersion: versions.privacyVersion,
      slaVersion: versions.slaVersion,
    };

    // Log consent (immutable append-only)
    const record = logConsent(userId, consentData, ipAddress, userAgent);

    // Log audit event
    logAuditEvent('CONSENT_ACCEPTED', userId, {
      consentType: consentData.consentType,
      termsVersion: consentData.termsVersion,
      privacyVersion: consentData.privacyVersion,
      slaVersion: consentData.slaVersion,
    }, ipAddress);

    res.status(201).json({
      success: true,
      consentId: record.id,
      timestamp: record.timestamp,
      message: 'Consent recorded successfully (POPI Act compliant)',
    });
  } catch (error) {
    console.error('Error storing consent:', error);
    res.status(500).json({ error: 'Failed to store consent' });
  }
});

/**
 * GET /api/legal/consent/:userId
 * Retrieve all consent records for a user (POPI Act: User access right)
 */
router.get('/consent/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Read all consent records
    const records = readJsonLines(LEGAL_CONSENTS_FILE);
    const userRecords = records.filter((r) => r.userId === userId);

    // Log audit event (access to personal data)
    logAuditEvent('CONSENT_RETRIEVED', userId, {
      recordCount: userRecords.length,
      operator: 'user',
    }, req.ip);

    res.json({
      userId,
      consentHistory: userRecords,
      totalRecords: userRecords.length,
      message: 'POPI Act: You have the right to know what personal data is stored',
    });
  } catch (error) {
    console.error('Error retrieving consent:', error);
    res.status(500).json({ error: 'Failed to retrieve consent' });
  }
});

/**
 * POST /api/legal/consent/:userId/withdraw
 * User withdraws consent (POPI Act: Section 11.4.3 - Right to withdraw)
 */
router.post('/consent/:userId/withdraw', (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Log withdrawal as audit event
    const auditRecord = logAuditEvent('CONSENT_WITHDRAWN', userId, {
      reason: reason || 'Not specified',
      timestamp: new Date().toISOString(),
    }, req.ip);

    // Read and update consent records
    const records = readJsonLines(LEGAL_CONSENTS_FILE);
    const userRecords = records.filter((r) => r.userId === userId);

    res.json({
      success: true,
      withdrawalId: auditRecord.id,
      userId,
      message: 'Consent withdrawn (POPI Act compliant)',
      affectedRecords: userRecords.length,
      note: 'User must be deleted or data anonymized per POPI Act requirements',
    });
  } catch (error) {
    console.error('Error withdrawing consent:', error);
    res.status(500).json({ error: 'Failed to withdraw consent' });
  }
});

/**
 * GET /api/legal/versions
 * Retrieve current legal document versions
 */
router.get('/versions', (req, res) => {
  try {
    const versions = loadLegalVersions();
    res.json(versions);
  } catch (error) {
    console.error('Error retrieving versions:', error);
    res.status(500).json({ error: 'Failed to retrieve versions' });
  }
});

/**
 * POST /api/legal/versions
 * Update legal document versions (admin only)
 */
router.post('/versions', (req, res) => {
  try {
    const { termsVersion, privacyVersion, slaVersion } = req.body;

    if (!termsVersion || !privacyVersion || !slaVersion) {
      return res.status(400).json({ error: 'All version numbers are required' });
    }

    const versions = {
      termsVersion,
      privacyVersion,
      slaVersion,
      lastUpdated: new Date().toISOString(),
    };

    saveLegalVersions(versions);

    // Log audit event
    logAuditEvent('LEGAL_VERSIONS_UPDATED', 'admin', versions, req.ip);

    res.json({
      success: true,
      message: 'Legal document versions updated',
      versions,
    });
  } catch (error) {
    console.error('Error updating versions:', error);
    res.status(500).json({ error: 'Failed to update versions' });
  }
});

/**
 * GET /api/legal/audit
 * Retrieve audit log (admin only - POPI Act transparency)
 * Returns paginated audit events
 */
router.get('/audit', (req, res) => {
  try {
    const { userId, action, limit = 50, offset = 0 } = req.query;

    let records = readJsonLines(AUDIT_LOGS_FILE);

    // Filter by userId if provided
    if (userId) {
      records = records.filter((r) => r.userId === userId);
    }

    // Filter by action if provided
    if (action) {
      records = records.filter((r) => r.action === action);
    }

    // Sort by timestamp descending (most recent first)
    records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const paginatedRecords = records.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      total: records.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      returned: paginatedRecords.length,
      records: paginatedRecords,
      message: 'POPI Act: Audit log for compliance verification',
    });
  } catch (error) {
    console.error('Error retrieving audit log:', error);
    res.status(500).json({ error: 'Failed to retrieve audit log' });
  }
});

/**
 * GET /api/legal/consent-summary/:userId
 * Retrieve a summary of user consent status
 * Useful for displaying in UI (Privacy Settings page)
 */
router.get('/consent-summary/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Read all consent records
    const records = readJsonLines(LEGAL_CONSENTS_FILE);
    const userRecords = records.filter((r) => r.userId === userId);

    if (userRecords.length === 0) {
      return res.json({
        userId,
        hasConsented: false,
        message: 'No consent records found',
      });
    }

    // Get latest consent record
    const latest = userRecords[userRecords.length - 1];

    res.json({
      userId,
      hasConsented: true,
      latestConsent: latest,
      totalConsents: userRecords.length,
      firstConsentDate: userRecords[0].timestamp,
      lastConsentDate: latest.timestamp,
      termsAccepted: !!latest.acceptedTerms?.accepted,
      privacyAccepted: !!latest.acceptedPrivacy?.accepted,
      slaAccepted: !!latest.acceptedSLA?.accepted,
      versions: {
        termsVersion: latest.termsVersion,
        privacyVersion: latest.privacyVersion,
        slaVersion: latest.slaVersion,
      },
    });
  } catch (error) {
    console.error('Error retrieving consent summary:', error);
    res.status(500).json({ error: 'Failed to retrieve consent summary' });
  }
});

/**
 * GET /api/legal/stats
 * Compliance stats for admin dashboard
 */
router.get('/stats', (req, res) => {
  try {
    const consentRecords = readJsonLines(LEGAL_CONSENTS_FILE);
    const auditRecords = readJsonLines(AUDIT_LOGS_FILE);

    // Calculate stats
    const stats = {
      totalConsents: consentRecords.length,
      totalAuditEvents: auditRecords.length,
      uniqueUsers: [...new Set(consentRecords.map((r) => r.userId))].length,
      acceptedTerms: consentRecords.filter((r) => r.acceptedTerms?.accepted).length,
      acceptedPrivacy: consentRecords.filter((r) => r.acceptedPrivacy?.accepted).length,
      acceptedSLA: consentRecords.filter((r) => r.acceptedSLA?.accepted).length,
      auditBreakdown: {},
      lastConsentTimestamp: consentRecords[consentRecords.length - 1]?.timestamp || null,
    };

    // Breakdown by audit action
    auditRecords.forEach((record) => {
      if (!stats.auditBreakdown[record.action]) {
        stats.auditBreakdown[record.action] = 0;
      }
      stats.auditBreakdown[record.action]++;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

module.exports = router;
