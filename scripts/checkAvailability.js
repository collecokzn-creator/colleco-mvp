(async ()=>{
  try{
    const start='2025-10-21';
    const end='2025-10-22';
    const url = `http://localhost:4001/api/accommodation/availability?roomType=testroom&startDate=${start}&endDate=${end}`;
    const res = await fetch(url);
    const j = await res.json();
    console.log('status', res.status);
    console.log(JSON.stringify(j, null, 2));
  }catch(e){ console.error(e); process.exit(1); }
})();
