// Centralized search intent parsing for smart catalog and global search
// Contracts:
// - parseQuery(text, { products, myLocation? }) -> { category, location: {area|city|province|country|continent}, usedConnector?: string }
// - getSuggestion(text, ctx) -> { label, count, params } | null

const CATEGORY_SYNONYMS = [
  {
    cat: 'Lodging',
    keys: [
      'hotel','hotels','lodging','stay','accommodation','accomodation',
      'guesthouse','guest house','bnb','b&b','b and b','b-and-b',
      'resort','lodge','lodges','hostel','hostels','inn','self-catering','apartment','villa'
    ]
  },
  {
    cat: 'Dining',
    keys: [
      'food','restaurant','restaurants','eat','dining','cafe','cafes','bar','bars',
      'breakfast','brunch','lunch','dinner','eatery','coffee'
    ]
  },
  {
    cat: 'Activity',
    keys: [
      'things to do','activities','activity','adventure','attraction','attractions',
      'what to do','sightseeing','hike','hiking','walk','walking'
    ]
  },
  {
    cat: 'Tour',
    keys: [
      'tour','tours','safari','safaris','guided tour','day tour','multi-day tour',
      'day trip','daytrip','trip','guided'
    ]
  },
  { cat: 'Transport', keys: ['transport','transfer','transfers','shuttle','car hire','car rental','taxi','bus','ride','pickup','dropoff','airport transfer','airport shuttle'] },
  { cat: 'Experience', keys: ['experience','experiences','workshop','workshops','class','classes','lesson','lessons','course','courses'] },
];

