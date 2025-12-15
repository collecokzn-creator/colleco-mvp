// Client util to search events via our server proxy aggregating trusted providers
// Usage: searchEvents({ q: 'Coldplay', city: 'London', country: 'GB' })

// Minimal ISO mapping for common demo countries; can be expanded or replaced with a full lib
const ISO2 = {
  'United States': 'US', 'USA': 'US', 'US': 'US',
  'United Kingdom': 'GB', 'UK': 'GB', 'England': 'GB',
  'South Africa': 'ZA', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES', 'Canada': 'CA', 'Brazil': 'BR', 'Australia': 'AU', 'Japan': 'JP', 'Thailand': 'TH', 'United Arab Emirates': 'AE', 'Egypt': 'EG', 'Kenya': 'KE'
};

export async function searchEvents({ q = '', city = '', country = '', page = 1, limit = 8, includePast = false, signal } = {}){
  const params = new URLSearchParams();
  if(q) params.set('q', q);
  if(city) params.set('city', city);
  if(country) params.set('country', ISO2[country] || country);
  if(page) params.set('page', String(page));
  if(limit) params.set('limit', String(limit));
  if(includePast) params.set('includePast','1');
  // Optional client-side demo flag to force demo results (also supported server-side)
  try { if (localStorage.getItem('demoEvents') === '1') params.set('demo','1'); } catch {}
  const res = await fetch(`/api/events/search?${params.toString()}` , { signal });
  if(!res.ok){ throw new Error(`Events search failed: ${res.status}`); }
  const j = await res.json();
  if (j && j.ok) {
    return {
      events: Array.isArray(j.events) ? j.events : [],
      page: j.page || 1,
      limit: j.limit || limit,
      total: j.total || 0,
      hasMore: !!j.hasMore,
      countsBySource: j.countsBySource || {},
    };
  }
  return { events: [], page: 1, limit, total: 0, hasMore: false };
}
