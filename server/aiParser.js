/**
 * Lightweight heuristic parser for travel itinerary prompts (AI MVP placeholder).
 * This is designed to be deterministic, side‑effect free, and easily swappable with
 * a future LLM-backed implementation while keeping the output contract stable.
 *
 * Input: raw natural language prompt describing a desired trip.
 * Output fields:
 *  - destinations: [string]
 *  - startDate: ISO date string | null
 *  - endDate: ISO date string | null
 *  - nights: number (>=1)
 *  - travelers: { adults: number, children: number }
 *  - budget: { currency: string, amount: number|null, perPerson: boolean }
 *  - interests: [string]
 *  - notes: string (sanitized trimmed copy of original for traceability)
 */

const CURRENCY_SYMBOLS = {
  '$': 'USD', '€': 'EUR', '£': 'GBP', 'R': 'ZAR', '¥': 'JPY'
};

const INTEREST_KEYWORDS = [
  'beach','museum','food','cuisine','adventure','luxury','relax','culture','nightlife','hiking','family','romantic','history','art','shopping'
];

// Very small destination lexicon (extendable). Real system would query geo DB.
const DESTINATION_LEXICON = [
  'paris','rome','london','barcelona','new york','new york city','tokyo','kyoto','bali','cape town','dubai','singapore','lisbon','amsterdam','prague','sydney','melbourne','vancouver','toronto','mexico city','cancun','madrid','venice','florence'
];

const DATE_RANGE_REGEX = /(\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\s*(?:to|-|through|–|—)\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i;
const SINGLE_DATE_REGEX = /(on|starting|from)\s+(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i;
const DURATION_REGEX = /(\b\d{1,2})\s*(?:nights?|days?)\b/i;
const TRAVELERS_REGEX = /(\b\d{1,2})\s*(?:adults?)\b(?:[^\d]{0,20}(\d{1,2})\s*(?:kids?|children))?/i;
const BUDGET_SYMBOL_REGEX = /([$€£R¥])\s?([\d,.]{2,})/;
const BUDGET_CODE_REGEX = /(USD|EUR|GBP|ZAR|JPY|CAD|AUD)\s*([\d,.]{2,})/i;
const PER_PERSON_REGEX = /per\s*(person|adult|head)/i;

function parseNumber(str) {
  if (!str) return null; const n = Number(str.replace(/[,]/g,'')); return isFinite(n) ? n : null;
}

function toISO(dateStr) {
  const parts = dateStr.split(/[\/\-.]/).map(p=>p.trim());
  if (parts.length < 3) return null;
  // Heuristic: if year is first vs last
  let [a,b,c] = parts;
  if (c.length === 2) { c = '20'+c; }
  // Assume formats: dd/mm/yyyy or mm/dd/yyyy -> choose if >12 implies day first
  const nA = Number(a), nB = Number(b);
  let year, month, day;
  if (nA > 12 && nB <= 12) { day = nA; month = nB; year = c; }
  else if (nB > 12 && nA <= 12) { day = nB; month = nA; year = c; }
  else { // ambiguous -> default to month=a
    month = nA; day = nB; year = c;
  }
  if (!month || !day) return null;
  try {
    const d = new Date(Date.UTC(Number(year), month-1, Number(day)));
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0,10);
  } catch { return null; }
}

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function extractDestinations(lower) {
  const found = new Set();
  for (const city of DESTINATION_LEXICON) {
    if (lower.includes(city)) found.add(titleCase(city));
  }
  // Also naive capitalized words heuristic (skip first word). Limit to 5.
  const capitalized = [...lower.matchAll(/\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*)\b/g)]
    .map(m=>m[1])
    .filter(w=>w.length <= 40);
  for (const c of capitalized) {
    if (found.size >= 5) break;
    if (!found.has(c) && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(c)) found.add(c);
  }
  return [...found].slice(0,5);
}

function extractInterests(lower) {
  const hits = new Set();
  for (const k of INTEREST_KEYWORDS) if (lower.includes(k)) hits.add(k);
  return [...hits];
}

function extractBudget(text) {
  let currency = 'USD', amount = null;
  let m = text.match(BUDGET_SYMBOL_REGEX);
  if (m) { currency = CURRENCY_SYMBOLS[m[1]] || 'USD'; amount = parseNumber(m[2]); }
  else {
    m = text.match(BUDGET_CODE_REGEX);
    if (m) { currency = m[1].toUpperCase(); amount = parseNumber(m[2]); }
  }
  const perPerson = PER_PERSON_REGEX.test(text);
  return { currency, amount, perPerson };
}

