// Hybrid LLM adapter with env-driven providers. Defaults to a safe stub when no keys provided.
// Supported providers:
// - OpenAI: set OPENAI_API_KEY and optional OPENAI_MODEL (default: gpt-4o-mini)
// - Azure OpenAI: set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT
// Optional cost estimation: LLM_COST_PER_1K_PROMPT, LLM_COST_PER_1K_COMPLETION (numbers)

const PROVIDER = (process.env.LLM_PROVIDER || '').toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';
const COST_PROMPT = parseFloat(process.env.LLM_COST_PER_1K_PROMPT || '0');
const COST_COMPLETION = parseFloat(process.env.LLM_COST_PER_1K_COMPLETION || '0');

function estimateCost(promptTokens, completionTokens){
  if(!isFinite(COST_PROMPT) || !isFinite(COST_COMPLETION)) return undefined;
  const cost = (promptTokens/1000)*COST_PROMPT + (completionTokens/1000)*COST_COMPLETION;
  return +cost.toFixed(6);
}

async function callOpenAIChat(model, messages, options={}){
  const ctrl = new AbortController();
  const t = setTimeout(()=> ctrl.abort(), options.timeoutMs || 10000);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model, messages, temperature: 0.2 }),
      signal: ctrl.signal
    });
    if(!res.ok){ throw new Error(`openai_error_${res.status}`); }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function callAzureOpenAIChat(deployment, messages, options={}){
  const ctrl = new AbortController();
  const t = setTimeout(()=> ctrl.abort(), options.timeoutMs || 10000);
  try {
    const url = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/,'')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({ messages, temperature: 0.2 }),
      signal: ctrl.signal
    });
    if(!res.ok){ throw new Error(`azure_openai_error_${res.status}`); }
    return await res.json();
  } finally { clearTimeout(t); }
}

function safeParseJsonText(s){
  if(!s) return null;
  // Extract JSON within fences if present
  const fence = s.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : s;
  try { return JSON.parse(raw); } catch { return null; }
}

async function enhanceWithRemoteLLM(parsed){
  const out = JSON.parse(JSON.stringify(parsed));
  if(!out.meta) out.meta = {};
  // Compose compact JSON instruction to keep responses deterministic
  const userPayload = {
    original: out.original,
    destinations: out.destinations,
    nights: out.nights,
    interests: out.interests,
    travelers: out.travelers,
    itinerary: (out.itinerary||[]).slice(0,3) // only send a small subset to limit tokens
  };
  const messages = [
    { role: 'system', content: 'You write concise travel summaries for draft itineraries. Respond ONLY with JSON: {"summary": string, "highlight": string }.' },
    { role: 'user', content: `Itinerary draft:\n${JSON.stringify(userPayload)}` }
  ];
  let resp;
  if((PROVIDER==='openai' || (!PROVIDER && OPENAI_API_KEY)) && OPENAI_API_KEY){
    resp = await callOpenAIChat(OPENAI_MODEL, messages);
  } else if((PROVIDER==='azure-openai' || (!PROVIDER && AZURE_OPENAI_API_KEY)) && AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_API_KEY && AZURE_OPENAI_DEPLOYMENT){
    resp = await callAzureOpenAIChat(AZURE_OPENAI_DEPLOYMENT, messages);
  } else {
    return null; // no remote provider configured
  }
  const choice = resp.choices && resp.choices[0];
  const content = choice && choice.message && choice.message.content;
  const j = safeParseJsonText(content) || {};
  if(j.summary) out.meta.summary = String(j.summary).slice(0, 400);
  if(Array.isArray(out.itinerary) && out.itinerary.length && j.highlight){
    const d0 = out.itinerary[0];
    if(Array.isArray(d0.activities)) d0.activities.push(String(j.highlight).slice(0, 140));
  }
  out.meta.llmEnhanced = true;
  // Token usage (if available)
  const u = resp.usage || {};
  const prompt = Number(u.prompt_tokens||0);
  const completion = Number(u.completion_tokens||0);
  const total = Number(u.total_tokens|| (prompt+completion));
  out.meta.tokenUsage = { prompt, completion, total };
  const cost = estimateCost(prompt, completion);
  if(typeof cost==='number' && isFinite(cost)) out.meta.estimatedCostUsd = cost;
  return out;
}

function enhanceWithStub(parsed){
  const out = JSON.parse(JSON.stringify(parsed));
  if(!out.meta) out.meta = {};
  const stamp = new Date().toISOString();
  const firstDest = out.destinations[0] || 'your destination';
  out.meta.summary = `A ${out.nights}-night outline focusing on ${out.interests.slice(0,3).join(', ') || 'core experiences'} starting in ${firstDest}. (stub @ ${stamp})`;
  if(out.itinerary && out.itinerary.length){
    const d0 = out.itinerary[0];
    if(d0.activities && !d0.activities.find(a=>a.includes('Curated Highlight'))){
      d0.activities.push('Curated Highlight: Local welcome walk with tasting');
    }
  }
  out.meta.llmEnhanced = true;
  // Conservative defaults when no provider: optional heuristic tokens
  const tokens = 150 + (out.nights||0)*15 + (out.interests||[]).length*8 + (out.itinerary? out.itinerary.reduce((a,d)=>a+(d.activities||[]).length,0)*3:0);
  out.meta.tokenUsage = { prompt: Math.round(tokens*0.4), completion: Math.round(tokens*0.6), total: tokens };
  const cost = estimateCost(out.meta.tokenUsage.prompt, out.meta.tokenUsage.completion);
  if(typeof cost==='number' && isFinite(cost)) out.meta.estimatedCostUsd = cost;
  return out;
}

module.exports = {
  async enhance(parsed){
    try {
      // Prefer remote provider if configured; fall back to stub
      const remote = await enhanceWithRemoteLLM(parsed);
      if(remote) return remote;
      return enhanceWithStub(parsed);
    } catch (e) {
      // Graceful fallback with error note
      const out = enhanceWithStub(parsed);
      out.meta.llmError = e.message || String(e);
      return out;
    }
  }
};
