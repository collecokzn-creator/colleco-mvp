import fs from 'fs'
import path from 'path'

const assetsDir = path.resolve('./dist/assets')
const outHtml = path.resolve('./dist/tmp/runner.html')

function findPdfBundle() {
  if (!fs.existsSync(assetsDir)) return null
  const files = fs.readdirSync(assetsDir)
  const f = files.find(f => f.startsWith('pdfGenerators') && f.endsWith('.js'))
  return f || null
}

const bundle = findPdfBundle()
if (!bundle) {
  console.error('Could not find pdfGenerators bundle in dist/assets — ensure build ran')
  process.exit(1)
}

const rel = `./assets/${bundle}`
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CI PDF Runner</title>
  </head>
  <body>
    <script type="module">
      import * as mod from '${rel}';
      window._exportQuote = mod.exportQuotePdfData || mod.generateQuotePdf || mod.e || mod.a || (mod.default && (mod.default.exportQuotePdfData || mod.default.generateQuotePdf));
      window._ready = true;
    </script>
    <div id="status">ready</div>
  </body>
</html>`

fs.mkdirSync(path.dirname(outHtml), { recursive: true })
fs.writeFileSync(outHtml, html, 'utf-8')
console.log('Wrote runner to', outHtml)
