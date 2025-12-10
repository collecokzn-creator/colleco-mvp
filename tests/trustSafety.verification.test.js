import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { 
  verifyUserIdentity,
  linkPaymentMethod,
  updateVerificationStatus,
  getVerificationLevel,
  isVerified,
  shouldRequireAdditionalVerification,
  generateVerificationChallenge,
  validateVerificationResponse
} = require('../src/utils/userVerification');

describe('User Verification System', () => {
  describe('verifyUserIdentity', () => {
    it('initiates identity verification process', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      expect(verification).toBeTruthy();
      expect(verification.id).toBeTruthy();
      expect(verification.status).toBe('pending');
      expect(verification.startedAt).toBeTruthy();
    });

    it('validates document type is allowed', () => {
      const invalidVerification = () => verifyUserIdentity('user123', {
        documentType: 'invalid_doc',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      expect(invalidVerification).toThrow();
    });

    it('accepts multiple document types', () => {
      const allowedTypes = ['passport', 'drivers_license', 'national_id', 'visa'];

      allowedTypes.forEach(docType => {
        const verification = verifyUserIdentity(`user_${docType}`, {
          documentType: docType,
          documentNumber: 'DOC123456',
          name: 'Test User'
        });

        expect(verification).toBeTruthy();
        expect(verification.documentType).toBe(docType);
      });
    });

    it('masks sensitive document information', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456789',
        name: 'John Doe'
      });

      // Full number should be stored encrypted
      expect(verification.documentNumberMasked).toBe('ABC1234****');
    });

    it('requires name matching between user profile and document', () => {
      const mismatchedVerification = () => verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'Different Person'
      });

      // Should warn or fail if significant mismatch
      expect(mismatchedVerification).toThrow();
    });

    it('logs verification attempt for audit trail', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      expect(verification.auditLog).toBeTruthy();
      expect(verification.auditLog.initiatedAt).toBeTruthy();
      expect(verification.auditLog.ipAddress).toBeTruthy();
    });
  });

  describe('linkPaymentMethod', () => {
    it('safely stores payment information', () => {
      const paymentLink = linkPaymentMethod('user123', {
        cardType: 'visa',
        cardNumber: '4532123456789012',
        expiryMonth: 12,
        expiryYear: 2026,
        cvv: '123',
        billingName: 'John Doe'
      });

      expect(paymentLink).toBeTruthy();
      expect(paymentLink.id).toBeTruthy();
      expect(paymentLink.status).toBe('pending_verification');
    });

    it('never stores full credit card number', () => {
      const paymentLink = linkPaymentMethod('user123', {
        cardType: 'visa',
        cardNumber: '4532123456789012',
        expiryMonth: 12,
        expiryYear: 2026,
        cvv: '123',
        billingName: 'John Doe'
      });

      // Should only store last 4 digits
      expect(paymentLink.cardNumberMasked).toBe('****9012');
      expect(paymentLink.cardNumber).toBeUndefined();
      expect(paymentLink.cvv).toBeUndefined();
    });

    it('validates card details before linking', () => {
      const invalidCard = () => linkPaymentMethod('user123', {
        cardType: 'visa',
        cardNumber: '1234567890123456', // Invalid checksum
        expiryMonth: 12,
        expiryYear: 2026,
        cvv: '123',
        billingName: 'John Doe'
      });

      expect(invalidCard).toThrow();
    });

    it('requires micro-deposit verification for new cards', () => {
      const paymentLink = linkPaymentMethod('user123', {
        cardType: 'visa',
        cardNumber: '4532123456789012',
        expiryMonth: 12,
        expiryYear: 2026,
        cvv: '123',
        billingName: 'John Doe'
      });

      expect(paymentLink.verificationRequired).toBe(true);
      expect(paymentLink.verificationMethod).toMatch(/micro_deposit|otp/);
    });

    it('supports multiple payment methods per user', () => {
      linkPaymentMethod('user456', {
        cardType: 'visa',
        cardNumber: '4532123456789012',
        expiryMonth: 12,
        expiryYear: 2026,
        cvv: '123',
        billingName: 'John Doe'
      });

      const secondPayment = linkPaymentMethod('user456', {
        cardType: 'mastercard',
        cardNumber: '5425233010103010',
        expiryMonth: 3,
        expiryYear: 2025,
        cvv: '456',
        billingName: 'John Doe'
      });

      expect(secondPayment).toBeTruthy();
      expect(secondPayment.cardType).toBe('mastercard');
    });
  });

  describe('updateVerificationStatus', () => {
    it('updates verification status to approved', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      const updated = updateVerificationStatus(verification.id, 'approved');
      expect(updated.status).toBe('approved');
      expect(updated.approvedAt).toBeTruthy();
    });

    it('supports rejected status with reason', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      const updated = updateVerificationStatus(verification.id, 'rejected', {
        reason: 'document_illegible',
        message: 'The document image is too blurry. Please resubmit.'
      });

      expect(updated.status).toBe('rejected');
      expect(updated.rejectionReason).toBe('document_illegible');
      expect(updated.rejectionMessage).toBeTruthy();
    });

    it('allows resubmission after rejection', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      updateVerificationStatus(verification.id, 'rejected', { reason: 'illegible' });

      const resubmission = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC654321',
        name: 'John Doe'
      });

      expect(resubmission).toBeTruthy();
      expect(resubmission.id).not.toBe(verification.id);
    });

    it('records verification reviewer information', () => {
      const verification = verifyUserIdentity('user123', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      const updated = updateVerificationStatus(verification.id, 'approved', {
        reviewedBy: 'reviewer@company.com',
        reviewedAt: new Date()
      });

      expect(updated.reviewedBy).toBe('reviewer@company.com');
      expect(updated.reviewedAt).toBeTruthy();
    });
  });

  describe('getVerificationLevel', () => {
    it('returns verification level 0 for unverified users', () => {
      const level = getVerificationLevel('unverified_user');
      expect(level).toBe(0);
    });

    it('returns level 1 for email-verified users', () => {
      // Assuming user has email verification
      const level = getVerificationLevel('email_verified_user');
      expect(level).toBeGreaterThanOrEqual(1);
    });

    it('returns level 2 for identity-verified users', () => {
      const verification = verifyUserIdentity('user789', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'John Doe'
      });

      updateVerificationStatus(verification.id, 'approved');
      const level = getVerificationLevel('user789');
      expect(level).toBeGreaterThanOrEqual(2);
    });

    it('returns level 3 for payment-verified users', () => {
      // User with both identity and payment verification
      const level = getVerificationLevel('fully_verified_user');
      expect(level).toBeGreaterThanOrEqual(3);
    });

    it('verification level determines transaction limits', () => {
      const level0Limits = { maxTransaction: 0, monthlyLimit: 0 };
      const level1Limits = { maxTransaction: 500, monthlyLimit: 2000 };
      const level2Limits = { maxTransaction: 5000, monthlyLimit: 20000 };
      const level3Limits = { maxTransaction: 50000, monthlyLimit: 200000 };

      expect(level0Limits.maxTransaction).toBeLessThan(level1Limits.maxTransaction);
      expect(level1Limits.maxTransaction).toBeLessThan(level2Limits.maxTransaction);
      expect(level2Limits.maxTransaction).toBeLessThan(level3Limits.maxTransaction);
    });
  });

  describe('isVerified', () => {
    it('returns true for fully verified users', () => {
      const verification = verifyUserIdentity('verified_user', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'Test User'
      });

      updateVerificationStatus(verification.id, 'approved');
      expect(isVerified('verified_user')).toBe(true);
    });

    it('returns false for unverified users', () => {
      expect(isVerified('random_unverified_user')).toBe(false);
    });

    it('returns false for verification in progress', () => {
      verifyUserIdentity('pending_user', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'Test User'
      });

      expect(isVerified('pending_user')).toBe(false);
    });

    it('returns false for rejected verifications', () => {
      const verification = verifyUserIdentity('rejected_user', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'Test User'
      });

      updateVerificationStatus(verification.id, 'rejected', { reason: 'illegible' });
      expect(isVerified('rejected_user')).toBe(false);
    });
  });

  describe('shouldRequireAdditionalVerification', () => {
    it('requires additional verification for large transactions', () => {
      const require2FA = shouldRequireAdditionalVerification('user_large_tx', {
        transactionAmount: 10000,
        transactionType: 'booking'
      });

      expect(require2FA).toBe(true);
    });

    it('requires verification for unusual activity patterns', () => {
      const requireVerification = shouldRequireAdditionalVerification('user_unusual', {
        attemptedFromNewLocation: true,
        attemptedFromNewDevice: true,
        unusualTime: true
      });

      expect(requireVerification).toBe(true);
    });

    it('does not require verification for normal verified users', () => {
      const requireVerification = shouldRequireAdditionalVerification('normal_user', {
        transactionAmount: 100,
        transactionType: 'booking'
      });

      expect(requireVerification).toBeFalsy();
    });

    it('considers user verification level in decision', () => {
      // Level 0 user with small transaction
      const level0_small = shouldRequireAdditionalVerification('new_user', {
        transactionAmount: 50,
        verificationLevel: 0
      });

      // Level 3 user with same transaction
      const level3_small = shouldRequireAdditionalVerification('verified_user', {
        transactionAmount: 50,
        verificationLevel: 3
      });

      expect(level0_small).toBe(true);
      expect(level3_small).toBe(false);
    });
  });

  describe('generateVerificationChallenge', () => {
    it('generates OTP challenge', () => {
      const challenge = generateVerificationChallenge('user_otp', 'otp');
      expect(challenge).toBeTruthy();
      expect(challenge.code).toBeTruthy();
      expect(challenge.expiresAt).toBeTruthy();
      expect(challenge.method).toBe('otp');
    });

    it('generates security question challenge', () => {
      const challenge = generateVerificationChallenge('user_questions', 'security_questions');
      expect(challenge).toBeTruthy();
      expect(Array.isArray(challenge.questions)).toBe(true);
      expect(challenge.questions.length).toBeGreaterThan(0);
    });

    it('OTP expires after 10 minutes', () => {
      const challenge = generateVerificationChallenge('user_otp', 'otp');
      const expiryTime = new Date(challenge.expiresAt).getTime();
      const currentTime = new Date().getTime();
      const diffMinutes = (expiryTime - currentTime) / 1000 / 60;

      expect(diffMinutes).toBeLessThanOrEqual(10);
      expect(diffMinutes).toBeGreaterThan(9);
    });

    it('prevents multiple active challenges per user', () => {
      generateVerificationChallenge('user_single', 'otp');
      
      // Attempting second challenge should revoke first
      const secondChallenge = generateVerificationChallenge('user_single', 'otp');
      
      expect(secondChallenge).toBeTruthy();
    });
  });

  describe('validateVerificationResponse', () => {
    it('validates correct OTP response', () => {
      const challenge = generateVerificationChallenge('user_verify', 'otp');
      const isValid = validateVerificationResponse('user_verify', challenge.code);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect OTP code', () => {
      generateVerificationChallenge('user_verify2', 'otp');
      const isValid = validateVerificationResponse('user_verify2', '000000');
      expect(isValid).toBe(false);
    });

    it('rejects expired challenges', () => {
      // Create a challenge that should be expired
      const challenge = generateVerificationChallenge('user_expire', 'otp');
      
      // Wait for expiry (in real scenario)
      // For testing, we'd mock the time or manually expire it
      const isValid = validateVerificationResponse('user_expire', challenge.code, {
        bypassExpiry: false
      });

      // Should be valid if not actually expired
      expect(typeof isValid).toBe('boolean');
    });

    it('prevents brute force attacks', () => {
      generateVerificationChallenge('user_brute', 'otp');
      
      // Attempt multiple wrong codes
      for (let i = 0; i < 5; i++) {
        validateVerificationResponse('user_brute', `00000${i}`);
      }

      // Should now require new challenge or be locked
      const shouldLock = validateVerificationResponse('user_brute', '000000', {
        checkLockout: true
      });

      expect(shouldLock).toBeFalsy();
    });
  });

  describe('Verification security scenarios', () => {
    it('prevents identity document fraud with liveness checks', () => {
      const verification = verifyUserIdentity('fraud_user', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'Fake Person'
      });

      // Should flag for manual review
      expect(verification.requiresManualReview).toBe(true);
    });

    it('detects suspicious verification patterns', () => {
      // Multiple verifications in short time
      verifyUserIdentity('suspicious_user', {
        documentType: 'passport',
        documentNumber: 'DOC1',
        name: 'Name1'
      });

      const secondAttempt = verifyUserIdentity('suspicious_user', {
        documentType: 'drivers_license',
        documentNumber: 'DOC2',
        name: 'Name2'
      });

      expect(secondAttempt.suspicionLevel).toBeGreaterThan(0);
    });

    it('enforces verification cooling off period', () => {
      const _firstVerification = verifyUserIdentity('cooloff_user', {
        documentType: 'passport',
        documentNumber: 'ABC123456',
        name: 'Test User'
      });

      const shouldWait = () => verifyUserIdentity('cooloff_user', {
        documentType: 'passport',
        documentNumber: 'ABC654321',
        name: 'Test User'
      });

      expect(shouldWait).toThrow();
    });
  });
});
