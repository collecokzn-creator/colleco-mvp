/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const filesToRemove = [
  'ai_analytics.log',
  'ai_drafts.json',
  'ai_metrics_history.jsonl',
  'collab.json'
];

function removeIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('removed:', filePath);
    } else {
      console.log('not found (skipping):', filePath);
    }
  } catch (err) {
    console.error('failed to remove', filePath, err.message);
  }
}

function main() {
  console.log('Cleaning server data directory:', DATA_DIR);
  for (const f of filesToRemove) {
    removeIfExists(path.join(DATA_DIR, f));
  }
  console.log('Done.');
}

if (require.main === module) main();
module.exports = { main };
