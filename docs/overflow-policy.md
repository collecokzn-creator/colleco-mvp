# Overflow-check policy (proposal)

Goal

Keep the E2E pipeline reliable while preserving actionable evidence for real visual regressions. Avoid blocking merges on CI-only rendering differences.

Contract

- Inputs: Cypress headless runs producing screenshots & DOM dumps.
- Outputs: Pass/fail for critical functional tests. Non-fatal logging for CI-only visual checks. Issues created when visual regressions are visually confirmed.
- Error modes: Headless-only rendering diffs, deterministic UI regressions, flaky external APIs.

Recommended approach (hybrid)

1. Keep overflow checks non-fatal by default in CI (log-only). This prevents transient headless-only rendering differences from blocking the pipeline.
2. Maintain a small, per-spec allowlist for known safe containers (selectors) that are allowed to overflow in headless. Keep the allowlist narrowly scoped and reviewed periodically.
3. When overflow logs appear, automatically collect artifacts (screenshots, cypress stdout, DOM dump) and create a draft issue for triage. The triage workflow should:
   - Attempt a local headed reproduction (fast manual check). If reproduced visually, label as `bug/ui` and assign to UI team.
   - If not reproduced in headed mode, label as `ci-headless` and postpone UI work unless the issue recurs frequently.
4. For confirmed layout regressions, fix the UI and re-enable strict overflow asserts for the affected spec(s).
5. Periodically (monthly or on-demand) audit `ci-headless` issues and decide whether to (a) fix layout, (b) update allowlists, or (c) close as a benign headless artifact.

Implementation notes

- The current helper `cy.ensureNoUnexpectedOverflow` should accept an `allowSelectors` option (already implemented in this branch) and return a detailed list of offending elements even when non-fatal.
- CI orchestration should collect artifacts into `cypress-logs/` (already implemented) and keep them for at least 7 days for triage.
- Create a lightweight automation to open draft issues with attached logs/screenshots when overflow occurs (we implemented manual drafts and attachments for now).

Edge cases

- Long dynamic content (like user-supplied text) may cause intermittent overflow. Consider sanitizing or truncating content in test fixtures.
- Flaky external assets (large images) can cause layout shifts. Where possible, stub or replace with fixed-size test assets.

Success criteria

- CI does not fail on transient headless-only overflow artifacts.
- Visual regressions that matter are triaged and fixed within a sprint.
- The per-spec allowlist remains small and well-documented.

If you'd like, I can add a small script to auto-open draft issues for new failing runs (we already created some drafts and issues manually).