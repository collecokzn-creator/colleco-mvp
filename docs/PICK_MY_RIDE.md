# Pick My Ride Feature Documentation

## Overview

The "Pick My Ride" feature empowers clients to choose their preferred shuttle/transfer based on multiple criteria: brand name, driver familiarity, pricing, popularity, and service ratings. This gives users complete control over their travel experience and builds trust through transparency.

## Features

### 🎯 Selection Criteria

#### 1. Brand Selection
- **View All Brands**: See transfers from Uber, Bolt, inDrive, DiDi, Executive Transfers, Luxury Rides, and more
- **Premium Filter**: Identify premium brands with special badges
- **Brand Trust**: Choose familiar names you know and trust
- **Brand Comparison**: Compare services across different providers

#### 2. Driver Selection
- **Favorite Drivers**: Mark drivers as favorites for quick access
- **Driver History**: See total trips completed and reviews
- **Verified Drivers**: Visual verification badges
- **Super Driver Status**: Elite drivers with exceptional ratings
- **Languages Spoken**: Filter by language preferences (English, Zulu, Afrikaans, etc.)
- **Specialties**: Airport transfers, corporate travel, long distance, tourism, etc.

#### 3. Price-Based Selection
- **Lowest Price**: Automatically identify budget options
- **Price Comparison**: See all prices in one view
- **Premium Pricing**: Higher prices for luxury/executive service
- **Price Labels**: "Lowest Price", "Competitive", "Premium" badges
- **Transparent Pricing**: No hidden fees, see exact cost upfront

#### 4. Rating & Reviews
- **Star Ratings**: 5-star system with decimal precision (e.g., 4.8)
- **Review Count**: Total number of customer reviews
- **Recent Reviews**: See latest customer feedback
- **Top Rated Filter**: Show only 4.5+ rated drivers
- **Color-Coded Ratings**: Green (4.8+), Blue (4.5+), Yellow (4.0+)

#### 5. Popularity Selection
- **Trip Count**: See how many trips driver has completed
- **Popular Badge**: Automatically assigned to high-volume, high-rated drivers
- **Trending**: Most-booked drivers highlighted
- **Reliability Indicator**: More trips = more experience

### 🔍 Filters & Sorting

#### Available Filters
1. **All Rides** - Show everything
2. **My Favorites** - Only favorite drivers
3. **Premium Brands** - Luxury/executive services only
4. **Budget Options** - Lowest-priced rides
5. **Top Rated** - 4.5+ stars only

#### Sorting Options
1. **Recommended** - AI-weighted scoring (rating 40% + popularity 30% + favorites 30%)
2. **Price: Low to High** - Budget-first sorting
3. **Price: High to Low** - Premium-first sorting
4. **Highest Rated** - Best customer satisfaction
5. **Most Popular** - Most experienced drivers

### 🚗 Ride Information Display

Each ride card shows:
- **Driver Photo** with verification badge
- **Driver Name** with favorite heart icon
- **Brand Name** with premium badge (if applicable)
- **Star Rating** with color coding
- **Review Count** 
- **Total Trips Completed**
- **Estimated Arrival Time** (5-20 minutes)
- **Vehicle Details**: Model, color, license plate
- **Vehicle Features**: AC, WiFi, leather seats, etc.
- **Languages Spoken**: Communication preferences
- **Driver Specialties**: Expertise areas
- **Latest Review**: Recent customer feedback
- **Price** with label (lowest, competitive, premium)
- **Special Badges**: Popular choice, super driver, verified

### 💝 Favorite Drivers

- **Save Favorites**: Heart icon to mark preferred drivers
- **Persistent Storage**: Favorites saved in localStorage
- **Quick Filter**: View only your favorite drivers
- **Recommendation Boost**: Favorites scored higher in recommendations

## User Flow

### 1. Initiate Booking
```
User fills out transfer form:
- Pickup location
- Dropoff location
- Date/time
- Passengers
- Vehicle type
- Special requirements
```

### 2. Click "Request Transfer"
- Form validation runs
- If valid, "Pick My Ride" modal opens
- Backend fetches available rides matching criteria

### 3. Browse Available Rides
- See 8 different ride options
- Each with unique driver, brand, price, rating
- Filter and sort as desired

### 4. Select Preferred Ride
- Click on ride card to select
- Card highlights in orange
- Price shown in confirmation button

### 5. Confirm Selection
- Click "Confirm Ride - R850" button
- Booking submitted with selected ride details
- Matched driver receives request

## Backend API

### Endpoint: `POST /api/transfers/available-rides`

**Request Body:**
```json
{
  "pickup": "Durban",
  "dropoff": "Port Shepstone",
  "vehicleType": "sedan",
  "passengers": 2
}
```

**Response:**
```json
{
  "ok": true,
  "rides": [
    {
      "id": "RIDE-1234567890-0",
      "brand": {
        "id": "uber",
        "name": "Uber",
        "isPremium": false
      },
      "driver": {
        "id": "DRV001",
        "name": "Thabo Mkhize",
        "photo": null,
        "isVerified": true,
        "isSuperDriver": true,
        "languages": ["English", "Zulu", "Afrikaans"],
        "specialties": ["Airport Transfers", "Long Distance"],
        "rating": 4.9,
        "totalReviews": 342,
        "completedTrips": 1250
      },
      "vehicle": {
        "model": "Toyota Corolla",
        "color": "Silver",
        "plate": "CA 123-456",
        "features": ["AC", "USB Charging"]
      },
      "price": 850,
      "rating": 4.9,
      "totalReviews": 342,
      "completedTrips": 1250,
      "estimatedArrival": 12,
      "isPopular": true,
      "latestReview": {
        "author": "David M.",
        "comment": "Excellent service, very professional and on time!"
      }
    }
    // ... 7 more rides
  ],
  "pickup": "Durban",
  "dropoff": "Port Shepstone",
  "requestedVehicleType": "sedan"
}
```

