#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import process from 'node:process'

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))))
  })
}

function start(cmd, args = [], opts = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts })
  return child
}

async function waitFor(url, timeoutMs = 30000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Timeout waiting for ${url}`)
}

async function main() {
  // 1) Build
  console.log('[smoke] Building app...')
  await run('npm', ['run', 'build'])

  // 2) Start backend on fixed port 4000 (avoid conflicts)
  console.log('[smoke] Starting backend on :4000 ...')
  const backend = start('node', ['server/server.js'], { env: { ...process.env, PORT: '4000' } })
  await waitFor('http://127.0.0.1:4000/health', 40000)

  // 3) Serve build on 5173
  console.log('[smoke] Starting preview server on :5173 ...')
  const preview = start('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '5173', '--strictPort'])
  await waitFor('http://127.0.0.1:5173', 40000)

  // 4) Run Cypress smoke
  console.log('[smoke] Running Cypress smoke...')
  const code = await new Promise((resolve) => {
    const c = spawn('npx', ['cypress', 'run', '--browser', 'chrome', '--e2e', '--spec', 'cypress/e2e/smoke.cy.js'], {
      stdio: 'inherit', shell: true, env: { ...process.env, API_BASE: 'http://127.0.0.1:4000' }
    })
    c.on('exit', (code) => resolve(code ?? 1))
    c.on('close', () => {
      try { backend.kill() } catch {}
      try { preview.kill() } catch {}
    })
  })

  process.exit(code)
}

process.on('SIGINT', () => process.exit(130))

main().catch((e) => {
  console.error('[smoke] failed:', e?.message || e)
  process.exit(1)
})
