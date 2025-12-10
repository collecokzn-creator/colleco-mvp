/**
 * Dispute Resolution System
 * Handles complaint intake, evidence collection, mediation, escalation, tracking
 */

// Dispute status
export const DISPUTE_STATUS = {
  OPENED: 'opened',
  UNDER_INVESTIGATION: 'under_investigation',
  NEGOTIATION: 'negotiation',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
  ARBITRATION: 'arbitration'
};

// Dispute categories
export const DISPUTE_CATEGORIES = {
  CANCELLATION: 'cancellation',
  REFUND: 'refund',
  PROPERTY_CONDITION: 'property_condition',
  HOST_BEHAVIOR: 'host_behavior',
  GUEST_BEHAVIOR: 'guest_behavior',
  SAFETY_ISSUE: 'safety_issue',
  BILLING_ERROR: 'billing_error',
  MISCOMMUNICATION: 'miscommunication'
};

// Resolution types
export const RESOLUTION_TYPES = {
  REFUND: 'refund',
  REBOOK: 'rebook',
  CREDIT: 'credit',
  CANCELLED: 'cancelled',
  SPLIT_SETTLEMENT: 'split_settlement',
  NO_ACTION: 'no_action'
};

// Create dispute
export function createDispute(disputeData) {
  const dispute = {
    id: `dispute_${Date.now()}`,
    complainant_id: disputeData.complainant_id,
    respondent_id: disputeData.respondent_id,
    booking_id: disputeData.booking_id,
    category: disputeData.category,
    status: DISPUTE_STATUS.OPENED,
    title: disputeData.title,
    description: disputeData.description,
    amount_at_stake: disputeData.amount_at_stake || 0,
    evidence: [],
    timeline: [{
      status: DISPUTE_STATUS.OPENED,
      timestamp: new Date().toISOString(),
      note: 'Dispute opened'
    }],
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    resolution: null,
    resolution_at: null,
    resolution_type: null,
    notes: []
  };

  // Validate dispute
  if (!Object.values(DISPUTE_CATEGORIES).includes(dispute.category)) {
    return { success: false, error: 'Invalid dispute category' };
  }

  localStorage.setItem(
    `colleco.dispute.${dispute.id}`,
    JSON.stringify(dispute)
  );

  return {
    success: true,
    dispute_id: dispute.id,
    status: DISPUTE_STATUS.OPENED
  };
}

// Get dispute
export function getDispute(disputeId) {
  const data = localStorage.getItem(`colleco.dispute.${disputeId}`);
  return data ? JSON.parse(data) : null;
}

// Submit evidence
export function submitEvidence(disputeId, evidenceData, submittedBy) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  const evidence = {
    id: `evidence_${Date.now()}`,
    type: evidenceData.type, // 'document', 'message', 'photo', 'receipt'
    file_url: evidenceData.file_url,
    description: evidenceData.description,
    submitted_by: submittedBy,
    submitted_at: new Date().toISOString(),
    verified: false
  };

  dispute.evidence.push(evidence);
  dispute.updated_at = new Date().toISOString();

  // Auto-escalate to investigation if enough evidence
  if (dispute.evidence.length >= 2 && dispute.status === DISPUTE_STATUS.OPENED) {
    dispute.status = DISPUTE_STATUS.UNDER_INVESTIGATION;
    dispute.timeline.push({
      status: DISPUTE_STATUS.UNDER_INVESTIGATION,
      timestamp: new Date().toISOString(),
      note: 'Sufficient evidence received, investigation started'
    });
  }

  updateDispute(disputeId, dispute);

  return {
    success: true,
    evidence_id: evidence.id,
    dispute_status: dispute.status
  };
}

// Request response from respondent
export function requestResponse(disputeId) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  if (dispute.status === DISPUTE_STATUS.OPENED) {
    dispute.status = DISPUTE_STATUS.UNDER_INVESTIGATION;
    dispute.timeline.push({
      status: DISPUTE_STATUS.UNDER_INVESTIGATION,
      timestamp: new Date().toISOString(),
      note: 'Response requested from respondent'
    });
  }

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  return {
    success: true,
    dispute_status: DISPUTE_STATUS.UNDER_INVESTIGATION
  };
}

