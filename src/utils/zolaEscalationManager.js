/**
 * Zola Escalation Manager
 * Real-time escalation tracking, team assignment, SLA management
 */

export class ZolaEscalationManager {
  constructor() {
    this.escalations = JSON.parse(localStorage.getItem('colleco.escalation.queue') || '[]');
    this.teams = {
      emergency_team: { maxWaitTime: 5, active: true },
      finance_team: { maxWaitTime: 30, active: true },
      technical_team: { maxWaitTime: 60, active: true },
      dispute_resolution: { maxWaitTime: 120, active: true },
      vip_team: { maxWaitTime: 15, active: true }
    };
    this.slaMetrics = JSON.parse(localStorage.getItem('colleco.escalation.sla') || '{}');
  }

  /**
   * Create and queue an escalation
   */
  createEscalation(userId, escalationType, reason, severity = 'medium') {
    const escalation = {
      id: `ESC-${Date.now()}`,
      userId,
      type: escalationType,
      reason,
      severity, // low, medium, high, critical
      status: 'queued',
      createdAt: new Date().toISOString(),
      assignedTeam: null,
      assignedAgent: null,
      assignedAt: null,
      resolvedAt: null,
      resolutionNote: null,
      priority: this.calculatePriority(severity, escalationType),
      slaDeadline: null,
      updates: []
    };

    // Assign team based on type
    escalation.assignedTeam = this.assignTeam(escalationType);

    // Calculate SLA deadline
    const maxWaitTime = this.teams[escalation.assignedTeam]?.maxWaitTime || 60;
    escalation.slaDeadline = new Date(Date.now() + maxWaitTime * 60000).toISOString();

    this.escalations.push(escalation);
    this.persistEscalations();

    return escalation;
  }

  /**
   * Calculate priority score
   */
  calculatePriority(severity, escalationType) {
    const severityScore = {
      low: 1,
      medium: 5,
      high: 10,
      critical: 100
    };

    const typeScore = {
      urgent: 50,
      payment_issue: 30,
      technical: 20,
      dispute: 25,
      vip_support: 15
    };

    return (severityScore[severity] || 5) + (typeScore[escalationType] || 0);
  }

  /**
   * Assign escalation to appropriate team
   */
  assignTeam(escalationType) {
    const teamMap = {
      urgent: 'emergency_team',
      payment_issue: 'finance_team',
      technical: 'technical_team',
      dispute: 'dispute_resolution',
      vip_support: 'vip_team'
    };

    return teamMap[escalationType] || 'technical_team';
  }

  /**
   * Get escalation queue sorted by priority
   */
  getQueue() {
    return this.escalations
      .filter(e => e.status === 'queued' || e.status === 'in_progress')
      .sort((a, b) => b.priority - a.priority)
      .map(e => ({
        ...e,
        waitTime: Math.round((Date.now() - new Date(e.createdAt)) / 60000),
        slaBreach: new Date(e.slaDeadline) < new Date()
      }));
  }

  /**
   * Get escalations by team
   */
  getTeamQueue(teamName) {
    return this.getQueue()
      .filter(e => e.assignedTeam === teamName)
      .slice(0, 10);
  }

  /**
   * Assign escalation to agent
   */
  assignToAgent(escalationId, agentName, agentId) {
    const escalation = this.escalations.find(e => e.id === escalationId);

    if (escalation) {
      escalation.assignedAgent = { name: agentName, id: agentId };
      escalation.assignedAt = new Date().toISOString();
      escalation.status = 'in_progress';
      escalation.updates.push({
        timestamp: new Date().toISOString(),
        action: 'assigned',
        details: `Assigned to ${agentName}`
      });

      this.persistEscalations();
    }

    return escalation;
  }

  /**
   * Update escalation status
   */
  updateEscalation(escalationId, status, note) {
    const escalation = this.escalations.find(e => e.id === escalationId);

    if (escalation) {
      escalation.status = status;
      escalation.resolutionNote = note;

      if (status === 'resolved' || status === 'closed') {
        escalation.resolvedAt = new Date().toISOString();
        escalation.resolutionTime = Math.round(
          (new Date(escalation.resolvedAt) - new Date(escalation.createdAt)) / 60000
        );
      }

      escalation.updates.push({
        timestamp: new Date().toISOString(),
        action: 'status_updated',
        details: `Status changed to ${status}`,
        note
      });

      this.persistEscalations();
      this.updateSLAMetrics(escalation);
    }

    return escalation;
  }

  /**
   * Update SLA metrics
   */
  updateSLAMetrics(escalation) {
    const teamName = escalation.assignedTeam;

    if (!this.slaMetrics[teamName]) {
      this.slaMetrics[teamName] = {
        total: 0,
        resolved: 0,
        slaMet: 0,
        slaBreach: 0,
        avgResolutionTime: 0
      };
    }

    const metrics = this.slaMetrics[teamName];
    metrics.total++;

    if (escalation.status === 'resolved' || escalation.status === 'closed') {
      metrics.resolved++;

      const isSLAMet = new Date(escalation.resolvedAt) <= new Date(escalation.slaDeadline);
      if (isSLAMet) {
        metrics.slaMet++;
      } else {
        metrics.slaBreach++;
      }

      // Update average resolution time
      metrics.avgResolutionTime = Math.round(
        (metrics.avgResolutionTime * (metrics.resolved - 1) + escalation.resolutionTime) /
          metrics.resolved
      );
    }

    localStorage.setItem('colleco.escalation.sla', JSON.stringify(this.slaMetrics));
  }

  /**
   * Get escalation details
   */
  getEscalation(escalationId) {
    return this.escalations.find(e => e.id === escalationId);
  }

  /**
   * Get all escalations for a user
   */
  getUserEscalations(userId) {
    return this.escalations.filter(e => e.userId === userId);
  }