// Common location aliases and abbreviations -> normalized location object
const LOCATION_ALIASES = new Map(Object.entries({
  // South Africa provinces
  'kzn': { province: 'KwaZulu-Natal' },
  'kwazulu natal': { province: 'KwaZulu-Natal' },
  'western cape': { province: 'Western Cape' },
  'wc': { province: 'Western Cape' },
  'eastern cape': { province: 'Eastern Cape' },
  'ec': { province: 'Eastern Cape' },
  'gauteng': { province: 'Gauteng' },
  'gp': { province: 'Gauteng' },
  'mpumalanga': { province: 'Mpumalanga' },
  'mp': { province: 'Mpumalanga' },
  'limpopo': { province: 'Limpopo' },
  'lp': { province: 'Limpopo' },
  'free state': { province: 'Free State' },
  'fs': { province: 'Free State' },
  'northern cape': { province: 'Northern Cape' },
  'nc': { province: 'Northern Cape' },
  'north west': { province: 'North West' },
  'nw': { province: 'North West' },
  // Cities colloquialisms & codes
  'durbs': { city: 'Durban' },
  'dbn': { city: 'Durban' },
  'dur': { city: 'Durban' },
  'ct': { city: 'Cape Town' },
  'cpt': { city: 'Cape Town' },
  'mother city': { city: 'Cape Town' },
  'joburg': { city: 'Johannesburg' },
  'jozi': { city: 'Johannesburg' },
  'jhb': { city: 'Johannesburg' },
  'jnb': { city: 'Johannesburg' },
  'umhlanga rocks': { city: 'Umhlanga' },
  'umhlanga': { city: 'Umhlanga' },
  // Regions/common phrases
  'south coast': { province: 'KwaZulu-Natal' },
  // Regions/common phrases
  'north coast': { province: 'KwaZulu-Natal' },
  'midlands': { province: 'KwaZulu-Natal' },
  'midlands meander': { province: 'KwaZulu-Natal' },
  'drakensberg': { province: 'KwaZulu-Natal' },
  'zululand': { area: 'Zululand' },
  'isimangaliso': { area: 'iSimangaliso Wetland Park' },
  'hluhluwe': { city: 'Hluhluwe' },
  'dolphin coast': { area: 'Dolphin Coast' },
  'sapphire coast': { area: 'Sapphire Coast' },
  'ballito': { city: 'Ballito' },
  'st lucia': { city: 'St Lucia' },
  'port shepstone': { city: 'Port Shepstone' },
  'margate': { city: 'Margate' },
  'scottburgh': { city: 'Scottburgh' },
  'amanzimtoti': { city: 'Amanzimtoti' },
  'pietermaritzburg': { city: 'Pietermaritzburg' },
  'pmb': { city: 'Pietermaritzburg' },
  // Eastern Cape regions and towns
  'garden route': { area: 'Garden Route' },
  'plettenberg bay': { city: 'Plettenberg Bay' },
  'plett': { city: 'Plettenberg Bay' },
  'knysna': { city: 'Knysna' },
  'mossel bay': { city: 'Mossel Bay' },
  'tsitsikamma': { area: 'Tsitsikamma' },
  'port elizabeth': { city: 'Port Elizabeth' },
  'gqeberha': { city: 'Port Elizabeth' },
  'pe': { city: 'Port Elizabeth' },
  'summerstrand': { area: 'Summerstrand' },
  'east london': { city: 'East London' },
  'el': { city: 'East London' },
  'jeffreys bay': { city: 'Jeffreys Bay' },
  'jbay': { city: 'Jeffreys Bay' },
  'hogsback': { city: 'Hogsback' },
  'coffee bay': { city: 'Coffee Bay' },
  'mthatha': { city: 'Mthatha' },
  'umtata': { city: 'Mthatha' },
  'wild coast': { area: 'Wild Coast' },
  // Western Cape regions
  'cape winelands': { area: 'Cape Winelands' },
  'winelands': { area: 'Cape Winelands' },
  'whale coast': { area: 'Whale Coast' },
  'overberg': { area: 'Overberg' },
  'overstrand': { area: 'Overstrand' },
  'cederberg': { area: 'Cederberg' },
  'west coast': { area: 'West Coast' },
  'karoo': { area: 'Karoo' },
  'klein karoo': { area: 'Klein Karoo' },
  'route 62': { area: 'Route 62' },
  'breede river valley': { area: 'Breede River Valley' },
  'breede valley': { area: 'Breede River Valley' },
  'cape peninsula': { area: 'Cape Peninsula' },
  'false bay': { area: 'False Bay' },
  'helderberg': { area: 'Helderberg' },
  'stellenbosch': { city: 'Stellenbosch' },
  'franschhoek': { city: 'Franschhoek' },
  'paarl': { city: 'Paarl' },
  'hermanus': { city: 'Hermanus' },
  'paternoster': { city: 'Paternoster' },
  'langebaan': { city: 'Langebaan' },
  // Additional Cape Town CBD/Atlantic Seaboard neighborhoods
  'bo-kaap': { area: 'Bo-Kaap' },
  'bokaap': { area: 'Bo-Kaap' },
  'de waterkant': { area: 'De Waterkant' },
  'gardens': { area: 'Gardens' },
  'tamboerskloof': { area: 'Tamboerskloof' },
  'oranjezicht': { area: 'Oranjezicht' },
  'vredehoek': { area: 'Vredehoek' },
  'fresnaye': { area: 'Fresnaye' },
  'bantry bay': { area: 'Bantry Bay' },
  'clifton': { area: 'Clifton' },
  // Cape Town suburbs & nearby
  'camps bay': { area: 'Camps Bay' },
  'sea point': { area: 'Sea Point' },
  'hout bay': { area: 'Hout Bay' },
  'constantia': { area: 'Constantia' },
  'newlands': { area: 'Newlands' },
  'rondebosch': { area: 'Rondebosch' },
  'green point': { area: 'Green Point' },
  'somerset west': { city: 'Somerset West' },
  'strand': { city: 'Strand' },
  "gordon's bay": { city: "Gordon's Bay" },
  'gordons bay': { city: "Gordon's Bay" },
  'bloubergstrand': { area: 'Bloubergstrand' },
  'table view': { area: 'Table View' },
  'melkbosstrand': { area: 'Melkbosstrand' },
  'durbanville': { city: 'Durbanville' },
  'muizenberg': { area: 'Muizenberg' },
  'kalk bay': { area: 'Kalk Bay' },
  'fish hoek': { area: 'Fish Hoek' },
  'kommetjie': { area: 'Kommetjie' },
  'noordhoek': { area: 'Noordhoek' },
  "simon's town": { area: "Simon's Town" },
  'simons town': { area: "Simon's Town" },
  'llandudno': { area: 'Llandudno' },
  // Overberg/Whale Coast towns
  "betty's bay": { city: "Betty's Bay" },
  'bettys bay': { city: "Betty's Bay" },
  'pringle bay': { city: 'Pringle Bay' },
  'rooiels': { city: 'Rooiels' },
  'gansbaai': { city: 'Gansbaai' },
  'de kelders': { city: 'De Kelders' },
  'stanford': { city: 'Stanford' },
  'cape agulhas': { city: 'Agulhas' },
  'agulhas': { city: 'Agulhas' },
  'arniston': { city: 'Arniston' },
  'waenhuiskrans': { city: 'Arniston' },
  'de hoop': { area: 'De Hoop Nature Reserve' },
  // Garden Route towns
  'wilderness': { city: 'Wilderness' },
  'george': { city: 'George' },
  'storms river': { city: 'Storms River' },
  "nature's valley": { city: "Nature's Valley" },
  'natures valley': { city: "Nature's Valley" },
  'oudtshoorn': { city: 'Oudtshoorn' },
  'prince albert': { city: 'Prince Albert' },
  // Eastern Cape coast towns
  'st francis bay': { city: 'St Francis Bay' },
  'cape st francis': { city: 'Cape St Francis' },
  'port alfred': { city: 'Port Alfred' },
  'kenton-on-sea': { city: 'Kenton-on-Sea' },
  'kenton on sea': { city: 'Kenton-on-Sea' },
  'grahamstown': { city: 'Makhanda' },
  'makhanda': { city: 'Makhanda' },
  // KZN North & South coast towns
  'richards bay': { city: 'Richards Bay' },
  'empangeni': { city: 'Empangeni' },
  'eshowe': { city: 'Eshowe' },
  'umdloti': { city: 'Umdloti' },
  'la lucia': { area: 'La Lucia' },
  'salt rock': { city: 'Salt Rock' },
  'sheffield beach': { city: 'Sheffield Beach' },
  'zinkwazi': { city: 'Zinkwazi' },
  'blythedale': { city: 'Blythedale' },
  'mtunzini': { city: 'Mtunzini' },
  'uvongo': { city: 'Uvongo' },
  'ramsgate': { city: 'Ramsgate' },
  'umtentweni': { city: 'Umtentweni' },
  'pennington': { city: 'Pennington' },
  'hibberdene': { city: 'Hibberdene' },
  'shelly beach': { city: 'Shelly Beach' },
  // Southern Drakensberg & Berg resorts
  'underberg': { city: 'Underberg' },
  'himeville': { city: 'Himeville' },
  'bergville': { city: 'Bergville' },
  'winterton': { city: 'Winterton' },
  'cathedral peak': { area: 'Cathedral Peak' },
  'champagne valley': { area: 'Champagne Valley' },
  'giants castle': { area: 'Giants Castle' },
  'royal natal': { area: 'Royal Natal National Park' },
  // Midlands towns
  'howick': { city: 'Howick' },
  'nottingham road': { city: 'Nottingham Road' },
  'mooi river': { city: 'Mooi River' },
  'balgowan': { city: 'Balgowan' },
  "curry's post": { city: "Curry's Post" },
  'currys post': { city: "Curry's Post" },
  // Kruger & Lowveld towns
  'hazyview': { city: 'Hazyview' },
  'sabie': { city: 'Sabie' },
  'graskop': { city: 'Graskop' },
  'nelspruit': { city: 'Nelspruit' },
  'mbombela': { city: 'Nelspruit' },
  'malelane': { city: 'Malelane' },
  'komatipoort': { city: 'Komatipoort' },
  'dullstroom': { city: 'Dullstroom' },
  'barberton': { city: 'Barberton' },
  'white river': { city: 'White River' },
  'hoedspruit': { city: 'Hoedspruit' },
  'phalaborwa': { city: 'Phalaborwa' },
  'tzaneen': { city: 'Tzaneen' },
  'polokwane': { city: 'Polokwane' },
  // Limpopo bushveld
  'bela-bela': { city: 'Bela-Bela' },
  'belabela': { city: 'Bela-Bela' },
  'warmbaths': { city: 'Bela-Bela' },
  'modimolle': { city: 'Modimolle' },
  'nylstroom': { city: 'Modimolle' },
  'mokopane': { city: 'Mokopane' },
  'thabazimbi': { city: 'Thabazimbi' },
  // North West
  'rustenburg': { city: 'Rustenburg' },
  'brits': { city: 'Brits' },
  // Free State & Northern Cape towns
  'clarens': { city: 'Clarens' },
  'golden gate': { area: 'Golden Gate Highlands National Park' },
  'parys': { city: 'Parys' },
  'upington': { city: 'Upington' },
  'springbok': { city: 'Springbok' },
  'pofadder': { city: 'Pofadder' },
  'kimberley': { city: 'Kimberley' },
  'sutherland': { city: 'Sutherland' },
  // Gauteng suburbs
  'centurion': { city: 'Centurion' },
  'fourways': { area: 'Fourways' },
  'randburg': { city: 'Randburg' },
  'melrose': { area: 'Melrose' },
  'sandhurst': { area: 'Sandhurst' },
  'hyde park': { area: 'Hyde Park' },
  'morningside': { area: 'Morningside' },
  'bryanston': { area: 'Bryanston' },
  'illovo': { area: 'Illovo' },
  'parkhurst': { area: 'Parkhurst' },
  'parktown': { area: 'Parktown' },
  'parkview': { area: 'Parkview' },
  'greenside': { area: 'Greenside' },
  'emmarentia': { area: 'Emmarentia' },
  'melville': { area: 'Melville' },
  'sunninghill': { area: 'Sunninghill' },
  'bedfordview': { city: 'Bedfordview' },
  // Gauteng and surrounds
  'pretoria': { city: 'Pretoria' },
  'pta': { city: 'Pretoria' },
  'tshwane': { city: 'Pretoria' },
  'sandton': { city: 'Sandton' },
  'rosebank': { city: 'Rosebank' },
  'soweto': { city: 'Soweto' },
  'midrand': { city: 'Midrand' },
  // North West & Limpopo & Mpumalanga safari regions
  'madikwe': { area: 'Madikwe Game Reserve' },
  'pilanesberg': { area: 'Pilanesberg' },
  'sun city': { city: 'Sun City' },
  'hartbeespoort': { city: 'Hartbeespoort' },
  'waterberg': { area: 'Waterberg' },
  'kruger': { area: 'Kruger National Park' },
  'kruger national park': { area: 'Kruger National Park' },
  'sabi sand': { area: 'Sabi Sand' },
  'sabi sands': { area: 'Sabi Sand' },
  'timbavati': { area: 'Timbavati' },
  'panorama route': { area: 'Panorama Route' },
  'addo elephant park': { area: 'Addo Elephant National Park' },
  'addo': { area: 'Addo Elephant National Park' },
  // Northern Cape and arid parks
  'namaqualand': { area: 'Namaqualand' },
  'richtersveld': { area: 'Richtersveld' },
  'kgalagadi': { area: 'Kgalagadi Transfrontier Park' },
  'augrabies': { area: 'Augrabies Falls National Park' },
  'elephant coast': { area: 'Elephant Coast' },
  // Countries
  'za': { country: 'South Africa' },
  'sa': { country: 'South Africa' },
  'rsa': { country: 'South Africa' },
  'uk': { country: 'United Kingdom' },
  'gb': { country: 'United Kingdom' },
  'uae': { country: 'United Arab Emirates' },
  'ksa': { country: 'Saudi Arabia' },
  'saudi': { country: 'Saudi Arabia' },
  'us': { country: 'United States' },
  'usa': { country: 'United States' },
  'america': { country: 'United States' },
  'tz': { country: 'Tanzania' },
  // More common country codes
  'au': { country: 'Australia' },
  'aus': { country: 'Australia' },
  'nz': { country: 'New Zealand' },
  'de': { country: 'Germany' },
  'fr': { country: 'France' },
  'it': { country: 'Italy' },
  'es': { country: 'Spain' },
  'jp': { country: 'Japan' },
  'nl': { country: 'Netherlands' },
  'pt': { country: 'Portugal' },
  'gr': { country: 'Greece' },
  'ae': { country: 'United Arab Emirates' },
  'qa': { country: 'Qatar' },
  'ke': { country: 'Kenya' },
  'zm': { country: 'Zambia' },
  'bw': { country: 'Botswana' },
  'na': { country: 'Namibia' },
  'mz': { country: 'Mozambique' },
  'mu': { country: 'Mauritius' },
  'sc': { country: 'Seychelles' },
  // Airport/city codes
  'ams': { city: 'Amsterdam' },
  'lhr': { city: 'London' },
  'dxb': { city: 'Dubai' },
  'lon': { city: 'London' },
  'nyc': { city: 'New York' },
  'lon': { city: 'London' },
  'fra': { city: 'Frankfurt' },
  'muc': { city: 'Munich' },
  'cdg': { city: 'Paris' },
  'lgw': { city: 'London' },
  'stn': { city: 'London' },
  'man': { city: 'Manchester' },
  'edi': { city: 'Edinburgh' },
  'gla': { city: 'Glasgow' },
  'doh': { city: 'Doha' },
  'auh': { city: 'Abu Dhabi' },
  'hkg': { city: 'Hong Kong' },
  'sin': { city: 'Singapore' },
  'bkk': { city: 'Bangkok' },
  'nbo': { city: 'Nairobi' },
  // Provinces/Islands common names
  'zanzibar': { province: 'Zanzibar North' },
}));

