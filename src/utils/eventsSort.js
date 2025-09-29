// Utilities for sorting and merging events by date
// Event shape expected: { date?: string, ... }

export function sortEvents(list = [], order = 'dateAsc'){
  const items = Array.isArray(list) ? list.slice() : [];
  const parseTs = (d) => {
    const t = Date.parse(d);
    return Number.isFinite(t) ? t : NaN;
  };
  const asc = order !== 'dateDesc';
  return items
    .map(e => ({ e, t: parseTs(e?.date) }))
    .sort((a,b) => {
      const at = a.t, bt = b.t;
      const aNaN = Number.isNaN(at), bNaN = Number.isNaN(bt);
      if (aNaN && bNaN) return 0;
      if (aNaN) return 1;  // unknown dates last
      if (bNaN) return -1;
      return asc ? (at - bt) : (bt - at);
    })
    .map(x => x.e);
}

export function mergeAndSort(prev = [], more = [], order = 'dateAsc'){
  return sortEvents([...(prev||[]), ...(more||[])], order);
}