  /**
   * Get SLA performance metrics
   */
  getSLAMetrics() {
    const metrics = {};

    Object.entries(this.slaMetrics).forEach(([team, data]) => {
      if (data.total > 0) {
        metrics[team] = {
          ...data,
          slaComplianceRate: ((data.slaMet / data.total) * 100).toFixed(1) + '%',
          avgWaitTime: data.avgResolutionTime
        };
      }
    });

    return metrics;
  }

  /**
   * Get pending escalations exceeding SLA
   */
  getSLABreaches() {
    const now = new Date();
    return this.escalations
      .filter(e => e.status !== 'resolved' && e.status !== 'closed')
      .filter(e => new Date(e.slaDeadline) < now)
      .map(e => ({
        ...e,
        breachTime: Math.round((now - new Date(e.slaDeadline)) / 60000),
        escalationLevel: this.calculateEscalationLevel(e)
      }));
  }

  /**
   * Calculate escalation level for SLA breaches
   */
  calculateEscalationLevel(escalation) {
    const breachTime = Math.round((Date.now() - new Date(escalation.slaDeadline)) / 60000);

    if (breachTime > 120) return 'critical';
    if (breachTime > 60) return 'high';
    if (breachTime > 30) return 'medium';
    return 'low';
  }

  /**
   * Auto-escalate to supervisor
   */
  escalateToSupervisor(escalationId, reason) {
    const escalation = this.getEscalation(escalationId);

    if (escalation) {
      escalation.updates.push({
        timestamp: new Date().toISOString(),
        action: 'supervisor_escalation',
        details: reason
      });

      escalation.escalationLevel = 'supervisor';
      this.persistEscalations();
    }

    return escalation;
  }

  /**
   * Get dashboard analytics
   */
  getDashboardAnalytics() {
    const all = this.escalations;
    const queued = all.filter(e => e.status === 'queued').length;
    const inProgress = all.filter(e => e.status === 'in_progress').length;
    const resolved = all.filter(e => e.status === 'resolved').length;
    const breaches = this.getSLABreaches().length;

    const avgResolutionTime = all
      .filter(e => e.resolutionTime)
      .reduce((acc, e) => acc + e.resolutionTime, 0) / all.filter(e => e.resolutionTime).length || 0;

    return {
      totalEscalations: all.length,
      queued,
      inProgress,
      resolved,
      slaBreaches: breaches,
      avgResolutionTime: Math.round(avgResolutionTime),
      resolutionRate: ((resolved / all.length) * 100).toFixed(1) + '%',
      slaComplianceRate: (((resolved - breaches) / resolved) * 100).toFixed(1) + '%',
      byType: this.groupByType(),
      byTeam: this.groupByTeam(),
      byStatus: this.groupByStatus()
    };
  }

  /**
   * Group escalations by type
   */
  groupByType() {
    const groups = {};

    this.escalations.forEach(e => {
      groups[e.type] = (groups[e.type] || 0) + 1;
    });

    return groups;
  }

  /**
   * Group escalations by team
   */
  groupByTeam() {
    const groups = {};

    this.escalations.forEach(e => {
      groups[e.assignedTeam] = (groups[e.assignedTeam] || 0) + 1;
    });

    return groups;
  }

  /**
   * Group escalations by status
   */
  groupByStatus() {
    const groups = {};

    this.escalations.forEach(e => {
      groups[e.status] = (groups[e.status] || 0) + 1;
    });

    return groups;
  }

  /**
   * Persist escalations to localStorage
   */
  persistEscalations() {
    localStorage.setItem('colleco.escalation.queue', JSON.stringify(this.escalations));
  }

  /**
   * Clear resolved escalations (older than 7 days)
   */
  archiveOldEscalations() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const toArchive = this.escalations.filter(
      e => e.status === 'resolved' && new Date(e.resolvedAt) < sevenDaysAgo
    );

    const archived = JSON.parse(localStorage.getItem('colleco.escalation.archive') || '[]');
    archived.push(...toArchive);

    localStorage.setItem('colleco.escalation.archive', JSON.stringify(archived));

    this.escalations = this.escalations.filter(e => !toArchive.includes(e));
    this.persistEscalations();

    return toArchive.length;
  }

  /**
   * Generate escalation report
   */
  generateReport(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = this.escalations.filter(e => {
      const created = new Date(e.createdAt);
      return created >= start && created <= end;
    });

    return {
      period: { from: startDate, to: endDate },
      totalEscalations: filtered.length,
      resolved: filtered.filter(e => e.status === 'resolved').length,
      unresolved: filtered.filter(e => e.status !== 'resolved').length,
      avgResolutionTime: Math.round(
        filtered
          .filter(e => e.resolutionTime)
          .reduce((acc, e) => acc + e.resolutionTime, 0) / filtered.filter(e => e.resolutionTime).length
      ),
      slaCompliance: this.getSLAMetrics(),
      topEscalationReasons: this.getTopReasons(filtered),
      topTeams: this.getTopTeamsByVolume(filtered)
    };
  }

  /**
   * Get top escalation reasons
   */
  getTopReasons(escalations) {
    const reasons = {};

    escalations.forEach(e => {
      reasons[e.reason] = (reasons[e.reason] || 0) + 1;
    });

    return Object.entries(reasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));
  }

  /**
   * Get top teams by volume
   */
  getTopTeamsByVolume(escalations) {
    const teams = {};

    escalations.forEach(e => {
      teams[e.assignedTeam] = (teams[e.assignedTeam] || 0) + 1;
    });

    return Object.entries(teams)
      .sort((a, b) => b[1] - a[1])
      .map(([team, count]) => ({ team, count }));
  }
}

export default ZolaEscalationManager;
