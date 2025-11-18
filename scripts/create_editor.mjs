import fs from 'fs'
import path from 'path'

const assetsDir = path.resolve('./dist/assets')
const outHtml = path.resolve('./dist/tmp/editor.html')

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

const rel = `/assets/${bundle}`
const sample = JSON.stringify({
  clientName: 'Editable Quote',
  clientEmail: 'client@example.com',
  clientPhone: '+27123456789',
  currency: 'R',
  taxRate: 15,
  notes: 'Editable preview — change values and click Generate PDF',
  items: [
    { title: 'Accommodation for 52 Guest', description: 'The Blue Marlin Hotel Scotteburgh, Single room, Incl Dinner, Bed and Breakfast. Check in 11th November 2025, Check out 12th November 2025.', quantity: 52, unitPrice: 2490 },
    { title: 'Conference room for 46 Delegates', description: 'Full day conference for the 11th and 12th November 2025. Includes stationary, refreshments and lunch. PA system and Projector', quantity: 46, unitPrice: 1500 }
  ]
}, null, 2)

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CollEco Quote Editor</title>
    <style>body{font-family: Arial, Helvetica, sans-serif;padding:16px} textarea{width:100%;height:320px;font-family:monospace} .controls{margin-top:8px}</style>
  </head>
  <body>
    <h2>CollEco Quote Editor</h2>
    <p>Edit the quote JSON below and click <strong>Generate PDF</strong>. The generated PDF will open in a new tab.</p>
    <textarea id="json">${sample}</textarea>
    <div class="controls">
      <button id="gen">Generate PDF</button>
      <button id="download" style="display:none">Download PDF</button>
      <span id="status" style="margin-left:12px"></span>
    </div>

    <script type="module">
      import * as mod from '${rel}';
      const exporter = mod.exportQuotePdfData || mod.generateQuotePdf || null;
      if (!exporter) {
        document.getElementById('status').innerText = 'ERROR: exporter not found in built bundle.';
      }

      document.getElementById('gen').addEventListener('click', async () => {
        try {
          const txt = document.getElementById('json').value;
          const obj = JSON.parse(txt);
          document.getElementById('status').innerText = 'Generating...';
          const dataUri = await exporter(obj);
          if (!dataUri) throw new Error('No data returned');
          // open in new tab
          const w = window.open('', '_blank');
          if (w) {
            w.document.write('<iframe src="' + dataUri + '" style="width:100%;height:100vh;border:0"></iframe>');
            w.document.title = 'Generated Quote PDF';
          } else {
            // fallback: create blob link
            const m = dataUri.match(/^data:application\/pdf(?:;[^,]*)?;base64,(.+)$/);
            if (!m) throw new Error('Unexpected data URI');
            const bytes = atob(m[1]);
            const len = bytes.length;
            const ab = new Uint8Array(len);
            for (let i = 0; i < len; i++) ab[i] = bytes.charCodeAt(i);
            const blob = new Blob([ab], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'quote.pdf';
            a.click();
            URL.revokeObjectURL(url);
          }
          document.getElementById('status').innerText = 'Done';
        } catch (e) {
          document.getElementById('status').innerText = 'Error: ' + (e && e.message ? e.message : String(e));
        }
      });
    </script>
  </body>
</html>`

fs.mkdirSync(path.dirname(outHtml), { recursive: true })
fs.writeFileSync(outHtml, html, 'utf-8')
console.log('Wrote editor to', outHtml)
