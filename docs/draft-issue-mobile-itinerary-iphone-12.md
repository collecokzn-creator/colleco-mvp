Title: Mobile Itinerary — unexpected horizontal overflow on iphone-12 (CI runs)

Spec: `cypress/e2e/mobile-itinerary.cy.js`
Failing viewport: iphone-12
CI artifact runs: multiple (see `cypress-logs/cypress-artifacts-*`)

Log excerpt (from `cypress-logs/.../cypress.stdout.log`):

```
Error: found 6 unexpected overflowing elements: div, div.min-h-screen.bg-cream, div.pb-24, div.flex.flex-row-reverse, main.flex-1.min-w-0.focus:outline-none, section.px-6.py-6
```

Reproduction steps
1. Run orchestrator locally: `npm run e2e:orchestrate`
2. Or run single spec against running preview: `npx cypress run --spec "cypress/e2e/mobile-itinerary.cy.js"`

Notes
- I reproduced the spec in headed mode locally and it passed — this suggests a CI headless rendering difference. Please triage with screenshots from the CI artifacts in `cypress-logs/`.

Suggested label: `ci-headless`.
