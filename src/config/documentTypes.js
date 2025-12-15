/**
 * Complete document type definitions for all partner categories
 * 60+ document types across 7 partner categories
 * Based on SA regulatory requirements
 */

export const DOCUMENT_TYPES = {
  // === STANDARD BUSINESS DOCUMENTS (All partners) ===
  standard: [
    {
      id: "business_registration",
      label: "Business Registration Certificate",
      description: "CIPC registration or equivalent",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    },
    {
      id: "tax_clearance",
      label: "Tax Clearance Certificate",
      description: "Valid tax compliance certificate from SARS",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "id_document",
      label: "ID/Passport of Director/Owner",
      description: "Valid identification document",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "banking_details",
      label: "Banking Details",
      description: "Proof of banking (bank letter or cancelled cheque)",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "public_liability_insurance",
      label: "Public Liability Insurance",
      description: "Minimum R5M coverage (higher for specific categories)",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "bbbee_certificate",
      label: "B-BBEE Certificate",
      description: "South African partners (optional but preferred)",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    }
  ],

  // === ACCOMMODATION DOCUMENTS ===
  accommodation: [
    {
      id: "tourism_grading",
      label: "Tourism Grading Certificate",
      description: "SA Tourism Grading Council star rating (1-5 star)",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    },
    {
      id: "tourism_business_license",
      label: "Tourism Business License",
      description: "Provincial tourism registration",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "certificate_of_acceptability",
      label: "Certificate of Acceptability (CoA)",
      description: "Municipal health department approval for food service",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "fire_safety_certificate",
      label: "Fire Safety Certificate",
      description: "Fire department approval with occupancy limits",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "liquor_license",
      label: "Liquor License (if applicable)",
      description: "Provincial liquor board on-consumption license",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "pool_safety_certificate",
      label: "Pool Safety Certificate (if applicable)",
      description: "Compliance with pool safety regulations",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "food_business_license",
      label: "Food Business License",
      description: "Municipality food handling approval",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "building_compliance_certificate",
      label: "Building Compliance Certificate",
      description: "Occupancy certificate and zoning approval",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "electrical_coc",
      label: "Electrical Certificate of Compliance",
      description: "ECSA registered electrician certification",
      required: true,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "gas_installation_certificate",
      label: "Gas Installation Certificate (if applicable)",
      description: "LPG installation for commercial kitchen (LPGSASA)",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "lift_inspection_certificate",
      label: "Lift Inspection Certificate (if applicable)",
      description: "Department of Labour lift safety inspection",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "emergency_evacuation_plan",
      label: "Emergency Evacuation Plan",
      description: "Fire safety evacuation procedures and assembly points",
      required: true,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "employee_certificates",
      label: "Employee Compliance Certificates",
      description: "UIF registration and bargaining council membership",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "zoning_certificate",
      label: "Zoning Certificate",
      description: "Municipal approval for commercial/business use",
      required: true,
      formats: [".pdf"],
      maxSize: 3
    }
  ],

  // === ACTIVITY OPERATOR DOCUMENTS ===
  activities: [
    {
      id: "adventure_activity_permit",
      label: "Adventure Activity Permit",
      description: "Provincial permit (Grade 1/2/3 based on risk)",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "environmental_permit",
      label: "Environmental Permit",
      description: "SANParks/DFFE/Provincial permit for protected areas",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "instructor_certification",
      label: "Instructor Certifications",
      description: "PADI/MCSA/ISA/IKO certifications per activity - upload for each instructor",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "equipment_inspection_certificate",
      label: "Equipment Inspection Certificates",
      description: "Safety inspection for bungee/scuba/zipline/climbing gear",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "safety_management_system",
      label: "Safety Management System (SMS)",
      description: "SANS 1586 compliant safety documentation",
      required: true,
      formats: [".pdf"],
      maxSize: 10
    },
    {
      id: "vessel_license",
      label: "Vessel License (if applicable)",
      description: "SAMSA registration for boat-based activities",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "skippers_license",
      label: "Skipper's License (if applicable)",
      description: "SAMSA coastal/offshore skipper certification",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "marine_safety_equipment",
      label: "Marine Safety Equipment Certificate (if applicable)",
      description: "Life jackets, flares, VHF radio, EPIRB inspection",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "scuba_diving_permit",
      label: "Scuba Diving Permit (if applicable)",
      description: "DFFE permit for marine protected areas",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "shark_cage_diving_permit",
      label: "Shark Cage Diving Permit (if applicable)",
      description: "DFFE permit for Gansbaai/Mossel Bay operations",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "bungee_inspection_certificate",
      label: "Bungee Inspection Certificate (if applicable)",
      description: "Structural engineer inspection and load testing",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "pasa_membership",
      label: "PASA Membership (if applicable)",
      description: "Parachute Association of South Africa for skydiving",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "aviation_permit",
      label: "Aviation Permit (if applicable)",
      description: "SACAA Air Operator Certificate for scenic flights/skydiving",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "prdp_permit",
      label: "Public Road Passenger Permit (if providing transport)",
      description: "PrDP permit if activity operator provides vehicle transport",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    },
    {
      id: "vehicle_roadworthy",
      label: "Vehicle Roadworthy Certificate (if providing transport)",
      description: "Annual roadworthy for commercial vehicles",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "passenger_liability_insurance",
      label: "Passenger Liability Insurance (if providing transport)",
      description: "Minimum R10M coverage if transporting clients",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    }
  ],

  // === RESTAURANT DOCUMENTS ===
  restaurants: [
    {
      id: "certificate_of_acceptability",
      label: "Certificate of Acceptability (CoA)",
      description: "Municipal health department inspection approval",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "food_business_license",
      label: "Food Business License",
      description: "Municipality food handling approval",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "pest_control_contract",
      label: "Pest Control Contract",
      description: "SAPCA registered provider with monthly service",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "food_handler_certificate",
      label: "Food Handler Certificates",
      description: "CATHSSETA certification for ALL kitchen staff - upload for each",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "fire_safety_certificate",
      label: "Fire Safety Certificate",
      description: "Fire department approval with occupancy limits",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "liquor_license",
      label: "Liquor License (if serving alcohol)",
      description: "Provincial liquor board on-consumption license",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "liquor_manager_registration",
      label: "Liquor Manager Registration (if serving alcohol)",
      description: "Provincial liquor board registered manager",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "police_clearance",
      label: "Police Clearance (if serving alcohol)",
      description: "SAPS clearance for liquor license applicants",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "vehicle_registration",
      label: "Vehicle Registration (if food truck)",
      description: "License disk and registration for mobile food service",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "catering_license",
      label: "Catering License (if off-site catering)",
      description: "Mobile food service license with central kitchen approval",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "zoning_certificate",
      label: "Zoning Certificate",
      description: "Municipal approval for commercial/business use",
      required: true,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "building_compliance_certificate",
      label: "Building Compliance Certificate",
      description: "Occupancy certificate and structural compliance",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    }
  ],

  // === TRAVEL AGENT / DMC DOCUMENTS ===
  travel_agents: [
    {
      id: "asata_membership",
      label: "ASATA Membership",
      description: "Association of Southern African Travel Agents membership",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "satsa_membership",
      label: "SATSA Membership (for DMCs)",
      description: "Southern Africa Tourism Services Association for inbound operators",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "iata_accreditation",
      label: "IATA Accreditation (if applicable)",
      description: "International Air Transport Association BSP/TIDS accreditation",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "trust_account_certificate",
      label: "Trust Account Certificate",
      description: "Bank confirmation of separate client funds account (required by law)",
      required: true,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "professional_indemnity_insurance",
      label: "Professional Indemnity Insurance",
      description: "Minimum R2M (home-based), R5M (retail), R10M (DMC)",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "fidelity_guarantee_insurance",
      label: "Fidelity Guarantee Insurance",
      description: "Minimum R500K (home-based), R1M (retail), R2M (DMC)",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "travel_consultant_qualification",
      label: "Travel Consultant Qualifications",
      description: "IATA/UFTAA diploma, GDS certifications - upload for each consultant",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "lease_agreement",
      label: "Lease Agreement (for retail agencies)",
      description: "Retail premises lease with commercial zoning",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "zoning_certificate",
      label: "Zoning Certificate (for retail agencies)",
      description: "Municipal approval for commercial/business use",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "tourism_business_license",
      label: "Tourism License (for DMCs operating tours)",
      description: "Provincial tourism registration if DMC operates tours",
      required: false,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "police_clearance",
      label: "Police Clearance",
      description: "SAPS clearance for principals/directors",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    }
  ],

  // === TOUR GUIDE DOCUMENTS ===
  tour_guides: [
    {
      id: "tour_guide_registration",
      label: "Tour Guide Registration",
      description: "Provincial tourism authority or CATHSSETA registration",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "first_aid_certificate",
      label: "First Aid Certificate",
      description: "Level 1/2 or WFR (Wilderness First Responder for adventure guides)",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "police_clearance",
      label: "Police Clearance Certificate",
      description: "SAPS clearance not older than 12 months",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "professional_indemnity_insurance",
      label: "Professional Indemnity Insurance",
      description: "Minimum R2M coverage (R10M for adventure guides)",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "language_certificate",
      label: "Language Certificates (optional)",
      description: "Proof of language proficiency (minimum B2 level)",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "fgasa_qualification",
      label: "FGASA Qualification (for wildlife guides)",
      description: "Field Guide Association of Southern Africa levels 1-3",
      required: false,
      formats: [".pdf"],
      maxSize: 3
    },
    {
      id: "diving_certification",
      label: "Diving Certification (for dive guides)",
      description: "PADI Divemaster or Instructor certification",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "climbing_instructor",
      label: "Climbing Instructor Certificate (for climbing guides)",
      description: "MCSA Rock Climbing Instructor (RCI) certification",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "river_guide_certification",
      label: "River Guide Certification (for rafting guides)",
      description: "Grade 1-4 river guide with Swift Water Rescue (SWR)",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    }
  ],

  // === TRANSPORT OPERATOR DOCUMENTS ===
  transport: [
    {
      id: "operating_license",
      label: "Operating License",
      description: "Provincial Transport Authority operating license",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    },
    {
      id: "tourist_transport_permit",
      label: "Tourist Transport Permit (TTP)",
      description: "Department of Tourism permit for tourist transport",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    },
    {
      id: "prdp_permit",
      label: "Public Road Passenger Permit (PrDP)",
      description: "Provincial Operating License Board permit",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    },
    {
      id: "prdp_driver",
      label: "Professional Driving Permit (per driver)",
      description: "Driver license with PrDP endorsement - upload for each driver",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "vehicle_roadworthy",
      label: "Vehicle Roadworthy Certificate (per vehicle)",
      description: "Certificate of Fitness (CoF) - upload for each vehicle",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "vehicle_registration",
      label: "Vehicle Registration Documents (per vehicle)",
      description: "License disk and registration papers - upload for each vehicle",
      required: true,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 3
    },
    {
      id: "passenger_liability_insurance",
      label: "Passenger Liability Insurance",
      description: "Minimum R10M coverage for transport operators",
      required: true,
      formats: [".pdf"],
      maxSize: 5
    },
    {
      id: "cross_border_permit",
      label: "Cross-Border Permit (if applicable)",
      description: "SADC/CBRTA permit for international tours",
      required: false,
      formats: [".pdf", ".jpg", ".png"],
      maxSize: 5
    }
  ]
};

/**
 * Get documents required for a specific partner category
 * @param {string} category - Partner category (accommodation, activities, restaurants, travel_agents, tour_guides, transport)
 * @returns {Array} - Array of document type objects
 */
export function getDocumentsForCategory(category) {
  const standardDocs = DOCUMENT_TYPES.standard;
  const categoryDocs = DOCUMENT_TYPES[category] || [];
  return [...standardDocs, ...categoryDocs];
}

/**
 * Get all unique document types (for admin/verification purposes)
 * @returns {Array} - Array of all document type IDs
 */
export function getAllDocumentTypes() {
  const allTypes = new Set();
  Object.values(DOCUMENT_TYPES).forEach(categoryDocs => {
    categoryDocs.forEach(doc => allTypes.add(doc.id));
  });
  return Array.from(allTypes);
}

/**
 * Get document configuration by ID
 * @param {string} docId - Document type ID
 * @returns {Object|null} - Document configuration object or null if not found
 */
export function getDocumentConfig(docId) {
  for (const categoryDocs of Object.values(DOCUMENT_TYPES)) {
    const doc = categoryDocs.find(d => d.id === docId);
    if (doc) return doc;
  }
  return null;
}
