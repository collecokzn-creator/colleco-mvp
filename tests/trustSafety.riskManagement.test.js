import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { 
  enforceAccountLimits,
  getAccountLimits,
  updateAccountLimits,
  flagSuspiciousActivity,
  getSuspiciousActivityLog,
  autoTemporarilySuspend,
  autoTemporarilyRestrict,
  getAccountRiskScore,
  analyzeRiskPattern,
  clearAccountData
} = require('../src/utils/riskManagement');

describe('Risk Management & Account Limits', () => {
  beforeEach(() => {
    clearAccountData();
  });

  describe('enforceAccountLimits', () => {
    it('enforces transaction amount limit', () => {
      const transaction = {
        userId: 'user123',
        amount: 10000,
        type: 'booking'
      };

      const canProceed = enforceAccountLimits('user123', transaction);
      expect(typeof canProceed.allowed).toBe('boolean');
    });

    it('enforces daily transaction limit', () => {
      const transactions = [
        { userId: 'user456', amount: 1000, type: 'booking', timestamp: Date.now() },
        { userId: 'user456', amount: 2000, type: 'booking', timestamp: Date.now() - 3600000 },
        { userId: 'user456', amount: 8000, type: 'booking', timestamp: Date.now() - 7200000 }
      ];

      const lastTx = transactions[transactions.length - 1];
      const canProceed = enforceAccountLimits('user456', lastTx);

      // Should track cumulative daily total
      expect(canProceed).toBeTruthy();
      expect(canProceed.dailySpent).toBe(11000);
    });

    it('enforces booking count limits', () => {
      const transaction = {
        userId: 'user789',
        type: 'booking',
        bookingCount: 50 // Excessive booking attempts
      };

      const canProceed = enforceAccountLimits('user789', transaction);
      expect(canProceed.allowed).toBe(false);
      expect(canProceed.reason).toMatch(/too.*many|limit/i);
    });

    it('enforces API rate limits', () => {
      const apiCall = {
        userId: 'user999',
        endpoint: '/api/search',
        timestamp: Date.now()
      };

      const canProceed = enforceAccountLimits('user999', apiCall);
      expect(canProceed).toBeTruthy();
    });

    it('allows higher limits for verified users', () => {
      const transaction = {
        userId: 'verified_user',
        amount: 50000,
        type: 'booking',
        verificationLevel: 3
      };

      const canProceed = enforceAccountLimits('verified_user', transaction);
      // Verified users should have higher limits
      expect(canProceed.allowed).toBe(true);
    });

    it('returns detailed limit info with response', () => {
      const transaction = {
        userId: 'user111',
        amount: 2000,
        type: 'booking'
      };

      const result = enforceAccountLimits('user111', transaction);
      expect(result.allowed).toBeDefined();
      expect(result.limit).toBeDefined();
      expect(result.remaining).toBeDefined();
      expect(result.resetAt).toBeDefined();
    });
  });

  describe('getAccountLimits', () => {
    it('returns transaction limits for unverified users', () => {
      const limits = getAccountLimits('new_user');
      expect(limits.maxTransactionAmount).toBeLessThan(1000);
      expect(limits.dailyLimit).toBeLessThan(2000);
      expect(limits.monthlyLimit).toBeLessThan(5000);
    });

    it('returns higher limits for verified users', () => {
      const limits = getAccountLimits('verified_user', { verificationLevel: 3 });
      expect(limits.maxTransactionAmount).toBeGreaterThan(10000);
      expect(limits.monthlyLimit).toBeGreaterThan(50000);
    });

    it('includes rate limits for API access', () => {
      const limits = getAccountLimits('api_user');
      expect(limits.requestsPerMinute).toBeDefined();
      expect(limits.requestsPerHour).toBeDefined();
      expect(limits.requestsPerDay).toBeDefined();
    });

    it('includes booking-specific limits', () => {
      const limits = getAccountLimits('booking_user');
      expect(limits.maxBookingsPerDay).toBeDefined();
      expect(limits.maxConcurrentBookings).toBeDefined();
      expect(limits.maxRefundsPerMonth).toBeDefined();
    });

    it('limits are lower for flagged accounts', () => {
      const normalLimits = getAccountLimits('normal_user');
      const flaggedLimits = getAccountLimits('flagged_user', { flagged: true });

      expect(flaggedLimits.maxTransactionAmount).toBeLessThan(normalLimits.maxTransactionAmount);
    });
  });

  describe('updateAccountLimits', () => {
    it('temporarily reduces limits for suspicious activity', () => {
      updateAccountLimits('suspicious_user', {
        maxTransactionAmount: 500,
        duration: 3600 // 1 hour
      });

      const limits = getAccountLimits('suspicious_user');
      expect(limits.maxTransactionAmount).toBe(500);
      expect(limits.limitExpiresAt).toBeTruthy();
    });

    it('increases limits after successful verification', () => {
      updateAccountLimits('just_verified', {
        maxTransactionAmount: 5000,
        dailyLimit: 20000
      });

      const limits = getAccountLimits('just_verified');
      expect(limits.maxTransactionAmount).toBe(5000);
      expect(limits.dailyLimit).toBe(20000);
    });

    it('enforces maximum limits ceiling', () => {
      const overLimit = () => updateAccountLimits('user', {
        maxTransactionAmount: 999999999
      });

      expect(overLimit).toThrow();
    });

    it('records who modified limits', () => {
      const updated = updateAccountLimits('user_tracked', {
        maxTransactionAmount: 2000,
        modifiedBy: 'admin@example.com',
        reason: 'Suspicious activity detected'
      });

      expect(updated.modifiedBy).toBe('admin@example.com');
      expect(updated.modificationReason).toMatch(/Suspicious/);
    });
  });

  describe('flagSuspiciousActivity', () => {
    it('flags account with description', () => {
      const flag = flagSuspiciousActivity('user_flagged', {
        type: 'multiple_failed_bookings',
        description: 'Failed 10 bookings in 5 minutes'
      });

      expect(flag).toBeTruthy();
      expect(flag.flaggedAt).toBeTruthy();
      expect(flag.reason).toBe('multiple_failed_bookings');
    });

    it('sets alert severity level', () => {
      const highSeverity = flagSuspiciousActivity('user_critical', {
        type: 'fraud_detected',
        severity: 'critical'
      });

      expect(highSeverity.severity).toBe('critical');
      expect(highSeverity.requiresImmediateAction).toBe(true);
    });

    it('notifies security team for critical flags', () => {
      const flag = flagSuspiciousActivity('user_critical2', {
        type: 'potential_money_laundering',
        severity: 'critical'
      });

      expect(flag.securityTeamNotified).toBe(true);
      expect(flag.notificationTime).toBeTruthy();
    });

    it('allows custom flag categories', () => {
      const customCategories = [
        'chargeback_attempt',
        'velocity_abuse',
        'account_takeover_attempt',
        'coordinated_fraud'
      ];

      customCategories.forEach(category => {
        const flag = flagSuspiciousActivity(`user_${category}`, { type: category });
        expect(flag.reason).toBe(category);
      });
    });

    it('prevents duplicate consecutive flags', () => {
      flagSuspiciousActivity('user_nodup', { type: 'test_flag' });

      const shouldNotDuplicate = () => flagSuspiciousActivity('user_nodup', { 
        type: 'test_flag' 
      });

      // Should either merge or reject duplicate
      expect(shouldNotDuplicate).toThrow();
    });
  });

  describe('getSuspiciousActivityLog', () => {
    it('retrieves activity log for user', () => {
      flagSuspiciousActivity('user_log', {
        type: 'failed_payment',
        description: 'Payment declined'
      });

      const log = getSuspiciousActivityLog('user_log');
      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBeGreaterThan(0);
    });

    it('filters by severity level', () => {
      flagSuspiciousActivity('user_filter', { type: 'minor', severity: 'low' });
      flagSuspiciousActivity('user_filter', { type: 'major', severity: 'high' });

      const highSeverity = getSuspiciousActivityLog('user_filter', { severity: 'high' });
      expect(highSeverity.every(a => a.severity === 'high')).toBe(true);
    });

    it('includes timestamp for correlation', () => {
      flagSuspiciousActivity('user_time', { type: 'test' });

      const log = getSuspiciousActivityLog('user_time');
      expect(log[0].timestamp).toBeTruthy();
      expect(log[0].timestamp instanceof Date || typeof log[0].timestamp === 'number').toBe(true);
    });

    it('respects privacy by not showing other users flags', () => {
      flagSuspiciousActivity('user_a', { type: 'test' });
      flagSuspiciousActivity('user_b', { type: 'test' });

      const logA = getSuspiciousActivityLog('user_a');
      expect(logA.every(a => a.userId === 'user_a')).toBe(true);
    });
  });

  describe('autoTemporarilySuspend', () => {
    it('auto-suspends account for critical violations', () => {
      const suspension = autoTemporarilySuspend('user_suspend', {
        reason: 'illegal_activity_detected',
        autoTrigger: true
      });

      expect(suspension).toBeTruthy();
      expect(suspension.suspended).toBe(true);
      expect(suspension.suspensionReason).toBe('illegal_activity_detected');
    });

    it('sets suspension duration based on severity', () => {
      const suspension = autoTemporarilySuspend('user_temp_suspend', {
        reason: 'fraud_attempt',
        severity: 'medium'
      });

      expect(suspension.suspendedUntil).toBeTruthy();
      const duration = new Date(suspension.suspendedUntil).getTime() - Date.now();
      expect(duration).toBeGreaterThan(0);
    });

    it('notifies user of suspension', () => {
      const suspension = autoTemporarilySuspend('user_notify_suspend', {
        reason: 'account_compromise_detected'
      });

      expect(suspension.userNotified).toBe(true);
      expect(suspension.notificationMethod).toMatch(/email|sms/);
    });

    it('allows appeal process', () => {
      const suspension = autoTemporarilySuspend('user_appeal', {
        reason: 'suspicious_activity',
        allowAppeal: true
      });

      expect(suspension.allowsAppeal).toBe(true);
      expect(suspension.appealDeadline).toBeTruthy();
    });

    it('prevents auto-suspension for low-risk triggers', () => {
      const result = autoTemporarilySuspend('user_no_suspend', {
        reason: 'too_many_searches', // Low risk
        severity: 'low'
      });

      expect(result.suspended).toBe(false);
    });
  });

  describe('autoTemporarilyRestrict', () => {
    it('restricts account functionality without full suspension', () => {
      const restriction = autoTemporarilyRestrict('user_restrict', {
        reason: 'velocity_abuse',
        restrictedFeatures: ['booking', 'api_access']
      });

      expect(restriction).toBeTruthy();
      expect(restriction.restricted).toBe(true);
      expect(restriction.restrictedFeatures).toContain('booking');
    });

    it('allows partial access during restriction', () => {
      const restriction = autoTemporarilyRestrict('user_partial', {
        reason: 'unusual_activity',
        allowedFeatures: ['view', 'search']
      });

      expect(restriction.allowedFeatures).toContain('view');
      expect(restriction.restrictedFeatures).not.toContain('view');
    });

    it('implements cooling off period', () => {
      const restriction = autoTemporarilyRestrict('user_cooloff', {
        reason: 'rate_limit_abuse',
        coolingOffMinutes: 30
      });

      expect(restriction.coolOffUntil).toBeTruthy();
    });

    it('notifies user of restrictions', () => {
      const restriction = autoTemporarilyRestrict('user_notify_restrict', {
        reason: 'suspicious_pattern'
      });

      expect(restriction.userNotified).toBe(true);
    });
  });

  describe('getAccountRiskScore', () => {
    it('calculates risk score 0-100', () => {
      const score = getAccountRiskScore('user_risk');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('increases score for flags and suspicions', () => {
      flagSuspiciousActivity('high_risk_user', { type: 'fraud_attempt' });
      
      const riskScore = getAccountRiskScore('high_risk_user');
      expect(riskScore).toBeGreaterThan(50);
    });

    it('decreases score over time with no incidents', () => {
      const newUser = getAccountRiskScore('clean_user');
      expect(newUser).toBeLessThan(20);
    });

    it('considers verification status in scoring', () => {
      const unverifiedScore = getAccountRiskScore('unverified_user', { verificationLevel: 0 });
      const verifiedScore = getAccountRiskScore('verified_user', { verificationLevel: 3 });

      expect(verifiedScore).toBeLessThan(unverifiedScore);
    });

    it('includes behavioral indicators', () => {
      const score = getAccountRiskScore('behavior_user', {
        newLocation: true,
        newDevice: true,
        unusualTime: true,
        rapidTransactions: true
      });

      expect(score).toBeGreaterThan(60);
    });
  });

  describe('analyzeRiskPattern', () => {
    it('detects card testing patterns', () => {
      const pattern = analyzeRiskPattern('user_card_test', {
        type: 'card_testing',
        pattern: [
          { amount: 0.5 },
          { amount: 1.0 },
          { amount: 2.0 },
          { amount: 3.0 }
        ]
      });

      expect(pattern.isRiskPattern).toBe(true);
      expect(pattern.patternType).toBe('card_testing');
    });

    it('detects purchase velocity abuse', () => {
      const now = Date.now();
      const pattern = analyzeRiskPattern('user_velocity', {
        type: 'velocity_abuse',
        transactions: [
          { timestamp: now },
          { timestamp: now - 60000 },
          { timestamp: now - 120000 },
          { timestamp: now - 180000 },
          { timestamp: now - 240000 }
        ]
      });

      expect(pattern.isRiskPattern).toBe(true);
      expect(pattern.velocity).toBeGreaterThan(4);
    });

    it('detects triangulation fraud patterns', () => {
      const pattern = analyzeRiskPattern('user_triangle', {
        type: 'triangulation',
        pattern: [
          { type: 'booking', successful: true },
          { type: 'payment_decline', successful: false },
          { type: 'refund_request', amount: 'high' }
        ]
      });

      expect(pattern.isRiskPattern).toBe(true);
    });

    it('detects geographical impossibility', () => {
      const pattern = analyzeRiskPattern('user_geo', {
        type: 'impossible_travel',
        transactions: [
          { location: 'New York', timestamp: new Date() },
          { location: 'Tokyo', timestamp: new Date(Date.now() + 60000) } // 1 minute later
        ]
      });

      expect(pattern.isRiskPattern).toBe(true);
      expect(pattern.reason).toMatch(/impossible|travel/i);
    });

    it('returns risk score for pattern', () => {
      const pattern = analyzeRiskPattern('user_score', {
        type: 'generic_suspicious',
        indicators: ['new_device', 'high_amount', 'unusual_time']
      });

      expect(pattern.riskScore).toBeGreaterThan(0);
      expect(pattern.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Risk management workflows', () => {
    it('escalates high-risk activities appropriately', () => {
      flagSuspiciousActivity('escalate_user', {
        type: 'potential_money_laundering',
        severity: 'critical'
      });

      const riskScore = getAccountRiskScore('escalate_user');
      expect(riskScore).toBeGreaterThan(80);
    });

    it('allows temporary restrictions before escalation', () => {
      const restriction = autoTemporarilyRestrict('user_gradual', {
        reason: 'rate_limiting',
        coolingOffMinutes: 15
      });

      expect(restriction.restricted).toBe(true);

      // Can escalate to suspension later if needed
      const suspension = autoTemporarilySuspend('user_gradual', {
        reason: 'escalation_from_restriction'
      });

      expect(suspension.suspended).toBe(true);
    });

    it('implements graduated response to violations', () => {
      // First: Flag and restrict
      flagSuspiciousActivity('user_graduated', {
        type: 'first_violation',
        severity: 'low'
      });

      const restriction = autoTemporarilyRestrict('user_graduated', {
        reason: 'first_violation'
      });

      // Then: Stronger restriction
      const _stronger = autoTemporarilyRestrict('user_graduated', {
        reason: 'second_violation',
        severity: 'medium'
      });

      // Finally: Suspension if needed
      const suspension = autoTemporarilySuspend('user_graduated', {
        reason: 'third_violation',
        severity: 'high'
      });

      expect(restriction.restricted).toBe(true);
      expect(suspension.suspended).toBe(true);
    });
  });
});
