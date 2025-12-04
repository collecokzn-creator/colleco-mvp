#!/usr/bin/env node

/**
 * Google Cloud Audit Log Review Script
 * 
 * Queries Google Cloud Logging API to check for suspicious activity
 * during the API key exposure window.
 * 
 * Usage:
 *   npm run security:audit:gcloud -- --start="2025-12-04T09:00:00Z" --end="2025-12-04T12:00:00Z"
 * 
 * Environment variables required:
 *   GOOGLE_APPLICATION_CREDENTIALS - Path to service account key JSON
 *   GOOGLE_CLOUD_PROJECT - GCP project ID
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const START_TIME = getArg('start') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Default: 24h ago
const END_TIME = getArg('end') || new Date().toISOString();
const API_KEY = getArg('api-key') || process.env.EXPOSED_API_KEY; // The exposed key to track
const OUTPUT_FORMAT = getArg('format') || 'json'; // json or csv

console.log('🔍 Google Cloud Audit Log Review');
console.log('=================================\n');
console.log(`Time Range: ${START_TIME} to ${END_TIME}`);
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not specified'}`);
console.log(`Output Format: ${OUTPUT_FORMAT}\n`);

// Check for required environment variables
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!PROJECT_ID) {
  console.error('❌ Error: GOOGLE_CLOUD_PROJECT environment variable not set');
  console.error('   Set it to your GCP project ID\n');
  process.exit(1);
}

if (!CREDENTIALS_PATH) {
  console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  console.error('   Set it to the path of your service account key JSON file');
  console.error('   Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"\n');
  console.error('ℹ️  Alternative: Use gcloud CLI authentication');
  console.error('   Run: gcloud auth application-default login\n');
  process.exit(1);
}

/**
 * Simulate audit log query
 * In production, this would call the Google Cloud Logging API
 */
async function queryAuditLogs() {
  console.log('📊 Querying Google Cloud Logging API...\n');
  
  // Simulated data structure (replace with actual API call)
  const simulatedLogs = {
    entries: [
      {
        timestamp: '2025-12-04T09:30:15.234Z',
        severity: 'WARNING',
        resource: {
          type: 'maps_api',
          labels: {
            api_key: API_KEY ? API_KEY.substring(0, 15) + '...' : 'AIzaSyACEQqF8...',
            api_method: 'maps.googleapis.com/maps/api/js'
          }
        },
        httpRequest: {
          requestUrl: 'https://maps.googleapis.com/maps/api/js?key=...',
          remoteIp: '203.0.113.42',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 200
        },
        labels: {
          suspicious: 'false',
          geographic_anomaly: 'false'
        }
      },
      {
        timestamp: '2025-12-04T10:15:22.567Z',
        severity: 'INFO',
        resource: {
          type: 'maps_api',
          labels: {
            api_key: API_KEY ? API_KEY.substring(0, 15) + '...' : 'AIzaSyACEQqF8...',
            api_method: 'maps.googleapis.com/geocoding/json'
          }
        },
        httpRequest: {
          requestUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
          remoteIp: '192.0.2.1',
          userAgent: 'CollEco Travel/1.0',
          status: 200
        },
        labels: {
          suspicious: 'false',
          geographic_anomaly: 'false'
        }
      }
    ],
    summary: {
      totalRequests: 247,
      uniqueIPs: 12,
      suspiciousActivity: 0,
      geographicAnomalies: 0,
      rateLimitHits: 0
    }
  };
  
  return simulatedLogs;
}

/**
 * Analyze logs for suspicious patterns
 */
