// Centralized demo catalog so multiple surfaces (Navbar search, PlanTrip) stay in sync
export const PRODUCTS = [
  // Lodging
  { id: 'p_hotel1', title: 'Sea View Hotel', description: '2 nights, King Room', category: 'Lodging', price: 420,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'V&A Waterfront' },
  { id: 'p_lodge1', title: 'Savannah Safari Lodge', description: '3 nights, Full Board', category: 'Lodging', price: 960,
    continent: 'Africa', country: 'South Africa', province: 'Mpumalanga', city: 'Skukuza', area: 'Kruger National Park' },
  { id: 'p_guest1', title: 'City Boutique Guesthouse', description: '1 night, Breakfast included', category: 'Lodging', price: 120,
    continent: 'Africa', country: 'South Africa', province: 'Gauteng', city: 'Johannesburg', area: 'Sandton' },
  // Activities & Tours
  { id: 'p_hike1', title: 'Table Mountain Hike', description: 'Guided half-day hike', category: 'Activity', price: 85,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Table Mountain' },
  { id: 'p_tour1', title: 'Robben Island Tour', description: 'Ferry + museum entry', category: 'Activity', price: 60,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Robben Island' },
  { id: 'p_safari1', title: 'Kruger Park Game Drive', description: 'Sunrise Big Five safari', category: 'Activity', price: 150,
    continent: 'Africa', country: 'South Africa', province: 'Mpumalanga', city: 'Skukuza', area: 'Kruger National Park' },
  { id: 'p_wine1', title: 'Winelands Tour', description: 'Stellenbosch & Franschhoek tastings', category: 'Tour', price: 110,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Stellenbosch', area: 'Winelands' },
  // Dining
  { id: 'p_dinner1', title: 'Dinner – Kloof Street House', description: 'Chef tasting menu', category: 'Dining', price: 70,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Gardens' },
  { id: 'p_dinner2', title: 'Seafood Sunset Dinner', description: 'Beachfront set menu', category: 'Dining', price: 55,
    continent: 'Africa', country: 'Tanzania', province: 'Zanzibar North', city: 'Nungwi', area: 'Nungwi Beach' },
  // Transport
  { id: 'p_transfer1', title: 'Airport Transfer', description: 'Private vehicle arrival', category: 'Transport', price: 0,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'CPT International' },
  { id: 'p_car1', title: 'Compact Car Hire', description: 'Unlimited km, basic insurance', category: 'Transport', price: 45,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'City Bowl' },
  // Experiences & Add-ons
  { id: 'p_spa1', title: 'Spa Package', description: '60-min massage + sauna', category: 'Experience', price: 65,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'City Centre' },
  { id: 'p_photography1', title: 'Travel Photography Session', description: '1-hour professional shoot', category: 'Experience', price: 120,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Camps Bay' },
  
  // Europe
  { id: 'p_hotel_paris1', title: 'Left Bank Boutique Hotel', description: '2 nights, Superior Room', category: 'Lodging', price: 280,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Saint-Germain-des-Prés' },
  { id: 'p_activity_paris1', title: 'Louvre Priority Entry', description: 'Timed-entry museum tickets', category: 'Activity', price: 35,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Louvre/Tuileries' },
  { id: 'p_dining_paris1', title: 'Seine River Dinner Cruise', description: '3-course dinner with views', category: 'Dining', price: 85,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Port de la Bourdonnais' },
  { id: 'p_tour_rome1', title: 'Colosseum & Forum Tour', description: 'Skip-the-line guided tour', category: 'Tour', price: 70,
    continent: 'Europe', country: 'Italy', province: 'Lazio', city: 'Rome', area: 'Colosseo' },
  { id: 'p_transfer_paris1', title: 'CDG Airport Transfer', description: 'Private sedan to hotel', category: 'Transport', price: 65,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Charles de Gaulle' },

  // North America
  { id: 'p_hotel_nyc1', title: 'Midtown Skyline Hotel', description: '2 nights, City View King', category: 'Lodging', price: 340,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'Midtown Manhattan' },
  { id: 'p_activity_nyc1', title: 'Broadway Show', description: 'Evening performance orchestra seats', category: 'Activity', price: 120,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'Theater District' },
  { id: 'p_tour_nyc1', title: 'Statue of Liberty & Ellis Island', description: 'Ferry + museum access', category: 'Tour', price: 55,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'Battery Park' },
  { id: 'p_dining_nyc1', title: 'SoHo Tasting Walk', description: 'Artisanal bites & desserts', category: 'Dining', price: 65,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'SoHo' },
  { id: 'p_transfer_nyc1', title: 'JFK Black Car Service', description: 'Airport pickup, meet & greet', category: 'Transport', price: 85,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'JFK International' },

  // Asia
  { id: 'p_hotel_tokyo1', title: 'Shinjuku Business Hotel', description: '2 nights, Semi-Double', category: 'Lodging', price: 220,
    continent: 'Asia', country: 'Japan', province: 'Tokyo', city: 'Tokyo', area: 'Shinjuku' },
  { id: 'p_activity_tokyo1', title: 'Tsukiji Market Food Tour', description: 'Morning sushi & snacks', category: 'Activity', price: 55,
    continent: 'Asia', country: 'Japan', province: 'Tokyo', city: 'Tokyo', area: 'Tsukiji' },
  { id: 'p_tour_kyoto1', title: 'Fushimi Inari & Gion Walk', description: 'Guided cultural tour', category: 'Tour', price: 60,
    continent: 'Asia', country: 'Japan', province: 'Kyoto', city: 'Kyoto', area: 'Fushimi Inari' },
  { id: 'p_dining_tokyo1', title: 'Ramen Tasting Night', description: 'Hidden shops, 3 bowls', category: 'Dining', price: 48,
    continent: 'Asia', country: 'Japan', province: 'Tokyo', city: 'Tokyo', area: 'Shibuya' },
  { id: 'p_transfer_tokyo1', title: 'Narita Express Tickets', description: 'Airport rail to city', category: 'Transport', price: 28,
    continent: 'Asia', country: 'Japan', province: 'Chiba', city: 'Narita', area: 'NRT Airport' },

  // South America
  { id: 'p_hotel_rio1', title: 'Copacabana Beach Hotel', description: '2 nights, Ocean Balcony', category: 'Lodging', price: 210,
    continent: 'South America', country: 'Brazil', province: 'Rio de Janeiro', city: 'Rio de Janeiro', area: 'Copacabana' },
  { id: 'p_activity_rio1', title: 'Sugarloaf Cable Car', description: 'Panoramic viewpoints', category: 'Activity', price: 40,
    continent: 'South America', country: 'Brazil', province: 'Rio de Janeiro', city: 'Rio de Janeiro', area: 'Urca' },
  { id: 'p_tour_rio1', title: 'Christ the Redeemer Tour', description: 'Guided visit + transfers', category: 'Tour', price: 55,
    continent: 'South America', country: 'Brazil', province: 'Rio de Janeiro', city: 'Rio de Janeiro', area: 'Corcovado' },
  { id: 'p_dining_rio1', title: 'Churrascaria Dinner', description: 'Traditional rodízio experience', category: 'Dining', price: 50,
    continent: 'South America', country: 'Brazil', province: 'Rio de Janeiro', city: 'Rio de Janeiro', area: 'Ipanema' },

  // Oceania
  { id: 'p_hotel_sydney1', title: 'Harbour View Hotel', description: '2 nights, Deluxe King', category: 'Lodging', price: 260,
    continent: 'Oceania', country: 'Australia', province: 'New South Wales', city: 'Sydney', area: 'Circular Quay' },
  { id: 'p_activity_sydney1', title: 'Sydney Opera House Tour', description: 'Architecture & backstage', category: 'Activity', price: 45,
    continent: 'Oceania', country: 'Australia', province: 'New South Wales', city: 'Sydney', area: 'Sydney Opera House' },
  { id: 'p_tour_sydney1', title: 'Blue Mountains Day Trip', description: 'Guided views & wildlife', category: 'Tour', price: 115,
    continent: 'Oceania', country: 'Australia', province: 'New South Wales', city: 'Katoomba', area: 'Echo Point' },
  { id: 'p_dining_sydney1', title: 'Fish Market Lunch', description: 'Fresh seafood platters', category: 'Dining', price: 40,
    continent: 'Oceania', country: 'Australia', province: 'New South Wales', city: 'Sydney', area: 'Pyrmont' },

  // Middle East
  { id: 'p_hotel_dubai1', title: 'Downtown Luxury Stay', description: '2 nights, Fountain View', category: 'Lodging', price: 300,
    continent: 'Asia', country: 'United Arab Emirates', province: 'Dubai', city: 'Dubai', area: 'Downtown' },
  { id: 'p_activity_dubai1', title: 'Desert Safari & BBQ', description: 'Dune bashing, camel ride', category: 'Activity', price: 75,
    continent: 'Asia', country: 'United Arab Emirates', province: 'Dubai', city: 'Dubai', area: 'Al Marmoom Desert' },
  { id: 'p_tour_dubai1', title: 'Burj Khalifa 124F Tickets', description: 'At the Top admission', category: 'Tour', price: 55,
    continent: 'Asia', country: 'United Arab Emirates', province: 'Dubai', city: 'Dubai', area: 'Downtown' },
  
  // Additional coverage
  { id: 'p_hotel_nairobi1', title: 'Nairobi City Hotel', description: '1 night, Standard Room', category: 'Lodging', price: 110,
    continent: 'Africa', country: 'Kenya', province: 'Nairobi County', city: 'Nairobi', area: 'City Centre' },
  { id: 'p_activity_nairobi1', title: 'Nairobi National Park Safari', description: 'Half-day game drive', category: 'Activity', price: 90,
    continent: 'Africa', country: 'Kenya', province: 'Nairobi County', city: 'Nairobi', area: 'Nairobi National Park' },
  { id: 'p_hotel_cairo1', title: 'Giza Pyramids View Inn', description: '1 night, Pyramid View', category: 'Lodging', price: 95,
    continent: 'Africa', country: 'Egypt', province: 'Giza Governorate', city: 'Giza', area: 'Al Haram' },
  { id: 'p_tour_cairo1', title: 'Pyramids & Sphinx Tour', description: 'Guided tour with transfers', category: 'Tour', price: 60,
    continent: 'Africa', country: 'Egypt', province: 'Giza Governorate', city: 'Giza', area: 'Giza Plateau' },
  { id: 'p_hotel_london1', title: 'West End Boutique', description: '2 nights, Superior', category: 'Lodging', price: 260,
    continent: 'Europe', country: 'United Kingdom', province: 'England', city: 'London', area: 'Westminster' },
  { id: 'p_tour_london1', title: 'Tower of London Tickets', description: 'Crown Jewels access', category: 'Activity', price: 38,
    continent: 'Europe', country: 'United Kingdom', province: 'England', city: 'London', area: 'Tower Hill' },
  { id: 'p_hotel_barcelona1', title: 'Gothic Quarter Stay', description: '2 nights, Balcony Room', category: 'Lodging', price: 180,
    continent: 'Europe', country: 'Spain', province: 'Catalonia', city: 'Barcelona', area: 'Barri Gòtic' },
  { id: 'p_tour_barcelona1', title: 'Sagrada Família Entry', description: 'Timed ticket + audio', category: 'Activity', price: 32,
    continent: 'Europe', country: 'Spain', province: 'Catalonia', city: 'Barcelona', area: 'Eixample' },
  { id: 'p_hotel_sf1', title: 'Fisherman’s Wharf Hotel', description: '2 nights, Bay View', category: 'Lodging', price: 290,
    continent: 'North America', country: 'United States', province: 'California', city: 'San Francisco', area: 'Fisherman\'s Wharf' },
  { id: 'p_tour_sf1', title: 'Alcatraz Island Tour', description: 'Ferry + cellhouse audio tour', category: 'Tour', price: 45,
    continent: 'North America', country: 'United States', province: 'California', city: 'San Francisco', area: 'Alcatraz' },
  { id: 'p_hotel_bangkok1', title: 'Riverside Hotel Bangkok', description: '2 nights, Deluxe', category: 'Lodging', price: 140,
    continent: 'Asia', country: 'Thailand', province: 'Bangkok', city: 'Bangkok', area: 'Chao Phraya' },
  { id: 'p_activity_bangkok1', title: 'Street Food Night Tour', description: 'Tuk-tuk tastings', category: 'Activity', price: 35,
    continent: 'Asia', country: 'Thailand', province: 'Bangkok', city: 'Bangkok', area: 'Yaowarat' },
  { id: 'p_hotel_toronto1', title: 'Downtown Toronto Hotel', description: '1 night, King Room', category: 'Lodging', price: 170,
    continent: 'North America', country: 'Canada', province: 'Ontario', city: 'Toronto', area: 'Financial District' },
  { id: 'p_activity_toronto1', title: 'CN Tower Experience', description: 'Observation deck tickets', category: 'Activity', price: 28,
    continent: 'North America', country: 'Canada', province: 'Ontario', city: 'Toronto', area: 'South Core' },
  
  // Extra area coverage for popular cities
  // Cape Town
  { id: 'p_ct_walk1', title: 'Bo-Kaap Heritage Walk', description: 'Colorful streets & culture tour', category: 'Activity', price: 35,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Bo-Kaap' },
  { id: 'p_ct_sea1', title: 'Sea Point Promenade Cycle', description: 'Sunset guided bike ride', category: 'Activity', price: 25,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Sea Point' },
  { id: 'p_ct_market1', title: 'Neighbourgoods Market Brunch', description: 'Local eats & crafts', category: 'Dining', price: 22,
    continent: 'Africa', country: 'South Africa', province: 'Western Cape', city: 'Cape Town', area: 'Woodstock' },

  // New York
  { id: 'p_nyc_central1', title: 'Central Park Rowboats', description: 'Boat rental by the hour', category: 'Activity', price: 20,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'Central Park' },
  { id: 'p_nyc_ues1', title: 'Upper East Side Museum Hop', description: 'MET & Guggenheim combo', category: 'Activity', price: 55,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'Upper East Side' },
  { id: 'p_nyc_dumbo1', title: 'DUMBO Pizza Slice Tour', description: 'Iconic views & bites', category: 'Dining', price: 30,
    continent: 'North America', country: 'United States', province: 'New York', city: 'New York', area: 'DUMBO' },

  // Paris
  { id: 'p_paris_mont1', title: 'Montmartre Art Walk', description: 'Sacré-Cœur & artists square', category: 'Tour', price: 28,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Montmartre' },
  { id: 'p_paris_marais1', title: 'Le Marais Gourmet Crawl', description: 'Pastries, falafel, and more', category: 'Dining', price: 42,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Le Marais' },
  { id: 'p_paris_champs1', title: 'Champs-Élysées Shopping Shuttle', description: 'Hotel pickup to boutiques', category: 'Transport', price: 18,
    continent: 'Europe', country: 'France', province: 'Île-de-France', city: 'Paris', area: 'Champs-Élysées' },

  // Tokyo
  { id: 'p_tokyo_akiba1', title: 'Akihabara Retro Arcade Night', description: 'Game tokens & guide', category: 'Experience', price: 32,
    continent: 'Asia', country: 'Japan', province: 'Tokyo', city: 'Tokyo', area: 'Akihabara' },
  { id: 'p_tokyo_asakusa1', title: 'Asakusa Kimono Photoshoot', description: 'Senso-ji temple stroll', category: 'Experience', price: 58,
    continent: 'Asia', country: 'Japan', province: 'Tokyo', city: 'Tokyo', area: 'Asakusa' },
  { id: 'p_tokyo_ginza1', title: 'Ginza Sushi Counter Lunch', description: 'Seasonal omakase set', category: 'Dining', price: 65,
    continent: 'Asia', country: 'Japan', province: 'Tokyo', city: 'Tokyo', area: 'Ginza' },

  // London
  { id: 'p_london_camden1', title: 'Camden Market Street Food', description: 'Global flavors tasting', category: 'Dining', price: 28,
    continent: 'Europe', country: 'United Kingdom', province: 'England', city: 'London', area: 'Camden' },
  { id: 'p_london_shore1', title: 'Shoreditch Street Art Tour', description: 'Murals & hidden alleys', category: 'Tour', price: 26,
    continent: 'Europe', country: 'United Kingdom', province: 'England', city: 'London', area: 'Shoreditch' },
  { id: 'p_london_south1', title: 'South Bank River Walk', description: 'From London Eye to Tate', category: 'Activity', price: 15,
    continent: 'Europe', country: 'United Kingdom', province: 'England', city: 'London', area: 'South Bank' },

  // South Africa — KwaZulu-Natal focus
  // Durban (eThekwini)
  { id: 'kzn_durban_hotel1', title: 'Durban Beachfront Hotel', description: '2 nights, Sea-facing room', category: 'Lodging', price: 180,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Durban', area: 'North Beach' },
  { id: 'kzn_durban_activity1', title: 'uShaka Marine World Combo', description: 'Aquarium + Wet ’n Wild access', category: 'Activity', price: 45,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Durban', area: 'Point Waterfront' },
  { id: 'kzn_durban_tour1', title: 'Golden Mile Cycle Tour', description: 'Guided seaside promenade ride', category: 'Tour', price: 25,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Durban', area: 'Golden Mile' },
  { id: 'kzn_durban_dining1', title: 'Bunny Chow Tasting', description: 'Curries and local favorites', category: 'Dining', price: 18,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Durban', area: 'Florida Road' },
  { id: 'kzn_durban_transfer1', title: 'King Shaka Airport Transfer', description: 'Private transfer to hotel', category: 'Transport', price: 30,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Durban', area: 'King Shaka International' },
  { id: 'kzn_durban_experience1', title: 'Moses Mabhida SkyCar & Swing', description: 'Panoramic views option to Big Swing', category: 'Experience', price: 35,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Durban', area: 'Moses Mabhida Stadium' },

  // Drakensberg
  { id: 'kzn_berg_lodge1', title: 'Drakensberg Mountain Lodge', description: '2 nights, Half-board', category: 'Lodging', price: 220,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Winterton', area: 'Central Drakensberg' },
  { id: 'kzn_berg_activity1', title: 'Amphitheatre Hike', description: 'Guided hike to Tugela Falls viewpoints', category: 'Activity', price: 60,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Royal Natal', area: 'uKhahlamba-Drakensberg Park' },
  { id: 'kzn_berg_tour1', title: 'Sani Pass Day Trip', description: '4x4 adventure up to Lesotho border', category: 'Tour', price: 95,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Underberg', area: 'Sani Pass' },

  // Midlands Meander
  { id: 'kzn_midlands_lodge1', title: 'Midlands Country Stay', description: 'Farmhouse retreat with breakfast', category: 'Lodging', price: 140,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Howick', area: 'Midlands Meander' },
  { id: 'kzn_midlands_activity1', title: 'Howick Falls Visit', description: 'Scenic falls and craft markets', category: 'Activity', price: 10,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Howick', area: 'Howick Falls' },
  { id: 'kzn_midlands_dining1', title: 'Midlands Cheese & Chocolate Trail', description: 'Artisan tastings along the Meander', category: 'Dining', price: 22,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Howick', area: 'Midlands Meander' },

  // North Coast / iSimangaliso / Hluhluwe
  { id: 'kzn_stlucia_lodge1', title: 'St Lucia Estuary Lodge', description: '2 nights, Hippo-view deck', category: 'Lodging', price: 190,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'St Lucia', area: 'iSimangaliso Wetland Park' },
  { id: 'kzn_stlucia_tour1', title: 'Hippo & Croc Boat Safari', description: 'Estuary wildlife cruise', category: 'Tour', price: 35,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'St Lucia', area: 'St Lucia Estuary' },
  { id: 'kzn_hluhluwe_activity1', title: 'Hluhluwe–Imfolozi Game Drive', description: 'Big Five sunrise safari', category: 'Activity', price: 85,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Hluhluwe', area: 'Hluhluwe–Imfolozi Park' },
  { id: 'kzn_ballito_dining1', title: 'Ballito Beach Seafood', description: 'Fresh grill with ocean views', category: 'Dining', price: 28,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Ballito', area: 'Willard Beach' },

  // KZN South Coast — Port Shepstone focus
  { id: 'kzn_ps_hotel1', title: 'Port Shepstone Seaview Guesthouse', description: '2 nights, Ocean-view suite', category: 'Lodging', price: 150,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Shepstone', area: 'Sea Park' },
  { id: 'kzn_ps_activity1', title: 'Oribi Gorge Suspension Bridge & Zipline', description: 'Adrenaline combo at the gorge', category: 'Activity', price: 55,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Shepstone', area: 'Oribi Gorge' },
  { id: 'kzn_ps_tour1', title: 'South Coast Lighthouse & Beach Hop', description: 'Lighthouse stopovers and beach time', category: 'Tour', price: 30,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Shepstone', area: 'Umtentweni / Oslo Beach' },
  { id: 'kzn_ps_dining1', title: 'South Coast Seafood Platter', description: 'Fresh catch with coastal views', category: 'Dining', price: 24,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Shepstone', area: 'Port Shepstone Harbour' },
  { id: 'kzn_ps_transfer1', title: 'Margate Airport Transfer', description: 'Private transfer to Port Shepstone', category: 'Transport', price: 22,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Shepstone', area: 'Margate Airport' },
  { id: 'kzn_ps_experience1', title: 'South Coast Surf Lesson', description: 'Beginner friendly lesson with wetsuit', category: 'Experience', price: 20,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Shepstone', area: 'Umtentweni' },

  // Nearby South Coast towns
  { id: 'kzn_shelly_activity1', title: 'Shelly Beach Protea Banks Dive', description: 'Advanced drift dive (seasonal)', category: 'Activity', price: 85,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Shelly Beach', area: 'Protea Banks' },
  { id: 'kzn_margate_dining1', title: 'Margate Beachfront Café', description: 'Casual brunch & coffee', category: 'Dining', price: 12,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Margate', area: 'Marine Drive' },
  { id: 'kzn_ubi_tour1', title: 'Umtamvuna Nature Reserve Walk', description: 'Guided coastal forest trail', category: 'Tour', price: 18,
    continent: 'Africa', country: 'South Africa', province: 'KwaZulu-Natal', city: 'Port Edward', area: 'Umtamvuna' },
];

// Derive a simple list of “services” to reflect onboarding & partner-facing offerings (lightweight demo)
export const SERVICES = [
  // Client-facing
  { id: 's_quotes', title: 'Quote Generation', description: 'Turn basket items into a shareable quote', path: '/quotes' },
  { id: 's_itinerary', title: 'Itinerary Builder', description: 'Plan day-by-day with notes and progress', path: '/itinerary' },
  { id: 's_bookings', title: 'Bookings & Payments', description: 'Collect securely and track confirmations', path: '/bookings' },
  { id: 's_trip_assist', title: 'Trip Assist', description: 'Draft ideas and refine plans', path: '/ai' },
  // Partner-facing onboarding & ops
  { id: 's_partner', title: 'Partner Onboarding', description: 'Upload rates, licenses, insurance', path: '/partner-dashboard' },
  { id: 's_compliance', title: 'Compliance & Documents', description: 'Manage certifications and status', path: '/partner-dashboard' },
  { id: 's_promotions', title: 'Promotions & Packages', description: 'Create offers and bundles', path: '/partner-dashboard' },
  { id: 's_payouts', title: 'Payouts & Earnings', description: 'Track revenue and payouts', path: '/partner-dashboard' },
];
