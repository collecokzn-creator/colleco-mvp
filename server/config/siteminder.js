const fs = require('fs');
const path = require('path');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Siteminder config] Failed to parse', filePath, err.message);
    return null;
  }
}

function getSiteminderConfig() {
  const explicit = path.join(__dirname, 'siteminder.json');
  const example = path.join(__dirname, 'siteminder.example.json');
  return loadJson(explicit) || loadJson(example) || {};
}

module.exports = { getSiteminderConfig };