// Add internal note
export function addDisputeNote(disputeId, note, addedBy) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  dispute.notes.push({
    text: note,
    added_by: addedBy,
    timestamp: new Date().toISOString()
  });

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  return { success: true };
}

// Assign to mediator
export function assignToMediator(disputeId, mediatorId) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  dispute.assigned_to = mediatorId;
  dispute.status = DISPUTE_STATUS.NEGOTIATION;
  dispute.timeline.push({
    status: DISPUTE_STATUS.NEGOTIATION,
    timestamp: new Date().toISOString(),
    note: `Assigned to mediator ${mediatorId}`
  });

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  return {
    success: true,
    dispute_status: DISPUTE_STATUS.NEGOTIATION
  };
}

// Propose resolution
export function proposeResolution(disputeId, resolutionData, proposedBy) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  dispute.resolution = {
    type: resolutionData.type,
    refund_amount: resolutionData.refund_amount || 0,
    credit_amount: resolutionData.credit_amount || 0,
    rebook_date: resolutionData.rebook_date || null,
    description: resolutionData.description,
    proposed_by: proposedBy,
    proposed_at: new Date().toISOString(),
    accepted_by: null,
    accepted_at: null
  };

  dispute.status = DISPUTE_STATUS.NEGOTIATION;
  dispute.timeline.push({
    status: DISPUTE_STATUS.NEGOTIATION,
    timestamp: new Date().toISOString(),
    note: `Resolution proposed: ${resolutionData.type}`
  });

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  return {
    success: true,
    resolution: dispute.resolution
  };
}

// Accept resolution
export function acceptResolution(disputeId, acceptedBy) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  if (!dispute.resolution) {
    return { success: false, error: 'No resolution to accept' };
  }

  dispute.resolution.accepted_by = acceptedBy;
  dispute.resolution.accepted_at = new Date().toISOString();
  dispute.status = DISPUTE_STATUS.RESOLVED;
  dispute.resolution_type = dispute.resolution.type;
  dispute.resolution_at = new Date().toISOString();

  dispute.timeline.push({
    status: DISPUTE_STATUS.RESOLVED,
    timestamp: new Date().toISOString(),
    note: `Resolution accepted by ${acceptedBy}`
  });

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  // Process resolution
  processResolution(dispute);

  return {
    success: true,
    dispute_status: DISPUTE_STATUS.RESOLVED
  };
}

// Escalate to arbitration
export function escalateToArbitration(disputeId, reason) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  dispute.status = DISPUTE_STATUS.ESCALATED;
  dispute.timeline.push({
    status: DISPUTE_STATUS.ESCALATED,
    timestamp: new Date().toISOString(),
    note: `Escalated to arbitration: ${reason}`
  });

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  return {
    success: true,
    dispute_status: DISPUTE_STATUS.ESCALATED
  };
}

// Cancel dispute
export function cancelDispute(disputeId, reason, cancelledBy) {
  const dispute = getDispute(disputeId);
  
  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  dispute.status = DISPUTE_STATUS.CANCELLED;
  dispute.timeline.push({
    status: DISPUTE_STATUS.CANCELLED,
    timestamp: new Date().toISOString(),
    note: `Cancelled by ${cancelledBy}: ${reason}`
  });

  dispute.updated_at = new Date().toISOString();
  updateDispute(disputeId, dispute);

  return {
    success: true,
    dispute_status: DISPUTE_STATUS.CANCELLED
  };
}

// Get disputes for user
export function getUserDisputes(userId, role = 'any') {
  const disputes = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.dispute.')) {
      const dispute = JSON.parse(localStorage.getItem(key));
      
      if (role === 'any') {
        if (dispute.complainant_id === userId || dispute.respondent_id === userId) {
          disputes.push(dispute);
        }
      } else if (role === 'complainant' && dispute.complainant_id === userId) {
        disputes.push(dispute);
      } else if (role === 'respondent' && dispute.respondent_id === userId) {
        disputes.push(dispute);
      }
    }
  }

  return disputes.sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );
}

