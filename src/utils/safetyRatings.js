/**
 * Safety Ratings System
 * Tracks incident history, safety ratings, automated alerts
 */

// Safety rating levels
export const SAFETY_RATING_LEVELS = {
  EXCELLENT: 'excellent', // 5.0
  GOOD: 'good', // 4.0-4.9
  FAIR: 'fair', // 3.0-3.9
  POOR: 'poor', // 2.0-2.9
  CRITICAL: 'critical' // < 2.0
};

// Incident types
export const INCIDENT_TYPES = {
  PROPERTY_DAMAGE: 'property_damage',
  CLEANLINESS_ISSUE: 'cleanliness_issue',
  SAFETY_HAZARD: 'safety_hazard',
  THEFT: 'theft',
  HARASSMENT: 'harassment',
  MISCOMMUNICATION: 'miscommunication',
  SERVICE_FAILURE: 'service_failure',
  OVERCHARGING: 'overcharging'
};

// Incident severity
export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Initialize safety rating for partner/property
export function initializeSafetyRating(partnerId, propertyId, propertyType) {
  const safety_rating = {
    partnerId,
    propertyId,
    propertyType,
    overall_rating: 5.0,
    incident_score: 0, // Lower is better
    ratings_count: 0,
    incidents: [],
    alerts: [],
    last_incident_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(
    `colleco.safety_rating.${propertyId}`,
    JSON.stringify(safety_rating)
  );

  return safety_rating;
}

// Get safety rating
export function getSafetyRating(propertyId) {
  const data = localStorage.getItem(`colleco.safety_rating.${propertyId}`);
  
  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

// Report incident
export function reportIncident(propertyId, incidentData) {
  let safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return { success: false, error: 'Safety rating record not found' };
  }

  const incident = {
    id: `incident_${Date.now()}`,
    type: incidentData.type,
    severity: incidentData.severity,
    description: incidentData.description,
    reported_by: incidentData.reported_by, // 'traveler' or 'partner'
    reported_at: new Date().toISOString(),
    resolved: false,
    resolved_at: null,
    resolution_notes: ''
  };

  // Validate incident
  if (!Object.values(INCIDENT_TYPES).includes(incident.type)) {
    return { success: false, error: 'Invalid incident type' };
  }

  if (!Object.values(INCIDENT_SEVERITY).includes(incident.severity)) {
    return { success: false, error: 'Invalid incident severity' };
  }

  safety_rating.incidents.push(incident);
  safety_rating.last_incident_date = new Date().toISOString();
  safety_rating.updated_at = new Date().toISOString();

  // Update safety scores
  updateSafetyScores(safety_rating);

  // Check for alerts
  const alerts = checkSafetyAlerts(safety_rating);
  if (alerts.length > 0) {
    safety_rating.alerts.push(...alerts);
  }

  updateSafetyRating(propertyId, safety_rating);

  return {
    success: true,
    incident: incident,
    overall_rating: safety_rating.overall_rating,
    incident_score: safety_rating.incident_score
  };
}

// Resolve incident
export function resolveIncident(propertyId, incidentId, resolutionNotes = '') {
  const safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return { success: false, error: 'Safety rating record not found' };
  }

  const incident = safety_rating.incidents.find(i => i.id === incidentId);
  if (!incident) {
    return { success: false, error: 'Incident not found' };
  }

  incident.resolved = true;
  incident.resolved_at = new Date().toISOString();
  incident.resolution_notes = resolutionNotes;

  safety_rating.updated_at = new Date().toISOString();

  // Recalculate scores
  updateSafetyScores(safety_rating);

  updateSafetyRating(propertyId, safety_rating);

  return {
    success: true,
    incident_resolved: true,
    overall_rating: safety_rating.overall_rating
  };
}

// Update safety scores
function updateSafetyScores(safety_rating) {
  // Calculate incident score (0-100, higher is worse)
  let incident_score = 0;
  
  safety_rating.incidents.forEach(incident => {
    if (!incident.resolved) {
      const severity_weight = {
        low: 5,
        medium: 15,
        high: 25,
        critical: 40
      };
      
      incident_score += severity_weight[incident.severity] || 0;
    }
  });

  // Add decay for historical incidents (older incidents count less)
  const now = new Date().getTime();
  safety_rating.incidents.forEach(incident => {
    const incident_age_days = (now - new Date(incident.reported_at).getTime()) / (1000 * 60 * 60 * 24);
    const decay_factor = Math.max(0.1, 1 - (incident_age_days / 365)); // Decay over 1 year
    
    if (incident.resolved) {
      const severity_weight = {
        low: 2,
        medium: 5,
        high: 10,
        critical: 20
      };
      
      incident_score += (severity_weight[incident.severity] || 0) * decay_factor;
    }
  });

  // Cap incident score at 100
  incident_score = Math.min(incident_score, 100);
  safety_rating.incident_score = incident_score;

  // Calculate overall rating (5.0 - (incident_score / 20))
  safety_rating.overall_rating = Math.max(1.0, 5.0 - (incident_score / 20));

  return safety_rating;
}

