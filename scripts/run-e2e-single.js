const { spawn } = require('child_process');
const httpServer = spawn('npx', ['http-server', 'dist', '-p', '5173', '-c-1'], { stdio: 'inherit', shell: true });

function killServer() {
  try { httpServer.kill(); } catch(e){}
}

process.on('SIGINT', killServer);
process.on('exit', killServer);

// Wait a moment for server to start
setTimeout(() => {
  const cypress = spawn('npx', ['cypress', 'run', '--spec', 'cypress/e2e/login_register_smoke.cy.js', '--config', 'baseUrl=http://127.0.0.1:5173'], { stdio: 'inherit', shell: true });
  cypress.on('exit', (code) => {
    killServer();
    process.exit(code);
  });
}, 1200);
