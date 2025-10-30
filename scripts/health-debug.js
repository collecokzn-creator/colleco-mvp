const http = require('http');
const targets = [
  { host: 'localhost', port: 4000, path: '/health' },
  { host: '127.0.0.1', port: 4000, path: '/health' },
  { host: '::1', port: 4000, path: '/health' },
  { host: 'localhost', port: 5173, path: '/health' },
  { host: '127.0.0.1', port: 5173, path: '/health' },
  { host: '::1', port: 5173, path: '/health' }
];

function probe(t){
  return new Promise(resolve => {
    const opts = { hostname: t.host, port: t.port, path: t.path, method: 'GET', timeout: 5000 };
    const req = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', ()=> resolve({ target: t, ok: res.statusCode === 200, statusCode: res.statusCode, body: body.trim() }));
    });
    req.on('error', err => resolve({ target: t, error: err.message, code: err.code }));
    req.on('timeout', ()=> { req.destroy(); resolve({ target: t, error: 'timeout' }); });
    req.end();
  });
}

(async ()=>{
  console.log('Probing targets...');
  for(const t of targets){
    const r = await probe(t);
    const name = `${t.host}:${t.port}${t.path}`;
    if(r.ok) console.log(`OK  ${name} -> ${r.statusCode} ${r.body}`);
    else if(r.error) console.log(`ERR ${name} -> ${r.error}${r.code?(' ('+r.code+')'):''}`);
    else console.log(`UNK ${name} -> status=${r.statusCode}`);
  }
  // Summary for main endpoints
  const apiOk = (await probe({ host: 'localhost', port: 4000, path: '/health' })).ok;
  const prevOk = (await probe({ host: 'localhost', port: 5173, path: '/health' })).ok;
  if(apiOk && prevOk){ console.log('\nHEALTH_OK'); process.exit(0); }
  console.log('\nHEALTH_FAIL'); process.exit(2);
})();
