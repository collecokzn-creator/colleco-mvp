/**
 * Background Check & Insurance Verification System
 */

export const backgroundCheck = {
  // Check statuses
  STATUSES: {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
    EXPIRED: 'expired'
  },

  // Initiate background check
  initiateCheck: (partnerId, checkType) => {
    const check = {
      id: `BGC-${Date.now()}`,
      partnerId,
      type: checkType, // 'criminal', 'credit', 'employment', 'civil'
      status: 'in_progress',
      initiatedAt: new Date().toISOString(),
      completedAt: null,
      result: null,
      clearance: null
    };

    const checks = JSON.parse(localStorage.getItem(`colleco.trust.bgc.${partnerId}`) || '[]');
    checks.push(check);
    localStorage.setItem(`colleco.trust.bgc.${partnerId}`, JSON.stringify(checks));

    return { success: true, check };
  },

  // Get background check result
  getCheckResult: (partnerId, checkType) => {
    const checks = JSON.parse(localStorage.getItem(`colleco.trust.bgc.${partnerId}`) || '[]');
    const check = checks.find(c => c.type === checkType);

    if (!check) return null;

    // Check if expired (1 year)
    if (check.completedAt) {
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      if (new Date(check.completedAt) < oneYearAgo) {
        check.status = 'expired';
      }
    }

    return check;
  },

  // Update check result
  updateCheckResult: (partnerId, checkType, result) => {
    const checks = JSON.parse(localStorage.getItem(`colleco.trust.bgc.${partnerId}`) || '[]');
    const check = checks.find(c => c.type === checkType);

    if (!check) return { success: false };

    check.status = 'completed';
    check.completedAt = new Date().toISOString();
    check.result = result;
    check.clearance = result.clearance || false;

    localStorage.setItem(`colleco.trust.bgc.${partnerId}`, JSON.stringify(checks));

    return { success: true, check };
  },

  // Check all required checks passed
  allChecksPassed: (partnerId) => {
    const requiredChecks = ['criminal', 'employment'];
    return requiredChecks.every(type => {
      const result = backgroundCheck.getCheckResult(partnerId, type);
      return result && result.clearance && result.status === 'completed';
    });
  }
};

export const insuranceVerification = {
  // Insurance types
  TYPES: {
    LIABILITY: 'liability',
    PROPERTY: 'property',
    PROFESSIONAL: 'professional',
    CYBER: 'cyber'
  },

  // Verify insurance
  verifyInsurance: (partnerId, insuranceData) => {
    const verification = {
      id: `INS-${Date.now()}`,
      partnerId,
      type: insuranceData.type,
      provider: insuranceData.provider,
      policyNumber: insuranceData.policyNumber,
      coverageAmount: insuranceData.coverageAmount,
      startDate: insuranceData.startDate,
      expiryDate: insuranceData.expiryDate,
      verified: false,
      verifiedAt: null,
      status: 'pending_verification'
    };

    // Simulate verification
    const isValid = insuranceVerification.validatePolicy(insuranceData);
    if (isValid) {
      verification.verified = true;
      verification.verifiedAt = new Date().toISOString();
      verification.status = 'verified';
    } else {
      verification.status = 'failed';
    }

    const policies = JSON.parse(localStorage.getItem(`colleco.trust.insurance.${partnerId}`) || '[]');
    policies.push(verification);
    localStorage.setItem(`colleco.trust.insurance.${partnerId}`, JSON.stringify(policies));

    return { success: true, verification };
  },

  // Get active insurance
  getActiveInsurance: (partnerId) => {
    const policies = JSON.parse(localStorage.getItem(`colleco.trust.insurance.${partnerId}`) || '[]');
    const now = new Date();

    return policies.filter(p => {
      const expiry = new Date(p.expiryDate);
      return p.verified && expiry > now;
    });
  },

  // Check coverage requirement
  hasSufficientCoverage: (partnerId, minimumAmount) => {
    const active = insuranceVerification.getActiveInsurance(partnerId);
    return active.some(p => p.coverageAmount >= minimumAmount);
  },

  // Get insurance expiry status
  getExpiryStatus: (partnerId) => {
    const policies = JSON.parse(localStorage.getItem(`colleco.trust.insurance.${partnerId}`) || '[]');
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiring = policies.filter(p => {
      const expiry = new Date(p.expiryDate);
      return expiry <= thirtyDaysFromNow && expiry > now && p.verified;
    });

    const expired = policies.filter(p => {
      const expiry = new Date(p.expiryDate);
      return expiry <= now && p.verified;
    });

    return {
      expiring: expiring.map(p => ({
        type: p.type,
        provider: p.provider,
        daysUntilExpiry: Math.ceil((new Date(p.expiryDate) - now) / (1000 * 60 * 60 * 24))
      })),
      expired: expired.map(p => ({
        type: p.type,
        provider: p.provider
      }))
    };
  },

  validatePolicy: (insuranceData) => {
    // Validate policy format
    if (!insuranceData.policyNumber || insuranceData.policyNumber.length < 5) {
      return false;
    }

    // Validate dates
    const start = new Date(insuranceData.startDate);
    const expiry = new Date(insuranceData.expiryDate);
    if (start >= expiry) {
      return false;
    }

    // Validate expiry is in future
    if (expiry <= new Date()) {
      return false;
    }

    // Validate coverage amount
    if (insuranceData.coverageAmount < 1000) {
      return false;
    }

    return true;
  }
};

