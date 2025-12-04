# Gamification System API Reference

## Overview

The CollEco gamification system provides automatic point awards, challenge tracking, achievements, leaderboards, and rewards for both travelers and partners. All features are POPI Act compliant with privacy-by-design principles.

## Core Modules

### 1. Gamification Engine (`src/utils/gamificationEngine.js`)

Core engine for points, challenges, achievements, and leaderboards.

#### Point System

```javascript
import { awardPoints, POINT_VALUES } from './gamificationEngine';

// Award points to a user
const result = awardPoints(userId, action, multiplier);

// Parameters:
// - userId: string - User identifier
// - action: string - Action type (see POINT_VALUES)
// - multiplier: number - Point multiplier (default: 1)

// Returns:
{
  success: true,
  pointsAwarded: 50,
  totalPoints: 150,
  action: 'trip_completed'
}
```

**Available Actions & Point Values:**

| Action | Points | Description |
|--------|--------|-------------|
| `booking_made` | 15 | User creates a booking |
| `booking_confirmed` | 25 | Booking is confirmed |
| `trip_completed` | 50 | User completes a trip |
| `review_written` | 20 | User submits a review |
| `profile_complete` | 100 | User completes their profile |
| `profile_photo` | 25 | User adds profile photo |
| `referral_signup` | 100 | Referred user signs up |
| `referral_booking` | 500 | Referred user makes booking |
| `quick_response` | 5 | Partner responds < 1 hour |

#### Challenge System

```javascript
import { getActiveChallenges, updateChallengeProgress } from './gamificationEngine';

// Get user's active challenges
const challenges = getActiveChallenges(userId, userType);
// userType: 'partner' | 'traveler'

// Returns:
[
  {
    id: 'first_trip',
    title: 'First Adventure',
    description: 'Complete your first trip',
    category: 'milestone',
    type: 'traveler',
    target: 1,
    progress: 0,
    pointReward: 100,
    completed: false
  }
]

// Update challenge progress
const result = updateChallengeProgress(userId, challengeId, value, operation);
// operation: 'increment' | 'set'

// Returns:
{
  success: true,
  challengeId: 'revenue_starter',
  progress: 5000,
  target: 10000,
  completed: false
}
```

**Partner Challenges:**

| Challenge ID | Title | Target | Points |
|-------------|-------|--------|--------|
| `revenue_starter` | Revenue Starter | R10,000 | 100 |
| `revenue_pro` | Revenue Pro | R50,000 | 500 |
| `revenue_master` | Revenue Master | R100,000 | 1,000 |
| `booking_milestone_10` | First 10 Bookings | 10 | 200 |
| `booking_milestone_50` | 50 Bookings | 50 | 750 |
| `high_occupancy` | High Occupancy | 30 days @ 90%+ | 500 |
| `five_star_streak` | Five Star Streak | 20 reviews | 1,000 |

**Traveler Challenges:**

| Challenge ID | Title | Target | Points |
|-------------|-------|--------|--------|
| `first_trip` | First Adventure | 1 trip | 100 |
| `trip_veteran` | Trip Veteran | 10 trips | 500 |
| `country_collector` | Country Collector | 5 countries | 750 |
| `big_spender` | Big Spender | R50,000 | 1,000 |
| `review_champion` | Review Champion | 10 reviews | 500 |
| `referral_champion` | Referral Champion | 5 referrals | 1,500 |

#### Achievement System

```javascript
import { getAchievements, BADGES } from './gamificationEngine';

// Get user's achievements
const achievements = getAchievements(userId);

// Returns:
{
  badges: [
    {
      id: 'bronze_traveler',
      name: 'Bronze Traveler',
      description: 'Reach 100 points',
      tier: 'bronze',
      icon: 'Trophy',
      color: 'text-amber-600',
      unlockedAt: '2025-12-04T10:30:00Z'
    }
  ],
  totalPoints: 150,
  challengesCompleted: 2,
  currentTier: 'bronze'
}
```

**Badge Tiers:**

- **Bronze**: 100+ points
- **Silver**: 500+ points
- **Gold**: 1,500+ points
- **Platinum**: 3,000+ points

#### Streak System

```javascript
import { updateStreak, getStreaks } from './gamificationEngine';

// Update user's streak
const streak = updateStreak(userId, action);
// action: 'login' | 'booking' | 'review'

// Returns:
{
  current: 7,
  longest: 10,
  lastDate: '2025-12-04'
}

// Get all streaks
const streaks = getStreaks(userId);

// Returns:
{
  login: { current: 7, longest: 10, lastDate: '2025-12-04' },
  booking: { current: 2, longest: 5, lastDate: '2025-12-03' }
}
```

**Streak Bonuses:**

- 7-day streak: +50 points
- 30-day streak: +200 points
- 100-day streak: +1,000 points

