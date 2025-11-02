(async ()=>{
  try{
    const startDate = new Date(); startDate.setDate(startDate.getDate()+3);
    const endDate = new Date(); endDate.setDate(endDate.getDate()+5);
    const fmt = (d)=>d.toISOString().slice(0,10);
    const sd = fmt(startDate), ed = fmt(endDate);
    console.log('dates', sd, ed);
    let res = await fetch('http://localhost:4001/api/accommodation/inventory', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomTypes: { testroom: { total: 2, price: 100 } } }) });
    console.log('PUT status', res.status);
    const body = await res.json(); console.log('PUT body', JSON.stringify(body));
    res = await fetch(`http://localhost:4001/api/accommodation/availability?roomType=testroom&startDate=${sd}&endDate=${ed}`);
    console.log('AV status', res.status);
    const ab = await res.json(); console.log('AV body', JSON.stringify(ab));
  }catch(e){ console.error(e); process.exit(1); }
})();
