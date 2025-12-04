/**
 * Background Checks & Insurance Verification System
 * Handles background check integration, insurance validation, compliance tracking
 */

// Check types
export const CHECK_TYPES = {
  CRIMINAL: 'criminal',
  IDENTITY: 'identity',
  ADDRESS: 'address',
  EMPLOYMENT: 'employment',
  FINANCIAL: 'financial'
};

// Check status
export const CHECK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

// Check result
export const CHECK_RESULT = {
  CLEAR: 'clear',
  CONCERNS: 'concerns',
  REJECTED: 'rejected'
};

// Insurance types
export const INSURANCE_TYPES = {
  PROPERTY_LIABILITY: 'property_liability',
  HOST_PROTECTION: 'host_protection',
  DAMAGE_PROTECTION: 'damage_protection',
  GENERAL_LIABILITY: 'general_liability'
};

// Insurance status
export const INSURANCE_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  LAPSED: 'lapsed'
};

// Initialize background check
export function initializeBackgroundCheck(partnerId, checkTypes = [CHECK_TYPES.CRIMINAL, CHECK_TYPES.IDENTITY]) {
  const check = {
    partnerId,
    check_types: checkTypes,
    results: [],
    status: CHECK_STATUS.PENDING,
    initiated_at: new Date().toISOString(),
    completed_at: null,
    expiry_date: null,
    overall_result: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(
    `colleco.background_check.${partnerId}`,
    JSON.stringify(check)
  );

  return check;
}

// Get background check
export function getBackgroundCheck(partnerId) {
  const data = localStorage.getItem(`colleco.background_check.${partnerId}`);
  
  if (!data) {
    return null;
  }

  const check = JSON.parse(data);

  // Check if expired
  if (check.expiry_date && new Date() > new Date(check.expiry_date)) {
    check.status = CHECK_STATUS.EXPIRED;
    updateBackgroundCheck(partnerId, check);
  }

  return check;
}

// Submit background check
export function submitBackgroundCheckRequest(partnerId, checkData) {
  let check = getBackgroundCheck(partnerId);
  
  if (!check) {
    check = initializeBackgroundCheck(partnerId);
  }

  check.status = CHECK_STATUS.IN_PROGRESS;
  check.updated_at = new Date().toISOString();

  // Simulate check processing (would integrate with provider API)
  processBackgroundCheck(check, checkData);

  updateBackgroundCheck(partnerId, check);

  return {
    success: true,
    check_id: `${partnerId}_${Date.now()}`,
    status: CHECK_STATUS.IN_PROGRESS
  };
}

// Process background check (simulated)
function processBackgroundCheck(check, checkData) {
  check.results = [];

  // Criminal check
  if (check.check_types.includes(CHECK_TYPES.CRIMINAL)) {
    check.results.push({
      type: CHECK_TYPES.CRIMINAL,
      status: CHECK_STATUS.COMPLETED,
      result: CHECK_RESULT.CLEAR, // Would call external API
      details: 'No criminal history found',
      completed_at: new Date().toISOString()
    });
  }

  // Identity check
  if (check.check_types.includes(CHECK_TYPES.IDENTITY)) {
    check.results.push({
      type: CHECK_TYPES.IDENTITY,
      status: CHECK_STATUS.COMPLETED,
      result: CHECK_RESULT.CLEAR,
      details: 'Identity verified successfully',
      completed_at: new Date().toISOString()
    });
  }

  // Address check
  if (check.check_types.includes(CHECK_TYPES.ADDRESS)) {
    check.results.push({
      type: CHECK_TYPES.ADDRESS,
      status: CHECK_STATUS.COMPLETED,
      result: CHECK_RESULT.CLEAR,
      details: 'Address verified',
      completed_at: new Date().toISOString()
    });
  }

  check.status = CHECK_STATUS.COMPLETED;
  check.completed_at = new Date().toISOString();

  // Set expiry (2 years)
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 2);
  check.expiry_date = expiry.toISOString();

  // Determine overall result
  const rejections = check.results.filter(r => r.result === CHECK_RESULT.REJECTED);
  const concerns = check.results.filter(r => r.result === CHECK_RESULT.CONCERNS);

  if (rejections.length > 0) {
    check.overall_result = CHECK_RESULT.REJECTED;
  } else if (concerns.length > 0) {
    check.overall_result = CHECK_RESULT.CONCERNS;
  } else {
    check.overall_result = CHECK_RESULT.CLEAR;
  }
}