function buildItinerary(destinations, nights, interests) {
  const days = [];
  for (let i=1;i<=nights;i++) {
    const dest = destinations[i-1] || destinations[destinations.length-1] || 'Destination';
    const activities = [];
    if (interests.includes('food')) activities.push('Local culinary tour');
    if (interests.includes('museum')||interests.includes('art')||interests.includes('history')) activities.push('Cultural site visit');
    if (interests.includes('beach')) activities.push('Relax at the beach');
    if (interests.includes('adventure')||interests.includes('hiking')) activities.push('Outdoor adventure');
    if (activities.length === 0) activities.push('Leisure & exploration');
    days.push({ day: i, title: `Day ${i} - ${dest}`, destination: dest, activities });
  }
  return days;
}

function roughPricing(nights, travelers, budget) {
  // Basic heuristic: base per-night-per-adult 150, child 60% of adult
  const basePerNightAdult = 150;
  const basePerNightChild = Math.round(basePerNightAdult * 0.6);
  const lodging = (travelers.adults * basePerNightAdult + travelers.children * basePerNightChild) * nights;
  const activities = Math.round(lodging * 0.25);
  const food = Math.round(lodging * 0.35);
  const total = lodging + activities + food;
  // If user specified a budget lower than heuristic total, scale components proportionally
  let scale = 1;
  if (budget.amount && budget.amount < total) scale = budget.amount / total;
  const scaled = (v)=>Math.round(v * scale);
  return {
    currency: budget.currency,
    total: scaled(total),
    breakdown: {
      lodging: scaled(lodging),
      activities: scaled(activities),
      food: scaled(food)
    },
    note: scale < 1 ? 'Scaled to fit stated budget' : 'Heuristic estimate'
  };
}

function titleCase(str) {
  return str.replace(/\b([a-z])/g, c=>c.toUpperCase());
}

/**
 * Parse a natural language trip request.
 * @param {string} prompt
 * @returns Parsed structure
 */
function parsePrompt(prompt) {
  const original = (prompt||'').toString().trim();
  if (!original) return { error: 'empty_prompt' };
  const text = original.replace(/\s+/g,' ').trim();
  const lower = text.toLowerCase();

  let startDate = null, endDate = null; let nights = 0;
  let m = text.match(DATE_RANGE_REGEX);
  if (m) {
    startDate = toISO(m[1]);
    endDate = toISO(m[2]);
    if (startDate && endDate) {
      const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
      if (diff >= 0 && diff <= 60) nights = diff || 1;
    }
  } else if ((m = text.match(SINGLE_DATE_REGEX))) {
    startDate = toISO(m[2]);
  }
  if (!nights) {
    m = text.match(DURATION_REGEX);
    if (m) nights = clamp(Number(m[1]) || 0, 1, 30);
  }
  if (!nights) nights = 5; // default fallback

  let adults = 2, children = 0;
  m = text.match(TRAVELERS_REGEX);
  if (m) {
    adults = clamp(Number(m[1])||2,1,20); children = clamp(Number(m[2])||0,0,10);
  }

  const budget = extractBudget(text);
  const interests = extractInterests(lower);
  const destinations = extractDestinations(text.replace(/\n/g,' '));

  const itinerary = buildItinerary(destinations, nights, interests);
  const pricing = roughPricing(nights, { adults, children }, budget);

  return {
    original,
    destinations,
    startDate,
    endDate,
    nights,
    travelers: { adults, children },
    budget,
    interests,
    itinerary,
    pricing,
    meta: { heuristic: true, version: 1 }
  };
}

// --- Flight intent parsing (basic heuristic) ---
function toHHmm(str){
  if(!str) return null;
  let s = str.trim().toLowerCase();
  const ampm = /(am|pm)$/i.test(s) ? s.slice(-2) : '';
  s = s.replace(/\s*(am|pm)$/i,'');
  let h=0,m=0;
  if(/^\d{1,2}:\d{2}$/.test(s)){ const [hh,mm] = s.split(':'); h=Number(hh); m=Number(mm); }
  else if(/^\d{1,2}$/.test(s)){ h=Number(s); m=0; }
  else return null;
  if(ampm){ if(ampm==='pm' && h<12) h+=12; if(ampm==='am' && h===12) h=0; }
  if(h<0||h>23||m<0||m>59) return null;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function relativeDate(keyword){
  const now = new Date();
  if(keyword==='today') return now.toISOString().slice(0,10);
  if(keyword==='tomorrow') return new Date(now.getTime()+86400000).toISOString().slice(0,10);
  return null;
}

function nextWeekendRange(baseDate=new Date()){
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const day = d.getDay(); // 0 Sun .. 6 Sat
  // upcoming Saturday and Sunday
  const daysUntilSat = (6 - day + 7) % 7 || 6; // ensure at least upcoming
  const sat = new Date(d.getTime() + daysUntilSat*86400000);
  const sun = new Date(sat.getTime() + 1*86400000);
  const toISO10 = (x)=> new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())).toISOString().slice(0,10);
  return { start: toISO10(sat), end: toISO10(sun), nights: 1 };
}

