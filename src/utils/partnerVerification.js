/**
 * Partner Verification System
 * Handles KYC, ID validation, document verification, and compliance tracking
 */

// Verification levels
export const VERIFICATION_LEVELS = {
  UNVERIFIED: 'unverified',
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  FULL: 'full',
  PREMIUM: 'premium'
};

// Document types
export const DOCUMENT_TYPES = {
  ID_COPY: 'id_copy',
  PASSPORT: 'passport',
  BUSINESS_REGISTRATION: 'business_registration',
  TAX_CERTIFICATE: 'tax_certificate',
  BANK_STATEMENT: 'bank_statement',
  UTILITY_BILL: 'utility_bill',
  PROOF_OF_ADDRESS: 'proof_of_address',
  INSURANCE_CERTIFICATE: 'insurance_certificate',
  SAFETY_CERTIFICATE: 'safety_certificate'
};

// Verification status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
};

// KYC requirements by partner type
export const KYC_REQUIREMENTS = {
  individual: {
    required_documents: [
      DOCUMENT_TYPES.ID_COPY,
      DOCUMENT_TYPES.PROOF_OF_ADDRESS
    ],
    required_info: ['full_name', 'dob', 'phone', 'email', 'address'],
    max_verification_time: 7, // days
    recheck_interval: 365 // days
  },
  business: {
    required_documents: [
      DOCUMENT_TYPES.ID_COPY,
      DOCUMENT_TYPES.BUSINESS_REGISTRATION,
      DOCUMENT_TYPES.TAX_CERTIFICATE,
      DOCUMENT_TYPES.BANK_STATEMENT
    ],
    required_info: ['business_name', 'registration_number', 'tax_number', 'business_address', 'owner_name'],
    max_verification_time: 14, // days
    recheck_interval: 180 // days
  }
};

// Initialize partner verification
export function initializePartnerVerification(partnerId, partnerType) {
  const verification = {
    partnerId,
    partnerType,
    status: VERIFICATION_STATUS.PENDING,
    level: VERIFICATION_LEVELS.UNVERIFIED,
    documents: [],
    kyc_data: {},
    flags: [],
    verification_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    verified_at: null,
    recheck_required_at: null,
    compliance_score: 0
  };

  localStorage.setItem(
    `colleco.verification.${partnerId}`,
    JSON.stringify(verification)
  );

  return verification;
}

// Get partner verification status
export function getPartnerVerification(partnerId) {
  const data = localStorage.getItem(`colleco.verification.${partnerId}`);
  
  if (!data) {
    return null;
  }

  const verification = JSON.parse(data);

  // Check if verification has expired
  if (verification.status === VERIFICATION_STATUS.VERIFIED) {
    const recheck_date = new Date(verification.recheck_required_at);
    if (new Date() > recheck_date) {
      verification.status = VERIFICATION_STATUS.EXPIRED;
      verification.level = VERIFICATION_LEVELS.UNVERIFIED;
      updatePartnerVerification(partnerId, verification);
    }
  }

  return verification;
}

// Submit document for verification
export function submitDocument(partnerId, documentType, documentData) {
  const verification = getPartnerVerification(partnerId);
  
  if (!verification) {
    return { success: false, error: 'Verification record not found' };
  }

  const document = {
    id: `doc_${Date.now()}`,
    type: documentType,
    status: VERIFICATION_STATUS.PENDING,
    submitted_at: new Date().toISOString(),
    verified_at: null,
    notes: '',
    file_url: documentData.file_url,
    file_size: documentData.file_size,
    file_type: documentData.file_type
  };

  // Validate document
  const validation = validateDocument(document, verification.partnerType);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }

  verification.documents.push(document);
  verification.updated_at = new Date().toISOString();

  // Check if all required documents submitted
  const required = KYC_REQUIREMENTS[verification.partnerType].required_documents;
  const submitted_types = verification.documents.map(d => d.type);
  const all_required_submitted = required.every(req => submitted_types.includes(req));

  if (all_required_submitted) {
    verification.status = VERIFICATION_STATUS.UNDER_REVIEW;
    verification.verification_history.push({
      timestamp: new Date().toISOString(),
      status: VERIFICATION_STATUS.UNDER_REVIEW,
      reason: 'All required documents submitted'
    });
  }

  updatePartnerVerification(partnerId, verification);

  return {
    success: true,
    document: document,
    status: verification.status,
    documents_submitted: verification.documents.length,
    documents_required: required.length
  };
}

