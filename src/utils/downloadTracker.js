/**
 * Download Tracking System
 * 
 * Tracks app downloads, installations, update metrics
 * Captures: region, device type, OS, source, timestamp, country
 * Supports: Android, iOS, Web PWA, Desktop
 */

const STORAGE_KEY = 'colleco.downloads.metrics';
const MAX_RECORDS = 10000; // Keep last 10k download records

/**
 * Detect device type and OS information
 */
function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  let deviceType = 'web';
  let os = 'unknown';
  let osVersion = '';
  
  // Detect OS
  if (/Windows/.test(ua)) {
    os = 'Windows';
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] || '';
  } else if (/Macintosh/.test(ua)) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  } else if (/iPhone|iPad/.test(ua)) {
    os = 'iOS';
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
    deviceType = /iPhone/.test(ua) ? 'iPhone' : 'iPad';
  } else if (/Android/.test(ua)) {
    os = 'Android';
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || '';
    deviceType = 'Android';
  }
  
  // Detect browser
  let browser = 'unknown';
  if (/Chrome/.test(ua) && !/Chromium|Edg/.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg/.test(ua)) {
    browser = 'Edge';
  } else if (/OPR/.test(ua)) {
    browser = 'Opera';
  }
  
  // Detect app vs web
  const isWebApp = window.matchMedia('(display-mode: standalone)').matches;
  const isPWA = 'caches' in window && 'serviceWorker' in navigator;
  
  return {
    deviceType,
    os,
    osVersion,
    browser,
    isWebApp,
    isPWA,
    userAgent: ua.substring(0, 200) // Truncate for storage
  };
}

/**
 * Get geolocation (IP-based or device location)
 */
async function getLocationInfo() {
  try {
    // Try to get from IP geolocation
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone || 'Unknown'
      };
    }
  } catch (error) {
    console.warn('Geolocation fetch failed:', error);
  }
  
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown',
    latitude: null,
    longitude: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

/**
 * Track app download/installation
 */
export async function trackDownload(source = 'direct') {
  const downloadRecord = {
    id: `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    source, // 'app-store', 'play-store', 'github', 'website', 'direct', 'referral'
    device: getDeviceInfo(),
    location: await getLocationInfo(),
    version: '1.0.0', // Will be updated with actual version
    downloadSize: 0, // To be filled by build process
    duration: 0 // Download duration in ms
  };
  
  // Store in localStorage
  const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  records.push(downloadRecord);
  
  // Keep only last N records
  if (records.length > MAX_RECORDS) {
    records.shift();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  
  // Send to backend if available
  try {
    await fetch('/api/analytics/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(downloadRecord)
    }).catch(() => {}); // Fail silently
  } catch (error) {
    console.warn('Failed to send download tracking:', error);
  }
  
  return downloadRecord;
}

/**
 * Track app installation/first launch
 */
export async function trackInstallation(installationType = 'first-launch') {
  const hasLaunched = localStorage.getItem('colleco.app.launched');
  
  if (!hasLaunched) {
    const installRecord = {
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: installationType, // 'first-launch', 'update', 'reinstall'
      device: getDeviceInfo(),
      location: await getLocationInfo()
    };
    
    localStorage.setItem('colleco.app.launched', new Date().toISOString());
    localStorage.setItem('colleco.installation.record', JSON.stringify(installRecord));
    
    // Send to backend
    try {
      await fetch('/api/analytics/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(installRecord)
      }).catch(() => {});
    } catch (error) {
      console.warn('Failed to send installation tracking:', error);
    }
    
    return installRecord;
  }
  
  return null;
}

/**
 * Track app update
 */
export async function trackUpdate(fromVersion, toVersion) {
  const updateRecord = {
    id: `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    fromVersion,
    toVersion,
    device: getDeviceInfo()
  };
  
  try {
    await fetch('/api/analytics/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateRecord)
    }).catch(() => {});
  } catch (error) {
    console.warn('Failed to send update tracking:', error);
  }
  
  return updateRecord;
}

/**
 * Get download statistics
 */
