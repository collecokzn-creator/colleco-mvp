# Triaging overflow findings (horizontal scroll / unexpected overflow)

If a CI run reports unexpected horizontal overflow (the Cypress helper logs "unexpected overflowing elements"), use this short triage checklist to collect diagnostics and file a clear issue.

1. Reproduce locally
   - Run the orchestrator: `npm run e2e:orchestrate` (build, start API on 4010, preview on 5174, run Cypress)
   - Or run a single spec against a running preview: `npx cypress run --spec "cypress/e2e/mobile-itinerary.cy.js"`

2. Collect artifacts
   - `cypress-logs/cypress.stdout.log` — full Cypress output and DOM dumps
   - `cypress-logs/<run-folder>/screenshots/...` — failing screenshots produced by Cypress
   - Any per-spec `.log` files output by the orchestrator

3. What to include in an issue
   - Spec path (e.g. `cypress/e2e/mobile-itinerary.cy.js`) and failing viewport (e.g. galaxy-s5)
   - A failing screenshot (attach PNG) and the snippet from `cypress.stdout.log` showing the overflow assertion
   - Command used to reproduce locally (or link to the CI run/artifact)
   - Note whether the overflow is reproducible in headed mode or only in headless CI

4. Triage guidance
   - If the screenshot clearly shows a visible layout break, mark as a layout bug and add a minimal reproduction (if possible).
   - If the overflow appears only in headless CI and screenshots don't show a visible problem, mark it as "CI headless rendering difference". We log these non-fatally so CI isn't blocked while we inspect artifacts.

5. Want me to file issues automatically?
   - I can prepare draft issue bodies using the collected artifacts (screenshots + log snippet). Say "please draft issues" and I will create draft issue files you can review before opening on GitHub.

This guide helps keep CI green while preserving the evidence needed to fix real UI regressions.
