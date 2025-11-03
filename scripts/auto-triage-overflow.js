#!/usr/bin/env node
/* eslint-disable no-console */
/*
 Lightweight automation to scan recent workflow runs and open draft-style issues
 for failed CI E2E runs that contain Cypress artifacts. This is intentionally
 conservative: it does not download artifacts or parse logs yet — it heuristically
 looks for workflow runs with artifacts whose names include "cypress" and opens
 an issue linking the run for human triage.

 Usage:
   GITHUB_TOKEN=... node scripts/auto-triage-overflow.js --repo owner/repo --branch e2e/stabilize-ci-and-stubs --limit 20

 The script will attempt to ensure the label `ci-headless` exists and then create
 issues labeled `ci-headless,triage` for each matching failed run that doesn't
 already have an open issue linking that run.
*/

const { Octokit } = require('@octokit/rest');
const process = require('process');
const unzipper = require('unzipper');
const path = require('path');

function parseArgs() {
  const args = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a === '--repo') args.repo = raw[++i];
    else if (a === '--branch') args.branch = raw[++i];
    else if (a === '--limit') args.limit = parseInt(raw[++i], 10);
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

async function ensureLabel(octokit, owner, repo, name, color = 'fbca04') {
  try {
    await octokit.rest.issues.getLabel({ owner, repo, name });
    return;
  } catch (err) {
    // create label
    await octokit.rest.issues.createLabel({ owner, repo, name, color, description: 'CI headless triage' });
  }
}

async function alreadyHasIssue(octokit, owner, repo, runUrl) {
  const q = `${runUrl} repo:${owner}/${repo}`;
  // Search issues for the run url in body. Requires the token to have repo scope.
  try {
    const res = await octokit.request('GET /search/issues', { q });
    return res.data.total_count > 0;
  } catch (err) {
    return false;
  }
}

