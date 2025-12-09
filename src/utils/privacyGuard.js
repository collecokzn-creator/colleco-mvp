/**
 * Privacy Guard - CollEco Platform
 * POPI Act Compliance Layer
 * 
 * Ensures all user data is protected and compliant with:
 * - Protection of Personal Information Act (POPI Act) - South Africa
 * - GDPR principles (where applicable)
 * - Privacy by Design methodology
 */

// ==================== DATA CLASSIFICATION ====================

export const DATA_SENSITIVITY_LEVELS = {
  PUBLIC: 'public',           // No restrictions (e.g., public reviews without names)
  INTERNAL: 'internal',       // Internal use only (e.g., analytics)
  CONFIDENTIAL: 'confidential', // Requires consent (e.g., location data)
  RESTRICTED: 'restricted',   // Highly sensitive (e.g., ID numbers, payment info)
};

export const PERSONAL_DATA_FIELDS = {
  // RESTRICTED - Never display publicly, encryption required
  restricted: [
    'idNumber',
    'passportNumber',
    'ssn',
    'taxNumber',
    'creditCardNumber',
    'cvv',
    'bankAccountNumber',
    'password',
    'securityAnswer',
    'biometricData',
  ],
  
  // CONFIDENTIAL - Requires explicit consent
  confidential: [
    'email',
    'phone',
    'mobileNumber',
    'fullAddress',
    'streetAddress',
    'postalCode',
    'dateOfBirth',
    'age',
    'gender',
    'nationality',
    'ipAddress',
    'deviceId',
    'geolocation',
    'gpsCoordinates',
  ],
  
  // INTERNAL - Limited sharing, anonymization required
  internal: [
    'firstName',
    'lastName',
    'fullName',
    'username',
    'profilePhoto',
    'preferences',
    'bookingHistory',
    'searchHistory',
  ],
  
  // PUBLIC - Can be shared with consent
  public: [
    'city',
    'country',
    'businessName',
    'publicReviews',
    'displayName',
  ],
};

// ==================== CONSENT MANAGEMENT ====================

/**
 * Consent types for POPI Act compliance
 */
export const CONSENT_TYPES = {
  ESSENTIAL: 'essential',           // Required for service (e.g., booking confirmation)
  FUNCTIONAL: 'functional',         // Enhances experience (e.g., save preferences)
  ANALYTICS: 'analytics',           // Usage analytics (anonymized)
  MARKETING: 'marketing',           // Promotional communications
  THIRD_PARTY: 'third_party',       // Sharing with partners
  LEADERBOARDS: 'leaderboards',     // Gamification visibility
  LOCATION: 'location',             // GPS/location services
  PROFILING: 'profiling',           // Personalization algorithms
};

/**
 * Get user consent status
 */
export function getUserConsent(userId) {
  try {
    const data = localStorage.getItem(`colleco.privacy.consent.${userId}`);
    return data ? JSON.parse(data) : {
      essential: true,        // Always true (required for service)
      functional: false,
      analytics: false,
      marketing: false,
      third_party: false,
      leaderboards: false,
      location: false,
      profiling: false,
      consentDate: null,
      lastUpdated: null,
      version: null,
    };
  } catch {
    return {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      third_party: false,
      leaderboards: false,
      location: false,
      profiling: false,
      consentDate: null,
      lastUpdated: null,
      version: null,
    };
  }
}

/**
 * Set user consent (POPI Act compliant)
 */
export function setUserConsent(userId, consents) {
  const consentRecord = {
    ...consents,
    essential: true, // Always required
    consentDate: consents.consentDate || new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    ipAddress: null, // Don't store IP (privacy by design)
    userAgent: navigator.userAgent.substring(0, 50), // Limited browser info
  };
  
  localStorage.setItem(`colleco.privacy.consent.${userId}`, JSON.stringify(consentRecord));
  
  // Log consent change for audit trail
  logConsentChange(userId, consents);
  
  return { success: true, consent: consentRecord };
}

/**
 * Check if user has given specific consent
 */
export function hasConsent(userId, consentType) {
  const consent = getUserConsent(userId);
  
  // Essential consent always granted
  if (consentType === CONSENT_TYPES.ESSENTIAL) {
    return true;
  }
  
  return consent[consentType] === true;
}

/**
 * Log consent changes (audit trail for POPI compliance)
 */
