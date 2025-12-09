/**
 * Legal Consent API Utility
 * Provides functions to interact with backend consent endpoints
 * POPI Act Compliance: Section 11 (Lawful basis for data processing)
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/**
 * Store user consent to legal documents
 * @param {string} userId - Unique user identifier
 * @param {object} consentData - { consentType, acceptedSLA }
 * @returns {Promise} - { success, consentId, timestamp }
 */
export async function storeConsent(userId, consentData = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        consentType: consentData.consentType || 'registration',
        acceptedTerms: true,
        acceptedPrivacy: true,
        acceptedSLA: consentData.acceptedSLA || false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] storeConsent failed:', error);
    throw error;
  }
}

/**
 * Get full consent history for a user
 * POPI Act: Section 14 - User's right to access personal information
 * @param {string} userId - Unique user identifier
 * @returns {Promise} - { userId, consentHistory, totalRecords }
 */
export async function getConsentHistory(userId) {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent/${userId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] getConsentHistory failed:', error);
    throw error;
  }
}

/**
 * Get consent summary for UI display (Privacy Settings)
 * @param {string} userId - Unique user identifier
 * @returns {Promise} - { userId, hasConsented, latestConsent, versions }
 */
export async function getConsentSummary(userId) {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent-summary/${userId}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] getConsentSummary failed:', error);
    throw error;
  }
}

/**
 * Withdraw user consent
 * POPI Act: Section 11.4.3 - User's right to withdraw consent at any time
 * @param {string} userId - Unique user identifier
 * @param {string} reason - Optional reason for withdrawal
 * @returns {Promise} - { success, withdrawalId, message }
 */
export async function withdrawConsent(userId, reason = '') {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent/${userId}/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'Not specified',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] withdrawConsent failed:', error);
    throw error;
  }
}

/**
 * Get current legal document versions
 * @returns {Promise} - { termsVersion, privacyVersion, slaVersion, lastUpdated }
 */
export async function getLegalVersions() {
  try {
    const response = await fetch(`${API_BASE}/api/legal/versions`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] getLegalVersions failed:', error);
    throw error;
  }
}

/**
 * Check if user has given consent
 * Utility function for checking permission before showing certain features
 * @param {string} userId - Unique user identifier
 * @returns {Promise<boolean>} - true if user has consented, false otherwise
 */
export async function hasUserConsented(userId) {
  try {
    const summary = await getConsentSummary(userId);
    return summary.hasConsented && summary.termsAccepted && summary.privacyAccepted;
  } catch (error) {
    console.warn('[consentApi] hasUserConsented check failed, assuming not consented:', error);
    return false;
  }
}

/**
 * Get audit log stats (admin function)
 * @returns {Promise} - { totalConsents, uniqueUsers, acceptedTerms, etc. }
 */
export async function getAuditStats() {
  try {
    const response = await fetch(`${API_BASE}/api/legal/stats`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] getAuditStats failed:', error);
    throw error;
  }
}

/**
 * Get paginated audit log (admin function)
 * @param {object} filters - { userId, action, limit, offset }
 * @returns {Promise} - { total, records, limit, offset }
 */
export async function getAuditLog(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.action) params.append('action', filters.action);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE}/api/legal/audit${queryString}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[consentApi] getAuditLog failed:', error);
    throw error;
  }
}

export default {
  storeConsent,
  getConsentHistory,
  getConsentSummary,
  withdrawConsent,
  getLegalVersions,
  hasUserConsented,
  getAuditStats,
  getAuditLog,
};
