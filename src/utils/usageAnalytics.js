/**
 * App Usage Analytics System
 * 
 * Tracks: feature usage, user sessions, time spent, user journey, conversions
 * Provides: real-time metrics, trends, user segments, feature adoption
 */

const SESSIONS_KEY = 'colleco.usage.sessions';
const EVENTS_KEY = 'colleco.usage.events';
const FEATURES_KEY = 'colleco.usage.features';
const MAX_RECORDS = 10000;

let currentSession = null;
let sessionStartTime = null;

/**
 * Initialize new session
 */
export function startSession(userId = 'anonymous') {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  currentSession = {
    id: sessionId,
    userId,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    pageViews: 0,
    featureInteractions: [],
    events: [],
    source: document.referrer || 'direct'
  };
  
  sessionStartTime = Date.now();
  
  // Store session
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  sessions.push(currentSession);
  if (sessions.length > MAX_RECORDS) sessions.shift();
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  
  return currentSession;
}

/**
 * End current session
 */
export function endSession() {
  if (!currentSession) return null;
  
  const duration = Date.now() - sessionStartTime;
  currentSession.endTime = new Date().toISOString();
  currentSession.duration = duration;
  
  // Update session
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  const index = sessions.findIndex(s => s.id === currentSession.id);
  if (index >= 0) {
    sessions[index] = currentSession;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
  
  const ended = currentSession;
  currentSession = null;
  sessionStartTime = null;
  
  return ended;
}

/**
 * Track page view
 */
export function trackPageView(pageName, metadata = {}) {
  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    sessionId: currentSession?.id || 'no-session',
    type: 'pageview',
    page: pageName,
    metadata,
    duration: 0
  };
  
  // Store event
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  events.push(event);
  if (events.length > MAX_RECORDS) events.shift();
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  
  // Update session
  if (currentSession) {
    currentSession.pageViews++;
  }
  
  return event;
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName, action = 'view', metadata = {}) {
  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    sessionId: currentSession?.id || 'no-session',
    type: 'feature',
    feature: featureName,
    action, // 'view', 'click', 'submit', 'complete', 'error'
    metadata
  };
  
  // Store event
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  events.push(event);
  if (events.length > MAX_RECORDS) events.shift();
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  
  // Track feature usage stats
  const features = JSON.parse(localStorage.getItem(FEATURES_KEY) || '{}');
  if (!features[featureName]) {
    features[featureName] = {
      name: featureName,
      views: 0,
      clicks: 0,
      submissions: 0,
      completions: 0,
      errors: 0,
      lastUsed: null,
      firstUsed: new Date().toISOString()
    };
  }
  
  features[featureName][action + 's'] = (features[featureName][action + 's'] || 0) + 1;
  features[featureName].lastUsed = new Date().toISOString();
  
  localStorage.setItem(FEATURES_KEY, JSON.stringify(features));
  
  // Update session
  if (currentSession) {
    currentSession.featureInteractions.push({
      feature: featureName,
      action,
      timestamp: event.timestamp
    });
  }
  
  return event;
}

/**
 * Track user conversion
 */
export function trackConversion(conversionType, value = 1, metadata = {}) {
  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    sessionId: currentSession?.id || 'no-session',
    type: 'conversion',
    conversionType,
    value,
    metadata
  };
  
  // Store event
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  events.push(event);
  if (events.length > MAX_RECORDS) events.shift();
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  
  return event;
}

/**
 * Track user action (custom event)
 */
export function trackAction(actionName, metadata = {}) {
  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    sessionId: currentSession?.id || 'no-session',
    type: 'action',
    action: actionName,
    metadata
  };
  
  // Store event
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  events.push(event);
  if (events.length > MAX_RECORDS) events.shift();
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  
  return event;
}

/**
 * Get usage statistics
 */
