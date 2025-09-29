// Quick local smoke test for events endpoints
// Usage: node server/scripts/smoke-events.mjs

const BASE = process.env.BASE || 'http://localhost:4000';

async function jget(path){
  const u = BASE + path;
  const r = await fetch(u);
  if(!r.ok) throw new Error(`${path} -> HTTP ${r.status}`);
  return r.json();
}

(async () => {
  try {
    const health = await jget('/health');
    console.log('health:', health);
    const prov = await jget('/api/providers');
    console.log('providers:', prov);
    const evDemo = await jget('/api/events/search?country=ZA&demo=1&limit=3');
    console.log('events(demo): page', evDemo.page, 'count', (evDemo.events||[]).length, 'total', evDemo.total, 'hasMore', evDemo.hasMore);
    const evDemo2 = await jget('/api/events/search?country=ZA&demo=1&page=2&limit=3');
    console.log('events(demo, page2):', (evDemo2.events||[]).map(e=>e.name));
  } catch(e){
    console.error('Smoke test failed:', e.message);
    process.exit(1);
  }
})();