// Initialize insurance verification
export function initializeInsuranceVerification(partnerId, propertyId) {
  const insurance = {
    partnerId,
    propertyId,
    policies: [],
    status: INSURANCE_STATUS.PENDING,
    coverage_amount: 0,
    verified_at: null,
    expiry_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(
    `colleco.insurance.${propertyId}`,
    JSON.stringify(insurance)
  );

  return insurance;
}

// Get insurance verification
export function getInsuranceVerification(propertyId) {
  const data = localStorage.getItem(`colleco.insurance.${propertyId}`);
  
  if (!data) {
    return null;
  }

  const insurance = JSON.parse(data);

  // Update status based on policy expiry
  updateInsuranceStatus(insurance);

  return insurance;
}

// Add insurance policy
export function addInsurancePolicy(propertyId, policyData) {
  let insurance = getInsuranceVerification(propertyId);
  
  if (!insurance) {
    return { success: false, error: 'Insurance verification record not found' };
  }

  const policy = {
    id: `policy_${Date.now()}`,
    type: policyData.type,
    provider: policyData.provider,
    policy_number: policyData.policy_number,
    coverage_amount: policyData.coverage_amount,
    start_date: policyData.start_date,
    expiry_date: policyData.expiry_date,
    certificate_url: policyData.certificate_url,
    verified: false,
    verified_at: null,
    verification_method: null // 'manual', 'automated', 'provider_api'
  };

  // Validate policy data
  if (!Object.values(INSURANCE_TYPES).includes(policy.type)) {
    return { success: false, error: 'Invalid insurance type' };
  }

  insurance.policies.push(policy);
  insurance.updated_at = new Date().toISOString();

  // Update total coverage
  insurance.coverage_amount = insurance.policies.reduce((sum, p) => sum + p.coverage_amount, 0);

  // Check if all required policies present
  const required_types = [INSURANCE_TYPES.PROPERTY_LIABILITY];
  const has_required = required_types.every(type =>
    insurance.policies.some(p => p.type === type && new Date(p.expiry_date) > new Date())
  );

  if (has_required) {
    insurance.status = INSURANCE_STATUS.ACTIVE;
  }

  updateInsuranceVerification(propertyId, insurance);

  return {
    success: true,
    policy_id: policy.id,
    insurance_status: insurance.status
  };
}

// Verify insurance policy
export function verifyInsurancePolicy(propertyId, policyId, verified = true, method = 'manual') {
  const insurance = getInsuranceVerification(propertyId);
  
  if (!insurance) {
    return { success: false, error: 'Insurance verification record not found' };
  }

  const policy = insurance.policies.find(p => p.id === policyId);
  if (!policy) {
    return { success: false, error: 'Policy not found' };
  }

  policy.verified = verified;
  policy.verified_at = new Date().toISOString();
  policy.verification_method = method;

  insurance.verified_at = new Date().toISOString();
  insurance.updated_at = new Date().toISOString();

  updateInsuranceStatus(insurance);
  updateInsuranceVerification(propertyId, insurance);

  return {
    success: true,
    policy_verified: verified,
    insurance_status: insurance.status
  };
}

// Update insurance status
function updateInsuranceStatus(insurance) {
  const now = new Date();
  const active_policies = insurance.policies.filter(p =>
    new Date(p.expiry_date) > now && p.verified
  );

  if (active_policies.length === 0) {
    insurance.status = INSURANCE_STATUS.EXPIRED;
  } else if (active_policies.every(p => new Date(p.expiry_date) > now)) {
    insurance.status = INSURANCE_STATUS.ACTIVE;
  } else {
    // Some policies expiring soon
    const expiring_soon = insurance.policies.filter(p => {
      const days_until_expiry = (new Date(p.expiry_date) - now) / (1000 * 60 * 60 * 24);
      return days_until_expiry < 30 && days_until_expiry > 0;
    });

    if (expiring_soon.length > 0) {
      insurance.status = INSURANCE_STATUS.PENDING; // Needs renewal
    }
  }

  // Set expiry date to earliest policy expiry
  const earliest_expiry = insurance.policies.reduce((min, p) =>
    new Date(p.expiry_date) < new Date(min) ? p.expiry_date : min,
    insurance.policies[0]?.expiry_date
  );
  
  insurance.expiry_date = earliest_expiry;
}

// Get expiring insurance policies
export function getExpiringInsurancePolicies(days = 30) {
  const expiring = [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.insurance.')) {
      const insurance = JSON.parse(localStorage.getItem(key));
      
      insurance.policies.forEach(policy => {
        const expiry = new Date(policy.expiry_date);
        if (expiry < cutoff && expiry > new Date()) {
          expiring.push({
            ...policy,
            propertyId: insurance.propertyId,
            partnerId: insurance.partnerId,
            days_until_expiry: Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24))
          });
        }
      });
    }
  }

  return expiring.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
}

