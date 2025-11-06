import http from 'http'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import puppeteer from 'puppeteer'

const serverScript = path.resolve('./scripts/simple_static_server.mjs')
const outPdf = path.resolve('./tmp/ci-verify-quote.pdf')
const runnerUrl = 'http://127.0.0.1:5174/tmp/runner.html'

function waitForServer(url, timeout = 15000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryReq = () => {
      http.get(url, res => { resolve(true) }).on('error', err => {
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for server'))
        setTimeout(tryReq, 200)
      })
    }
    tryReq()
  })
}

async function run() {
  console.log('Starting static server...')
  const child = spawn(process.execPath, [serverScript], { stdio: 'inherit' })

  try {
    await waitForServer('http://127.0.0.1:5174/')
    console.log('Server up, launching puppeteer...')

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    page.on('console', msg => console.log('PAGE LOG>', msg.text()))
    page.on('pageerror', err => console.error('PAGE ERROR>', err))

    const resp = await page.goto(runnerUrl, { waitUntil: 'networkidle0', timeout: 15000 })
    if (!resp || !resp.ok()) throw new Error('Failed to load runner page: ' + (resp && resp.status()))

    // wait for window._ready
    await page.waitForFunction(() => window._ready === true, { timeout: 10000 })

    const sample = {
      clientName: 'CI Runner',
      clientEmail: 'ci@example.com',
      clientPhone: '+27123456789',
      currency: 'USD',
      taxRate: 0,
      notes: 'CI verification PDF',
      items: [{ title: 'Item', description: 'Desc', quantity: 1, unitPrice: 10 }]
    }

    // call exporter in page context
    const dataUri = await page.evaluate(async (s) => {
      const exporter = window._exportQuote
      if (!exporter) throw new Error('exporter not found on window')
      return await exporter(s)
    }, sample)

    if (!dataUri || typeof dataUri !== 'string') throw new Error('Exporter returned unexpected value')
    const m = dataUri.match(/^data:application\/pdf;base64,(.+)$/)
    if (!m) throw new Error('Unexpected data URI from exporter')
    const buf = Buffer.from(m[1], 'base64')
    fs.mkdirSync(path.dirname(outPdf), { recursive: true })
    fs.writeFileSync(outPdf, buf)
    console.log('Wrote PDF to', outPdf, 'size', buf.length)

    await browser.close()
    child.kill()
    process.exit(0)
  } catch (err) {
    console.error(err)
    try { child.kill() } catch (e) {}
    process.exit(1)
  }
}

run()
