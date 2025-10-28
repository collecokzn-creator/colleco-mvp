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

function log(...args) { console.log('[orchestrator]', ...args); }

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
  try {
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
    // Start API with explicit env. Use shell true to make Windows env handling consistent.
    apiProc = spawn('node', ['server/server.js'], { env: { ...process.env, PORT: String(API_PORT) }, stdio: 'inherit', shell: true });
    writePid('api', apiProc.pid || 0);

    log('waiting for API /health');
    const apiOk = await checkHealthHosts(API_PORT, 30000);
    if (!apiOk) {
      log('API /health did not respond in time; killing API process and aborting');
      try { if (apiProc) apiProc.kill(); } catch (e) {}
      removePid('api');
      process.exit(2);
    }

    log('4) Starting stable preview on port', PREVIEW_PORT);
    previewProc = spawn('node', ['scripts/express-preview-server.js', '--port', String(PREVIEW_PORT)], { stdio: 'inherit', shell: true });
    writePid('preview', previewProc.pid || 0);

    log('waiting for preview /health');
    const previewOk = await checkHealthHosts(PREVIEW_PORT, 30000);
    if (!previewOk) {
      log('preview /health did not respond in time; killing started processes and aborting');
      try { if (previewProc) previewProc.kill(); } catch (e) {}
      try { if (apiProc) apiProc.kill(); } catch (e) {}
      removePid('preview'); removePid('api');
      process.exit(3);
    }

    log('5) Running Cypress full suite');
    const cy = spawnSync('npx', ['cypress', 'run', '--e2e'], { stdio: 'inherit', shell: true });

    log('6) Cleaning up processes');
    try { if (previewProc) previewProc.kill(); } catch (e) {}
    try { if (apiProc) apiProc.kill(); } catch (e) {}
    removePid('preview'); removePid('api');

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