function logConsentChange(userId, consents) {
  try {
    const logs = JSON.parse(localStorage.getItem('colleco.privacy.audit_log') || '[]');
    logs.push({
      userId,
      timestamp: new Date().toISOString(),
      action: 'consent_updated',
      consents,
    });
    
    // Keep last 1000 entries
    if (logs.length > 1000) {
      logs.shift();
    }
    
    localStorage.setItem('colleco.privacy.audit_log', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log consent change:', e);
  }
}

// ==================== DATA ANONYMIZATION ====================

/**
 * Anonymize personal data (POPI Act compliant)
 */
export function anonymizeData(data, level = 'full') {
  if (!data) return data;
  
  const anonymized = { ...data };
  
  if (level === 'full') {
    // Remove all identifiable information
    PERSONAL_DATA_FIELDS.restricted.forEach(field => delete anonymized[field]);
    PERSONAL_DATA_FIELDS.confidential.forEach(field => delete anonymized[field]);
    PERSONAL_DATA_FIELDS.internal.forEach(field => {
      if (field === 'firstName' || field === 'lastName' || field === 'fullName') {
        delete anonymized[field];
      }
    });
  } else if (level === 'partial') {
    // Remove only restricted data
    PERSONAL_DATA_FIELDS.restricted.forEach(field => delete anonymized[field]);
  }
  
  return anonymized;
}

/**
 * Mask sensitive data (e.g., email, phone)
 */
export function maskSensitiveData(value, type) {
  if (!value) return value;
  
  switch (type) {
    case 'email': {
      const [username, domain] = value.split('@');
      if (!domain) return '***';
      return `${username.substring(0, 2)}***@${domain}`;
    }
      
    case 'phone':
      return value.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
      
    case 'idNumber':
      return value.replace(/\d(?=\d{4})/g, '*');
      
    case 'creditCard':
      return value.replace(/\d(?=\d{4})/g, '*');
      
    case 'address':
      return value.split(',')[0] + ', ***'; // Only show street, hide rest
      
    case 'name': {
      const parts = value.split(' ');
      return parts.length > 1 
        ? `${parts[0]} ${parts[1].charAt(0)}.`
        : parts[0];
    }
      
    default:
      return '***';
  }
}

/**
 * Redact sensitive fields from object
 */
export function redactSensitiveFields(obj) {
  const redacted = { ...obj };
  
  PERSONAL_DATA_FIELDS.restricted.forEach(field => {
    if (redacted[field]) {
      redacted[field] = '[REDACTED]';
    }
  });
  
  return redacted;
}

// ==================== DATA SHARING CONTROLS ====================

/**
 * Check if data can be shared with third party
 */
export function canShareWithThirdParty(userId, dataType) {
  const consent = getUserConsent(userId);
  
  // Restricted data can NEVER be shared
  if (PERSONAL_DATA_FIELDS.restricted.includes(dataType)) {
    return false;
  }
  
  // Confidential data requires explicit consent
  if (PERSONAL_DATA_FIELDS.confidential.includes(dataType)) {
    return consent.third_party === true;
  }
  
  // Internal data requires consent
  if (PERSONAL_DATA_FIELDS.internal.includes(dataType)) {
    return consent.third_party === true;
  }
  
  // Public data can be shared with consent
  return consent.third_party === true;
}

/**
 * Get shareable user profile (removes sensitive data)
 */
export function getShareableProfile(userId, userProfile, sharingContext = 'public') {
  const consent = getUserConsent(userId);
  const profile = { ...userProfile };
  
  // Always remove restricted data
  PERSONAL_DATA_FIELDS.restricted.forEach(field => delete profile[field]);
  
  if (sharingContext === 'public') {
    // Remove confidential and internal data
    PERSONAL_DATA_FIELDS.confidential.forEach(field => delete profile[field]);
    PERSONAL_DATA_FIELDS.internal.forEach(field => {
      if (!PERSONAL_DATA_FIELDS.public.includes(field)) {
        delete profile[field];
      }
    });
  } else if (sharingContext === 'partner') {
    // Remove confidential data unless consent given
    if (!consent.third_party) {
      PERSONAL_DATA_FIELDS.confidential.forEach(field => delete profile[field]);
    }
  }
  
  return profile;
}

// ==================== DATA RETENTION ====================

/**
 * Data retention periods (POPI Act Section 14)
 */
export const RETENTION_PERIODS = {
  BOOKING_DATA: 365 * 7,      // 7 years (tax/legal requirement)
  USER_PROFILE: 365 * 2,       // 2 years after last activity
  CONSENT_RECORDS: 365 * 7,    // 7 years (audit requirement)
  ANALYTICS: 365 * 1,          // 1 year
  MARKETING_DATA: 365 * 1,     // 1 year
  SUPPORT_TICKETS: 365 * 3,    // 3 years
  FINANCIAL_RECORDS: 365 * 7,  // 7 years (legal requirement)
};

/**
 * Check if data should be deleted (retention policy)
 */
export function shouldDeleteData(dataType, createdDate) {
  const retentionDays = RETENTION_PERIODS[dataType];
  if (!retentionDays) return false;
  
  const daysSinceCreation = Math.floor((Date.now() - new Date(createdDate)) / (1000 * 60 * 60 * 24));
  return daysSinceCreation > retentionDays;
}

/**
 * Schedule data deletion (right to erasure)
 */
export function scheduleDataDeletion(userId, dataType, reason = 'retention_policy') {
  const deletionRequest = {
    userId,
    dataType,
    reason,
    requestedAt: new Date().toISOString(),
    scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    status: 'pending',
  };
  
  // Store deletion request
  const requests = JSON.parse(localStorage.getItem('colleco.privacy.deletion_queue') || '[]');
  requests.push(deletionRequest);
  localStorage.setItem('colleco.privacy.deletion_queue', JSON.stringify(requests));
  
  return deletionRequest;
}

// ==================== USER RIGHTS (POPI Chapter 3) ====================

/**
 * Export user data (right to portability)
 */
export function exportUserData(userId) {
  const data = {
    exportDate: new Date().toISOString(),
    userId,
    profile: JSON.parse(localStorage.getItem(`colleco.user.${userId}`) || '{}'),
    consent: getUserConsent(userId),
    bookings: JSON.parse(localStorage.getItem(`colleco.bookings.${userId}`) || '[]'),
    achievements: JSON.parse(localStorage.getItem(`colleco.gamification.achievements.${userId}`) || '{}'),
    loyalty: JSON.parse(localStorage.getItem(`colleco.loyalty.${userId}`) || '{}'),
    preferences: JSON.parse(localStorage.getItem(`colleco.preferences.${userId}`) || '{}'),
  };
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `colleco_data_export_${userId}_${Date.now()}.json`;
  a.click();
  
  return data;
}

/**
 * Delete user account (right to erasure)
 */
export function deleteUserAccount(userId, reason = 'user_request') {
  // Log deletion request
  logConsentChange(userId, { action: 'account_deletion', reason });
  
  // Schedule deletion (30-day grace period)
  const deletionRequest = scheduleDataDeletion(userId, 'ALL_DATA', reason);
  
  return {
    success: true,
    message: 'Account deletion scheduled. You have 30 days to cancel.',
    deletionRequest,
  };
}

// ==================== PRIVACY VALIDATION ====================

/**
 * Validate data before storage (prevent sensitive data leaks)
 */
export function validateDataPrivacy(data, context = 'storage') {
  const issues = [];
  
  // Check for restricted data in public contexts
  if (context === 'public' || context === 'leaderboard') {
    PERSONAL_DATA_FIELDS.restricted.forEach(field => {
      if (data[field]) {
        issues.push({
          field,
          level: 'CRITICAL',
          message: `Restricted field '${field}' detected in ${context} context`,
        });
      }
    });
    
    PERSONAL_DATA_FIELDS.confidential.forEach(field => {
      if (data[field]) {
        issues.push({
          field,
          level: 'HIGH',
          message: `Confidential field '${field}' detected in ${context} context`,
        });
      }
    });
  }
  
  return {
    valid: issues.filter(i => i.level === 'CRITICAL').length === 0,
    issues,
  };
}

/**
 * Sanitize data before API transmission
 */
export function sanitizeForAPI(data, userId) {
  const consent = getUserConsent(userId);
  const sanitized = { ...data };
  
  // Always remove restricted data
  PERSONAL_DATA_FIELDS.restricted.forEach(field => delete sanitized[field]);
  
  // Remove confidential data unless consent given
  if (!consent.third_party) {
    PERSONAL_DATA_FIELDS.confidential.forEach(field => delete sanitized[field]);
  }
  
  return sanitized;
}

// ==================== PRIVACY NOTIFICATIONS ====================

/**
 * Notify user of privacy-related event
 */
export function notifyPrivacyEvent(userId, eventType, details) {
  const notification = {
    userId,
    eventType,
    details,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  const notifications = JSON.parse(localStorage.getItem(`colleco.privacy.notifications.${userId}`) || '[]');
  notifications.unshift(notification);
  
  // Keep last 50 notifications
  if (notifications.length > 50) {
    notifications.pop();
  }
  
  localStorage.setItem(`colleco.privacy.notifications.${userId}`, JSON.stringify(notifications));
  
  return notification;
}

/**
 * Get privacy notifications
 */
export function getPrivacyNotifications(userId) {
  try {
    return JSON.parse(localStorage.getItem(`colleco.privacy.notifications.${userId}`) || '[]');
  } catch {
    return [];
  }
}

// ==================== EXPORT ====================

export default {
  // Consent management
  getUserConsent,
  setUserConsent,
  hasConsent,
  
  // Data anonymization
  anonymizeData,
  maskSensitiveData,
  redactSensitiveFields,
  
  // Data sharing
  canShareWithThirdParty,
  getShareableProfile,
  
  // Data retention
  shouldDeleteData,
  scheduleDataDeletion,
  
  // User rights
  exportUserData,
  deleteUserAccount,
  
  // Privacy validation
  validateDataPrivacy,
  sanitizeForAPI,
  
  // Notifications
  notifyPrivacyEvent,
  getPrivacyNotifications,
  
  // Constants
  DATA_SENSITIVITY_LEVELS,
  PERSONAL_DATA_FIELDS,
  CONSENT_TYPES,
  RETENTION_PERIODS,
};
