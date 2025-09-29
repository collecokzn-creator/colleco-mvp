// Maps itinerary item type (or fallback) to illustrative SVG asset & alt text.
// Adds optional photo thumbnail support when an itinerary item includes a `photo` field.
// Photo naming convention (placed under /assets/itinerary/photos/):
//   <photo>.jpg (base)
//   <photo>@2x.jpg (retina/high density)
//   <photo>-wide.jpg (optional wider aspect)
// If only base exists it's still fine; srcSet will gracefully fall back.

const base = '/assets/itinerary';
const photoBase = `${base}/photos`;

const typeMap = {
  hike: { src: `${base}/hike.svg`, alt: 'Hiking trail preview' },
  meal: { src: `${base}/meal.svg`, alt: 'Meal or dining experience' },
  lodging: { src: `${base}/lodging.svg`, alt: 'Lodging or accommodation' },
  custom: { src: `${base}/custom.svg`, alt: 'Custom itinerary activity' }
};

export function mediaFor(item) {
  if (!item) return typeMap.custom;
  // If a `photo` property is present, compose responsive photo metadata
  if (item.photo) {
    const safe = String(item.photo).replace(/[^a-zA-Z0-9-_]/g, '_');
    const baseImg = `${photoBase}/${safe}.jpg`;
    const retina = `${photoBase}/${safe}@2x.jpg`;
    const wide = `${photoBase}/${safe}-wide.jpg`;
    // Build a tentative srcSet; consumers can still just use .src
    const srcSetParts = [
      `${baseImg} 1x`,
      `${retina} 2x`
    ];
    const mapAlt = typeMap[item.type]?.alt || 'Itinerary photo';
    return {
      src: baseImg,
      alt: item.photoAlt || item.title || mapAlt,
      srcSet: srcSetParts.join(', '),
      wide
    };
  }
  return typeMap[item.type] || typeMap.custom;
}

export default { mediaFor };
