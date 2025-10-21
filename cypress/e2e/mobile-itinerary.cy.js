// Mobile viewport checks for Itinerary page responsive behavior
const viewports = [
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'galaxy-s5', width: 360, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'iphone-14-pro-max', width: 430, height: 932 },
]

describe('Mobile Itinerary responsiveness', () => {
  viewports.forEach(({ name, width, height }) => {
    it(`renders without horizontal scroll on ${name}`, () => {
      cy.viewport(width, height)
      cy.visit('/itinerary', {
        timeout: 120000,
        failOnStatusCode: false,
        onBeforeLoad(win) {
          // capture console.error calls and uncaught errors for diagnostics
          try {
            // mark E2E mode so the app disables animations and prepares modal root
            try { win.__E2E__ = true } catch (e) {}
            // Ensure guarded routes treat the session as authenticated for tests
            try { win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('client')) } catch (e) {}
            try { win.localStorage.setItem('user', JSON.stringify({ email: 'e2e@example.com', name: 'E2E Tester', role: 'client' })) } catch (e) {}
            win.__cypress_console_errors = []
            const origErr = win.console && win.console.error && win.console.error.bind(win.console)
            if (win.console && win.console.error) {
              win.console.error = function () {
                try { win.__cypress_console_errors.push(Array.from(arguments).join(' ')) } catch (e) {}
                return origErr.apply(null, arguments)
              }
            }
            const origOnError = win.onerror
            win.onerror = function (msg, url, _line, _col, _err) {
              try { win.__cypress_console_errors.push(String(msg) + ' @' + (url||'') + ':' + (_line||'') ) } catch (e) {}
              if (typeof origOnError === 'function') return origOnError.apply(this, arguments)
              return false
            }
          } catch (e) {}

          setTimeout(() => {
            try { win.dispatchEvent(new Event('load')); } catch (e) {}
          }, 1500)
        }
      })

      // Assert page content renders
      cy.get('#root', { timeout: 60000 }).should('exist')
      // Make any captured console errors visible to the Node process for debugging
      cy.window({ log: false }).then((win) => {
        try {
          if (Array.isArray(win.__cypress_console_errors) && win.__cypress_console_errors.length) {
            // send to node via task so it appears in runner logs
            cy.task('log', win.__cypress_console_errors.join('\n'))
          }
        } catch (e) {}
      })
      // Itinerary heading may be rendered by a code-split bundle; allow longer wait here.
      cy.contains(/Itinerary/i, { timeout: 60000 }).should('exist')

      // Use the shared helper which logs rich details to the Node runner and fails with a concise message
      // The helper will call cy.task('log') with offending element details so CI logs show exactly which
      // elements overflowed (tag, classes, scrollWidth, clientWidth and a short outerHTML snippet).
      cy.ensureNoUnexpectedOverflow()
    })
  })
})