// Settings loader for smart parsing
export function loadSmartSettings(){
  try {
    // Default ON (true). If localStorage has '0', treat as disabled
    const smartAliases = localStorage.getItem('smartAliases') !== '0';
    return { smartAliases };
  } catch { return { smartAliases: true }; }
}

// Custom alias management: allow end-users to add their own alias → normalized location
export function loadCustomAliases(){
  try {
    const raw = localStorage.getItem('customLocationAliases:v1');
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}
export function saveCustomAliases(list){
  try {
    const safe = Array.isArray(list) ? list : [];
    localStorage.setItem('customLocationAliases:v1', JSON.stringify(safe));
  } catch {}
}

// Build merged alias map (built-ins + custom). If aliases disabled, returns null.
function getAliasMap(enableAliases){
  if(!enableAliases) return null;
  const m = new Map(LOCATION_ALIASES);
  const custom = loadCustomAliases();
  if(Array.isArray(custom)){
    for(const it of custom){
      if(!it || typeof it !== 'object') continue;
      const key = String(it.key||'').toLowerCase().trim();
      if(!key) continue;
      const loc = it.area ? { area: it.area } : it.city ? { city: it.city } : it.province ? { province: it.province } : it.country ? { country: it.country } : it.continent ? { continent: it.continent } : null;
      if(loc) m.set(key, loc);
    }
  }
  return m;
}

export function buildLocationMaps(products){
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const makeMap = (arr) => {
    const m = new Map();
    uniq(arr).forEach(v => m.set(String(v).toLowerCase(), v));
    return m;
  };
  const continents = makeMap(products.map(p=>p.continent));
  const countries = makeMap(products.map(p=>p.country));
  const provinces = makeMap(products.map(p=>p.province));
  const cities = makeMap(products.map(p=>p.city));
  const areas = makeMap(products.map(p=>p.area));
  const allLabels = (()=>{
    const labels = uniq([
      ...products.map(p=>p.area),
      ...products.map(p=>p.city),
      ...products.map(p=>p.province),
      ...products.map(p=>p.country),
      ...products.map(p=>p.continent),
    ]);
    return labels.map(v => ({ key: String(v).toLowerCase(), label: v }));
  })();
  return { continents, countries, provinces, cities, areas, allLabels };
}

export function detectCategory(text){
  const t = (text||'').toLowerCase();
  for(const entry of CATEGORY_SYNONYMS){ if(entry.keys.some(k => t.includes(k))) return entry.cat; }
  return '';
}

export function resolveLocationToken(token, locMaps, enableAliases = true){
  const t = (token||'').toLowerCase().trim();
  if(!t) return {};
  // Alias first (exact match)
  const aliasMap = getAliasMap(enableAliases);
  if(aliasMap && aliasMap.has(t)) return aliasMap.get(t);
  const tryExact = (map)=> map.get(t);
  const tryIncludes = (map)=>{
    let found = '';
    for(const [k,v] of map.entries()){ if(k.includes(t)){ found = v; break; } }
    return found;
  };
  // Alias includes (only consider alias keys with length >= 3 and word-boundary match to avoid noise like 'sa')
  if (aliasMap) for (const [k, v] of aliasMap.entries()){
    if(k.length < 3) continue;
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, 'i');
    if(re.test(t)) return v;
  }
  const { areas, cities, provinces, countries, continents } = locMaps;
  let area = tryExact(areas) || tryIncludes(areas); if(area) return { area };
  let city = tryExact(cities) || tryIncludes(cities); if(city) return { city };
  let province = tryExact(provinces) || tryIncludes(provinces); if(province) return { province };
  let country = tryExact(countries) || tryIncludes(countries); if(country) return { country };
  let continent = tryExact(continents) || tryIncludes(continents); if(continent) return { continent };
  return {};
}

