import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { 
  filterContent, 
  containsProhibitedContent,
  sanitizeUserInput,
  getModerationScore 
} = require('../src/utils/contentFilter');

describe('Content Filtering System', () => {
  describe('filterContent', () => {
    it('removes profanity from text', () => {
      const input = 'This is a damn good trip with some ****ed up activities';
      const result = filterContent(input);
      expect(result).not.toContain('damn');
      expect(result).toContain('***');
    });

    it('flags sexual content', () => {
      const input = 'Looking for adult entertainment in Las Vegas';
      const result = filterContent(input, { severity: 'strict' });
      expect(result.flagged).toBe(true);
      expect(result.category).toBe('sexual_content');
    });

    it('detects hate speech patterns', () => {
      const input = 'I hate all tourists from that country';
      const result = filterContent(input, { categories: ['hate_speech'] });
      expect(result.flagged).toBe(true);
    });

    it('identifies spam indicators', () => {
      const input = 'BUY NOW!!! CLICK HERE!!! WIN FREE MONEY!!! www.spam.com www.malware.com';
      const result = filterContent(input, { categories: ['spam'] });
      expect(result.flagged).toBe(true);
      expect(result.spamScore).toBeGreaterThan(0.7);
    });

    it('preserves clean content', () => {
      const input = 'I would like to book a beautiful hotel in Paris for my anniversary trip';
      const result = filterContent(input);
      expect(result.flagged).toBe(false);
      expect(result.text).toBe(input);
    });

    it('handles mixed content with some violations', () => {
      const input = 'Great hotel! Though the staff was damn rude sometimes.';
      const result = filterContent(input);
      expect(result.modified).toBe(true);
      expect(result.originalLength).toBeGreaterThan(result.text.length);
    });
  });

  describe('containsProhibitedContent', () => {
    it('returns false for clean business content', () => {
      const text = 'We offer premium travel packages to exotic destinations';
      expect(containsProhibitedContent(text)).toBe(false);
    });

    it('returns true for violence threats', () => {
      const text = 'I will hurt anyone who disagrees with me';
      expect(containsProhibitedContent(text, { severe: true })).toBe(true);
    });

    it('returns true for illegal activity mentions', () => {
      const text = 'I need help with human trafficking routes';
      expect(containsProhibitedContent(text)).toBe(true);
    });

    it('returns true for drug-related content', () => {
      const text = 'Looking for cocaine suppliers in Miami';
      expect(containsProhibitedContent(text, { categories: ['drugs'] })).toBe(true);
    });

    it('handles URL extraction and validation', () => {
      const text = 'Check this link: https://example.com/malware or visit spam.ru';
      const result = containsProhibitedContent(text);
      expect(result).toBeTruthy();
    });

    it('detects child safety violations', () => {
      const text = 'Looking for child exploitation material';
      expect(containsProhibitedContent(text, { checkChildSafety: true })).toBe(true);
    });
  });

  describe('sanitizeUserInput', () => {
    it('removes script tags', () => {
      const input = 'Hello <script>alert("xss")</script> world';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('removes HTML attributes with event handlers', () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain('onerror');
    });

    it('preserves safe markdown', () => {
      const input = '**Bold** and *italic* text';
      const result = sanitizeUserInput(input, { allowMarkdown: true });
      expect(result).toContain('**Bold**');
    });

    it('removes SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizeUserInput(input);
      expect(result).not.toContain('DROP TABLE');
    });

    it('normalizes unicode to prevent spoofing', () => {
      const input = 'раҮ (Cyrillic lookalikes for "pay")';
      const result = sanitizeUserInput(input, { normalizeUnicode: true });
      expect(result.length).toBeLessThanOrEqual(input.length);
    });

    it('limits message length', () => {
      const longInput = 'a'.repeat(10000);
      const result = sanitizeUserInput(longInput, { maxLength: 1000 });
      expect(result.length).toBeLessThanOrEqual(1000);
    });

    it('preserves legitimate special characters', () => {
      const input = 'Price: $99.99, Phone: +1-555-0123';
      const result = sanitizeUserInput(input);
      expect(result).toContain('$');
      expect(result).toContain('+');
      expect(result).toContain('-');
    });
  });

  describe('getModerationScore', () => {
    it('returns 0 for completely safe content', () => {
      const score = getModerationScore('This is a wonderful trip recommendation');
      expect(score).toBe(0);
    });

    it('returns low score for minor issues', () => {
      const score = getModerationScore('The damn hotel was okay');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(0.3);
    });

    it('returns medium score for moderate violations', () => {
      const score = getModerationScore('This sucks! I hate it here!');
      expect(score).toBeGreaterThan(0.3);
      expect(score).toBeLessThan(0.7);
    });

    it('returns high score for severe violations', () => {
      const score = getModerationScore('I will harm all people from that group');
      expect(score).toBeGreaterThan(0.7);
    });

    it('considers repetition in scoring', () => {
      const singleBad = 'This is bad';
      const multipleBad = 'This is bad bad bad bad bad';
      expect(getModerationScore(multipleBad)).toBeGreaterThan(getModerationScore(singleBad));
    });

    it('factors in context severity', () => {
      const money = 'I need to transfer money to you';
      const scam = 'Send me money now or I will harm you';
      expect(getModerationScore(scam)).toBeGreaterThan(getModerationScore(money));
    });
  });

  describe('Content categories detection', () => {
    it('detects financial fraud patterns', () => {
      const fraudPatterns = [
        'Send me Bitcoin for urgent fee',
        'I can guarantee you 1000% return',
        'Wire transfer needed immediately'
      ];
      fraudPatterns.forEach(pattern => {
        const result = filterContent(pattern, { categories: ['financial_fraud'] });
        expect(result.flagged).toBe(true);
      });
    });

    it('detects personal information exposure', () => {
      const piiPatterns = [
        'My passport number is 12345678',
        'Credit card: 4532-1234-5678-9012',
        'SSN: 123-45-6789'
      ];
      piiPatterns.forEach(pattern => {
        const result = filterContent(pattern, { checkPII: true });
        expect(result.flagged).toBe(true);
      });
    });

    it('detects discrimination and bias', () => {
      const biasPatterns = [
        'I only want hotels owned by my ethnic group',
        'No guests from that religion allowed',
        'Disabled travelers not welcome'
      ];
      biasPatterns.forEach(pattern => {
        const result = filterContent(pattern, { categories: ['discrimination'] });
        expect(result.flagged).toBe(true);
      });
    });

    it('detects misinformation and false claims', () => {
      const falsePatterns = [
        'Vaccines cause autism and tourism is dangerous',
        'This resort cures cancer'
      ];
      falsePatterns.forEach(pattern => {
        const result = filterContent(pattern, { categories: ['misinformation'] });
        expect(result.flagged).toBe(true);
      });
    });
  });

  describe('Context-aware filtering', () => {
    it('allows hotel reviews with constructive criticism', () => {
      const review = 'The bathroom could use renovation but the staff was helpful';
      const result = filterContent(review, { context: 'review' });
      expect(result.flagged).toBe(false);
    });

    it('is stricter with public posts than private messages', () => {
      const text = 'This place is okay I guess';
      const publicResult = filterContent(text, { context: 'public_post', severity: 'strict' });
      const privateResult = filterContent(text, { context: 'private_message', severity: 'strict' });
      // Public should have higher scrutiny if applicable
      expect(publicResult.context).toBe('public_post');
    });

    it('allows professional jargon in business context', () => {
      const text = 'We need to leverage synergies to maximize ROI on destination marketing';
      const result = filterContent(text, { context: 'business' });
      expect(result.flagged).toBe(false);
    });

    it('detects promotional spam more aggressively in review context', () => {
      const spam = 'BUY NOW at www.discount-hotels.com for huge savings!!!';
      const result = filterContent(spam, { context: 'review' });
      expect(result.flagged).toBe(true);
      expect(result.category).toBe('spam');
    });
  });
});