// Get disputes by status
export function getDisputesByStatus(status) {
  const disputes = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.dispute.')) {
      const dispute = JSON.parse(localStorage.getItem(key));
      
      if (dispute.status === status) {
        disputes.push(dispute);
      }
    }
  }

  return disputes;
}

// Get dispute stats
export function getDisputeStats() {
  const stats = {
    total: 0,
    opened: 0,
    under_investigation: 0,
    negotiation: 0,
    escalated: 0,
    resolved: 0,
    cancelled: 0,
    avg_resolution_time_days: 0,
    resolution_rate: 0
  };

  const all_disputes = [];
  let total_resolution_time = 0;
  let resolved_count = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.dispute.')) {
      const dispute = JSON.parse(localStorage.getItem(key));
      all_disputes.push(dispute);
      stats.total++;

      switch (dispute.status) {
        case DISPUTE_STATUS.OPENED:
          stats.opened++;
          break;
        case DISPUTE_STATUS.UNDER_INVESTIGATION:
          stats.under_investigation++;
          break;
        case DISPUTE_STATUS.NEGOTIATION:
          stats.negotiation++;
          break;
        case DISPUTE_STATUS.ESCALATED:
          stats.escalated++;
          break;
        case DISPUTE_STATUS.RESOLVED:
          stats.resolved++;
          resolved_count++;
          
          if (dispute.resolution_at) {
            const resolution_time = new Date(dispute.resolution_at) - new Date(dispute.created_at);
            total_resolution_time += resolution_time / (1000 * 60 * 60 * 24); // Convert to days
          }
          break;
        case DISPUTE_STATUS.CANCELLED:
          stats.cancelled++;
          break;
      }
    }
  }

  if (resolved_count > 0) {
    stats.avg_resolution_time_days = Math.round(total_resolution_time / resolved_count);
  }

  if (stats.total > 0) {
    stats.resolution_rate = Math.round((stats.resolved / stats.total) * 100);
  }

  return stats;
}

// Process resolution (execute refund, credit, etc.)
function processResolution(dispute) {
  if (!dispute.resolution) {
    return;
  }

  const resolution = dispute.resolution;

  switch (resolution.type) {
    case RESOLUTION_TYPES.REFUND:
      // Process refund
      processRefund(dispute.complainant_id, resolution.refund_amount);
      break;

    case RESOLUTION_TYPES.CREDIT:
      // Add credit to account
      addAccountCredit(dispute.complainant_id, resolution.credit_amount);
      break;

    case RESOLUTION_TYPES.REBOOK:
      // Schedule rebook
      scheduleRebook(dispute.complainant_id, resolution.rebook_date);
      break;

    case RESOLUTION_TYPES.SPLIT_SETTLEMENT:
      // Split settlement
      processRefund(dispute.complainant_id, resolution.refund_amount);
      addAccountCredit(dispute.respondent_id, resolution.credit_amount);
      break;
  }
}

// Helper functions
function updateDispute(disputeId, dispute) {
  dispute.updated_at = new Date().toISOString();
  localStorage.setItem(
    `colleco.dispute.${disputeId}`,
    JSON.stringify(dispute)
  );
}

function processRefund(userId, amount) {
  // Would integrate with payment processor
  /* eslint-disable-next-line no-console */
  console.log(`Processing refund of ${amount} to user ${userId}`);
}

function addAccountCredit(userId, amount) {
  // Would add credit to user account
  /* eslint-disable-next-line no-console */
  console.log(`Adding ${amount} credit to user ${userId}`);
}

function scheduleRebook(userId, rebookDate) {
  // Would schedule rebook for user
  /* eslint-disable-next-line no-console */
  console.log(`Scheduling rebook for user ${userId} on ${rebookDate}`);
}
