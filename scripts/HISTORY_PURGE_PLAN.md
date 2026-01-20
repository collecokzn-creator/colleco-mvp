# History Purge Plan (git-filter-repo / BFG)

This document describes a safe, reviewable plan to remove sensitive files and secrets from repository history.

IMPORTANT: Do NOT run history rewrite until:
- All exposed secrets have been rotated/revoked at the provider (YOCO, VAPID, SMTP, OpenAI, etc.).
- All contributors are informed and prepared to re-clone the repository after the rewrite.

Recommended steps (non-destructive verification first):

1) Backup a mirror of the repository (local copy):

```bash
git clone --mirror git@github.com:collecokzn-creator/colleco-mvp.git colleco-mvp.git
cd colleco-mvp.git
```

2) Install `git-filter-repo` (preferred) or `bfg-repo-cleaner` (alternative):

```bash
# git-filter-repo (requires Python)
pip3 install git-filter-repo
```

3) Dry-run idea: `git-filter-repo` does not support a dry-run, so work on the mirror above.

4) Run filter to remove specific paths (example):

```bash
# Remove specific files and folders from history
git filter-repo \
  --invert-paths \
  --paths server/.env \
  --paths .env.local \
  --paths server/.env.local \
  --paths server/data/payment_notifications.jsonl \
  --paths server/data/ai_analytics.log \
  --paths "server/data/*.json"
```

Alternative with BFG (simpler for file deletions):

```bash
# Use BFG to delete files by name or pattern (run against the mirrored repo)
java -jar bfg.jar --delete-files server/.env --delete-files ".env.local" ../colleco-mvp.git
cd ../colleco-mvp.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

5) Inspect the rewritten mirror to confirm removed blobs/refs.

6) Force-push cleaned refs to remote (coordinate with team):

```bash
git push --force --all origin
git push --force --tags origin
```

7) Post-cleanup steps for contributors:
- Everyone must `git clone` the cleaned repository (do not rebase or pull old clones).
- Rotate any tokens/keys again if needed.

Notes & cautions:
- History rewriting is destructive and will change commit SHAs. Coordinate with all contributors.
- Consider creating a new protected branch on the remote (`main-cleaned`) and ship CI to point there first.
- If you prefer a safer staged approach, I can prepare a branch with only the metadata/docs changes and avoid rewriting history now.

If you want, I will run these commands in a mirror on your behalf and prepare the cleaned push — I will not do this without explicit approval.
