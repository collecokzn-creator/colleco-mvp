/**
 * Trust & Safety System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  partnerVerification,
  fraudDetection,
  reviewModeration,
  safetyRatings,
  disputeResolution
} from '../src/utils/trustSafetyEngine';

import {
  backgroundCheck,
  insuranceVerification,
  safetyCompliance
} from '../src/utils/backgroundCheckEngine';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

describe('Partner Verification System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create verification record', () => {
    const result = partnerVerification.createVerification('partner_123', {});
    expect(result.success).toBe(true);
    expect(result.verification.status).toBe('pending');
    expect(result.verification.level).toBe('unverified');
  });

  it('should get verification status', () => {
    partnerVerification.createVerification('partner_123', {});
    const verification = partnerVerification.getVerification('partner_123');
    
    expect(verification).toBeDefined();
    expect(verification.partnerId).toBe('partner_123');
  });

  it('should submit document', () => {
    partnerVerification.createVerification('partner_123', {});
    const result = partnerVerification.submitDocument('partner_123', 'identity_document', {
      documentType: 'national_id',
      expiryDate: '2026-12-31'
    });

    expect(result.success).toBe(true);
    expect(result.document.type).toBe('identity_document');
    expect(result.document.status).toBe('pending_review');
  });

  it('should update verification level', () => {
    partnerVerification.createVerification('partner_123', {});
    const result = partnerVerification.updateVerificationLevel('partner_123', 'standard');

    expect(result.success).toBe(true);
    expect(result.verification.level).toBe('standard');
    expect(result.verification.status).toBe('verified');
  });
});

describe('Fraud Detection System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should analyze low-risk transaction', () => {
    const result = fraudDetection.analyzeTransaction('user_123', 'traveler', {
      id: 'TXN-001',
      amount: 5000
    });

    expect(result.riskLevel).toBe('low');
    expect(result.riskScore).toBeLessThan(20);
  });

  it('should identify high-risk transaction', () => {
    const result = fraudDetection.analyzeTransaction('user_123', 'traveler', {
      id: 'TXN-002',
      amount: 150000,
      newDevice: true,
      newLocation: true
    });

    expect(result.riskLevel).toMatch(/high|critical/);
    expect(result.flags.length).toBeGreaterThan(0);
  });

  it('should recommend appropriate action', () => {
    const lowRisk = fraudDetection.analyzeTransaction('user_123', 'traveler', {
      id: 'TXN-003',
      amount: 2000
    });
    expect(lowRisk.recommended_action).toBe('approve');

    localStorage.clear();
    const highRisk = fraudDetection.analyzeTransaction('user_123', 'traveler', {
      id: 'TXN-004',
      amount: 200000
    });
    expect(highRisk.recommended_action).toMatch(/review|challenge|block/);
  });

  it('should track fraud history', () => {
    fraudDetection.analyzeTransaction('user_123', 'traveler', { id: 'TXN-005', amount: 5000 });
    fraudDetection.analyzeTransaction('user_123', 'traveler', { id: 'TXN-006', amount: 6000 });

    const history = fraudDetection.getFraudHistory('user_123');
    expect(history.length).toBe(2);
  });

  it('should report suspicious activity', () => {
    const result = fraudDetection.reportSuspiciousActivity('user_123', 'multiple_cancellations', 'User cancelled 5 bookings in 1 hour');

    expect(result.success).toBe(true);
    expect(result.report.status).toBe('under_review');
  });
});

describe('Review Moderation System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should approve clean review', () => {
    const result = reviewModeration.moderateReview('REV-001', {
      comment: 'This was an amazing experience! Highly recommend to everyone.',
      authorId: 'user_123'
    });

    expect(result.status).toBe('approved');
    expect(result.issues.length).toBe(0);
  });

  it('should flag review with prohibited content', () => {
    const result = reviewModeration.moderateReview('REV-002', {
      comment: 'This is spam and scam! Click here for better deals.',
      authorId: 'user_456'
    });

    expect(result.status).toBe('flagged');
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should flag review with contact info', () => {
    const result = reviewModeration.moderateReview('REV-003', {
      comment: 'Great place! Call me at 0712345678 for more info.',
      authorId: 'user_789'
    });

    expect(result.status).toBe('flagged');
    expect(result.issues).toContain('contains_contact_info');
  });

  it('should detect suspicious review velocity', () => {
    // Create first review
    reviewModeration.moderateReview('REV-004', {
      comment: 'Good place.',
      authorId: 'user_spammer'
    });

    // Create multiple reviews quickly
    for (let i = 0; i < 4; i++) {
      reviewModeration.moderateReview(`REV-00${i+5}`, {
        comment: 'Nice place.',
        authorId: 'user_spammer'
      });
    }

    const lastResult = reviewModeration.moderateReview('REV-010', {
      comment: 'Great place.',
      authorId: 'user_spammer'
    });

    expect(lastResult.status).toBe('flagged');
    expect(lastResult.issues).toContain('suspicious_velocity');
  });

  it('should bulk moderate reviews', () => {
    const reviews = [
      { id: 'REV-011', comment: 'Great!', authorId: 'user_a' },
      { id: 'REV-012', comment: 'Spam click here!', authorId: 'user_b' }
    ];

    const results = reviewModeration.bulkModerate(reviews);

    expect(results.length).toBe(2);
    expect(results[0].status).toBe('approved');
    expect(results[1].status).toBe('flagged');
  });

  it('should get moderation result', () => {
    reviewModeration.moderateReview('REV-013', {
      comment: 'Wonderful experience!',
      authorId: 'user_123'
    });

    const result = reviewModeration.getModerationResult('REV-013');
    expect(result).toBeDefined();
    expect(result.status).toBe('approved');
  });
});

describe('Safety Ratings System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should calculate safety score', () => {
    const score = safetyRatings.calculateSafetyScore('partner_123');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should assign safety rating based on score', () => {
    const rating = safetyRatings.getSafetyRating('partner_123');
    expect(rating).toHaveProperty('score');
    expect(rating).toHaveProperty('rating');
    expect(['excellent', 'good', 'fair', 'at_risk']).toContain(rating.rating);
  });

  it('should return lower score for unverified partner', () => {
    const unverified = safetyRatings.calculateSafetyScore('unverified_partner');
    expect(unverified).toBeLessThan(100);
  });

  it('should track rating trend', () => {
    const trend = safetyRatings.getRatingTrend('partner_123', 30);
    expect(Array.isArray(trend)).toBe(true);
  });
});

describe('Dispute Resolution System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create dispute', () => {
    const result = disputeResolution.createDispute(
      'traveler_123',
      'partner_456',
      'booking_issue',
      'Partner cancelled booking without notice'
    );

    expect(result.success).toBe(true);
    expect(result.dispute.status).toBe('open');
    expect(result.dispute.id).toMatch(/^DISPUTE-/);
  });

  it('should get dispute', () => {
    const created = disputeResolution.createDispute(
      'traveler_123',
      'partner_456',
      'booking_issue',
      'Issue description'
    );

    const dispute = disputeResolution.getDispute(created.dispute.id);
    expect(dispute).toBeDefined();
    expect(dispute.complainantId).toBe('traveler_123');
  });

  it('should update dispute status', () => {
    const created = disputeResolution.createDispute(
      'traveler_123',
      'partner_456',
      'booking_issue',
      'Issue'
    );

    const result = disputeResolution.updateDisputeStatus(
      created.dispute.id,
      'in_progress',
      'Investigation started'
    );

    expect(result.success).toBe(true);
    expect(result.dispute.status).toBe('in_progress');
    expect(result.dispute.timeline.length).toBeGreaterThan(0);
  });

  it('should resolve dispute', () => {
    const created = disputeResolution.createDispute(
      'traveler_123',
      'partner_456',
      'booking_issue',
      'Issue'
    );

    const result = disputeResolution.resolveDispute(
      created.dispute.id,
      'full_refund',
      5000
    );

    expect(result.success).toBe(true);
    expect(result.dispute.status).toBe('resolved');
    expect(result.dispute.resolution.compensation).toBe(5000);
  });

  it('should get user disputes', () => {
    disputeResolution.createDispute('traveler_123', 'partner_456', 'issue1', 'Description 1');
    disputeResolution.createDispute('traveler_123', 'partner_789', 'issue2', 'Description 2');

    const disputes = disputeResolution.getUserDisputes('traveler_123');
    expect(disputes.length).toBe(2);
  });
});

describe('Background Check System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initiate background check', () => {
    const result = backgroundCheck.initiateCheck('partner_123', 'criminal');
    expect(result.success).toBe(true);
    expect(result.check.status).toBe('in_progress');
  });

  it('should get check result', () => {
    backgroundCheck.initiateCheck('partner_123', 'criminal');
    const result = backgroundCheck.getCheckResult('partner_123', 'criminal');

    expect(result).toBeDefined();
    expect(result.partnerId).toBe('partner_123');
  });

  it('should update check result', () => {
    backgroundCheck.initiateCheck('partner_123', 'criminal');
    const result = backgroundCheck.updateCheckResult('partner_123', 'criminal', {
      clearance: true,
      details: 'No criminal record found'
    });

    expect(result.success).toBe(true);
    expect(result.check.status).toBe('completed');
    expect(result.check.clearance).toBe(true);
  });

  it('should check if all checks passed', () => {
    backgroundCheck.initiateCheck('partner_123', 'criminal');
    backgroundCheck.updateCheckResult('partner_123', 'criminal', { clearance: true });

    backgroundCheck.initiateCheck('partner_123', 'employment');
    backgroundCheck.updateCheckResult('partner_123', 'employment', { clearance: true });

    const passed = backgroundCheck.allChecksPassed('partner_123');
    expect(passed).toBe(true);
  });
});

describe('Insurance Verification System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should verify valid insurance', () => {
    const result = insuranceVerification.verifyInsurance('partner_123', {
      type: 'liability',
      provider: 'Santam',
      policyNumber: 'POL123456',
      coverageAmount: 500000,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    expect(result.success).toBe(true);
    expect(result.verification.verified).toBe(true);
    expect(result.verification.status).toBe('verified');
  });

  it('should reject invalid policy', () => {
    const result = insuranceVerification.verifyInsurance('partner_123', {
      type: 'liability',
      provider: 'Test',
      policyNumber: 'XX', // Too short
      coverageAmount: 500000,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() - 1000).toISOString() // Expired
    });

    expect(result.verification.verified).toBe(false);
    expect(result.verification.status).toBe('failed');
  });

  it('should get active insurance', () => {
    insuranceVerification.verifyInsurance('partner_123', {
      type: 'liability',
      provider: 'Santam',
      policyNumber: 'POL123456',
      coverageAmount: 500000,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    const active = insuranceVerification.getActiveInsurance('partner_123');
    expect(active.length).toBe(1);
    expect(active[0].verified).toBe(true);
  });

  it('should check sufficient coverage', () => {
    insuranceVerification.verifyInsurance('partner_123', {
      type: 'liability',
      provider: 'Santam',
      policyNumber: 'POL123456',
      coverageAmount: 1000000,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    const hasCoverage = insuranceVerification.hasSufficientCoverage('partner_123', 500000);
    expect(hasCoverage).toBe(true);
  });

  it('should track insurance expiry', () => {
    // Add expiring insurance
    insuranceVerification.verifyInsurance('partner_123', {
      type: 'liability',
      provider: 'Santam',
      policyNumber: 'POL123456',
      coverageAmount: 500000,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days
    });

    const status = insuranceVerification.getExpiryStatus('partner_123');
    expect(status.expiring.length).toBe(1);
  });
});

describe('Safety Compliance System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get compliance status', () => {
    const status = safetyCompliance.getComplianceStatus('partner_123');

    expect(status).toHaveProperty('verified');
    expect(status).toHaveProperty('backgroundCheckPassed');
    expect(status).toHaveProperty('insuranceActive');
    expect(status).toHaveProperty('compliant');
  });

  it('should get requirements by partner type', () => {
    const hotel = safetyCompliance.getRequirements('hotel');
    expect(hotel.verification).toBe('standard');
    expect(hotel.backgroundCheck).toContain('criminal');

    const guide = safetyCompliance.getRequirements('tour_guide');
    expect(guide.verification).toBe('basic');
  });

  it('should check if partner meets requirements', () => {
    // Create compliant partner
    partnerVerification.createVerification('partner_123', {});
    partnerVerification.updateVerificationLevel('partner_123', 'standard');

    backgroundCheck.initiateCheck('partner_123', 'criminal');
    backgroundCheck.updateCheckResult('partner_123', 'criminal', { clearance: true });

    backgroundCheck.initiateCheck('partner_123', 'employment');
    backgroundCheck.updateCheckResult('partner_123', 'employment', { clearance: true });

    insuranceVerification.verifyInsurance('partner_123', {
      type: 'liability',
      provider: 'Santam',
      policyNumber: 'POL123456',
      coverageAmount: 500000,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    const meets = safetyCompliance.meetsRequirements('partner_123', 'hotel');
    expect(meets).toBe(true);
  });
});
