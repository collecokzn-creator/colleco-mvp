/**
 * Property-to-Supplier Mapping
 * 
 * Maps customer-facing property names to backend supplier IDs.
 * This keeps supplier relationships internal while showing properties to customers.
 */

const PROPERTIES = [
  // Beekman Holidays Properties
  {
    id: 'beekman-main',
    name: 'The Beekman',
    supplierId: 'beekman',
    location: 'Umhlanga, Durban',
    type: 'Hotel',
    stars: 4,
    description: 'Luxury beachfront hotel with conference facilities',
    image: '/assets/properties/beekman.jpg',
    basePrice: 450, // per night starting price
    serviceTypes: ['accommodation', 'conference', 'banqueting', 'groups_accommodation']
  },
  {
    id: 'beekman-conference',
    name: 'Beekman Conference Centre',
    supplierId: 'beekman',
    location: 'Umhlanga, Durban',
    type: 'Conference Centre',
    stars: 4,
    description: 'State-of-the-art conference facilities with catering',
    image: '/assets/properties/beekman-conference.jpg',
    basePrice: 150, // per delegate
    serviceTypes: ['conference', 'banqueting']
  },
  
  // Premier Hotels & Resorts Properties
  {
    id: 'premier-umhlanga',
    name: 'Premier Hotel Umhlanga',
    supplierId: 'premier',
    location: 'Umhlanga, Durban',
    type: 'Hotel',
    stars: 5,
    description: '5-star luxury hotel with ocean views and premium conference facilities',
    image: '/assets/properties/premier-umhlanga.jpg',
    basePrice: 650,
    serviceTypes: ['accommodation', 'day_conference_packages', 'formal_banqueting_meals', 'corporate', 'groups_accommodation']
  },
  {
    id: 'premier-splendid',
    name: 'Premier Splendid Inn',
    supplierId: 'premier',
    location: 'Durban CBD',
    type: 'Hotel',
    stars: 3,
    description: 'Comfortable business hotel in the heart of Durban',
    image: '/assets/properties/premier-splendid.jpg',
    basePrice: 350,
    serviceTypes: ['accommodation', 'corporate']
  }
];

/**
 * Get all properties
 */
function getAllProperties() {
  return PROPERTIES;
}

/**
 * Get properties by location
 */
function getPropertiesByLocation(location) {
  const search = location.toLowerCase();
  return PROPERTIES.filter(p => 
    p.location.toLowerCase().includes(search) ||
    p.name.toLowerCase().includes(search)
  );
}

/**
 * Get property by ID
 */
function getPropertyById(propertyId) {
  return PROPERTIES.find(p => p.id === propertyId);
}

/**
 * Get supplier ID for a property
 */
function getSupplierForProperty(propertyId) {
  const property = getPropertyById(propertyId);
  return property ? property.supplierId : null;
}

/**
 * Get properties by supplier (internal use only)
 */
function getPropertiesBySupplier(supplierId) {
  return PROPERTIES.filter(p => p.supplierId === supplierId);
}

module.exports = {
  getAllProperties,
  getPropertiesByLocation,
  getPropertyById,
  getSupplierForProperty,
  getPropertiesBySupplier
};