const AIRPORT_ALIASES = {
  'durban': { city:'Durban', code:'DUR' },
  'dbn': { city:'Durban', code:'DUR' },
  'king shaka': { city:'Durban', code:'DUR' },
  'johannesburg': { city:'Johannesburg', code:'JNB' },
  'joburg': { city:'Johannesburg', code:'JNB' },
  'jozi': { city:'Johannesburg', code:'JNB' },
  'jhb': { city:'Johannesburg', code:'JNB' },
  'cape town': { city:'Cape Town', code:'CPT' },
  'cpt': { city:'Cape Town', code:'CPT' },
  'port elizabeth': { city:'Gqeberha', code:'PLZ' },
  'gqeberha': { city:'Gqeberha', code:'PLZ' },
  'dur': { city:'Durban', code:'DUR' },
  'jnb': { city:'Johannesburg', code:'JNB' }
};

function resolveAirport(token){
  const t = token.toLowerCase().trim();
  if(AIRPORT_ALIASES[t]) return AIRPORT_ALIASES[t];
  // try split words to join
  const norm = t.replace(/\s+/g,' ');
  if(AIRPORT_ALIASES[norm]) return AIRPORT_ALIASES[norm];
  // uppercase 3 letter code
  if(/^[a-z]{3}$/i.test(t)){
    const code = t.toUpperCase();
    for(const k in AIRPORT_ALIASES){ if(AIRPORT_ALIASES[k].code===code) return AIRPORT_ALIASES[k]; }
    return { city: code, code };
  }
  // fallback: title case city without code
  return { city: titleCase(t), code: undefined };
}

function parseFlightRequest(prompt){
  const original = (prompt||'').toString().trim();
  if(!original) return { error:'empty_prompt' };
  const text = original.replace(/\s+/g,' ').trim();
  const lower = text.toLowerCase();
  if(!/\bflight(s)?\b/.test(lower)) return { error:'not_flight_intent' };
  // extract from-to
  const ft = lower.match(/from\s+([^]+?)\s+to\s+([^]+?)(?:\s+(?:for|on|at|tomorrow|today|next|this)\b|$)/i);
  let from=null,to=null;
  if(ft){
    from = resolveAirport(ft[1].replace(/\s+(?:for|on|at|tomorrow|today|next|this).*$/i,'').trim());
    to = resolveAirport(ft[2].trim());
  }
  // date
  let date = null;
  const rel = lower.match(/\b(today|tomorrow)\b/);
  if(rel){ date = relativeDate(rel[1]); }
  if(!date){
    const m = text.match(SINGLE_DATE_REGEX) || text.match(DATE_RANGE_REGEX);
    if(m){ const ds = m[2] ? m[1] : m[2] || m[1]; date = toISO(ds); }
  }
  if(!date){ date = relativeDate('tomorrow'); }
  // time
  let time = null; const tm = lower.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/);
  if(tm){ time = toHHmm(tm[1]); }
  // return date/time
  let returnDate = null; let returnTime = null;
  const rrel = lower.match(/\breturn\b.*\b(today|tomorrow)\b/);
  if(rrel){ returnDate = relativeDate(rrel[1]); }
  if(!returnDate){
    const rm = text.match(/return[^\d]*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
    if(rm){ returnDate = toISO(rm[1]); }
  }
  const rtm = lower.match(/\breturn\b[^\d]*at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/);
  if(rtm){ returnTime = toHHmm(rtm[1]); }
  // pax and cabin heuristics
  const paxM = lower.match(/(\d+)\s*(?:passengers?|pax|adults?)/);
  const pax = paxM ? Math.max(1,Math.min(9,Number(paxM[1]))) : 1;
  const cabin = /business|first|premium/.test(lower) ? (lower.match(/business|first|premium/)[0]) : 'economy';
  return { original, from, to, date, time, pax, cabin, returnDate, returnTime };
}

// --- Unified intent parsing ---
function words(t){ return (t||'').toLowerCase(); }
function matchAny(t, arr){ const s = words(t); return arr.some(k=> s.includes(k)); }
function toInt(v, d=0){ const n = parseInt(v,10); return isFinite(n)? n : d; }

