Title: Mobile Itinerary — unexpected horizontal overflow on iphone-se (CI run 18883849022)

Spec: `cypress/e2e/mobile-itinerary.cy.js`
Failing viewport: iphone-se
CI artifact run: cypress-logs/cypress-artifacts-18883849022/cypress-artifacts
Screenshot(s):
- `cypress/screenshots/mobile-itinerary.cy.js/Mobile Itinerary responsiveness -- renders without horizontal scroll on iphone-se (failed).png`
- `cypress/screenshots/mobile-itinerary.cy.js/Mobile Itinerary responsiveness -- renders without horizontal scroll on iphone-se (failed) (attempt 2).png`
- `cypress/screenshots/mobile-itinerary.cy.js/Mobile Itinerary responsiveness -- renders without horizontal scroll on iphone-se (failed) (attempt 3).png`

Log excerpt (from `cypress.stdout.log`):

```
  2) Mobile Itinerary responsiveness
       renders without horizontal scroll on iphone-se:
     Error: found 1 unexpected overflowing elements: div
      at Context.eval (webpack://collecotravel-frontend/./cypress/support/e2e.js:272:14)
```

Reproduction steps
1. Run orchestrator locally: `npm run e2e:orchestrate`
2. Or run single spec against running preview: `npx cypress run --spec "cypress/e2e/mobile-itinerary.cy.js"`
3. Inspect screenshots at `cypress-logs/cypress-artifacts-18883849022/cypress-artifacts/cypress/screenshots/mobile-itinerary.cy.js/`.

Notes / triage guidance
- The overflow helper pinpoints the offending element by tag; the screenshot should be checked to see if the overflow is visually meaningful.
- If it's only present in headless CI, label as `ci-headless` and collect logs for future UI fixes. If visible in headed mode, prioritize a CSS/layout fix.

Suggested priority: medium-low — check visual evidence first.

Next actions I can take
- Open the issue on GitHub with attached screenshots and log snippet (I can do that if you confirm).
- Attempt a headed local run to see if the overflow reproduces in a normal browser.
