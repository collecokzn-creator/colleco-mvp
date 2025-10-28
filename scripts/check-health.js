const http = require('http');
const urls = ['http://localhost:4010/health','http://localhost:5174/health'];
function get(url){
  return new Promise(res=>{
    const req = http.get(url, r=>{
      let body='';
      r.on('data', c=> body += c);
      r.on('end', ()=> res({ statusCode: r.statusCode, body }));
    });
    req.on('error', e => res({ error: e.message }));
    req.setTimeout(5000, ()=>{
      req.abort();
      res({ error: 'timeout' });
    });
  });
}
(async ()=>{
  const a = await get(urls[0]);
  const p = await get(urls[1]);
  console.log('API:', JSON.stringify(a));
  console.log('PREVIEW:', JSON.stringify(p));
  if(a && a.statusCode === 200 && p && p.statusCode === 200) process.exit(0);
  process.exit(2);
})();