function extractCityFromText(text){
  // Prefer explicit preposition pattern and stop at common delimiters/stop-words
  const pre = /\b(?:in|near|around|at)\s+([A-Z][A-Za-z'’\-]+(?:\s+[A-Z][A-Za-z'’\-]+)*)(?=\s+(?:for|on|at|from|to|with|during|this|next|tomorrow|today|\d)|[,.!?]|$)/;
  const m = text.match(pre);
  if(m){ return titleCase(m[1].trim()); }
  // Fallback to destination extraction, but trim trailing stop-words like "On/At/For"
  const dests = extractDestinations(text);
  if(dests && dests.length){
    const STOP = new Set(['On','At','For','To','From','This','Next','Near','Around']);
    const parts = dests[0].split(/\s+/);
    while(parts.length>1 && STOP.has(parts[parts.length-1])) parts.pop();
    return parts.join(' ');
  }
  return null;
}

function extractDateRange(text){
  let checkIn=null, checkOut=null, nights=null;
  let m = text.match(DATE_RANGE_REGEX);
  if(m){ checkIn = toISO(m[1]); checkOut = toISO(m[2]); if(checkIn && checkOut){ const diff=(new Date(checkOut)-new Date(checkIn))/86400000; nights = diff>0? diff : null; } }
  if(!checkIn){
    m = text.match(SINGLE_DATE_REGEX);
    if(m){ checkIn = toISO(m[2]); }
  }
  // Relative phrases
  const s = words(text);
  if(!checkIn){
    if(/\bnext\s+weekend\b|\bthis\s+weekend\b/.test(s)){
      const rng = nextWeekendRange(); checkIn = rng.start; checkOut = rng.end; nights = rng.nights;
    } else if(/\btonight\b/.test(s)){
      checkIn = relativeDate('today');
    } else if(/\btomorrow\b/.test(s)){
      checkIn = relativeDate('tomorrow');
    }
  }
  if(!nights){
    m = text.match(DURATION_REGEX);
    if(m){ nights = clamp(Number(m[1])||0,1,30); }
  }
  return { checkIn, checkOut, nights };
}

function extractGuests(text){
  const m = text.match(TRAVELERS_REGEX);
  let adults=2, children=0;
  if(m){ adults = clamp(Number(m[1])||2,1,20); children = clamp(Number(m[2])||0,0,10); }
  return { adults, children };
}

function extractStars(text){
  const s = words(text);
  const m = s.match(/(\b[1-5])\s*\-*\s*star/);
  if(m){ return toInt(m[1], null); }
  return null;
}

function extractVehicleClass(text){
  const s = words(text);
  if(/suv/.test(s)) return 'SUV';
  if(/mini\b|compact/.test(s)) return 'Compact';
  if(/sedan/.test(s)) return 'Sedan';
  if(/van|people carrier|mpv/.test(s)) return 'Van';
  return null;
}

function parseItineraryOps(text){
  const s = words(text);
  const ops = [];
  if(/\bextend\b/.test(s) || /add\s+\d+\s*(night|day)/.test(s)){
    const m = s.match(/add\s+(\d+)\s*(night|day)/); const delta = m? toInt(m[1],1):1; ops.push({ op:'extend', nightsDelta: delta });
  }
  if(/\bshorten\b/.test(s) || /remove\s+\d+\s*(night|day)/.test(s)){
    const m = s.match(/remove\s+(\d+)\s*(night|day)/); const delta = m? toInt(m[1],1):1; ops.push({ op:'shorten', nightsDelta: delta });
  }
  if(/swap\s+.*\s+for\s+.*/.test(s)){
    const m = text.match(/swap\s+([^]+?)\s+for\s+([^]+?)(?:\.|$)/i);
    if(m){ ops.push({ op:'swapDestination', from: m[1].trim(), to: m[2].trim() }); }
  }
  if(/(increase|raise)\s+budget/.test(s)){
    const m = text.match(/(increase|raise)\s+budget\s+by\s+(\d+)%/i); const pct = m? toInt(m[2],10):10; ops.push({ op:'adjustBudget', percent: +pct });
  }
  if(/(decrease|reduce|lower)\s+budget/.test(s)){
    const m = text.match(/(decrease|reduce|lower)\s+budget\s+by\s+(\d+)%/i); const pct = m? toInt(m[2],10):10; ops.push({ op:'adjustBudget', percent: -pct });
  }
  return ops;
}

