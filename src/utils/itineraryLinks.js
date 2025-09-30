// Utility functions for itinerary deep links and calendar/ICS exports.
// These functions are pure and can be tree-shaken.
// Data contract (partial): {
//   id, title, description, start (ISO), end (ISO), lat, lng, location,
//   trailProvider, trailUrl
// }


/**
 * Build a Google Maps navigation or place URL for an itinerary item.
 * Priority order: explicit lat/lng -> location string -> title
 */
export function buildGoogleMapsUrl(item) {
  if (!item) return '';
  const base = 'https://www.google.com/maps/search/?api=1';
  if (typeof item.lat === 'number' && typeof item.lng === 'number') {
    return `${base}&query=${encodeURIComponent(item.lat + ',' + item.lng)}&query_place_id=`;
  }
  const q = item.location || item.title || 'Point of Interest';
  return `${base}&query=${encodeURIComponent(q)}`;
}

/**
 * Return a normalized trail provider URL.
 * If a canonical trailUrl exists, prefer it.
 * Fallback: attempt to build provider search link.
 */
export function buildTrailUrl(item) {
  if (!item) return '';
  if (item.trailUrl) return item.trailUrl;
  const name = encodeURIComponent(item.title || item.location || 'trail');
  switch (item.trailProvider) {
    case 'alltrails':
      return `https://www.alltrails.com/search?q=${name}`;
    case 'komoot':
      return `https://www.komoot.com/discover/${name}`;
    case 'wikiloc':
      return `https://www.wikiloc.com/trails?q=${name}`;
    default:
      return '';
  }
}

/**
 * Build a Google Calendar event creation URL prefilled with event data.
 * Note: Spaces & certain punctuation managed by encodeURIComponent.
 */
export function buildGoogleCalendarUrl(item) {
  if (!item) return '';
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(item.title || 'Itinerary Event');
  const details = encodeURIComponent(item.description || '');
  const location = encodeURIComponent(item.location || '');
  // Google Calendar expects UTC-ish date/time format: YYYYMMDDTHHMMSSZ or without Z if local (treat as floating time)
  // We'll convert to UTC to be safest.
  const startIso = new Date(item.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const endIso = new Date(item.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dates = `${startIso}/${endIso}`;
  return `${base}&text=${text}&details=${details}&location=${location}&dates=${dates}`;
}

/**
 * Generate ICS content for a single event.
 * @param {object} item Itinerary item
 * @param {string} timezone (currently not applying VTIMEZONE block – using UTC/Z)
 */
export function buildSingleICS(item) {
  if (!item) return '';
  const uid = `${item.id || crypto.randomUUID?.() || Date.now()}@colleco.itinerary`;
  const dtStart = toICSDateUTC(item.start);
  const dtEnd = toICSDateUTC(item.end);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Colleco//Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSDateUTC(new Date().toISOString())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    foldLine(`SUMMARY:${escapeText(item.title || 'Itinerary Event')}`),
    item.description ? foldLine(`DESCRIPTION:${escapeText(item.description)}`) : null,
    item.location ? foldLine(`LOCATION:${escapeText(item.location)}`) : null,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  return lines.join('\r\n');
}

/**
 * Build a combined ICS for multiple items.
 */
export function buildCombinedICS(items = []) {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Colleco//Itinerary//EN',
    'CALSCALE:GREGORIAN'
  ];
  const body = items.map(item => {
    const uid = `${item.id || crypto.randomUUID?.() || Math.random()}@colleco.itinerary`;
    const dtStart = toICSDateUTC(item.start);
    const dtEnd = toICSDateUTC(item.end);
    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${toICSDateUTC(new Date().toISOString())}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      foldLine(`SUMMARY:${escapeText(item.title || 'Event')}`),
      item.description ? foldLine(`DESCRIPTION:${escapeText(item.description)}`) : null,
      item.location ? foldLine(`LOCATION:${escapeText(item.location)}`) : null,
      'END:VEVENT'
    ].filter(Boolean).join('\r\n');
  });
  const footer = ['END:VCALENDAR'];
  return [...header, ...body, ...footer].join('\r\n');
}

/** Format an ISO date/time into ICS compliant UTC timestamp */
function toICSDateUTC(isoLike) {
  if (!isoLike) return '';
  const d = new Date(isoLike);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// Escape characters per RFC 5545 (comma, semicolon, backslash, newline)
function escapeText(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// Fold long lines at 75 octets – simplified (counting characters)
function foldLine(line) {
  const limit = 75;
  if (line.length <= limit) return line;
  let out = '';
  for (let i = 0; i < line.length; i += limit) {
    const chunk = line.slice(i, i + limit);
    out += (i === 0 ? '' : '\r\n ') + chunk; // Space prefix for continuation
  }
  return out;
}

/**
 * Trigger a download of the provided ICS content in browser.
 */
export function downloadICS(content, filename = 'event.ics') {
  if (!content) return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export default {
  buildGoogleMapsUrl,
  buildTrailUrl,
  buildGoogleCalendarUrl,
  buildSingleICS,
  buildCombinedICS,
  downloadICS
};