#### Leaderboard System

```javascript
import { getLeaderboard, updateLeaderboard, getUserRank } from './gamificationEngine';

// Get leaderboard (POPI-compliant)
const leaderboard = getLeaderboard(type, category, timeframe, currentUserId);
// type: 'partner' | 'traveler'
// category: 'revenue' | 'bookings' | 'rating' | 'points' | 'trips'
// timeframe: 'weekly' | 'monthly' | 'all_time'

// Returns:
[
  {
    rank: 1,
    userId: 'partner_123', // Current user - real ID
    displayName: 'My Hotel', // Current user - real name
    value: 50000,
    city: 'Durban',
    lastUpdated: '2025-12-04T10:30:00Z'
  },
  {
    rank: 2,
    userId: 'anonymized_001', // Other user - anonymized
    displayName: 'User 2', // Other user - anonymized
    value: 45000,
    city: null, // Hidden if no consent
    lastUpdated: '2025-12-03T15:20:00Z'
  }
]

// Update leaderboard entry
updateLeaderboard(userId, userType, category, value, metadata);

// Get user's rank
const rank = getUserRank(userId, userType, category, timeframe);

// Returns:
{
  rank: 15,
  total: 234,
  value: 25000,
  percentile: 93.6
}
```

#### Reward Tiers

```javascript
import { getRewardTier, REWARD_TIERS } from './gamificationEngine';

// Get user's reward tier
const tier = getRewardTier(userId);

// Returns:
{
  name: 'Gold',
  minPoints: 1500,
  discount: 0.15, // 15%
  color: 'yellow',
  benefits: [
    '15% discount on all bookings',
    'Priority customer support',
    'Exclusive partner deals',
    'Early access to new features'
  ]
}
```

**Tier Levels:**

| Tier | Min Points | Discount | Benefits |
|------|-----------|----------|----------|
| Bronze | 0 | 5% | Basic perks |
| Silver | 500 | 10% | Priority support |
| Gold | 1,500 | 15% | Exclusive deals |
| Platinum | 3,000 | 20% | VIP treatment |

#### POPI Compliance

```javascript
import { getLeaderboardConsent, setLeaderboardConsent } from './gamificationEngine';

// Get user's consent status
const consent = getLeaderboardConsent(userId);

// Returns:
{
  enabled: false,
  showCity: false,
  showBusinessName: false,
  updatedAt: '2025-12-04T10:30:00Z'
}

// Set consent preferences
setLeaderboardConsent(userId, {
  enabled: true,
  showCity: true,
  showBusinessName: true
});
```

---

### 2. Gamification Integration (`src/utils/gamificationIntegration.js`)

Auto-trigger functions for booking flows and user actions.

#### Booking Flow Integration

```javascript
import {
  onBookingCreated,
  onBookingConfirmed,
  onTripCompleted
} from './gamificationIntegration';

// Example: Booking creation
const handleBookingCreated = async (bookingData) => {
  const result = onBookingCreated(userId, userType, {
    bookingId: 'BK-2025-001',
    totalAmount: 5000,
    destination: 'Cape Town'
  });
  
  if (result.success) {
    console.log(`Awarded ${result.pointsAwarded} points`);
    console.log(`Updated challenges: ${result.challengesUpdated.join(', ')}`);
  }
};

// Example: Booking confirmation
const handleBookingConfirmed = async (bookingData) => {
  const result = onBookingConfirmed(userId, userType, {
    bookingId: 'BK-2025-001',
    totalAmount: 5000,
    partnerId: 'partner_456'
  });
};

// Example: Trip completion
const handleTripCompleted = async (tripData) => {
  const result = onTripCompleted(userId, {
    tripId: 'TRIP-001',
    destination: 'Paris',
    country: 'France'
  });
};
```

#### Review System Integration

```javascript
import { onReviewSubmitted } from './gamificationIntegration';

const handleReviewSubmission = async (reviewData) => {
  const result = onReviewSubmitted(userId, userType, {
    reviewId: 'REV-001',
    rating: 5,
    comment: 'Excellent service!',
    forPartnerId: 'partner_456' // Optional
  });
  
  // Awards 20 points
  // Updates review challenges
  // For 5-star reviews: updates five_star_streak
};
```

#### Loyalty Integration

```javascript
import { onLoyaltyTierReached } from './gamificationIntegration';

const handleTierUpgrade = async (tierData) => {
  const result = onLoyaltyTierReached(userId, {
    tier: 'gold',
    previousTier: 'silver'
  });
  
  // Awards tier bonus points:
  // Bronze: 100 pts, Silver: 500 pts, Gold: 1,500 pts, Platinum: 3,000 pts
};
```

#### Referral Integration