function parseQuoteOps(text){
  const s = words(text);
  // create a quote / new quote / make a quotation / generate estimate
  if(/\b(create|make|generate|prepare|new)\s+(?:a\s+)?(quote|quotation|estimate)\b/.test(s)) return [{ op:'create' }];
  if(/\badd\b.+\b(quote|quotation|estimate)\b/.test(s)){
    const m = text.match(/add\s+(.+?)\s+to\s+(?:my\s+)?(?:quote|quotation|estimate)/i); const title = m? m[1].trim(): 'Custom Item';
    return [{ op:'addItem', item: { title, unitPrice: 0, quantity: 1 } }];
  }
  return [];
}

function parseIntent(prompt){
  const original = (prompt||'').toString().trim();
  if(!original) return { error:'empty_prompt' };
  const intents = [];
  const nearMe = /\bnear\s+me\b|\bnearby\b|\baround\s+me\b|\bclose\s+by\b|\bclosest\b/i.test(original);
  // Flight detection via existing util
  try {
    const f = parseFlightRequest(original);
    if(!f.error){ intents.push({ type:'flight_search', ...f }); }
  } catch {}
  // Hotel
  if(matchAny(original, ['hotel','accommodation','lodging','guesthouse','guest house','bnb','resort','stay'])){
    const city = extractCityFromText(original);
    const { checkIn, checkOut, nights } = extractDateRange(original);
    const guests = extractGuests(original);
    const budget = extractBudget(original);
    const stars = extractStars(original);
    intents.push({ type:'hotel_search', city, checkIn, checkOut, nights, guests, budget, stars, amenities: [], nearMe });
  }
  // Car rental
  if(matchAny(original, ['car hire','car rental','rent a car','hire a car','rental car'])){
    const pickupCity = extractCityFromText(original);
    const { checkIn, checkOut } = extractDateRange(original);
    // time parsing
    const tm = original.toLowerCase().match(/\b(?:at|pickup\s+at)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/);
    const pickupTime = tm ? toHHmm(tm[1]) : null;
    const retm = original.toLowerCase().match(/\breturn\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/);
    const returnTime = retm ? toHHmm(retm[1]) : null;
    const vehicleClass = extractVehicleClass(original);
    intents.push({ type:'car_rental', pickupCity, returnCity: pickupCity, pickupDate: checkIn, returnDate: checkOut, pickupTime, returnTime, vehicleClass, nearMe });
  }
  // Activities
  if(matchAny(original, ['activity','activities','tour','tickets','museum','hike','safari','wine tasting','things to do'])){
    const city = extractCityFromText(original);
    const { checkIn, checkOut } = extractDateRange(original);
    intents.push({ type:'activity_search', city, startDate: checkIn, endDate: checkOut, category: null, groupSize: null, nearMe });
  }
  // Dining / Restaurants
  if(matchAny(original, ['dining','restaurant','restaurants','eat','food','cafe','cafes','bar','bars'])){
    const city = extractCityFromText(original);
    const { checkIn } = extractDateRange(original);
    const tm = original.toLowerCase().match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/);
    const time = tm ? toHHmm(tm[1]) : null;
    const budget = extractBudget(original);
    intents.push({ type:'dining_search', city, date: checkIn, time, budget, nearMe });
  }
  // Transfers / Shuttle
  if(matchAny(original, ['transfer','transfers','shuttle','pickup','dropoff','airport transfer','airport shuttle'])){
    const city = extractCityFromText(original);
    const { checkIn } = extractDateRange(original);
    const tm = original.toLowerCase().match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/);
    const time = tm ? toHHmm(tm[1]) : null;
    intents.push({ type:'transfer_request', city, date: checkIn, time, nearMe });
  }
  // Events
  if(matchAny(original, ['event','events','concert','festival','exhibition','expo','show'])){
    const city = extractCityFromText(original);
    const { checkIn, checkOut } = extractDateRange(original);
    intents.push({ type:'event_search', city, startDate: checkIn, endDate: checkOut, nearMe });
  }
  // Visa / Insurance help
  if(matchAny(original, ['visa','schengen','e-visa','passport'])){
    intents.push({ type:'visa_help', original, nearMe });
  }
  if(matchAny(original, ['insurance','travel insurance','medical cover'])){
    intents.push({ type:'insurance_help', original, nearMe });
  }
  // Itinerary ops
  const ops = parseItineraryOps(original);
  if(ops.length){ intents.push({ type:'itinerary_ops', ops }); }
  // Quote ops
  const qops = parseQuoteOps(original);
  if(qops.length){ intents.push({ type:'quote_ops', ops: qops }); }
  if(!intents.length) return { error:'no_intent_detected' };
  return { original, intents };
}

module.exports = { parsePrompt, buildItinerary, roughPricing, parseFlightRequest, parseIntent };
