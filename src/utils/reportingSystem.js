const VALID_REASONS = ['hate_speech', 'harassment', 'spam', 'fraud', 'illegal_activity', 'child_safety_violation', 'violence', 'misinformation'];
const SEVERITY_MAP = { child_safety_violation: 10, illegal_activity: 9, violence: 8, fraud: 7, harassment: 6, hate_speech: 5, misinformation: 3, spam: 2 };
const reports = new Map();
let reportIdCounter = 1;

function reportUserContent(data) {
  const { reporterId, reportedUserId, contentId, reason, description, contentPreview, attachments = [] } = data;
  if (!VALID_REASONS.includes(reason)) throw new Error('Invalid reason: ' + reason);
  // Check for duplicate reports
  for (const ex of reports.values()) {
    if (ex.contentId === contentId && ex.reason === reason) {
      // If both have reporterId, only prevent if same reporter
      // If either lacks reporterId, always prevent duplicate  
      if (!reporterId || !ex.reporterId || ex.reporterId === reporterId) {
        throw new Error('Duplicate report for same content');
      }
    }
  }
  const priority = SEVERITY_MAP[reason] || 1;
  const now = new Date().toISOString();
  const report = {
    id: 'RPT-' + (reportIdCounter++), reporterId, reportedUserId, contentId, reason, description,
    contentPreview: contentPreview ? contentPreview.substring(0, 500) : undefined, attachments,
    status: 'open', priority, createdAt: now, updatedAt: now,
    statusHistory: [{ status: 'open', timestamp: now }],
    publicReport: { reason, status: 'open', createdAt: now }
  };
  reports.set(report.id, report);
  return report;
}

function getReportStatus(reportId) {
  return reports.get(reportId);
}

function resolveReport(reportId, status, resolution, metadata = {}) {
  const report = reports.get(reportId);
  if (!report) throw new Error('Report not found');
  const now = new Date().toISOString();
  report.status = status;
  report.resolution = resolution;
  report.updatedAt = now;
  if (!report.statusHistory) report.statusHistory = [];
  report.statusHistory.push({ status, timestamp: now, resolution });
  if (metadata.moderatorId) report.moderatorId = metadata.moderatorId;
  if (metadata.policyViolated) report.policyViolated = metadata.policyViolated;
  if (metadata.escalatedTo) report.escalatedTo = metadata.escalatedTo;
  return report;
}

function getReportHistory(userId, filters = {}) {
  const { reason, status, startDate, endDate } = filters;
  let filtered = Array.from(reports.values()).filter(r => r.reportedUserId === userId);
  if (reason) filtered = filtered.filter(r => r.reason === reason);
  if (status) filtered = filtered.filter(r => r.status === status);
  if (startDate && endDate) filtered = filtered.filter(r => new Date(r.createdAt) >= startDate && new Date(r.createdAt) <= endDate);
  return filtered;
}

function calculateReportUrgency(report) {
  let urgency = SEVERITY_MAP[report.reason] || 1;
  if (report.attachments && report.attachments.length > 0) urgency += 2;
  const history = getReportHistory(report.reportedUserId);
  if (history.length > 1) urgency += Math.min(history.length - 1, 3);
  return Math.min(urgency, 10);
}

function clearReports() {
  reports.clear();
  reportIdCounter = 1;
}

module.exports = { reportUserContent, getReportStatus, resolveReport, getReportHistory, calculateReportUrgency, createReport: reportUserContent, clearReports };
