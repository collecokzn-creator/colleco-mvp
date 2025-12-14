// Minimal properties data stub used by tests and server routes
const SAMPLE_PROPERTIES = [
  {
    id: 'prop_1',
    title: 'Sample Hotel One',
    location: 'Cape Town',
    description: 'A small sample hotel in Cape Town for tests.'
  },
  {
    id: 'prop_2',
    title: 'Sample Lodge Two',
    location: 'Johannesburg',
    description: 'A sample lodge in Johannesburg.'
  }
];

function getAllProperties() {
  return SAMPLE_PROPERTIES;
}

function getPropertiesByLocation(location) {
  if (!location) return SAMPLE_PROPERTIES;
  const q = String(location).toLowerCase();
  return SAMPLE_PROPERTIES.filter(p => String(p.location || '').toLowerCase().includes(q));
}

function getPropertyById(id) {
  return SAMPLE_PROPERTIES.find(p => p.id === id) || null;
}

module.exports = {
  getAllProperties,
  getPropertiesByLocation,
  getPropertyById
};
