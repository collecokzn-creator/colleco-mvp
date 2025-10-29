#!/usr/bin/env node
/**
 * Improved orchestrator for E2E: build -> free ports -> start API -> start preview -> wait /health (IPv4/IPv6) -> run Cypress -> cleanup
 * Works on CI (Linux) and Windows. Keeps clearer logs, writes PIDs, and traps signals for cleanup.
 */
const { spawn, spawnSync, execSync } = require('child_process');
const http = require('http');
const tcpPortUsed = require('tcp-port-used');
const fs = require('fs');
const path = require('path');

const API_PORT = parseInt(process.env.API_PORT || process.env.PORT || '4010', 10);
const PREVIEW_PORT = parseInt(process.env.PREVIEW_PORT || '5174', 10);
const HEALTH_PATH = '/health';
const PID_DIR = path.join(process.cwd(), 'scripts', '.pids');
if (!fs.existsSync(PID_DIR)) try { fs.mkdirSync(PID_DIR, { recursive: true }); } catch (e) {}
const LOG_DIR = path.join(process.cwd(), 'cypress-logs');
if (!fs.existsSync(LOG_DIR)) try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) {}

function log(...args) { console.log('[orchestrator]', ...args); }

function logToFile(...args) {
  try {
    const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'orchestrator.log'), line, 'utf8');
  } catch (e) {}
}

