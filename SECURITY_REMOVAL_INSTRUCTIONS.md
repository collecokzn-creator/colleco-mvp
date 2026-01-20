Remediation steps for exposed secrets in this repository

Summary
- Several local/test secrets were found in tracked files (e.g. `server/.env`, `server/.env.local`, `.env.local`). Treat these as exposed until rotated.

Immediate actions (performed by agent)
- Identified occurrences and reported them.
- Ensured `.gitignore` contains patterns to ignore `.env` and `server/.env.local`.
- Attempted to untrack common env files from the index (`git rm --cached --ignore-unmatch server/.env server/.env.local .env .env.local`).

Recommended manual/privileged actions (you must run or approve)
1) Rotate/Revoke exposed secrets immediately
   - Yoco: rotate `YOCO_SECRET_KEY` and `YOCO_WEBHOOK_SECRET` in your Yoco dashboard.
   - Google Maps / OpenAI / Ticketmaster / VAPID / SMTP: rotate any keys shown here if they are real.

2) Purge secrets from git history (if secrets were committed in history)
   - Option A: Use GitHub's "Remove sensitive data" guided workflow (if available in your org).
   - Option B: Use `git-filter-repo` (recommended over BFG). Example:

     # Install git-filter-repo (python/pip) and run from repo root
     pip install git-filter-repo
     # Remove specific file paths from history
     git clone --mirror <repo-url> repo.git
     cd repo.git
     git filter-repo --invert-paths --path server/.env --path server/.env.local --path .env.local --path .env
     git push --force --all
     git push --force --tags

   - Option C: Use BFG repo cleaner (simpler for common cases). Follow BFG docs.

   Notes: History rewrite requires coordinating with all contributors (everyone must reclone or reset branches). Use force-push to remote after repository rewrite.

3) Add local `.env` files to `.gitignore` (already present in this repo). Confirm removal from index:

   git rm --cached --ignore-unmatch server/.env server/.env.local .env .env.local
   git commit -m "chore(secrets): remove tracked local env files"
   git push origin <branch>

4) Store secrets securely
   - Add production secrets to GitHub Actions Secrets or your cloud provider secret manager.
   - Never store secrets in plaintext in the repository.

5) Re-run secret scanner and enable push protection
   - Run an automated scanner (GitGuardian, TruffleHog, GitLeaks)
   - Enable GitHub push protection / secret scanning for the repo to block future commits with secrets

6) Additional recommended hardening
   - Add pre-commit secret scanner (.husky + git-secrets) to block local commits.
   - Add CI checks (npm run security:scan or equivalent) to fail PRs if secrets are detected.

If you want, I can:
- Create a PR that removes any remaining tracked env files and adds `.env` placeholders.
- Generate a small script to help rotate and replace secrets in environment configuration files with placeholders.
- Run `git-filter-repo` locally and prepare a cleaned mirror for you to review (requires your approval to force-push).

Tell me which of the above privileged actions you'd like me to prepare or run next.