### Ride Generation Logic

**Price Calculation:**
- Base price: R850
- Premium brand: +30%
- Super driver: +15%
- High rating (4.9+): +10%
- Market variation: ±10% randomness

**Popularity Determination:**
- Trips > 1000 AND rating ≥ 4.8 = Popular

**Driver Pool:**
- 8 diverse drivers with varied backgrounds
- Different language combinations
- Specialty areas (corporate, tourism, budget, luxury)
- Rating range: 4.6 - 5.0
- Trip range: 320 - 1580

**Brand Mix:**
- Standard: Uber, Bolt, inDrive, DiDi, Coastal, City Cabs
- Premium: Executive Transfers, Luxury Rides SA

## UI Components

### RideSelector Component

**Props:**
- `pickup` (string): Pickup location
- `dropoff` (string): Dropoff location
- `vehicleType` (string): Requested vehicle type
- `passengers` (number): Passenger count
- `onSelectRide` (function): Callback when ride confirmed
- `onCancel` (function): Callback when modal closed

**State Management:**
- `rides`: Array of available rides
- `loading`: Fetch state
- `filterBy`: Current filter selection
- `sortBy`: Current sort method
- `favoriteDrivers`: Array of favorite driver IDs (from localStorage)
- `selectedRide`: Currently selected ride object

**Local Storage:**
- Key: `colleco.favoriteDrivers`
- Value: JSON array of driver IDs
- Persists across sessions

## Integration Points

### Transfers Page
1. Import RideSelector component
2. Add state for `showRideSelector` and `selectedRide`
3. Modify `submitRequest()` to show selector instead of immediate booking
4. Add `confirmRideSelection()` to handle selection and booking
5. Render RideSelector modal conditionally

### Booking Payload
Selected ride details included in transfer request:
```json
{
  ...standard fields,
  "selectedRide": {
    "rideId": "RIDE-1234567890-0",
    "driverId": "DRV001",
    "driverName": "Thabo Mkhize",
    "brandId": "uber",
    "brandName": "Uber",
    "vehicleModel": "Toyota Corolla",
    "vehiclePlate": "CA 123-456",
    "agreedPrice": 850
  }
}
```

## Benefits

### For Clients
✅ **Transparency**: See all options before committing
✅ **Control**: Choose based on personal preferences
✅ **Trust**: Familiar brands and favorite drivers
✅ **Value**: Compare prices and find best deal
✅ **Quality**: Select highly-rated, experienced drivers
✅ **Predictability**: Know exact price and driver upfront

### For Business
✅ **Customer Satisfaction**: Empowered choice increases satisfaction
✅ **Driver Competition**: Encourages quality service
✅ **Market Insights**: See which brands/drivers preferred
✅ **Premium Upsell**: Easier to justify higher prices when transparent
✅ **Loyalty Building**: Favorite system encourages repeat bookings
✅ **Reduced Disputes**: Pre-agreed pricing and driver selection

### For Drivers
✅ **Recognition**: Ratings and reviews prominently displayed
✅ **Reward Excellence**: Super driver status for top performers
✅ **Fair Pricing**: Premium service commands premium rates
✅ **Customer Relationship**: Build loyal client base through favorites
✅ **Specialization**: Highlight unique skills and languages

## Best Practices

### For Users
1. **Check Reviews**: Read recent customer feedback
2. **Save Favorites**: Mark good drivers for future bookings
3. **Compare Prices**: Don't always choose cheapest - consider value
4. **Filter Smart**: Use filters to narrow down quickly
5. **Read Specialties**: Match driver skills to your needs

### For Implementation
1. **Keep Data Fresh**: Update driver stats in real-time
2. **Validate Availability**: Confirm driver actually available before showing
3. **Cache Favorites**: Store in localStorage for offline access
4. **Monitor Performance**: Track which filters/sorts most used
5. **A/B Test Defaults**: Experiment with default sort order

## Accessibility

- ✅ Keyboard navigation support
- ✅ Clear visual indicators for selection
- ✅ Color-coded ratings with text labels
- ✅ Large touch targets for mobile
- ✅ Screen reader friendly structure
- ✅ Focus management in modal

## Mobile Responsiveness

- Stacks filters vertically on small screens
- Ride cards adapt to screen width
- Fixed header and footer for easy navigation
- Scroll optimization for long lists
- Touch-friendly buttons and cards

## Future Enhancements

1. **Photos**: Real driver and vehicle photos
2. **Live Location**: Show driver current location on map
3. **Chat Before Booking**: Message driver before confirming
4. **Price Negotiation**: For inDrive-style bidding
5. **Schedule Viewing**: See driver's availability calendar
6. **Video Profiles**: Driver introduction videos
7. **Insurance Info**: Coverage details per ride
8. **Carbon Offset**: Environmental impact display
9. **Multi-Select**: Book multiple rides at once
10. **Share Ride**: Send ride details to travel companions

---

**Status**: ✅ Fully Implemented
**Integration**: ✅ Transfers page
**Backend**: ✅ `/api/transfers/available-rides`
**Documentation**: ✅ Complete
