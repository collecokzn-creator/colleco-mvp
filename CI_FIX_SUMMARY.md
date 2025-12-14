# CI/CD Fix Summary - Playwright Migration

## Issue Identified

After the initial Cypress to Playwright migration push, GitHub Actions workflows were failing due to improper service startup orchestration in the E2E workflow.

## Root Cause

The E2E workflow ([.github/workflows/e2e.yml](.github/workflows/e2e.yml)) was using `concurrently` to start both backend and frontend services in a single background command. This approach had several issues:

1. **Lack of proper background execution** - The command would block the workflow
2. **Insufficient health checking** - Only checked backend, not frontend
3. **Poor error visibility** - No logs captured when services failed to start
4. **Missing cross-env** - CI environment might not have cross-env globally available

## Fix Applied (Commit: `3963814`)

### Changes to `.github/workflows/e2e.yml`:

**Before:**
```yaml
- name: Start backend and frontend
  run: |
    npx concurrently -k -s first -n api,web -c blue,green \
      "cross-env PORT=4010 node server/server.js" \
      "npx serve -s dist -l 5173" &
    
    timeout=60
    elapsed=0
    until curl -f http://127.0.0.1:4010/health || [ $elapsed -ge $timeout ]; do
      sleep 2
      elapsed=$((elapsed + 2))
    done
```

**After:**
```yaml
- name: Start backend server
  run: |
    PORT=4010 nohup node server/server.js > server.log 2>&1 &
    echo $! > server.pid

- name: Start preview server
  run: |
    nohup npx serve -s dist -l 5173 > preview.log 2>&1 &
    echo $! > preview.pid

- name: Wait for services
  run: |
    set -e
    BACKEND_OK=0
    PREVIEW_OK=0
    for i in $(seq 1 60); do
      if curl -fsS http://127.0.0.1:4010/health >/dev/null 2>&1; then
        echo "Backend ready"; BACKEND_OK=1
      fi
      if curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
        echo "Preview ready"; PREVIEW_OK=1
      fi
      if [ "$BACKEND_OK" -eq 1 ] && [ "$PREVIEW_OK" -eq 1 ]; then
        echo "All services ready"; exit 0
      fi
      sleep 1
    done
    echo "Services failed to start"
    tail -n 50 server.log || true
    tail -n 50 preview.log || true
    exit 1
```

### Key Improvements:

1. ✅ **Separate process spawning** - Each service started independently with `nohup`
2. ✅ **Log capture** - Both services write to `server.log` and `preview.log`
3. ✅ **PID tracking** - Process IDs saved for potential cleanup
4. ✅ **Dual health checks** - Verifies both backend AND frontend are responsive
5. ✅ **Better error reporting** - Shows last 50 lines of logs on failure
6. ✅ **Artifact upload** - Logs included in workflow artifacts for debugging

## Monitoring Strategy

### Check Workflow Status

```powershell
# List recent runs
gh run list --limit 5

# Watch specific workflow
gh run watch

# View specific run details
gh run view <run-id>

# Download artifacts from failed run
gh run download <run-id>
```

### Expected Workflow Behavior

After the fix, workflows should:

1. **✓ Build** - Compile the Vite app successfully
2. **✓ Start Services** - Backend (port 4010) and Preview (port 5173) start
3. **✓ Health Checks** - Both services respond within 60 seconds
4. **✓ Run Tests** - Playwright executes test suite
5. **✓ Upload Artifacts** - Reports and logs saved on completion/failure

### Troubleshooting Failed Runs

If jobs still fail, check artifacts for:

- **`server.log`** - Backend startup errors, port conflicts, module issues
- **`preview.log`** - Frontend serving errors, asset loading issues
- **`playwright-report/`** - HTML test results with screenshots/traces
- **`test-results/`** - Raw test execution data

## Related Workflows

The following workflows use similar patterns and are working correctly:

- ✅ **e2e-smoke.yml** - Already uses proper background process spawning
- ✅ **e2e-pr-smoke.yml** - Already uses proper background process spawning
- ✅ **playwright-mobile.yml** - Already uses proper background process spawning

## Status

- **Initial Migration Push**: Commit `9646fc0` ⚠️ (workflows failed)
- **Workflow Fix Push**: Commit `3963814` ✅ (workflows running)

### Current Running Workflows:

- E2E Smoke
- CI
- Deploy Vite site to Pages
- CodeQL
- Security Scan

All workflows triggered by the fix commit are currently in progress.

## Next Actions

1. **Monitor Current Runs** - Wait for workflows to complete (~2-5 minutes)
2. **Verify Test Execution** - Check that Playwright tests run successfully
3. **Review Artifacts** - If failures occur, download and inspect logs
4. **Adjust Timeouts** - If health checks timeout, consider increasing wait time
5. **Add Retries** - Consider adding retry logic for flaky tests

## Prevention

To prevent similar issues in future migrations:

1. **Test workflows locally** - Use `act` or similar tools to test GitHub Actions locally
2. **Incremental changes** - Update one workflow at a time
3. **Service orchestration** - Always use explicit background spawning with health checks
4. **Log everything** - Capture stdout/stderr for all services
5. **Artifact uploads** - Include logs in artifacts (already done)

## Useful Commands

```powershell
# Monitor all active runs
gh run watch

# List workflows
gh workflow list

# View workflow file
gh workflow view "E2E Tests (Playwright)"

# Re-run failed workflows
gh run rerun <run-id>

# Cancel running workflow
gh run cancel <run-id>
```

---

**Last Updated**: December 14, 2025  
**Status**: Fix pushed, workflows in progress  
**Commit**: `3963814` - fix: Improve E2E workflow service startup reliability