// Get compliance status for partner
export function getPartnerComplianceStatus(partnerId) {
  const status = {
    partner_id: partnerId,
    verification_status: 'incomplete',
    background_check_status: 'pending',
    insurance_status: 'incomplete',
    compliance_score: 0,
    issues: [],
    created_at: new Date().toISOString()
  };

  // Check background check status
  const background_check = getBackgroundCheck(partnerId);
  if (background_check) {
    status.background_check_status = background_check.status;
    
    if (background_check.overall_result === CHECK_RESULT.CLEAR) {
      status.compliance_score += 30;
    } else if (background_check.overall_result === CHECK_RESULT.CONCERNS) {
      status.issues.push('Background check has concerns');
      status.compliance_score += 15;
    } else if (background_check.overall_result === CHECK_RESULT.REJECTED) {
      status.issues.push('Background check failed');
    }
  } else {
    status.issues.push('Background check not completed');
  }

  // Check insurance status
  let total_insurance_coverage = 0;
  let verified_policies = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.insurance.')) {
      const insurance = JSON.parse(localStorage.getItem(key));
      
      if (insurance.partnerId === partnerId) {
        total_insurance_coverage += insurance.coverage_amount;
        verified_policies += insurance.policies.filter(p => p.verified).length;

        if (insurance.status === INSURANCE_STATUS.ACTIVE) {
          status.compliance_score += 30;
          status.insurance_status = 'active';
        } else if (insurance.status === INSURANCE_STATUS.PENDING) {
          status.issues.push('Insurance pending renewal');
          status.compliance_score += 15;
        } else {
          status.issues.push('Insurance expired or inactive');
        }
      }
    }
  }

  // Verification completeness
  status.compliance_score += 40; // Base for attempting compliance

  status.compliance_score = Math.min(status.compliance_score, 100);

  return status;
}

// Helper functions
function updateBackgroundCheck(partnerId, check) {
  check.updated_at = new Date().toISOString();
  localStorage.setItem(
    `colleco.background_check.${partnerId}`,
    JSON.stringify(check)
  );
}

function updateInsuranceVerification(propertyId, insurance) {
  insurance.updated_at = new Date().toISOString();
  localStorage.setItem(
    `colleco.insurance.${propertyId}`,
    JSON.stringify(insurance)
  );
}
