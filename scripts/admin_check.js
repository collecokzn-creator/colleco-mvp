(async ()=>{
  try{
    const startDate = new Date(); startDate.setDate(startDate.getDate()+3);
    const endDate = new Date(); endDate.setDate(endDate.getDate()+5);
    const fmt = (d)=>d.toISOString().slice(0,10);
    const sd = fmt(startDate), ed = fmt(endDate);
  if (!process.env.CI) process.stdout.write('dates ' + sd + ' ' + ed + '\n');
    let res = await fetch('http://localhost:4001/api/accommodation/inventory', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomTypes: { testroom: { total: 2, price: 100 } } }) });
  if (!process.env.CI) process.stdout.write('PUT status ' + res.status + '\n');
  const body = await res.json(); if (!process.env.CI) process.stdout.write('PUT body ' + JSON.stringify(body) + '\n');
    res = await fetch(`http://localhost:4001/api/accommodation/availability?roomType=testroom&startDate=${sd}&endDate=${ed}`);
  if (!process.env.CI) process.stdout.write('AV status ' + res.status + '\n');
  const ab = await res.json(); if (!process.env.CI) process.stdout.write('AV body ' + JSON.stringify(ab) + '\n');
  }catch(e){ console.error(e); process.exit(1); }
})();