```javascript
import { onReferralSignup, onReferralBooking } from './gamificationIntegration';

// Referral signs up
const handleReferralSignup = async (referralData) => {
  const result = onReferralSignup(userId, {
    referredUserId: 'user_456',
    referralCode: 'REF123'
  });
  // Awards 100 points
};

// Referral makes booking
const handleReferralBooking = async (referralData) => {
  const result = onReferralBooking(userId, {
    referredUserId: 'user_456',
    bookingId: 'BK-001',
    bookingAmount: 5000
  });
  // Awards 500 points
  // Updates referral_champion challenge
};
```

#### Partner Metrics Integration

```javascript
import {
  onPartnerQuickResponse,
  onOccupancyUpdate,
  onPartnerRatingUpdate
} from './gamificationIntegration';

// Quick response bonus
const handleResponse = async (responseData) => {
  const result = onPartnerQuickResponse(partnerId, {
    responseTimeMinutes: 30,
    inquiryId: 'INQ-001'
  });
  // Awards 5 points if response < 60 minutes
};

// Occupancy tracking
const handleOccupancyUpdate = async (occupancyData) => {
  const result = onOccupancyUpdate(partnerId, {
    occupancyRate: 95,
    date: new Date().toISOString()
  });
  // Updates high_occupancy challenge if >= 90%
};

// Rating updates
const handleRatingUpdate = async (ratingData) => {
  const result = onPartnerRatingUpdate(partnerId, {
    averageRating: 4.8,
    totalReviews: 50
  });
  // Updates rating leaderboard
};
```

#### Profile Integration

```javascript
import { onProfileCompleted, onProfilePhotoAdded } from './gamificationIntegration';

// Profile completion
const handleProfileComplete = async () => {
  const result = onProfileCompleted(userId);
  // Awards 100 points
};

// Profile photo
const handlePhotoAdded = async () => {
  const result = onProfilePhotoAdded(userId);
  // Awards 25 points
};
```

#### Login Streak Integration

```javascript
import { onUserLogin } from './gamificationIntegration';

const handleUserLogin = async () => {
  const result = onUserLogin(userId);
  
  if (result.streak === 7) {
    console.log('7-day streak bonus: +50 points!');
  } else if (result.streak === 30) {
    console.log('30-day streak bonus: +200 points!');
  }
  
  // Returns: { success: true, streak: 7, bonusPoints: 50 }
};
```

#### Batch Processing

```javascript
import { batchProcessEvents } from './gamificationIntegration';

const events = [
  { type: 'booking_created', userId: 'user_123', userType: 'traveler', data: {...} },
  { type: 'profile_completed', userId: 'user_123', data: {} },
  { type: 'review_submitted', userId: 'user_456', userType: 'traveler', data: {...} }
];

const results = batchProcessEvents(events);

// Returns array of results
// Useful for bulk imports or migrations
```

---

### 3. Gamification Widget (`src/components/GamificationWidget.jsx`)

React component for displaying gamification status.

#### Usage

```jsx
import GamificationWidget from './components/GamificationWidget';

// Compact mode (for headers/nav)
<GamificationWidget userId={user.id} compact={true} />

// Full mode (for dashboards)
<GamificationWidget userId={user.id} compact={false} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | string | required | User identifier |
| `compact` | boolean | false | Display mode |

#### Events

The widget listens for custom events:

```javascript
// Dispatch point award event
window.dispatchEvent(new CustomEvent('gamification:points-awarded', {
  detail: {
    userId: 'user_123',
    points: 50,
    action: 'booking_confirmed'
  }
}));
```

#### Features

- **Real-time updates**: Listens for point award events
- **Animated point display**: Floats up and fades on award
- **Streak tracking**: Shows current daily streak
- **Tier display**: Shows current reward tier
- **Badge count**: Shows total badges earned
- **Clickable**: Navigates to `/gamification` page

---

## Event System

The gamification system uses custom browser events for real-time updates.

### Event: `gamification:points-awarded`

Dispatched when points are awarded to a user.

```javascript
window.addEventListener('gamification:points-awarded', (event) => {
  const { userId, points, action } = event.detail;
  console.log(`User ${userId} earned ${points} points for ${action}`);
});
```

**Event Detail:**

```javascript
{
  userId: 'user_123',
  points: 50,
  action: 'trip_completed',
  totalPoints: 150,
  tier: 'bronze'
}
```

---

## Storage Schema

All gamification data is stored in localStorage with the following keys:

### User Points

```
colleco.gamification.points.{userId}
```

```json
{
  "total": 150,
  "history": [
    {
      "action": "booking_made",
      "points": 15,
      "timestamp": "2025-12-04T10:30:00Z"
    }
  ]
}
```

### Challenge Progress

```
colleco.gamification.challenges.{userId}
```

```json
{
  "first_trip": {
    "progress": 1,
    "target": 1,
    "completed": true,
    "completedAt": "2025-12-04T10:30:00Z"
  }
}
```

### Streaks

```
colleco.gamification.streaks.{userId}
```

```json
{
  "login": {
    "current": 7,
    "longest": 10,
    "lastDate": "2025-12-04"
  }
}
```

### Leaderboards

```
colleco.gamification.leaderboard.{userType}
```

```json
[
  {
    "userId": "partner_123",
    "revenue": 50000,
    "bookings": 45,
    "rating": 4.8,
    "lastUpdated": "2025-12-04T10:30:00Z",
    "metadata": {
      "businessName": "My Hotel",
      "city": "Durban"
    }
  }
]
```

### Consent

```
colleco.gamification.consent.{userId}
```

```json
{
  "leaderboard": {
    "enabled": true,
    "showCity": true,
    "showBusinessName": false,
    "updatedAt": "2025-12-04T10:30:00Z"
  }
}
```

---

## Integration Examples

### Complete Booking Flow

```javascript
// 1. User creates booking
const bookingData = {
  bookingId: 'BK-2025-001',
  userId: 'user_123',
  userType: 'traveler',
  totalAmount: 5000,
  partnerId: 'partner_456'
};

