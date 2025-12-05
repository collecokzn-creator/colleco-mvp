describe('Debug mobile navbar', () => {
  it('captures navbar content on mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/', {
      timeout: 120000,
      failOnStatusCode: false,
      onBeforeLoad(win) {
        try { 
          win.__E2E__ = true; 
          win.localStorage.setItem('colleco.sidebar.role', JSON.stringify('client')); 
        } catch (e) {}
      }
    });

    cy.get('nav', { timeout: 10000 }).then(nav => {
      // Get all text content in the navbar
      const navText = nav.text();
      const navHTML = nav.html();
      
      cy.task('log', `=== NAVBAR TEXT CONTENT ===\n${navText}`);
      cy.task('log', `=== NAVBAR HTML ===\n${navHTML.substring(0, 5000)}`);
      
      // Check for "Book Now"
      if (navText.includes('Book Now')) {
        cy.task('log', '❌ Found "Book Now" in navbar text');
      } else {
        cy.task('log', '✓ "Book Now" NOT found in navbar text');
      }
      
      // Check for /book links
      const bookLinks = nav.find('a[href*="/book"]');
      cy.task('log', `Links with /book: ${bookLinks.length}`);
      if (bookLinks.length > 0) {
        cy.task('log', `❌ Found /book links: ${bookLinks.map((i, el) => el.href).get()}`);
      } else {
        cy.task('log', '✓ No /book links in navbar');
      }
    });
  });
});
