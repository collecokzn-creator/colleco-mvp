---
name: Visual / Overflow regression
about: Report unexpected horizontal scroll or visual overflow seen in E2E runs
labels: bug, e2e
---

### Summary
A brief one-line description of the overflow or visual regression.

### Where it failed
- Spec: `cypress/e2e/...` (example: `mobile-itinerary.cy.js`)
- Viewport / device (example: galaxy-s5)
- CI run / artifact link (if available):

### Reproduction steps
1. Command run (e.g. `npm run e2e:orchestrate` or `npx cypress run --spec 'cypress/e2e/mobile-itinerary.cy.js'`)
2. Steps to reproduce manually (if known)

### Attachments
- [ ] failing screenshot (attach PNG)
- [ ] relevant snippet from `cypress-logs/cypress.stdout.log`

### Notes
- Is this reproducible in headed browser locally? (yes/no)
- Any quick notes about the suspected cause (overflow from image, long text, fixed element, etc.)

Please attach the artifacts from `cypress-logs/` when filing this issue so the triage team can investigate quickly.
