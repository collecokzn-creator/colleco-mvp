/**
 * Analytics API Routes
 * 
 * Server-side analytics endpoints for:
 * - Download tracking
 * - Usage analytics aggregation
 * - Real-time metrics
 * - Reports generation
 */

import express from 'express';
const router = express.Router();

// In-memory storage (would use database in production)
const downloadMetrics = [];
const usageMetrics = [];
const sessions = [];

// Store limit
const MAX_RECORDS = 100000;

/**
 * POST /api/analytics/downloads
 * Track app download
 */
router.post('/downloads', (req, res) => {
  try {
    const download = {
      ...req.body,
      id: req.body.id || `dl_${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    
    downloadMetrics.push(download);
    if (downloadMetrics.length > MAX_RECORDS) {
      downloadMetrics.shift();
    }
    
    res.status(201).json({
      success: true,
      message: 'Download tracked',
      id: download.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/analytics/installations
 * Track app installation
 */
router.post('/installations', (req, res) => {
  try {
    const installation = {
      ...req.body,
      id: req.body.id || `inst_${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Installation tracked',
      id: installation.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/analytics/updates
 * Track app update
 */
router.post('/updates', (req, res) => {
  try {
    const update = {
      ...req.body,
      id: req.body.id || `upd_${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Update tracked',
      id: update.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/analytics/sessions
 * Track user session
 */
router.post('/sessions', (req, res) => {
  try {
    const session = {
      ...req.body,
      id: req.body.id || `sess_${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    
    sessions.push(session);
    if (sessions.length > MAX_RECORDS) {
      sessions.shift();
    }
    
    res.status(201).json({
      success: true,
      message: 'Session tracked',
      id: session.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/analytics/events
 * Track usage event
 */
router.post('/events', (req, res) => {
  try {
    const event = {
      ...req.body,
      id: req.body.id || `ev_${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    
    usageMetrics.push(event);
    if (usageMetrics.length > MAX_RECORDS) {
      usageMetrics.shift();
    }
    
    res.status(201).json({
      success: true,
      message: 'Event tracked',
      id: event.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get dashboard metrics
 */
router.get('/dashboard', (req, res) => {
  try {
    const timeRange = req.query.timeRange || '24h';
    const now = Date.now();
    let cutoff = 0;
    
    switch (timeRange) {
      case '24h': cutoff = now - (24 * 60 * 60 * 1000); break;
      case '7d': cutoff = now - (7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoff = now - (30 * 24 * 60 * 60 * 1000); break;
      case '90d': cutoff = now - (90 * 24 * 60 * 60 * 1000); break;
    }
    
    const filtered = {
      downloads: downloadMetrics.filter(d => new Date(d.recordedAt).getTime() > cutoff),
      sessions: sessions.filter(s => new Date(s.recordedAt).getTime() > cutoff),
      events: usageMetrics.filter(e => new Date(e.recordedAt).getTime() > cutoff)
    };
    
    const dashboard = {
      timeRange,
      metrics: {
        totalDownloads: downloadMetrics.length,
        recentDownloads: filtered.downloads.length,
        totalSessions: sessions.length,
        activeSessions: filtered.sessions.length,
        totalEvents: usageMetrics.length,
        recentEvents: filtered.events.length,
        uniqueCountries: new Set(downloadMetrics.map(d => d.location?.country)).size,
        uniqueDevices: new Set(downloadMetrics.map(d => d.device?.os)).size
      },
      downloadsBySource: aggregateBy(filtered.downloads, 'source'),
      downloadsByOS: aggregateBy(filtered.downloads, d => d.device?.os),
      downloadsByCountry: aggregateBy(filtered.downloads, d => d.location?.country),
      eventsByType: aggregateBy(filtered.events, 'type'),
      topPages: getTopPages(filtered.events),
      conversionRate: calculateConversionRate(filtered.sessions),
      bounceRate: calculateBounceRate(filtered.sessions),
      avgSessionDuration: calculateAvgSessionDuration(filtered.sessions)
    };
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/downloads
 * Get download analytics
 */
router.get('/downloads', (req, res) => {
  try {
    const timeRange = req.query.timeRange || '7d';
    const limit = parseInt(req.query.limit) || 100;
    
    const analytics = {
      total: downloadMetrics.length,
      recent: downloadMetrics.slice(-limit),
      bySource: aggregateBy(downloadMetrics, 'source'),
      byOS: aggregateBy(downloadMetrics, d => d.device?.os),
      byCountry: aggregateBy(downloadMetrics, d => d.location?.country),
      topCountries: getTopCountries(downloadMetrics, 10),
      topSources: getTopSources(downloadMetrics, 5)
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/usage
 * Get usage analytics
 */
router.get('/usage', (req, res) => {
  try {
    const timeRange = req.query.timeRange || '7d';
    
    const analytics = {
      total: {
        events: usageMetrics.length,
        sessions: sessions.length,
        pageViews: usageMetrics.filter(e => e.type === 'pageview').length,
        conversions: usageMetrics.filter(e => e.type === 'conversion').length
      },
      byType: aggregateBy(usageMetrics, 'type'),
      eventsByFeature: aggregateBy(usageMetrics.filter(e => e.type === 'feature'), 'feature'),
      conversionsByType: aggregateBy(usageMetrics.filter(e => e.type === 'conversion'), 'conversionType'),
      topPages: getTopPages(usageMetrics),
      avgSessionDuration: calculateAvgSessionDuration(sessions),
      bounceRate: calculateBounceRate(sessions),
      uniqueUsers: new Set(sessions.map(s => s.userId)).size
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/export
 * Export analytics data
 */
router.get('/export', (req, res) => {
  try {
    const format = req.query.format || 'json';
    const type = req.query.type || 'all';
    
    let data = {};
    
    if (type === 'downloads' || type === 'all') {
      data.downloads = downloadMetrics;
    }
    if (type === 'usage' || type === 'all') {
      data.events = usageMetrics;
      data.sessions = sessions;
    }
    
    if (format === 'json') {
      res.json({
        success: true,
        data
      });
    } else if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csv);
    } else {
      res.status(400).json({ success: false, error: 'Invalid format' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/health
 * Health check for analytics
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    records: {
      downloads: downloadMetrics.length,
      sessions: sessions.length,
      events: usageMetrics.length
    }
  });
});

// Helper functions

function aggregateBy(items, keyFn) {
  const map = {};
  items.forEach(item => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

function getTopCountries(downloads, limit) {
  const countries = aggregateBy(downloads, d => d.location?.country);
  return Object.entries(countries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([country, count]) => ({ country, count }));
}

function getTopSources(downloads, limit) {
  const sources = aggregateBy(downloads, 'source');
  return Object.entries(sources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([source, count]) => ({ source, count }));
}

function getTopPages(events) {
  const pages = {};
  events
    .filter(e => e.type === 'pageview')
    .forEach(e => {
      pages[e.page] = (pages[e.page] || 0) + 1;
    });
  
  return Object.entries(pages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));
}

function calculateConversionRate(sessionData) {
  if (sessionData.length === 0) return 0;
  const converted = sessionData.filter(s => s.conversions && s.conversions.length > 0).length;
  return (converted / sessionData.length) * 100;
}

function calculateBounceRate(sessionData) {
  if (sessionData.length === 0) return 0;
  const bounced = sessionData.filter(s => (!s.pageViews || s.pageViews <= 1)).length;
  return (bounced / sessionData.length) * 100;
}

function calculateAvgSessionDuration(sessionData) {
  if (sessionData.length === 0) return 0;
  const total = sessionData.reduce((sum, s) => sum + (s.duration || 0), 0);
  return total / sessionData.length;
}

function convertToCSV(data) {
  let csv = '';
  
  if (data.downloads && data.downloads.length > 0) {
    csv += 'DOWNLOADS\n';
    csv += 'ID,Timestamp,Source,OS,Device\n';
    data.downloads.forEach(d => {
      csv += `${d.id},${d.timestamp},${d.source},${d.device?.os},${d.device?.deviceType}\n`;
    });
    csv += '\n\n';
  }
  
  if (data.events && data.events.length > 0) {
    csv += 'EVENTS\n';
    csv += 'ID,Timestamp,Type,Page/Feature,Action\n';
    data.events.forEach(e => {
      csv += `${e.id},${e.timestamp},${e.type},${e.page || e.feature || ''},${e.action || ''}\n`;
    });
  }
  
  return csv;
}

export default router;