export function longestLocationMatch(text, locMaps, enableAliases = true){
  const t = (text||'').toLowerCase();
  let best = { label: '', len: 0 };
  for(const { key, label } of locMaps.allLabels){
    if(!key) continue;
    const idx = t.indexOf(key);
    if(idx >= 0 && key.length > best.len){ best = { label, len: key.length }; }
  }
  // Also consider alias keys
  let bestAlias = { key: '', len: 0, loc: {} };
  const aliasMap = getAliasMap(enableAliases);
  if (aliasMap) for (const [k, v] of aliasMap.entries()){
    if(k.length < 3) continue; // skip very short keys unless exact token match elsewhere
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, 'i');
    const m = t.match(re);
    if(m){
      const l = k.length;
      if(l > bestAlias.len){ bestAlias = { key: k, len: l, loc: v }; }
    }
  }
  if(bestAlias.len > best.len){
    return bestAlias.loc;
  }
  if(!best.label) return {};
  const k = String(best.label).toLowerCase();
  const { areas, cities, provinces, countries, continents } = locMaps;
  if(areas.has(k)) return { area: best.label };
  if(cities.has(k)) return { city: best.label };
  if(provinces.has(k)) return { province: best.label };
  if(countries.has(k)) return { country: best.label };
  if(continents.has(k)) return { continent: best.label };
  return {};
}

