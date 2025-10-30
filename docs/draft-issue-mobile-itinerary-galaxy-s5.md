Title: Mobile Itinerary — unexpected horizontal overflow on galaxy-s5 (CI run 18883849022)

Spec: `cypress/e2e/mobile-itinerary.cy.js`
Failing viewport: galaxy-s5
CI artifact run: cypress-logs/cypress-artifacts-18883849022/cypress-artifacts
Screenshot(s):
- `cypress/screenshots/mobile-itinerary.cy.js/Mobile Itinerary responsiveness -- renders without horizontal scroll on galaxy-s5 (failed).png`
- `cypress/screenshots/mobile-itinerary.cy.js/Mobile Itinerary responsiveness -- renders without horizontal scroll on galaxy-s5 (failed) (attempt 2).png`
- `cypress/screenshots/mobile-itinerary.cy.js/Mobile Itinerary responsiveness -- renders without horizontal scroll on galaxy-s5 (failed) (attempt 3).png`

Log excerpt (from `cypress.stdout.log`):

```
  1) Mobile Itinerary responsiveness
       renders without horizontal scroll on galaxy-s5:
     Error: found 1 unexpected overflowing elements: div
      at Context.eval (webpack://collecotravel-frontend/./cypress/support/e2e.js:272:14)
```

Reproduction steps
1. Run orchestrator locally: `npm run e2e:orchestrate`
2. Or run single spec against running preview: `npx cypress run --spec "cypress/e2e/mobile-itinerary.cy.js"`
3. Inspect screenshots at `cypress-logs/cypress-artifacts-18883849022/cypress-artifacts/cypress/screenshots/mobile-itinerary.cy.js/`.

Notes / triage guidance
- The assertion originates from the overflow helper in `cypress/support/e2e.js` which reports the offending element(s) by tag/class.
- This failure was observed in headless CI. Please check whether the overflow is visible in the screenshots; if it is a visible layout problem, mark as `bug/ui` and include a minimal repro. If the screenshot shows no visible break, mark as `ci-headless` and keep for later triage.

Suggested priority: medium — blocks mobile visual correctness if confirmed visually.

Next actions I can take
- Attach the screenshots to this draft and open the issue on GitHub (I can do that if you confirm).
- Try reproducing locally in headed mode and capture a comparison screenshot.
