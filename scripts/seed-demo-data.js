/**
 * Seed demo data for CollEco Travel analytics
 * Run this in browser console to populate localStorage with sample data
 */

const SAMPLE_BOOKINGS = [
  {
    id: 'BK001',
    destination: 'Cape Town',
    status: 'confirmed',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 12500,
    userId: 'user1',
    user: 'John Smith',
    country: 'South Africa'
  },
  {
    id: 'BK002',
    destination: 'Cape Town',
    status: 'confirmed',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 8900,
    userId: 'user2',
    user: 'Jane Doe',
    country: 'South Africa'
  },
  {
    id: 'BK003',
    destination: 'Johannesburg',
    status: 'pending',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 6700,
    userId: 'user3',
    user: 'Mike Johnson',
    country: 'South Africa'
  },
  {
    id: 'BK004',
    destination: 'Durban',
    status: 'confirmed',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 9800,
    userId: 'user1',
    user: 'John Smith',
    country: 'South Africa'
  },
  {
    id: 'BK005',
    destination: 'Kruger National Park',
    status: 'confirmed',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 15600,
    userId: 'user4',
    user: 'Sarah Williams',
    country: 'South Africa'
  },
  {
    id: 'BK006',
    destination: 'Cape Town',
    status: 'cancelled',
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 0,
    userId: 'user2',
    user: 'Jane Doe',
    country: 'South Africa'
  },
  {
    id: 'BK007',
    destination: 'Johannesburg',
    status: 'confirmed',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 7200,
    userId: 'user5',
    user: 'David Brown',
    country: 'South Africa'
  },
  {
    id: 'BK008',
    destination: 'Durban',
    status: 'pending',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 5400,
    userId: 'user3',
    user: 'Mike Johnson',
    country: 'South Africa'
  },
  {
    id: 'BK009',
    destination: 'Port Elizabeth',
    status: 'confirmed',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 8500,
    userId: 'user1',
    user: 'John Smith',
    country: 'South Africa'
  },
  {
    id: 'BK010',
    destination: 'Garden Route',
    status: 'confirmed',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 22000,
    userId: 'user4',
    user: 'Sarah Williams',
    country: 'South Africa'
  }
];

const SAMPLE_TRAVEL_HISTORY = [
  {
    id: 'TH001',
    destination: 'Cape Town',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 13200,
    user: 'user1',
    country: 'South Africa'
  },
  {
    id: 'TH002',
    destination: 'Cape Town',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 11500,
    user: 'user2',
    country: 'South Africa'
  },
  {
    id: 'TH003',
    destination: 'Johannesburg',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 8900,
    user: 'user1',
    country: 'South Africa'
  },
  {
    id: 'TH004',
    destination: 'Kruger National Park',
    date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 16800,
    user: 'user4',
    country: 'South Africa'
  },
  {
    id: 'TH005',
    destination: 'Durban',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 9200,
    user: 'user3',
    country: 'South Africa'
  },
  {
    id: 'TH006',
    destination: 'Stellenbosch',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 5600,
    user: 'user2',
    country: 'South Africa'
  },
  {
    id: 'TH007',
    destination: 'Hermanus',
    date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 7800,
    user: 'user5',
    country: 'South Africa'
  }
];

const SAMPLE_USERS = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'client',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user2',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'client',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'business-traveler',
    type: 'business',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    role: 'client',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'business-traveler',
    type: 'business',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@colleco.travel',
    role: 'admin',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SAMPLE_LISTINGS = [
  {
    id: 'LST001',
    title: 'Luxury Cape Town Hotel',
    status: 'active',
    partnerId: 'partner1',
    price: 2500,
    category: 'hotel'
  },
  {
    id: 'LST002',
    title: 'Table Mountain Cable Car Tour',
    status: 'active',
    partnerId: 'partner2',
    price: 450,
    category: 'tour'
  },
  {
    id: 'LST003',
    title: 'Garden Route Road Trip Package',
    status: 'active',
    partnerId: 'partner3',
    price: 12000,
    category: 'activity'
  },
  {
    id: 'LST004',
    title: 'Airport Shuttle Service',
    status: 'active',
    partnerId: 'partner4',
    price: 350,
    category: 'car-hire'
  },
  {
    id: 'LST005',
    title: 'Kruger Safari Lodge',
    status: 'active',
    partnerId: 'partner1',
    price: 4500,
    category: 'hotel'
  },
  {
    id: 'LST006',
    title: 'Wine Tasting Experience',
    status: 'active',
    partnerId: 'partner5',
    price: 850,
    category: 'tour'
  },
  {
    id: 'LST007',
    title: 'Durban Beach Resort',
    status: 'inactive',
    partnerId: 'partner6',
    price: 1800,
    category: 'hotel'
  },
  {
    id: 'LST008',
    title: 'Pending New Tour Package',
    status: 'pending',
    partnerId: 'partner2',
    price: 950,
    category: 'tour'
  }
];

const SAMPLE_ITINERARIES = [
  {
    id: 'IT001',
    title: 'Cape Town Explorer - 5 Days',
    destination: 'Cape Town',
    days: 5,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user1'
  },
  {
    id: 'IT002',
    title: 'Johannesburg Business Trip',
    destination: 'Johannesburg',
    days: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user3'
  },
  {
    id: 'IT003',
    title: 'Garden Route Adventure',
    destination: 'Garden Route',
    days: 7,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'user4'
  }
];

// Seed the data
localStorage.setItem('colleco.bookings', JSON.stringify(SAMPLE_BOOKINGS));
localStorage.setItem('colleco.travel.history', JSON.stringify(SAMPLE_TRAVEL_HISTORY));
localStorage.setItem('colleco.users', JSON.stringify(SAMPLE_USERS));
localStorage.setItem('colleco.listings', JSON.stringify(SAMPLE_LISTINGS));
localStorage.setItem('colleco.itineraries', JSON.stringify(SAMPLE_ITINERARIES));

// Set demo user
localStorage.setItem('colleco.user', JSON.stringify(SAMPLE_USERS[0]));
localStorage.setItem('colleco.user.id', SAMPLE_USERS[0].id);

console.log('✅ Demo data seeded successfully!');
console.log(`📊 Added ${SAMPLE_BOOKINGS.length} bookings`);
console.log(`🗺️  Added ${SAMPLE_TRAVEL_HISTORY.length} travel history entries`);
console.log(`👥 Added ${SAMPLE_USERS.length} users`);
console.log(`📦 Added ${SAMPLE_LISTINGS.length} listings/packages`);
console.log(`🗓️  Added ${SAMPLE_ITINERARIES.length} saved itineraries`);
console.log('🔄 Refresh the page to see updated analytics');
console.log('');
console.log('📈 Now showing consistent data across:');
console.log('  - Analytics Dashboard');
console.log('  - Reports Page');
console.log('  - Admin Dashboard');
console.log('  - Traveler Dashboard');
console.log('  - Business Dashboard');
