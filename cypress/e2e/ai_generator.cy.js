describe('AI Generator E2E', () => {
  it('generates an itinerary and uploads draft', () => {
  // Set up deterministic intercepts so CI/local runs don't rely on slow AI services
  // Reply with the same shape the client utils expect: { data: { itinerary, pricing } }
  cy.intercept('POST', '**/api/ai/itinerary', (req) => {
    // Return a shape that matches what the client code expects:
    // - itinerary items include an activities array
    // - pricing is nested under pricing and includes total, currency and a breakdown
    req.reply({
      statusCode: 200,
      body: {
        data: {
          itinerary: [
            { day: 1, title: 'Arrival & Beach', activities: ['Arrival', 'Beach time', 'Relax'] },
            { day: 2, title: 'City Food Tour', activities: ['Market visit', 'Street food tasting'] }
          ],
          pricing: {
            total: 550,
            currency: 'USD',
            breakdown: { subtotal: 500, taxes: 50 },
            note: 'Estimate'
          }
        }
      }
    });
  }).as('generate');

  cy.intercept('POST', '**/api/ai/draft', (req) => {
    req.reply({ statusCode: 201, body: { ok: true, id: 'draft-1' } })
  }).as('upload');

  // Ensure admin role/user so the workspace AIGeneratorPage is accessible
  cy.setRole('admin', { email: 'admin@example.com', name: 'Auto admin', role: 'admin' });

  cy.visit('/#/ai', {
    failOnStatusCode: false,
    onBeforeLoad(win) {
      // Mark E2E mode and capture browser console lines for debugging
      try { win.__E2E__ = true; } catch (e) {}
      // Ensure guarded workspace route has an admin role BEFORE app boot
      try { win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('admin')); } catch (e) {}
      try { win.localStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', name: 'Auto admin', role: 'admin' })); } catch (e) {}
      try {
        win.__capturedConsole = [];
        ['log','info','warn','error'].forEach((m) => {
          try {
            const orig = win.console && win.console[m] ? win.console[m].bind(win.console) : () => {};
            win.console[m] = function(...args){
              try { win.__capturedConsole.push({ method: m, args: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))) }); } catch(e){}
              try { orig(...args); } catch(e){}
            };
          } catch(e){}
        });
      } catch(e){}
    }
  });

  // Wait briefly and reload so the app boots with the client role/user present
  cy.wait(200).then(() => cy.reload());

  // Dump the DOM immediately after visit/reload so we can inspect what rendered
  cy.document().then((doc) => {
    const html = (doc && doc.documentElement && doc.documentElement.outerHTML) ? doc.documentElement.outerHTML.slice(0, 20000) : '<no-doc>';
    cy.task('log', ['[VISIT_DOM_START]', html, '[VISIT_DOM_END]']);
    // Forward any captured console lines immediately
    cy.window({ log: false }).then((w) => {
      try { if (w.__capturedConsole && w.__capturedConsole.length) cy.task('log', ['[BROWSER_CONSOLE_AFTER_VISIT]', JSON.stringify(w.__capturedConsole.slice(0,200))]); } catch(e){}
    });
  });

  // Diagnostic: log the current location and stored role so we can see if a redirect occurred
  cy.window({ log: false }).then((w) => {
    try {
      const path = w.location && w.location.pathname;
      const title = w.document && w.document.title;
      const role = w.localStorage && w.localStorage.getItem('colleco.sidebar.role');
      cy.task('log', ['[DIAG]', `path=${path}`, `title=${title}`, `storedRole=${role}`]);
    } catch (e) { cy.task('log', ['[DIAG_ERROR]', String(e)]) }
  });

  // Wait for the AI textarea to appear and scope interactions from it (robust across admin/client layouts)
  cy.get('textarea', { timeout: 60000 }).first().should('be.visible').then(($ta) => {
    // prefer locating the surrounding ai-panel container if present
    const panel = $ta.closest('.ai-panel') || $ta.closest('section') || $ta.parentElement;
    cy.wrap(panel).as('aiPanel');
  });

  // Type prompt with a small delay to mimic real typing (and avoid flaky instant-change handlers)
  cy.get('@aiPanel').find('textarea').first().should('be.visible').and('not.be.disabled').clear().type('Family trip to Cape Town for 3 nights, beach and food', { delay: 15 });

  // choose single mode and generate
  cy.get('@aiPanel').find('input[name="aimode"][value="single"]').should('be.visible').and('not.be.disabled').check({ force: true });
  cy.get('@aiPanel').contains('Generate').should('be.visible').and('not.be.disabled').click();
  cy.wait('@generate', { timeout: 30000 }).then((interception) => {
    // Ensure the stubbed response reached the app and has the expected shape
    expect(interception.response).to.exist;
    expect(interception.response.statusCode).to.eq(200);
    expect(interception.response.body).to.have.property('data');
    const data = interception.response.body.data;
    expect(data).to.have.property('itinerary');
    expect(data.itinerary).to.have.length.greaterThan(0);
    // Log the intercepted body to Cypress runner output for debugging
    cy.log('INTERCEPTED_BODY', JSON.stringify(interception.response.body));
    // Dump the current page HTML to Node logs to inspect rendered output
    cy.document().then((doc) => {
      const html = (doc && doc.documentElement && doc.documentElement.outerHTML) ? doc.documentElement.outerHTML.slice(0, 20000) : '<no-doc>';
      cy.task('log', ['[DOM_DUMP_START]', html, '[DOM_DUMP_END]']);
      // Forward captured console lines if present
      cy.window({ log: false }).then((w) => {
        try { if (w.__capturedConsole && w.__capturedConsole.length) cy.task('log', ['[BROWSER_CONSOLE]', JSON.stringify(w.__capturedConsole.slice(0,200))]); } catch(e){}
      });
    });
    // Extra debug: list H2 headings and Plan section HTML if present
    cy.document().then((doc) => {
      try {
        const hs = Array.from(doc.querySelectorAll('h2')).map(h => h.textContent && h.textContent.trim());
        cy.task('log', ['[HEADINGS]', JSON.stringify(hs)]);
        const planH = Array.from(doc.querySelectorAll('h2')).find(h => /Plan/i.test(h.textContent || ''));
        if (planH) {
          const sec = planH.closest('section');
          cy.task('log', ['[PLAN_SECTION_HTML]', sec ? sec.outerHTML.slice(0,2000) : '<no-section>']);
        } else {
          cy.task('log', ['[PLAN_SECTION_HTML]', '<no-plan-heading>']);
        }
      } catch(e) { cy.task('log', ['[HEADINGS_ERROR]', String(e)]); }
    });
  });
  // Ensure plan and pricing panels show results (these are satisfied by the stub)
  cy.contains(/Plan/i, { timeout: 30000 }).should('be.visible');
  cy.contains(/Pricing/i, { timeout: 30000 }).should('be.visible');

  // Debug: inspect the Plan panel DOM after it is visible to see if items were rendered
  cy.contains(/^Plan/i, { timeout: 15000 }).closest('section').find('ol', { timeout: 10000 }).then($ol => {
    if ($ol.length === 0) {
      cy.log('PLAN_OL_NOT_FOUND');
    } else {
      cy.log('PLAN_HTML', $ol.prop('outerHTML'));
      cy.log('PLAN_ITEM_COUNT', $ol.find('li').length);
    }
  });

  // More robust: assert the stubbed plan items and price are rendered
  // More robust: assert the stubbed plan items and price are rendered
  cy.contains('Arrival & Beach', { timeout: 10000 }).should('be.visible');
  cy.contains('City Food Tour', { timeout: 10000 }).should('be.visible');
  // Assert subtotal/total number from stubbed response (550)
  cy.contains(/550/).should('exist');

  // Upload draft via stubbed endpoint
  cy.get('@aiPanel').contains('Upload Draft').should('be.visible').and('not.be.disabled').click();
  cy.wait('@upload', { timeout: 15000 }).its('response.statusCode').should('eq', 201);

  // Confirm UI shows uploaded message
  cy.contains('Draft stored on server', { timeout: 10000 }).should('be.visible');
  });
});
