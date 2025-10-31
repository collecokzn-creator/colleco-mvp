#!/usr/bin/env node
/*
 Lightweight watcher to poll GitHub issues for new triage issues created by
 the auto-triage workflow. Intended to be run locally by maintainers.

 Usage:
   GITHUB_TOKEN=... node scripts/watch-triage.js --repo owner/repo --interval 900000

 It stores seen issue IDs in `.triage_seen.json` so repeated runs only print new
 items. If GITHUB_TOKEN is not provided, it will attempt unauthenticated calls
 (rate-limited).
*/

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

function parseArgs() {
  const args = { interval: 5 * 60 * 1000 }; // default 5 minutes (recommended)
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '--repo') args.repo = raw[++i];
    else if (raw[i] === '--interval') args.interval = parseInt(raw[++i], 10);
  }
  return args;
}

async function fetchIssues(octokit, owner, repo) {
  const res = await octokit.rest.issues.listForRepo({ owner, repo, labels: 'ci-headless,triage', state: 'open', per_page: 100 });
  return res.data || [];
}

async function main() {
  const args = parseArgs();
  const repoArg = args.repo || 'collecokzn-creator/colleco-mvp';
  const [owner, repo] = repoArg.split('/');
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  const octokit = new Octokit(token ? { auth: token } : {});

  const seenFile = path.resolve(process.cwd(), '.triage_seen.json');
  let seen = { issues: [] };
  if (fs.existsSync(seenFile)) {
    try { seen = JSON.parse(fs.readFileSync(seenFile, 'utf8')); } catch (e) { seen = { issues: [] }; }
  }

  process.stdout.write(`Watching ${owner}/${repo} for new triage issues (labels: ci-headless,triage)\n`);

  async function checkOnce() {
    try {
      const issues = await fetchIssues(octokit, owner, repo);
      const newIssues = issues.filter(i => !seen.issues.includes(i.id));
      if (newIssues.length) {
        for (const it of newIssues) {
          process.stdout.write('\nNew triage issue:\n');
          process.stdout.write(`#${it.number} ${it.title}\n`);
          process.stdout.write(`${it.html_url}\n`);
          process.stdout.write(`${it.body ? it.body.substring(0, 1000) : '(no body)'}\n`);
        }
        seen.issues.push(...newIssues.map(i => i.id));
        fs.writeFileSync(seenFile, JSON.stringify(seen, null, 2));
        // optional webhook notification
        const webhook = process.env.WATCHER_WEBHOOK_URL;
        if (webhook) {
          try {
            // extract image links from issue body (markdown ![](...) or raw URLs)
            const extractImages = text => {
              if (!text) return [];
              const imgs = [];
              const mdImg = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
              let m;
              while ((m = mdImg.exec(text)) !== null) imgs.push(m[1]);
              const rawImg = /https:\/\/raw\.githubusercontent\.com\/[A-Za-z0-9_\-/.]+\.(png|jpe?g)/g;
              while ((m = rawImg.exec(text)) !== null) imgs.push(m[0]);
              return imgs;
            };

            const issuesForPayload = newIssues.map(i => ({
              number: i.number,
              title: i.title,
              url: i.html_url,
              images: extractImages(i.body)
            }));

            const payload = { repo: `${owner}/${repo}`, count: newIssues.length, issues: issuesForPayload };
            const fetch = (await import('node-fetch')).default;
            await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
            process.stdout.write('Watcher: webhook notified\n');
          } catch (err) {
            process.stderr.write(`Watcher: webhook error ${err && err.message}\n`);
          }
        }
        // optional Slack notification
        const slackUrl = process.env.SLACK_WEBHOOK_URL;
        if (slackUrl) {
          try {
            const fetch = (await import('node-fetch')).default;
            const attachments = newIssues.map(i => ({
              title: `#${i.number} ${i.title}`,
              title_link: i.html_url,
              text: i.body ? (i.body.length > 400 ? i.body.substring(0, 400) + '...' : i.body) : ''
            }));
            const slackPayload = { text: `New triage issues in ${owner}/${repo} (${newIssues.length})`, attachments };
            await fetch(slackUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(slackPayload) });
            process.stdout.write('Watcher: slack notified\n');
          } catch (err) {
            process.stderr.write(`Watcher: slack error ${err && err.message}\n`);
          }
        }
      } else {
        process.stdout.write(`${new Date().toISOString()} - no new triage issues\n`);
      }
    } catch (err) {
      process.stderr.write(`watch error ${err && err.message}\n`);
    }
  }

  // run immediately, then on interval
  await checkOnce();
  setInterval(checkOnce, args.interval);
}

main().catch(err => { process.stderr.write(`${err && err.stack ? err.stack : err}\n`); process.exit(1); });