export function getUsageStats(timeRange = 'all') {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  const features = JSON.parse(localStorage.getItem(FEATURES_KEY) || '{}');
  
  let filteredSessions = sessions;
  let filteredEvents = events;
  
  // Apply time range filter
  if (timeRange !== 'all') {
    const now = Date.now();
    let cutoff = 0;
    
    switch (timeRange) {
      case '24h': cutoff = now - (24 * 60 * 60 * 1000); break;
      case '7d': cutoff = now - (7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoff = now - (30 * 24 * 60 * 60 * 1000); break;
      case '90d': cutoff = now - (90 * 24 * 60 * 60 * 1000); break;
    }
    
    filteredSessions = sessions.filter(s => new Date(s.startTime).getTime() > cutoff);
    filteredEvents = events.filter(e => new Date(e.timestamp).getTime() > cutoff);
  }
  
  // Calculate stats
  const totalSessions = filteredSessions.length;
  const avgSessionDuration = totalSessions > 0 
    ? filteredSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions 
    : 0;
  
  const totalPageViews = filteredEvents.filter(e => e.type === 'pageview').length;
  const avgPageViewsPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;
  
  const totalConversions = filteredEvents.filter(e => e.type === 'conversion').length;
  const conversionRate = totalSessions > 0 ? totalConversions / totalSessions : 0;
  
  const uniqueUsers = new Set(filteredSessions.map(s => s.userId)).size;
  
  // Feature adoption
  const featureStats = Object.entries(features).map(([name, stats]) => ({
    name,
    ...stats,
    adoptionRate: totalSessions > 0 ? stats.views / totalSessions : 0
  }));
  
  return {
    totalSessions,
    totalPageViews,
    totalConversions,
    avgSessionDuration,
    avgPageViewsPerSession,
    conversionRate,
    uniqueUsers,
    featureStats,
    timeRange
  };
}

/**
 * Get feature adoption metrics
 */
export function getFeatureAdoption(timeRange = 'all') {
  const stats = getUsageStats(timeRange);
  
  const adoption = stats.featureStats
    .sort((a, b) => b.adoptionRate - a.adoptionRate)
    .map(f => ({
      feature: f.name,
      views: f.views,
      adoptionRate: (f.adoptionRate * 100).toFixed(2) + '%',
      lastUsed: f.lastUsed,
      firstUsed: f.firstUsed
    }));
  
  return adoption;
}

/**
 * Get user journey (page flow)
 */
export function getUserJourney(sessionId) {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  
  const journey = events
    .filter(e => e.sessionId === sessionId && e.type === 'pageview')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(e => ({
      page: e.page,
      timestamp: e.timestamp,
      metadata: e.metadata
    }));
  
  return journey;
}

/**
 * Get conversion funnel
 */
export function getConversionFunnel() {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  
  const conversions = {};
  events
    .filter(e => e.type === 'conversion')
    .forEach(e => {
      const type = e.conversionType;
      conversions[type] = (conversions[type] || 0) + 1;
    });
  
  return Object.entries(conversions)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ conversionType: type, count }));
}

/**
 * Get top pages
 */
export function getTopPages(limit = 10) {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  
  const pages = {};
  events
    .filter(e => e.type === 'pageview')
    .forEach(e => {
      pages[e.page] = (pages[e.page] || 0) + 1;
    });
  
  return Object.entries(pages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([page, views]) => ({ page, views }));
}

/**
 * Get bounce rate
 */
export function getBounceRate() {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  
  if (sessions.length === 0) return 0;
  
  const bounced = sessions.filter(s => s.pageViews <= 1).length;
  return (bounced / sessions.length) * 100;
}

/**
 * Get average session duration
 */
export function getAverageSessionDuration() {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  
  if (sessions.length === 0) return 0;
  
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  return totalDuration / sessions.length;
}

/**
 * Get peak usage times
 */
export function getPeakUsageTimes() {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  
  const hourly = {};
  events.forEach(e => {
    const date = new Date(e.timestamp);
    const hour = date.getHours();
    hourly[hour] = (hourly[hour] || 0) + 1;
  });
  
  return Object.entries(hourly)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get user retention rate
 */
export function getRetentionRate(days = 7) {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  
  if (sessions.length === 0) return 0;
  
  const userLastSeen = {};
  sessions.forEach(s => {
    const date = new Date(s.startTime).toDateString();
    if (!userLastSeen[s.userId] || userLastSeen[s.userId] < date) {
      userLastSeen[s.userId] = date;
    }
  });
  
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toDateString();
  
  const retained = Object.values(userLastSeen).filter(date => date >= cutoff).length;
  return (retained / Object.keys(userLastSeen).length) * 100;
}

/**
 * Export usage data as CSV
 */
export function exportUsageAsCSV() {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  
  if (events.length === 0) return '';
  
  const headers = ['ID', 'Timestamp', 'Session ID', 'Type', 'Page/Feature', 'Action', 'Metadata'];
  
  const rows = events.map(e => [
    e.id,
    e.timestamp,
    e.sessionId,
    e.type,
    e.page || e.feature || e.action || '',
    e.action || '',
    JSON.stringify(e.metadata || {})
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return csv;
}

/**
 * Clear usage data
 */
export function clearUsageData() {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(EVENTS_KEY);
  localStorage.removeItem(FEATURES_KEY);
  currentSession = null;
  sessionStartTime = null;
}

export default {
  startSession,
  endSession,
  trackPageView,
  trackFeatureUsage,
  trackConversion,
  trackAction,
  getUsageStats,
  getFeatureAdoption,
  getUserJourney,
  getConversionFunnel,
  getTopPages,
  getBounceRate,
  getAverageSessionDuration,
  getPeakUsageTimes,
  getRetentionRate,
  exportUsageAsCSV,
  clearUsageData
};