export function parseQuery(rawText, { products, myLocation, enableAliases = true }={}){
  const text = (rawText||'').trim();
  if(!text) return { category: '', location: {} };
  const locMaps = buildLocationMaps(products||[]);
  const lower = text.toLowerCase();
  const CONNECTORS = [' in ', ' near ', ' around ', ' at '];
  let pos = -1, usedConnector = '';
  for(const c of CONNECTORS){ const i = lower.lastIndexOf(c); if(i > pos){ pos = i; usedConnector = c.trim(); } }
  let left = text, right = '';
  if(pos > 0){ left = text.slice(0,pos).trim(); right = text.slice(pos + (usedConnector.length+2)).trim(); }
  const category = detectCategory(left || text);

  // Near me handling
  if(/near me|around me|close by|nearby/.test(lower) && myLocation && (myLocation.city || myLocation.province || myLocation.country)){
    const location = myLocation.city ? { city: myLocation.city } : (myLocation.province ? { province: myLocation.province } : { country: myLocation.country });
    return { category, location, usedConnector: usedConnector || 'near' };
  }

  let location = resolveLocationToken(right, locMaps, enableAliases);
  if(Object.keys(location).length===0){ location = longestLocationMatch(text, locMaps, enableAliases); }
  return { category, location, usedConnector };
}

export function getSuggestion(text, { products, myLocation, enableAliases = true }={}){
  const { category, location } = parseQuery(text, { products, myLocation, enableAliases });
  if(!category && Object.keys(location).length===0) return null;
  const match = (p)=>{
    if(category && String(p.category||'') !== category) return false;
    if('area' in location) return String(p.area||'') === location.area;
    if('city' in location) return String(p.city||'') === location.city;
    if('province' in location) return String(p.province||'') === location.province;
    if('country' in location) return String(p.country||'') === location.country;
    if('continent' in location) return String(p.continent||'') === location.continent;
    return true;
  };
  const count = Array.isArray(products) ? products.filter(match).length : 0;
  const locLabel = Object.values(location)[0];
  const label = `Show${category?` ${category}`:''}${locLabel?` in ${locLabel}`:''} (${count})`;
  const params = { ...(category?{category}:{}) , ...location };
  return { label, count, params };
}

export function persistMyLocation(loc){
  try { localStorage.setItem('myLocation:v1', JSON.stringify(loc || {})); } catch {}
}
export function loadMyLocation(){
  try {
    const raw = localStorage.getItem('myLocation:v1');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