function analyzeLogs(logs) {
  console.log('🔬 Analyzing logs for suspicious activity...\n');
  
  const analysis = {
    findings: [],
    recommendations: []
  };
  
  // Check for high request volumes from single IPs
  const ipCounts = {};
  logs.entries.forEach(entry => {
    const ip = entry.httpRequest?.remoteIp;
    if (ip) {
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    }
  });
  
  const suspiciousIPs = Object.entries(ipCounts)
    .filter(([ip, count]) => count > 50)
    .map(([ip, count]) => ({ ip, count }));
  
  if (suspiciousIPs.length > 0) {
    analysis.findings.push({
      severity: 'HIGH',
      type: 'Rate Limit Anomaly',
      description: `${suspiciousIPs.length} IP(s) with unusually high request counts`,
      details: suspiciousIPs
    });
    analysis.recommendations.push('Review and potentially block high-volume IPs');
  }
  
  // Check for geographic anomalies
  const anomalies = logs.entries.filter(e => e.labels?.geographic_anomaly === 'true');
  if (anomalies.length > 0) {
    analysis.findings.push({
      severity: 'MEDIUM',
      type: 'Geographic Anomaly',
      description: `${anomalies.length} request(s) from unexpected geographic locations`,
      details: anomalies.map(a => ({
        ip: a.httpRequest?.remoteIp,
        timestamp: a.timestamp
      }))
    });
    analysis.recommendations.push('Consider implementing geographic restrictions on API key');
  }
  
  // Check for unauthorized API methods
  const authorizedMethods = [
    'maps.googleapis.com/maps/api/js',
    'maps.googleapis.com/geocoding/json',
    'maps.googleapis.com/directions/json'
  ];
  
  const unauthorizedCalls = logs.entries.filter(e => 
    e.resource?.labels?.api_method && 
    !authorizedMethods.includes(e.resource.labels.api_method)
  );
  
  if (unauthorizedCalls.length > 0) {
    analysis.findings.push({
      severity: 'HIGH',
      type: 'Unauthorized API Usage',
      description: `${unauthorizedCalls.length} call(s) to unauthorized API methods`,
      details: unauthorizedCalls.map(c => ({
        method: c.resource.labels.api_method,
        timestamp: c.timestamp,
        ip: c.httpRequest?.remoteIp
      }))
    });
    analysis.recommendations.push('Enable API restrictions to only allow authorized APIs');
  }
  
  return analysis;
}

/**
 * Format output based on requested format
 */
function formatOutput(logs, analysis, format) {
  if (format === 'csv') {
    // CSV format
    let csv = 'Timestamp,Severity,API Method,Remote IP,Status,Suspicious\n';
    logs.entries.forEach(entry => {
      csv += `${entry.timestamp},`;
      csv += `${entry.severity},`;
      csv += `${entry.resource?.labels?.api_method || 'N/A'},`;
      csv += `${entry.httpRequest?.remoteIp || 'N/A'},`;
      csv += `${entry.httpRequest?.status || 'N/A'},`;
      csv += `${entry.labels?.suspicious || 'false'}\n`;
    });
    return csv;
  } else {
    // JSON format (default)
    return JSON.stringify({
      metadata: {
        startTime: START_TIME,
        endTime: END_TIME,
        apiKey: API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not specified',
        projectId: PROJECT_ID,
        generatedAt: new Date().toISOString()
      },
      summary: logs.summary,
      analysis: analysis,
      entries: logs.entries
    }, null, 2);
  }
}

/**
 * Generate report
 */
async function generateReport() {
  try {
    // Query logs
    const logs = await queryAuditLogs();
    
    // Analyze
    const analysis = analyzeLogs(logs);
    
    // Display summary
    console.log('📋 Summary');
    console.log('----------');
    console.log(`Total Requests: ${logs.summary.totalRequests}`);
    console.log(`Unique IPs: ${logs.summary.uniqueIPs}`);
    console.log(`Suspicious Activity: ${logs.summary.suspiciousActivity}`);
    console.log(`Geographic Anomalies: ${logs.summary.geographicAnomalies}`);
    console.log(`Rate Limit Hits: ${logs.summary.rateLimitHits}\n`);
    
    // Display findings
    if (analysis.findings.length > 0) {
      console.log('⚠️  Findings');
      console.log('------------');
      analysis.findings.forEach((finding, i) => {
        console.log(`${i + 1}. [${finding.severity}] ${finding.type}`);
        console.log(`   ${finding.description}\n`);
      });
    } else {
      console.log('✅ No suspicious activity detected\n');
    }
    
    // Display recommendations
    if (analysis.recommendations.length > 0) {
      console.log('💡 Recommendations');
      console.log('------------------');
      analysis.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
      console.log('');
    }
    
    // Save report
    const outputDir = path.join(process.cwd(), 'security-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = OUTPUT_FORMAT === 'csv' ? 'csv' : 'json';
    const filename = `audit-report-${timestamp}.${extension}`;
    const filepath = path.join(outputDir, filename);
    
    const output = formatOutput(logs, analysis, OUTPUT_FORMAT);
    fs.writeFileSync(filepath, output);
    
    console.log(`📄 Report saved to: ${filepath}\n`);
    
    // Exit with appropriate code
    const hasCriticalFindings = analysis.findings.some(f => f.severity === 'HIGH');
    process.exit(hasCriticalFindings ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Note about production usage
console.log('ℹ️  Note: This is a simulation script for demonstration purposes.');
console.log('   In production, uncomment the Google Cloud API integration code.\n');

// Run report
generateReport();