// Check for safety alerts
function checkSafetyAlerts(safety_rating) {
  const alerts = [];

  // Alert: Multiple incidents in short time
  const recent_incidents = safety_rating.incidents.filter(i => {
    const age = (new Date() - new Date(i.reported_at)) / (1000 * 60 * 60 * 24);
    return age < 30; // Last 30 days
  });

  if (recent_incidents.length >= 3) {
    alerts.push({
      type: 'multiple_incidents',
      severity: 'high',
      message: `${recent_incidents.length} incidents reported in last 30 days`,
      created_at: new Date().toISOString()
    });
  }

  // Alert: Critical incident
  const critical_incidents = safety_rating.incidents.filter(i =>
    i.severity === INCIDENT_SEVERITY.CRITICAL && !i.resolved
  );

  if (critical_incidents.length > 0) {
    alerts.push({
      type: 'critical_incident',
      severity: 'critical',
      message: `${critical_incidents.length} unresolved critical incidents`,
      created_at: new Date().toISOString()
    });
  }

  // Alert: Low safety rating
  if (safety_rating.overall_rating < 2.0) {
    alerts.push({
      type: 'low_safety_rating',
      severity: 'critical',
      message: `Safety rating dropped to ${safety_rating.overall_rating.toFixed(1)}`,
      created_at: new Date().toISOString()
    });
  }

  return alerts;
}

// Get unresolved incidents
export function getUnresolvedIncidents(propertyId) {
  const safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return [];
  }

  return safety_rating.incidents.filter(i => !i.resolved);
}

// Get incident history
export function getIncidentHistory(propertyId, days = 365) {
  const safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return [];
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return safety_rating.incidents.filter(i =>
    new Date(i.reported_at) > cutoff
  ).sort((a, b) =>
    new Date(b.reported_at) - new Date(a.reported_at)
  );
}

// Get incidents by type
export function getIncidentsByType(propertyId) {
  const safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return {};
  }

  const by_type = {};
  
  safety_rating.incidents.forEach(incident => {
    by_type[incident.type] = (by_type[incident.type] || 0) + 1;
  });

  return by_type;
}

// Get safety level based on rating
export function getSafetyLevel(overallRating) {
  if (overallRating >= 4.5) return SAFETY_RATING_LEVELS.EXCELLENT;
  if (overallRating >= 4.0) return SAFETY_RATING_LEVELS.GOOD;
  if (overallRating >= 3.0) return SAFETY_RATING_LEVELS.FAIR;
  if (overallRating >= 2.0) return SAFETY_RATING_LEVELS.POOR;
  return SAFETY_RATING_LEVELS.CRITICAL;
}

// Flag property for review
export function flagPropertyForSafetyReview(propertyId, reason) {
  const safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return { success: false, error: 'Safety rating record not found' };
  }

  safety_rating.alerts.push({
    type: 'manual_review_flag',
    severity: 'high',
    message: reason,
    created_at: new Date().toISOString()
  });

  updateSafetyRating(propertyId, safety_rating);

  return {
    success: true,
    property_flagged: true
  };
}

// Get active alerts
export function getActiveAlerts(propertyId) {
  const safety_rating = getSafetyRating(propertyId);
  
  if (!safety_rating) {
    return [];
  }

  // Return alerts from last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  return safety_rating.alerts.filter(a =>
    new Date(a.created_at) > cutoff
  );
}

// Get safety stats for partner
export function getPartnerSafetyStats(partnerId) {
  const stats = {
    properties_count: 0,
    avg_safety_rating: 0,
    critical_properties: 0,
    total_incidents: 0,
    unresolved_incidents: 0
  };

  let total_rating = 0;
  let properties_with_rating = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('colleco.safety_rating.')) {
      const safety_rating = JSON.parse(localStorage.getItem(key));
      
      if (safety_rating.partnerId === partnerId) {
        stats.properties_count++;
        total_rating += safety_rating.overall_rating;
        properties_with_rating++;

        if (safety_rating.overall_rating < 2.0) {
          stats.critical_properties++;
        }

        stats.total_incidents += safety_rating.incidents.length;
        stats.unresolved_incidents += safety_rating.incidents.filter(i => !i.resolved).length;
      }
    }
  }

  if (properties_with_rating > 0) {
    stats.avg_safety_rating = (total_rating / properties_with_rating).toFixed(1);
  }

  return stats;
}

// Update safety rating
function updateSafetyRating(propertyId, safety_rating) {
  safety_rating.updated_at = new Date().toISOString();
  localStorage.setItem(
    `colleco.safety_rating.${propertyId}`,
    JSON.stringify(safety_rating)
  );
}