// Validate document
function validateDocument(document, partnerType) {
  const errors = [];

  // File size check (max 10MB)
  if (document.file_size > 10 * 1024 * 1024) {
    errors.push('File size exceeds 10MB limit');
  }

  // File type check
  const allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowed_types.includes(document.file_type)) {
    errors.push('Invalid file type. Allowed: PDF, JPG, PNG, WebP');
  }

  // Document-specific validation
  const requirements = KYC_REQUIREMENTS[partnerType];
  if (!requirements.required_documents.includes(document.type)) {
    errors.push(`Document type ${document.type} not required for ${partnerType}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Submit KYC data
export function submitKYCData(partnerId, kycData) {
  const verification = getPartnerVerification(partnerId);
  
  if (!verification) {
    return { success: false, error: 'Verification record not found' };
  }

  // Validate required fields
  const required = KYC_REQUIREMENTS[verification.partnerType].required_info;
  const missing = required.filter(field => !kycData[field]);

  if (missing.length > 0) {
    return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  // Run fraud checks on KYC data
  const fraud_check = performFraudCheck(partnerId, kycData);
  if (fraud_check.risk_level === 'high') {
    verification.flags.push({
      type: 'fraud_risk',
      severity: 'high',
      timestamp: new Date().toISOString(),
      details: fraud_check.issues
    });
  }

  verification.kyc_data = kycData;
  verification.updated_at = new Date().toISOString();

  updatePartnerVerification(partnerId, verification);

  return {
    success: true,
    kyc_submitted: true,
    fraud_check: fraud_check,
    verification_status: verification.status
  };
}

// Verify document manually (admin action)
export function verifyDocument(partnerId, documentId, approved, notes = '') {
  const verification = getPartnerVerification(partnerId);
  
  if (!verification) {
    return { success: false, error: 'Verification record not found' };
  }

  const document = verification.documents.find(d => d.id === documentId);
  if (!document) {
    return { success: false, error: 'Document not found' };
  }

  document.status = approved ? VERIFICATION_STATUS.VERIFIED : VERIFICATION_STATUS.REJECTED;
  document.verified_at = new Date().toISOString();
  document.notes = notes;

  verification.updated_at = new Date().toISOString();

  // Check if all documents verified
  const all_verified = verification.documents.every(d => 
    d.status === VERIFICATION_STATUS.VERIFIED || d.status === VERIFICATION_STATUS.REJECTED
  );

  if (all_verified) {
    const all_approved = verification.documents.every(d => d.status === VERIFICATION_STATUS.VERIFIED);
    
    if (all_approved) {
      verification.status = VERIFICATION_STATUS.VERIFIED;
      verification.level = VERIFICATION_LEVELS.FULL;
      verification.verified_at = new Date().toISOString();
      
      // Set recheck date
      const recheck_days = KYC_REQUIREMENTS[verification.partnerType].recheck_interval;
      const recheck_date = new Date();
      recheck_date.setDate(recheck_date.getDate() + recheck_days);
      verification.recheck_required_at = recheck_date.toISOString();

      // Calculate compliance score
      verification.compliance_score = calculateComplianceScore(verification);

      verification.verification_history.push({
        timestamp: new Date().toISOString(),
        status: VERIFICATION_STATUS.VERIFIED,
        reason: 'All documents verified and approved'
      });
    } else {
      verification.status = VERIFICATION_STATUS.REJECTED;
      verification.verification_history.push({
        timestamp: new Date().toISOString(),
        status: VERIFICATION_STATUS.REJECTED,
        reason: 'One or more documents rejected'
      });
    }
  }

  updatePartnerVerification(partnerId, verification);

  return {
    success: true,
    document_status: document.status,
    verification_status: verification.status,
    verification_level: verification.level
  };
}

// Perform fraud checks on KYC data
function performFraudCheck(partnerId, kycData) {
  const issues = [];
  let risk_score = 0;

  // Check for duplicate information
  const all_verifications = getAllVerifications();
  for (const otherId in all_verifications) {
    if (otherId !== partnerId) {
      const other = all_verifications[otherId];
      
      if (other.kyc_data.email === kycData.email) {
        issues.push('Email already registered');
        risk_score += 15;
      }
      
      if (other.kyc_data.phone === kycData.phone) {
        issues.push('Phone number already registered');
        risk_score += 10;
      }
      
      if (kycData.id_number && other.kyc_data.id_number === kycData.id_number) {
        issues.push('ID number already registered');
        risk_score += 25;
      }
    }
  }

  // Check for suspicious patterns
  if (kycData.full_name) {
    if (kycData.full_name.length < 3) {
      issues.push('Name too short');
      risk_score += 5;
    }
  }

  // Check date of birth
  if (kycData.dob) {
    const dob = new Date(kycData.dob);
    const age = new Date().getFullYear() - dob.getFullYear();
    
    if (age < 18) {
      issues.push('Partner must be at least 18 years old');
      risk_score += 30;
    }
    
    if (age > 120) {
      issues.push('Invalid date of birth');
      risk_score += 20;
    }
  }

  // Business-specific checks
  if (kycData.registration_number) {
    // Check registration number format
    if (!kycData.registration_number.match(/^\d{4}\/\d{6}\/\d{2}$/)) {
      issues.push('Invalid business registration number format');
      risk_score += 10;
    }
  }

  return {
    risk_level: risk_score > 30 ? 'high' : risk_score > 15 ? 'medium' : 'low',
    risk_score,
    issues
  };
}

// Calculate compliance score (0-100)
function calculateComplianceScore(verification) {
  let score = 0;

  // Document verification: 40 points
  const verified_docs = verification.documents.filter(d => d.status === VERIFICATION_STATUS.VERIFIED).length;
  const doc_score = (verified_docs / verification.documents.length) * 40;
  score += doc_score;

  // KYC data completeness: 30 points
  const required = KYC_REQUIREMENTS[verification.partnerType].required_info;
  const provided = required.filter(field => verification.kyc_data[field]).length;
  const kyc_score = (provided / required.length) * 30;
  score += kyc_score;

  // No fraud flags: 30 points
  const fraud_flags = verification.flags.filter(f => f.type === 'fraud_risk').length;
  if (fraud_flags === 0) {
    score += 30;
  } else {
    score += Math.max(0, 30 - (fraud_flags * 10));
  }

  return Math.round(score);
}

// Suspend partner verification
export function suspendPartnerVerification(partnerId, reason) {
  const verification = getPartnerVerification(partnerId);
  
  if (!verification) {
    return { success: false, error: 'Verification record not found' };
  }

  verification.status = VERIFICATION_STATUS.SUSPENDED;
  verification.flags.push({
    type: 'suspension',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    reason
  });

  verification.verification_history.push({
    timestamp: new Date().toISOString(),
    status: VERIFICATION_STATUS.SUSPENDED,
    reason
  });

  updatePartnerVerification(partnerId, verification);

  return {
    success: true,
    verification_status: VERIFICATION_STATUS.SUSPENDED
  };
}

// Get verification history
export function getVerificationHistory(partnerId) {
  const verification = getPartnerVerification(partnerId);
  
  if (!verification) {
    return [];
  }

  return verification.verification_history;
}

// Update verification record
function updatePartnerVerification(partnerId, verification) {
  verification.updated_at = new Date().toISOString();
  localStorage.setItem(
    `colleco.verification.${partnerId}`,
    JSON.stringify(verification)
  );
}

// Get all verifications (for admin dashboard)
function getAllVerifications() {
  const all = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.verification.')) {
      const partnerId = key.replace('colleco.verification.', '');
      all[partnerId] = JSON.parse(localStorage.getItem(key));
    }
  }

  return all;
}

// Get verification stats (for admin dashboard)
export function getVerificationStats() {
  const all = getAllVerifications();
  
  const stats = {
    total_partners: Object.keys(all).length,
    verified: 0,
    pending: 0,
    under_review: 0,
    rejected: 0,
    suspended: 0,
    compliance_score_avg: 0
  };

  let total_compliance = 0;
  let compliance_count = 0;

  for (const verification of Object.values(all)) {
    switch (verification.status) {
      case VERIFICATION_STATUS.VERIFIED:
        stats.verified++;
        break;
      case VERIFICATION_STATUS.PENDING:
        stats.pending++;
        break;
      case VERIFICATION_STATUS.UNDER_REVIEW:
        stats.under_review++;
        break;
      case VERIFICATION_STATUS.REJECTED:
        stats.rejected++;
        break;
      case VERIFICATION_STATUS.SUSPENDED:
        stats.suspended++;
        break;
    }

    if (verification.compliance_score > 0) {
      total_compliance += verification.compliance_score;
      compliance_count++;
    }
  }

  if (compliance_count > 0) {
    stats.compliance_score_avg = Math.round(total_compliance / compliance_count);
  }

  return stats;
}

// Export for testing
export function _getRequirements(partnerType) {
  return KYC_REQUIREMENTS[partnerType];
}

export function _performFraudCheck(partnerId, kycData) {
  return performFraudCheck(partnerId, kycData);
}

export function _getAllVerifications() {
  return getAllVerifications();
}
