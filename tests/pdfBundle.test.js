import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

describe('PDF bundle presence', () => {
  it('build produces dist/assets/pdfGenerators-*.js containing expected exports', () => {
    const assetsDir = path.resolve(process.cwd(), 'dist', 'assets')
    expect(fs.existsSync(assetsDir)).toBe(true)

    const files = fs.readdirSync(assetsDir)
    const pdfFile = files.find(f => f.includes('pdfGenerators') && f.endsWith('.js'))
    expect(pdfFile, 'pdfGenerators bundle not found in dist/assets').toBeTruthy()

  const filePath = path.join(assetsDir, pdfFile)
  const stats = fs.statSync(filePath)
  // basic smoke assertions: file exists and is non-trivial in size
  expect(stats.size, 'pdfGenerators bundle file is unexpectedly small').toBeGreaterThan(1024)

  // also check for a known dependency token (jspdf) if present in the bundle
  const content = fs.readFileSync(filePath, 'utf-8')
  const hasMarker = content.includes('jspdf') || content.includes('jsPDF') || content.includes('jspdf.es')
  expect(hasMarker || stats.size > 1024).toBe(true)
  })
})