// Award points
onBookingCreated(bookingData.userId, bookingData.userType, bookingData);

// 2. Partner confirms booking
onBookingConfirmed(bookingData.partnerId, 'partner', {
  ...bookingData,
  userId: bookingData.userId
});

// 3. User completes trip
onTripCompleted(bookingData.userId, {
  tripId: 'TRIP-001',
  destination: 'Cape Town',
  country: 'South Africa'
});

// 4. User writes review
onReviewSubmitted(bookingData.userId, 'traveler', {
  reviewId: 'REV-001',
  rating: 5,
  comment: 'Amazing!',
  forPartnerId: bookingData.partnerId
});
```

### Dashboard Integration

```jsx
import GamificationWidget from './components/GamificationWidget';
import { getAchievements, getStreaks } from './utils/gamificationEngine';

function TravelerDashboard() {
  const [achievements, setAchievements] = useState(null);
  const [streaks, setStreaks] = useState(null);
  
  useEffect(() => {
    const userId = 'user_123';
    setAchievements(getAchievements(userId));
    setStreaks(getStreaks(userId));
  }, []);
  
  return (
    <div>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <GamificationWidget userId="user_123" compact={false} />
      </div>
      
      {/* Mobile main column */}
      <div className="lg:hidden">
        <GamificationWidget userId="user_123" compact={false} />
      </div>
    </div>
  );
}
```

---

## Testing

### Unit Tests

```bash
npm run test tests/gamificationEngine.test.js
npm run test tests/gamificationIntegration.test.js
```

### E2E Tests

```bash
npm run cy:open
# Select: cypress/e2e/gamification.cy.js
```

---

## Migration Guide

### Backend Migration (Future)

When migrating to backend API:

1. **Points System**: Replace `awardPoints()` with API call
2. **Challenges**: Fetch from `/api/gamification/challenges`
3. **Leaderboards**: Fetch from `/api/gamification/leaderboard`
4. **Real-time**: Use WebSocket for live updates

### Database Schema (Recommended)

```sql
CREATE TABLE user_points (
  user_id VARCHAR(255) PRIMARY KEY,
  total_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE point_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  points INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_points(user_id)
);

CREATE TABLE challenge_progress (
  user_id VARCHAR(255) NOT NULL,
  challenge_id VARCHAR(50) NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  target INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  PRIMARY KEY (user_id, challenge_id)
);

CREATE TABLE leaderboard_entries (
  user_id VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  value INT NOT NULL,
  metadata JSON,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, category)
);
```

---

## Performance Considerations

### Optimization Tips

1. **Batch operations**: Use `batchProcessEvents()` for bulk processing
2. **Debounce updates**: Avoid updating leaderboards on every point award
3. **Cache results**: Cache leaderboard data for 5-10 minutes
4. **Lazy loading**: Load challenge details only when needed
5. **Event throttling**: Throttle UI update events to avoid excessive re-renders

### Scaling Recommendations

- **localStorage limits**: ~5-10MB per domain
- **Current usage**: ~50-100KB per user (safe for MVP)
- **Migration trigger**: 1,000+ active users or 100+ entries per leaderboard
- **Backend migration**: Q1 2026 (planned)

---

## Support

For questions or issues:
- **Documentation**: `docs/GAMIFICATION_POPI_COMPLIANCE.md`
- **Privacy**: `docs/PRIVACY_PROTECTION_FRAMEWORK.md`
- **Issues**: GitHub Issues
- **Email**: support@colleco.co.za
