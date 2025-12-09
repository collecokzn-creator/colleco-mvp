export class ZolaEscalationManager {
  constructor() {
    this.escalations = new Map();
    this.idCounter = 1;
    this.statusHistory = new Map();
  }

  createEscalation(userId, type, description, severity) {
    const teamMap = {
      urgent: 'emergency_team',
      payment_issue: 'finance_team',
      technical: 'technical_team',
      dispute: 'dispute_resolution',
      vip_support: 'vip_team',
      complaint: 'support_team'
    };

    const slaMinutes = {
      emergency_team: 15,
      finance_team: 120,
      technical_team: 60,
      dispute_resolution: 240,
      vip_team: 30,
      support_team: 120
    };

    const assignedTeam = teamMap[type] || 'support_team';
    const escalation = {
      id: 'ESC-' + (this.idCounter++),
      userId,
      type,
      description,
      severity: severity || 'medium',
      status: 'queued',
      assignedTeam,
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + slaMinutes[assignedTeam] * 60000).toISOString(),
      assignedAgent: null,
      updates: []
    };

    this.escalations.set(escalation.id, escalation);
    return escalation;
  }

  assignEscalation(escalationId, agentId) {
    const esc = this.escalations.get(escalationId);
    if (!esc) throw new Error('Escalation not found');
    esc.assignedAgent = agentId;
    esc.status = 'assigned';
    esc.assignedAt = new Date().toISOString();
    this._recordStatusChange(escalationId, 'queued', 'assigned');
    return esc;
  }

  assignToAgent(escalationId, agentName, agentId) {
    const esc = this.escalations.get(escalationId);
    if (!esc) throw new Error('Escalation not found');
    esc.assignedAgent = { name: agentName, id: agentId };
    esc.status = 'in_progress';
    esc.assignedAt = new Date().toISOString();
    esc.updates.push({ type: 'assigned', agentName, agentId, timestamp: new Date().toISOString() });
    this._recordStatusChange(escalationId, esc.status || 'queued', 'in_progress');
    return esc;
  }

  getEscalation(escalationId) {
    return this.escalations.get(escalationId);
  }

  updateEscalation(escalationId, status, resolutionNote) {
    const esc = this.escalations.get(escalationId);
    if (!esc) throw new Error('Escalation not found');
    const previousStatus = esc.status;
    esc.status = status;
    esc.resolutionNote = resolutionNote;
    
    if (status === 'resolved') {
      esc.resolvedAt = new Date().toISOString();
      const createdAt = new Date(esc.createdAt).getTime();
      const resolvedAt = new Date(esc.resolvedAt).getTime();
      esc.resolutionTime = resolvedAt - createdAt;
    }
    
    esc.updates.push({ type: status, note: resolutionNote, timestamp: new Date().toISOString() });
    this._recordStatusChange(escalationId, previousStatus, status);
    return esc;
  }

  resolveEscalation(escalationId, resolution) {
    const esc = this.escalations.get(escalationId);
    if (!esc) throw new Error('Escalation not found');
    const previousStatus = esc.status;
    esc.status = 'resolved';
    esc.resolution = resolution;
    esc.resolvedAt = new Date().toISOString();
    this._recordStatusChange(escalationId, previousStatus, 'resolved');
    return esc;
  }

  _recordStatusChange(escalationId, fromStatus, toStatus) {
    if (!this.statusHistory.has(escalationId)) {
      this.statusHistory.set(escalationId, []);
    }
    this.statusHistory.get(escalationId).push({
      from: fromStatus,
      to: toStatus,
      timestamp: new Date().toISOString()
    });
  }

  getEscalations(filters = {}) {
    let results = Array.from(this.escalations.values());
    if (filters.userId) results = results.filter(e => e.userId === filters.userId);
    if (filters.status) results = results.filter(e => e.status === filters.status);
    if (filters.team) results = results.filter(e => e.assignedTeam === filters.team);
    return results;
  }

  getQueue() {
    return this.getQueuedEscalations('priority');
  }

  getTeamQueue(team) {
    return this.getQueuedEscalations().filter(e => e.assignedTeam === team);
  }

  checkSLA(escalationId) {
    const esc = this.escalations.get(escalationId);
    if (!esc) throw new Error('Escalation not found');
    const deadline = new Date(esc.slaDeadline).getTime();
    const now = Date.now();
    return { breached: now > deadline, timeRemaining: Math.max(0, deadline - now) };
  }

  getQueuedEscalations(sortBy = 'priority') {
    const queued = Array.from(this.escalations.values()).filter(e => e.status === 'queued');       

    if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };  // Higher number = higher priority
      const sorted = queued.sort((a, b) => {
        const aPriority = priorityOrder[a.severity] || 2;
        const bPriority = priorityOrder[b.severity] || 2;
        if (aPriority !== bPriority) return bPriority - aPriority;  // Descending priority
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      return sorted.map(e => ({ ...e, priority: priorityOrder[e.severity] || 2, waitTime: Date.now() - new Date(e.createdAt).getTime() }));
    }    if (sortBy === 'age') {
      return queued.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return queued;
  }

  getWaitTime(escalationId) {
    const esc = this.escalations.get(escalationId);
    if (!esc) throw new Error('Escalation not found');
    
    const createdAt = new Date(esc.createdAt).getTime();
    const resolvedAt = esc.resolvedAt ? new Date(esc.resolvedAt).getTime() : Date.now();
    const assignedAt = esc.assignedAt ? new Date(esc.assignedAt).getTime() : null;
    
    return {
      totalWaitTime: resolvedAt - createdAt,
      queueWaitTime: assignedAt ? assignedAt - createdAt : resolvedAt - createdAt,
      resolutionTime: assignedAt && esc.resolvedAt ? resolvedAt - assignedAt : null
    };
  }

  getStatusHistory(escalationId) {
    return this.statusHistory.get(escalationId) || [];
  }

  getSLAMetrics(team = null) {
    let escalations = Array.from(this.escalations.values());
    
    if (team) {
      escalations = escalations.filter(e => e.assignedTeam === team);
      const metrics = this._calculateMetrics(escalations);
      return metrics;
    }
    
    // Return metrics organized by team
    const byTeam = {};
    const teams = [...new Set(escalations.map(e => e.assignedTeam))];
    
    teams.forEach(t => {
      const teamEscalations = escalations.filter(e => e.assignedTeam === t);
      byTeam[t] = this._calculateMetrics(teamEscalations);
    });
    
    return byTeam;
  }
  
  _calculateMetrics(escalations) {
    const total = escalations.length;
    const resolved = escalations.filter(e => e.status === 'resolved').length;
    const breached = escalations.filter(e => {
      const deadline = new Date(e.slaDeadline).getTime();
      const completedAt = e.resolvedAt ? new Date(e.resolvedAt).getTime() : Date.now();
      return completedAt > deadline;
    }).length;

    const avgResolutionTime = escalations
      .filter(e => e.resolvedAt && e.createdAt)
      .reduce((sum, e) => {
        const created = new Date(e.createdAt).getTime();
        const resolvedTime = new Date(e.resolvedAt).getTime();
        return sum + (resolvedTime - created);
      }, 0) / (resolved || 1);

    return {
      total,
      resolved,
      breached,
      complianceRate: total > 0 ? ((total - breached) / total) * 100 : 100,
      slaComplianceRate: total > 0 ? ((total - breached) / total) * 100 : 100,
      averageResolutionTime: avgResolutionTime
    };
  }  persistEscalations() {
    // Persist to storage (stub for tests)
    return true;
  }

  getSLABreaches() {
    return Array.from(this.escalations.values()).filter(e => {
      const deadline = new Date(e.slaDeadline).getTime();
      const completedAt = e.resolvedAt ? new Date(e.resolvedAt).getTime() : Date.now();
      return completedAt > deadline;
    });
  }

  getDashboardMetrics() {
    const allEscalations = Array.from(this.escalations.values());
    const byStatus = {
      queued: allEscalations.filter(e => e.status === 'queued').length,
      assigned: allEscalations.filter(e => e.status === 'assigned').length,
      inProgress: allEscalations.filter(e => e.status === 'in_progress').length,
      resolved: allEscalations.filter(e => e.status === 'resolved').length
    };
    
    const byTeam = {};
    allEscalations.forEach(e => {
      byTeam[e.assignedTeam] = (byTeam[e.assignedTeam] || 0) + 1;
    });
    
    const bySeverity = {};
    allEscalations.forEach(e => {
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
    });

    const byType = {};
    allEscalations.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });
    
    return {
      totalEscalations: allEscalations.length,
      queued: byStatus.queued,
      assigned: byStatus.assigned,
      inProgress: byStatus.inProgress,
      resolved: byStatus.resolved,
      byStatus,
      byTeam,
      byType,
      bySeverity,
      sla: this.getSLAMetrics()
    };
  }

  getDashboardAnalytics() {
    return this.getDashboardMetrics();
  }

  generateReport(startDate, endDate, team = null) {
    let escalations = Array.from(this.escalations.values());
    
    if (startDate) {
      const start = new Date(startDate).getTime();
      escalations = escalations.filter(e => new Date(e.createdAt).getTime() >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime();
      escalations = escalations.filter(e => new Date(e.createdAt).getTime() <= end);
    }
    
    if (team) {
      escalations = escalations.filter(e => e.assignedTeam === team);
    }
    
    const resolved = escalations.filter(e => e.status === 'resolved');
    const avgResolutionTime = resolved.length > 0 
      ? resolved.reduce((sum, e) => {
          const created = new Date(e.createdAt).getTime();
          const resolvedAt = new Date(e.resolvedAt).getTime();
          return sum + (resolvedAt - created);
        }, 0) / resolved.length
      : 0;
    
    return {
      period: { startDate, endDate },
      team,
      totalEscalations: escalations.length,
      resolved: resolved.length,
      resolvedEscalations: resolved.length,
      averageResolutionTime: avgResolutionTime,
      slaCompliance: this.getSLAMetrics(team).complianceRate,
      escalations: escalations.map(e => ({
        id: e.id,
        type: e.type,
        severity: e.severity,
        status: e.status,
        createdAt: e.createdAt,
        resolvedAt: e.resolvedAt
      }))
    };
  }
}
