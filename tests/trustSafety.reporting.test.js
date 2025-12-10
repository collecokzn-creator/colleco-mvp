import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { 
  reportUserContent,
  getReportStatus,
  resolveReport,
  getReportHistory,
  calculateReportUrgency,
  clearReports
} = require('../src/utils/reportingSystem');

describe('User Reporting System', () => {
  beforeEach(() => {
    clearReports();
  });

  describe('reportUserContent', () => {
    it('creates a new report for inappropriate content', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'hate_speech',
        description: 'User posted discriminatory content'
      });

      expect(report).toBeTruthy();
      expect(report.id).toBeTruthy();
      expect(report.status).toBe('open');
      expect(report.createdAt).toBeTruthy();
      expect(report.reason).toBe('hate_speech');
    });

    it('requires valid reason from allowed list', () => {
      const invalidReport = () => reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'invalid_reason',
        description: 'Description'
      });

      expect(invalidReport).toThrow();
    });

    it('stores reporter identity securely', () => {
      const report = reportUserContent({
        reporterId: 'reporter789',
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'harassment',
        description: 'Repeated threatening messages'
      });

      // Reporter ID should be stored but obfuscated in public views
      expect(report.reporterId).toBeTruthy();
      expect(report.publicReport?.reporterId).toBeUndefined();
    });

    it('includes content preview for context', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'spam',
        description: 'Promotional spam',
        contentPreview: 'BUY NOW at www.spam.com!!!'
      });

      expect(report.contentPreview).toBeTruthy();
      expect(report.contentPreview.length).toBeLessThanOrEqual(500);
    });

    it('accepts attachments for evidence', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'fraud',
        description: 'Suspicious payment request',
        attachments: ['screenshot1.png', 'transcript.txt']
      });

      expect(report.attachments).toBeTruthy();
      expect(report.attachments.length).toBe(2);
    });

    it('prevents spam reporting of the same content multiple times', () => {
      const _firstReport = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'spam',
        description: 'First report'
      });

      const reportAgain = () => reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'spam',
        description: 'Duplicate report'
      });

      // Should reject or merge duplicate reports
      expect(reportAgain).toThrow();
    });

    it('assigns priority based on severity', () => {
      const severeReport = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'child_safety_violation',
        description: 'Explicit content involving minors'
      });

      const minorReport = reportUserContent({
        reportedUserId: 'user456',
        contentId: 'message789',
        reason: 'spam',
        description: 'Random promotional post'
      });

      expect(severeReport.priority).toBeGreaterThan(minorReport.priority);
    });
  });

  describe('getReportStatus', () => {
    it('returns current status of a report', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'harassment'
      });

      const status = getReportStatus(report.id);
      expect(status.status).toBe('open');
    });

    it('tracks status transitions over time', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'harassment'
      });

      // Simulate status change
      resolveReport(report.id, 'resolved', 'User warned');
      const status = getReportStatus(report.id);
      expect(status.status).toBe('resolved');
    });

    it('includes metadata about report age and activity', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'harassment'
      });

      const status = getReportStatus(report.id);
      expect(status.createdAt).toBeTruthy();
      expect(status.updatedAt).toBeTruthy();
    });
  });

  describe('resolveReport', () => {
    it('marks a report as resolved with action taken', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'harassment'
      });

      const resolved = resolveReport(report.id, 'resolved', 'Content removed. User warned.');
      expect(resolved.status).toBe('resolved');
      expect(resolved.resolution).toBe('Content removed. User warned.');
    });

    it('supports multiple resolution types', () => {
      const reasons = ['upheld', 'dismissed', 'resolved', 'escalated'];

      reasons.forEach(reason => {
        const report = reportUserContent({
          reportedUserId: `user_${reason}`,
          contentId: `msg_${reason}`,
          reason: 'harassment'
        });

        const resolved = resolveReport(report.id, reason, 'Test resolution');
        expect(resolved.status).toBe(reason);
      });
    });

    it('records moderator action and rationale', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'harassment'
      });

      const resolved = resolveReport(report.id, 'upheld', 'Policy violation confirmed', {
        moderatorId: 'mod789',
        policyViolated: 'harassment_policy_2024'
      });

      expect(resolved.moderatorId).toBe('mod789');
      expect(resolved.policyViolated).toBe('harassment_policy_2024');
    });

    it('can mark report as escalated to legal team', () => {
      const report = reportUserContent({
        reportedUserId: 'user123',
        contentId: 'message456',
        reason: 'illegal_activity'
      });

      const escalated = resolveReport(report.id, 'escalated', 'Requires legal review', {
        escalatedTo: 'legal_team'
      });

      expect(escalated.escalatedTo).toBe('legal_team');
    });
  });

  describe('getReportHistory', () => {
    it('returns list of reports for a user', () => {
      reportUserContent({
        reportedUserId: 'user123',
        contentId: 'msg1',
        reason: 'spam'
      });
      reportUserContent({
        reportedUserId: 'user123',
        contentId: 'msg2',
        reason: 'harassment'
      });

      const history = getReportHistory('user123');
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('filters by report reason', () => {
      reportUserContent({
        reportedUserId: 'user456',
        contentId: 'msg1',
        reason: 'spam'
      });
      reportUserContent({
        reportedUserId: 'user456',
        contentId: 'msg2',
        reason: 'harassment'
      });

      const spamReports = getReportHistory('user456', { reason: 'spam' });
      expect(spamReports.every(r => r.reason === 'spam')).toBe(true);
    });

    it('filters by status', () => {
      const report = reportUserContent({
        reportedUserId: 'user789',
        contentId: 'msg1',
        reason: 'fraud'
      });

      resolveReport(report.id, 'dismissed', 'Not policy violation');

      const openReports = getReportHistory('user789', { status: 'open' });
      const dismissedReports = getReportHistory('user789', { status: 'dismissed' });

      expect(openReports.length).toBe(0);
      expect(dismissedReports.length).toBeGreaterThan(0);
    });

    it('supports date range filtering', () => {
      reportUserContent({
        reportedUserId: 'user999',
        contentId: 'msg1',
        reason: 'spam'
      });

      const yesterday = new Date(Date.now() - 86400000);
      const tomorrow = new Date(Date.now() + 86400000);

      const history = getReportHistory('user999', {
        startDate: yesterday,
        endDate: tomorrow
      });

      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('calculateReportUrgency', () => {
    it('calculates urgency level based on violation severity', () => {
      const childSafetyReport = {
        reason: 'child_safety_violation',
        priority: 10
      };

      const urgency = calculateReportUrgency(childSafetyReport);
      expect(urgency).toBeGreaterThanOrEqual(9);
    });

    it('increases urgency for repeated violations', () => {
      const report = reportUserContent({
        reportedUserId: 'repeat_violator',
        contentId: 'msg1',
        reason: 'harassment'
      });

      const _history = getReportHistory('repeat_violator');
      const report2 = reportUserContent({
        reportedUserId: 'repeat_violator',
        contentId: 'msg2',
        reason: 'harassment'
      });

      const urgency1 = calculateReportUrgency(report);
      const urgency2 = calculateReportUrgency(report2);

      expect(urgency2).toBeGreaterThanOrEqual(urgency1);
    });

    it('prioritizes reports with attachments/evidence', () => {
      const reportNoEvidence = reportUserContent({
        reportedUserId: 'user111',
        contentId: 'msg1',
        reason: 'fraud'
      });

      const reportWithEvidence = reportUserContent({
        reportedUserId: 'user222',
        contentId: 'msg2',
        reason: 'fraud',
        attachments: ['evidence.png', 'transcript.pdf']
      });

      const urgency1 = calculateReportUrgency(reportNoEvidence);
      const urgency2 = calculateReportUrgency(reportWithEvidence);

      expect(urgency2).toBeGreaterThan(urgency1);
    });

    it('returns urgency scale from 0-10', () => {
      const minorReport = reportUserContent({
        reportedUserId: 'user333',
        contentId: 'msg1',
        reason: 'spam'
      });

      const urgency = calculateReportUrgency(minorReport);
      expect(urgency).toBeGreaterThanOrEqual(0);
      expect(urgency).toBeLessThanOrEqual(10);
    });
  });

  describe('Report workflow scenarios', () => {
    it('handles complete report lifecycle', () => {
      // Create report
      const report = reportUserContent({
        reportedUserId: 'user_test',
        contentId: 'msg_test',
        reason: 'harassment',
        description: 'User sent threatening message'
      });

      expect(report.status).toBe('open');

      // Check status
      let status = getReportStatus(report.id);
      expect(status.status).toBe('open');

      // Resolve report
      const resolved = resolveReport(report.id, 'upheld', 'User account suspended', {
        moderatorId: 'mod001'
      });

      expect(resolved.status).toBe('upheld');

      // Verify in history
      const history = getReportHistory('user_test');
      const found = history.find(r => r.id === report.id);
      expect(found).toBeTruthy();
      expect(found.status).toBe('upheld');
    });

    it('escalates serious violations appropriately', () => {
      const childSafetyReport = reportUserContent({
        reportedUserId: 'dangerous_user',
        contentId: 'illegal_msg',
        reason: 'child_safety_violation'
      });

      const escalated = resolveReport(
        childSafetyReport.id,
        'escalated',
        'Forwarded to law enforcement',
        { escalatedTo: 'law_enforcement' }
      );

      expect(escalated.escalatedTo).toBe('law_enforcement');
    });
  });
});