async function main() {
  const args = parseArgs();
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    console.error('ERROR: GITHUB_TOKEN or GH_TOKEN must be set in the environment.');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  const repoArg = args.repo || 'collecokzn-creator/colleco-mvp';
  const [owner, repo] = repoArg.split('/');
  const branch = args.branch || 'e2e/stabilize-ci-and-stubs';
  const limit = args.limit || 30;

  console.log(`Scanning recent workflow runs for ${owner}/${repo} branch=${branch} (limit=${limit})`);

  const runsRes = await octokit.rest.actions.listWorkflowRunsForRepo({ owner, repo, branch, per_page: limit });
  const runs = runsRes.data.workflow_runs || [];

  // ensure labels exist
  await ensureLabel(octokit, owner, repo, 'ci-headless', 'fbca04');
  await ensureLabel(octokit, owner, repo, 'triage', 'b60205');

  let created = 0;

  for (const run of runs) {
    // only look at completed runs that are not a success
    if (run.status !== 'completed' || run.conclusion === 'success') continue;

    // list artifacts for the run
    const arts = await octokit.rest.actions.listWorkflowRunArtifacts({ owner, repo, run_id: run.id });
    const artifacts = arts.data.artifacts || [];
    // only consider artifacts that look like Cypress artifacts
    const cypressArtifacts = artifacts.filter(a => /cypress/i.test(a.name));
    if (cypressArtifacts.length === 0) continue;

    const runUrl = run.html_url;

    // avoid duplicate issues referencing the same run url
    const dup = await alreadyHasIssue(octokit, owner, repo, runUrl);
    if (dup) {
      console.log(`Skipping run ${run.id} – an issue already references ${runUrl}`);
      continue;
    }

    // download and scan artifacts for overflow strings
    const overflowFindings = [];

    for (const a of cypressArtifacts) {
      try {
        if (!a.archive_download_url) continue;
        const res = await fetch(a.archive_download_url, { headers: { authorization: `token ${token}` } });
        if (!res.ok) continue;
        const ab = await res.arrayBuffer();
        const buffer = Buffer.from(ab);
        const directory = await unzipper.Open.buffer(buffer);
        for (const file of directory.files) {
          const path = file.path || file.path;
          if (/cypress\.stdout\.log|\.log$/i.test(path)) {
            const contentBuf = await file.buffer();
            const content = contentBuf.toString('utf8');
            const m = content.match(/(unexpected overflowing elements|overflowing elements|overflow)/i);
            if (m) {
              const snippet = content.split('\n').slice(Math.max(0, content.substr(0, m.index).split('\n').length - 3), Math.min(200, content.split('\n').length)).join('\n');
              overflowFindings.push({ artifact: a.name, file: path, snippet: snippet.substring(0, 2000) });
            }
          }
          // collect screenshots (png/jpg) to attach to an issue later
          if (/\.(png|jpe?g)$/i.test(path)) {
            const buf = await file.buffer();
            // store temporary in-memory to upload later
            if (!a._images) a._images = [];
            a._images.push({ path, buf });
          }
        }
      } catch (err) {
        console.error('artifact scan error', err && err.message);
      }
    }

    if (overflowFindings.length === 0) {
      console.log(`No overflow strings found for run ${run.id}; skipping issue creation.`);
      continue;
    }

    const title = `[DRAFT] CI E2E overflow — run ${run.id} (${run.name || run.workflow_id})`;
    const bodyLines = [];
    bodyLines.push(`Detected failed workflow run with Cypress artifacts: ${runUrl}`);
    bodyLines.push('');
    bodyLines.push('Overflow findings (snippets):');
    for (const f of overflowFindings) {
      bodyLines.push(`- Artifact: ${f.artifact} file: ${f.file}`);
      bodyLines.push('```');
      bodyLines.push(f.snippet);
      bodyLines.push('```');
      bodyLines.push('');
    }
    // If there are image buffers collected, publish them to a branch and include raw URLs
    const imageLinks = [];
    try {
      // determine images grouped by artifact
      const imagesToUpload = [];
      for (const a of cypressArtifacts) {
        if (a._images && a._images.length) {
          for (const img of a._images) imagesToUpload.push(img);
        }
      }

      if (imagesToUpload.length > 0) {
        const branchName = `ci-artifacts/${run.id}`;
        // get default branch sha
        const repoInfo = await octokit.rest.repos.get({ owner, repo });
        const defaultBranch = repoInfo.data.default_branch;
        const ref = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` });
        const defaultSha = ref.data.object.sha;

        // create a new branch ref if it doesn't exist
        try {
          await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branchName}` });
        } catch (e) {
          await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: defaultSha });
        }

        // upload each image as a file in the branch
        for (const img of imagesToUpload) {
          const fileName = path.basename(img.path);
          const targetPath = `ci-artifacts/${run.id}/${fileName}`;
          const contentBase64 = img.buf.toString('base64');
          try {
            await octokit.rest.repos.createOrUpdateFileContents({
              owner,
              repo,
              path: targetPath,
              message: `chore(ci): add artifact ${fileName} for run ${run.id}`,
              content: contentBase64,
              branch: branchName,
            });
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}/${targetPath}`;
            imageLinks.push(rawUrl);
          } catch (err) {
            console.error('upload image error', err && err.message);
          }
        }
            /* eslint-disable no-console */
      }
    } catch (err) {
      console.error('image publish error', err && err.message);
    }

    bodyLines.push('Suggested triage steps:');
    bodyLines.push('- Download artifacts and inspect full `cypress.stdout.log` and screenshots.');
    bodyLines.push('- Try headed reproduction locally using the orchestrator: `npm run e2e:orchestrate` then run the spec headed.');
    bodyLines.push('- If this is a headless-only visual difference, keep `ci-headless` label and mark as non-blocking; otherwise open a follow-up bug.');

    if (imageLinks.length) {
      bodyLines.push('');
      bodyLines.push('Screenshots:');
      for (const l of imageLinks) bodyLines.push(`![](${l})`);
    }

    if (args.dryRun) {
      console.log('DRY RUN — would create issue with title:', title);
      console.log(bodyLines.join('\n'));
    } else {
      const issue = await octokit.rest.issues.create({ owner, repo, title, body: bodyLines.join('\n'), labels: ['ci-headless', 'triage'] });
      console.log(`Created issue #${issue.data.number} for run ${run.id}`);
      created++;
    }
  }

  console.log(`Done. Created ${created} issue(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