export function getDownloadStats() {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  if (records.length === 0) {
    return {
      totalDownloads: 0,
      bySource: {},
      byOS: {},
      byCountry: {},
      byRegion: {},
      byDevice: {},
      timeline: []
    };
  }
  
  const stats = {
    totalDownloads: records.length,
    bySource: {},
    byOS: {},
    byCountry: {},
    byRegion: {},
    byDevice: {},
    byBrowser: {},
    uniqueCountries: new Set(),
    uniqueRegions: new Set(),
    timeline: []
  };
  
  // Aggregate by various dimensions
  records.forEach(record => {
    // By source
    stats.bySource[record.source] = (stats.bySource[record.source] || 0) + 1;
    
    // By OS
    const os = record.device.os;
    stats.byOS[os] = (stats.byOS[os] || 0) + 1;
    
    // By device type
    const deviceType = record.device.deviceType;
    stats.byDevice[deviceType] = (stats.byDevice[deviceType] || 0) + 1;
    
    // By browser
    const browser = record.device.browser;
    stats.byBrowser[browser] = (stats.byBrowser[browser] || 0) + 1;
    
    // By country
    const country = record.location.country;
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
    stats.uniqueCountries.add(country);
    
    // By region
    const region = record.location.region;
    stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
    stats.uniqueRegions.add(region);
  });
  
  stats.uniqueCountries = stats.uniqueCountries.size;
  stats.uniqueRegions = stats.uniqueRegions.size;
  
  // Generate timeline (hourly aggregation for last 24 hours)
  const now = Date.now();
  const last24h = now - (24 * 60 * 60 * 1000);
  const recent = records.filter(r => new Date(r.timestamp).getTime() > last24h);
  
  const timeline = {};
  recent.forEach(record => {
    const date = new Date(record.timestamp);
    const hour = Math.floor(date.getTime() / (60 * 60 * 1000));
    timeline[hour] = (timeline[hour] || 0) + 1;
  });
  
  stats.timeline = Object.entries(timeline)
    .map(([hour, count]) => ({
      timestamp: new Date(parseInt(hour) * 60 * 60 * 1000).toISOString(),
      downloads: count
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return stats;
}

/**
 * Get downloads by date range
 */
export function getDownloadsByDateRange(startDate, endDate) {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return records.filter(r => {
    const time = new Date(r.timestamp).getTime();
    return time >= start && time <= end;
  });
}

/**
 * Get top download sources
 */
export function getTopDownloadSources(limit = 5) {
  const stats = getDownloadStats();
  return Object.entries(stats.bySource)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([source, count]) => ({ source, count }));
}

/**
 * Get top countries by downloads
 */
export function getTopDownloadCountries(limit = 10) {
  const stats = getDownloadStats();
  return Object.entries(stats.byCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([country, count]) => ({ country, count }));
}

/**
 * Get device breakdown
 */
export function getDeviceBreakdown() {
  const stats = getDownloadStats();
  return {
    byOS: stats.byOS || {},
    byDevice: stats.byDevice || {},
    byBrowser: stats.byBrowser || {}
  };
}

/**
 * Clear all download records
 */
export function clearDownloadRecords() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export download data as CSV
 */
export function exportDownloadsAsCSV() {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  if (records.length === 0) {
    return '';
  }
  
  const headers = [
    'ID', 'Timestamp', 'Source', 'OS', 'Device Type', 'Browser',
    'Country', 'Region', 'City', 'Latitude', 'Longitude'
  ];
  
  const rows = records.map(r => [
    r.id,
    r.timestamp,
    r.source,
    r.device.os,
    r.device.deviceType,
    r.device.browser,
    r.location.country,
    r.location.region,
    r.location.city,
    r.location.latitude || '',
    r.location.longitude || ''
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${v}"`).join(','))
  ].join('\n');
  
  return csv;
}

/**
 * Download data as file
 */
export function downloadAsFile(filename = 'downloads.csv') {
  const csv = exportDownloadsAsCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default {
  trackDownload,
  trackInstallation,
  trackUpdate,
  getDownloadStats,
  getDownloadsByDateRange,
  getTopDownloadSources,
  getTopDownloadCountries,
  getDeviceBreakdown,
  clearDownloadRecords,
  exportDownloadsAsCSV,
  downloadAsFile
};