async function checkHealthHosts(port, timeoutMs = 30000) {
  const hosts = ['127.0.0.1', 'localhost', '::1'];
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const host of hosts) {
      try {
        const ok = await new Promise((res) => {
          const req = http.get({ hostname: host, port, path: HEALTH_PATH, timeout: 3000 }, (r) => {
            const status = r.statusCode || 0;
            res(status >= 200 && status < 500);
          });
          req.on('error', () => res(false));
          req.on('timeout', () => { req.destroy(); res(false); });
        });
        if (ok) {
          log(`health ok via ${host}:${port}`);
          return true;
        }
      } catch (e) { /* ignore per-host errors */ }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr ":${port}"`, { encoding: 'utf8' });
      const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const cols = line.split(/\s+/);
        const pid = cols[cols.length - 1];
        if (pid && !isNaN(Number(pid))) {
          log(`killing PID ${pid} (port ${port})`);
          try { execSync(`taskkill /PID ${pid} /F`); } catch (e) { log('taskkill failed', e.message); }
        }
      }
    } else {
      try {
        const out = execSync(`lsof -ti :${port}`, { encoding: 'utf8' });
        const pids = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        for (const pid of pids) {
          log(`killing PID ${pid} (port ${port})`);
          try { process.kill(Number(pid), 'SIGKILL'); } catch (e) { log('kill failed', e.message); }
        }
      } catch (err) {
        // lsof not present or no process; ignore
      }
    }
  } catch (e) {
    log('port-kill helper encountered error:', e.message);
  }
}

async function ensurePortFree(port, waitMs = 10000) {
  try {
    const inUse = await tcpPortUsed.check(port, '127.0.0.1');
    if (!inUse) return true;
  } catch (e) { /* ignore */ }
  log(`port ${port} appears in-use, attempting to free it`);
  killProcessOnPort(port);
  try {
    await tcpPortUsed.waitUntilFree(port, 500, waitMs);
    return true;
  } catch (e) {
    log(`port ${port} did not free in ${waitMs}ms`);
    return false;
  }
}

function writePid(name, pid) {
  try { fs.writeFileSync(path.join(PID_DIR, `${name}.pid`), String(pid), 'utf8'); } catch (e) {}
}

function removePid(name) {
  try { fs.unlinkSync(path.join(PID_DIR, `${name}.pid`)); } catch (e) {}
}

async function main() {
  let apiProc = null;
  let previewProc = null;
  let mockProc = null;
  try {
    // Ensure runtime/generated server data is cleaned before builds/tests run
    try {
      log('0) Cleaning server data (automatic)');
      spawnSync('node', ['scripts/clean-server-data.js'], { stdio: 'inherit', shell: true });
    } catch (e) {
      log('clean-server-data failed (non-fatal):', e && e.message);
    }

    log('1) Running build');
    const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
    if (build.status !== 0) {
      log('build failed; aborting');
      process.exit(build.status || 1);
    }

    log('2) Ensuring API and preview ports are free');
    await ensurePortFree(API_PORT);
    await ensurePortFree(PREVIEW_PORT);

    log('3) Starting API (server/server.js) on port', API_PORT);
    logToFile('3) Starting API on port', API_PORT);
    // Start API with explicit env. Capture stdout/stderr to files for CI artifacts.
    apiProc = spawn('node', ['server/server.js'], { env: { ...process.env, PORT: String(API_PORT) }, stdio: ['ignore','pipe','pipe'], shell: true });
    writePid('api', apiProc.pid || 0);
    try {
      const apiOut = fs.createWriteStream(path.join(LOG_DIR, 'api.stdout.log'));
      const apiErr = fs.createWriteStream(path.join(LOG_DIR, 'api.stderr.log'));
      if (apiProc.stdout) apiProc.stdout.pipe(apiOut);
      if (apiProc.stderr) apiProc.stderr.pipe(apiErr);
    } catch (e) { log('failed to create api log streams', e && e.message); }

    log('waiting for API /health');
    const apiOk = await checkHealthHosts(API_PORT, 30000);
    if (!apiOk) {
      log('API /health did not respond in time; killing API process and aborting');
      try { if (apiProc) apiProc.kill(); } catch (e) {}
      removePid('api');
      process.exit(2);
    }

    log('4) Starting stable preview on port', PREVIEW_PORT);
    logToFile('4) Starting stable preview on port', PREVIEW_PORT);
    previewProc = spawn('node', ['scripts/express-preview-server.js', '--port', String(PREVIEW_PORT)], { stdio: ['ignore','pipe','pipe'], shell: true });
    writePid('preview', previewProc.pid || 0);
    try {
      const prevOut = fs.createWriteStream(path.join(LOG_DIR, 'preview.stdout.log'));
      const prevErr = fs.createWriteStream(path.join(LOG_DIR, 'preview.stderr.log'));
      if (previewProc.stdout) previewProc.stdout.pipe(prevOut);
      if (previewProc.stderr) previewProc.stderr.pipe(prevErr);
    } catch (e) { log('failed to create preview log streams', e && e.message); }

    log('waiting for preview /health');
    const previewOk = await checkHealthHosts(PREVIEW_PORT, 30000);
    if (!previewOk) {
      log('preview /health did not respond in time; killing started processes and aborting');
      try { if (previewProc) previewProc.kill(); } catch (e) {}
      try { if (apiProc) apiProc.kill(); } catch (e) {}
      removePid('preview'); removePid('api');
      process.exit(3);
    }

    // Optionally start local Siteminder mock server when using mock mode
    const useSiteminderMock = process.env.SITEMINDER_USE_MOCK === '1';
    const SITEMINDER_MOCK_PORT = parseInt(process.env.SITEMINDER_MOCK_PORT || '4015', 10);
    if (useSiteminderMock) {
      log('6) Starting local Siteminder mock on port', SITEMINDER_MOCK_PORT);
      await ensurePortFree(SITEMINDER_MOCK_PORT);
      mockProc = spawn('node', ['scripts/mock-siteminder-server.js'], { env: { ...process.env, SITEMINDER_MOCK_PORT: String(SITEMINDER_MOCK_PORT) }, stdio: ['ignore','pipe','pipe'], shell: true });
      writePid('siteminder-mock', mockProc.pid || 0);
      try {
        const mockOut = fs.createWriteStream(path.join(LOG_DIR, 'siteminder-mock.stdout.log'));
        const mockErr = fs.createWriteStream(path.join(LOG_DIR, 'siteminder-mock.stderr.log'));
        if (mockProc.stdout) mockProc.stdout.pipe(mockOut);
        if (mockProc.stderr) mockProc.stderr.pipe(mockErr);
      } catch (e) { log('failed to create siteminder mock log streams', e && e.message); }

      log('waiting for siteminder mock /health');
      const mockOk = await checkHealthHosts(SITEMINDER_MOCK_PORT, 15000);
      if (!mockOk) {
        log('siteminder mock did not respond in time; killing mock and aborting');
        try { if (mockProc) mockProc.kill(); } catch (e) {}
        removePid('siteminder-mock');
        process.exit(4);
      }
    }

    log('5) Running Cypress full suite');
    logToFile('5) Running Cypress full suite');
    // Run Cypress and capture stdout/stderr to a file for CI artifact upload
    // Ensure Cypress receives API_BASE pointing to the mock (if used) and baseUrl to preview
    const cypressEnv = Object.assign({}, process.env);
    if (useSiteminderMock) {
      cypressEnv.API_BASE = `http://127.0.0.1:${SITEMINDER_MOCK_PORT}`;
      log(`CYPRESS env: API_BASE=${cypressEnv.API_BASE}`);
    } else if (!cypressEnv.API_BASE) {
      cypressEnv.API_BASE = `http://127.0.0.1:${API_PORT}`;
    }
    cypressEnv.PREVIEW_PORT = String(PREVIEW_PORT);

    // Provide baseUrl to Cypress explicitly (preview server)
    const cyArgs = ['cypress', 'run', '--e2e', '--config', `baseUrl=http://127.0.0.1:${PREVIEW_PORT}`];
    const cy = spawnSync('npx', cyArgs, { stdio: 'pipe', shell: true, encoding: 'utf8', env: cypressEnv });
    try {
      fs.writeFileSync(path.join(LOG_DIR, 'cypress.stdout.log'), cy.stdout || '', 'utf8');
      fs.writeFileSync(path.join(LOG_DIR, 'cypress.stderr.log'), cy.stderr || '', 'utf8');
    } catch (e) { log('failed to write cypress logs', e && e.message); }

  log('7) Cleaning up processes');
  try { if (previewProc) previewProc.kill(); } catch (e) {}
  try { if (apiProc) apiProc.kill(); } catch (e) {}
  try { if (mockProc) mockProc.kill(); } catch (e) {}
  removePid('preview'); removePid('api'); removePid('siteminder-mock');

    process.exit(cy.status || 0);
  } catch (err) {
    console.error('orchestrator error', err && err.stack || err);
    try { if (previewProc) previewProc.kill(); } catch (e) {}
    try { if (apiProc) apiProc.kill(); } catch (e) {}
    removePid('preview'); removePid('api');
    process.exit(10);
  }
}

process.on('SIGINT', () => { log('received SIGINT, exiting'); process.exit(130); });
process.on('SIGTERM', () => { log('received SIGTERM, exiting'); process.exit(143); });

main();
