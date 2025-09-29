// Session-oriented AI helpers
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';
function withAuth(headers = {}){
  const h = { ...headers };
  if (API_TOKEN) h['Authorization'] = `Bearer ${API_TOKEN}`;
  return h;
}

export async function startSession(prompt){
  const res = await fetch(`${API_BASE}/api/ai/session`, { method:'POST', headers: withAuth({'Content-Type':'application/json'}), body: JSON.stringify({ prompt }) });
  if(!res.ok){ let e='Session start failed'; try{const j=await res.json(); e=j.error||e;}catch{} throw new Error(e); }
  return res.json();
}

export async function refineSession(id, instructions){
  const res = await fetch(`${API_BASE}/api/ai/session/${id}/refine`, { method:'POST', headers: withAuth({'Content-Type':'application/json'}), body: JSON.stringify({ instructions }) });
  if(!res.ok){ let e='Session refine failed'; try{const j=await res.json(); e=j.error||e;}catch{} throw new Error(e); }
  const data = await res.json();
  return data.data;
}

export async function uploadDraft(prompt, data){
  const res = await fetch(`${API_BASE}/api/ai/draft`, { method:'POST', headers: withAuth({'Content-Type':'application/json'}), body: JSON.stringify({ prompt, data }) });
  if(!res.ok){ let e='Upload failed'; try{const j=await res.json(); e=j.error||e;}catch{} throw new Error(e); }
  return res.json();
}

export async function fetchSession(id){
  const res = await fetch(`${API_BASE}/api/ai/session/${id}`, { headers: withAuth() });
  if(!res.ok){ let e='Fetch session failed'; try{const j=await res.json(); e=j.error||e;}catch{} throw new Error(e); }
  return res.json();
}