export const safetyCompliance = {
  // Get compliance status
  getComplianceStatus: (partnerId) => {
    const verification = JSON.parse(localStorage.getItem(`colleco.trust.verification.${partnerId}`) || '{}');
    const bgcPassed = backgroundCheck.allChecksPassed(partnerId);
    const insurance = insuranceVerification.getActiveInsurance(partnerId);
    const disputes = JSON.parse(localStorage.getItem('colleco.trust.disputes') || '[]')
      .filter(d => d.respondentId === partnerId && d.status !== 'resolved');

    const status = {
      partnerId,
      verified: verification.status === 'verified',
      verificationLevel: verification.level || 'unverified',
      backgroundCheckPassed: bgcPassed,
      insuranceActive: insurance.length > 0,
      openDisputes: disputes.length,
      compliant: false,
      lastCheckedAt: new Date().toISOString()
    };

    // Compliance logic
    status.compliant = 
      status.verified && 
      status.backgroundCheckPassed && 
      status.insuranceActive && 
      status.openDisputes === 0;

    localStorage.setItem(`colleco.trust.compliance.${partnerId}`, JSON.stringify(status));

    return status;
  },

  // Get compliance requirements
  getRequirements: (partnerType) => {
    const requirements = {
      'hotel': {
        verification: 'standard',
        backgroundCheck: ['criminal', 'employment'],
        insurance: ['liability', 'property'],
        minimumCoverage: 500000
      },
      'tour_guide': {
        verification: 'basic',
        backgroundCheck: ['criminal'],
        insurance: ['liability'],
        minimumCoverage: 100000
      },
      'car_rental': {
        verification: 'standard',
        backgroundCheck: ['criminal'],
        insurance: ['liability', 'professional'],
        minimumCoverage: 1000000
      },
      'restaurant': {
        verification: 'standard',
        backgroundCheck: ['criminal', 'employment'],
        insurance: ['liability', 'property'],
        minimumCoverage: 300000
      }
    };

    return requirements[partnerType] || requirements['hotel'];
  },

  // Check if partner meets requirements
  meetsRequirements: (partnerId, partnerType) => {
    const requirements = safetyCompliance.getRequirements(partnerType);
    const compliance = safetyCompliance.getComplianceStatus(partnerId);

    // Check verification level
    const verificationLevels = { unverified: 0, basic: 1, standard: 2, premium: 3 };
    const requiredLevel = verificationLevels[requirements.verification] || 1;
    const currentLevel = verificationLevels[compliance.verificationLevel] || 0;
    if (currentLevel < requiredLevel) return false;

    // Check background checks
    for (const checkType of requirements.backgroundCheck) {
      const result = backgroundCheck.getCheckResult(partnerId, checkType);
      if (!result || !result.clearance || result.status === 'expired') {
        return false;
      }
    }

    // Check insurance
    if (!insuranceVerification.hasSufficientCoverage(partnerId, requirements.minimumCoverage)) {
      return false;
    }

    return true;
  }
};
