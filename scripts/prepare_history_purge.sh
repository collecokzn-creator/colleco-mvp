#!/usr/bin/env bash
# Helper script: instructions for purging sensitive files from git history
# NOTE: This script does not run automatically. Review before running.

set -euo pipefail

echo "This script will prepare a mirror repo and run git-filter-repo to remove sensitive files from history."

echo "1) Install git-filter-repo (python/pip):"
echo "   pip install git-filter-repo"

echo "2) Create a bare mirror clone (replace <repo-url>):"
echo "   git clone --mirror <repo-url> repo.git"
echo "   cd repo.git"

echo "3) Run git-filter-repo to remove paths:" 
echo "   git filter-repo --invert-paths --path server/.env --path server/.env.local --path .env --path .env.local"

echo "4) Push cleaned history back to remote (force):"
echo "   git push --force --all"
echo "   git push --force --tags"

echo "IMPORTANT: History rewrite requires coordination with all contributors. After push, all users must reclone or reset their local copies."
