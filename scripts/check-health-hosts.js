const http = require('http');
const hosts = ['localhost','127.0.0.1','::1'];
const port = 4010;
function get(host){
  return new Promise(res=>{
    const urlHost = host.includes(':') ? `[${host}]` : host;
    const url = `http://${urlHost}:${port}/health`;
    const req = http.get(url, r=>{
      let body='';
      r.on('data', c=> body += c);
      r.on('end', ()=> res({ host, statusCode: r.statusCode, body }));
    });
    req.on('error', e => res({ host, error: e.message, stack: e.stack }));
    req.setTimeout(3000, ()=>{
      req.abort();
      res({ host, error: 'timeout' });
    });
  });
}
(async ()=>{
  for(const h of hosts){
    const r = await get(h);
    console.log(JSON.stringify(r));
  }
})();
