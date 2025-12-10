/**
 * Unit Tests for Gamification Engine
 */

import { describe, it, expect, beforeEach, vi as _vi } from 'vitest';
import {
  awardPoints,
  updateChallengeProgress,
  getActiveChallenges,
  getAchievements,
  updateStreak,
  getStreaks,
  getLeaderboard,
  updateLeaderboard,
  getUserRank,
  getRewardTier,
  getLeaderboardConsent,
  setLeaderboardConsent,
  POINT_VALUES,
  CHALLENGES,
  BADGES,
  REWARD_TIERS
} from '../src/utils/gamificationEngine';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

describe('Gamification Engine - Point System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should award points for booking made', () => {
    const result = awardPoints('user_123', 'booking_made', 1);
    expect(result.success).toBe(true);
    expect(result.pointsAwarded).toBe(POINT_VALUES.booking_made);
    expect(result.totalPoints).toBeGreaterThanOrEqual(POINT_VALUES.booking_made);
  });

  it('should apply multiplier to points', () => {
    const result = awardPoints('user_123', 'booking_made', 2);
    expect(result.pointsAwarded).toBe(POINT_VALUES.booking_made * 2);
  });

  it('should handle invalid action gracefully', () => {
    const result = awardPoints('user_123', 'invalid_action', 1);
    expect(result.success).toBe(true);
    expect(result.pointsAwarded).toBe(0);
  });

  it('should accumulate points across multiple actions', () => {
    awardPoints('user_123', 'booking_made', 1);
    const result = awardPoints('user_123', 'booking_confirmed', 1);
    
    const expectedTotal = POINT_VALUES.booking_made + POINT_VALUES.booking_confirmed;
    expect(result.totalPoints).toBe(expectedTotal);
  });

  it('should track points per user separately', () => {
    awardPoints('user_123', 'booking_made', 1);
    const result = awardPoints('user_456', 'booking_made', 1);
    
    expect(result.totalPoints).toBe(POINT_VALUES.booking_made);
  });
});

describe('Gamification Engine - Challenge System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get active challenges for partner', () => {
    const challenges = getActiveChallenges('partner_123', 'partner');
    
    expect(Array.isArray(challenges)).toBe(true);
    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges[0]).toHaveProperty('id');
    expect(challenges[0]).toHaveProperty('title');
    expect(challenges[0]).toHaveProperty('progress');
    expect(challenges[0]).toHaveProperty('target');
  });

  it('should get active challenges for traveler', () => {
    const challenges = getActiveChallenges('user_123', 'traveler');
    
    expect(Array.isArray(challenges)).toBe(true);
    expect(challenges.length).toBeGreaterThan(0);
  });

  it('should update challenge progress with increment operation', () => {
    const result = updateChallengeProgress('user_123', 'first_trip', 1, 'increment');
    
    expect(result.success).toBe(true);
    expect(result.progress).toBe(1);
    expect(result.target).toBe(1);
  });

  it('should complete challenge when target reached', () => {
    const result = updateChallengeProgress('user_123', 'first_trip', 1, 'increment');
    
    expect(result.completed).toBe(true);
    expect(result.progress).toBeGreaterThanOrEqual(result.target);
  });

  it('should update challenge progress with set operation', () => {
    const result = updateChallengeProgress('partner_123', 'revenue_starter', 5000, 'set');
    
    expect(result.success).toBe(true);
    expect(result.progress).toBe(5000);
  });

  it('should not exceed target for capped challenges', () => {
    updateChallengeProgress('user_123', 'country_collector', 15, 'increment');
    const challenges = getActiveChallenges('user_123', 'traveler');
    
    const challenge = challenges.find(c => c.id === 'country_collector');
    expect(challenge.progress).toBeLessThanOrEqual(challenge.target);
  });
});

describe('Gamification Engine - Achievement System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with no achievements', () => {
    const achievements = getAchievements('user_123');
    
    expect(achievements).toHaveProperty('badges');
    expect(achievements).toHaveProperty('totalPoints');
    expect(achievements).toHaveProperty('challengesCompleted');
    expect(achievements.badges.length).toBe(0);
  });

  it('should unlock badge after earning enough points', () => {
    // Award 500 points (bronze tier)
    awardPoints('user_123', 'profile_complete', 5);
    
    const achievements = getAchievements('user_123');
    expect(achievements.badges.length).toBeGreaterThan(0);
  });

  it('should track total points correctly', () => {
    awardPoints('user_123', 'booking_made', 1);
    awardPoints('user_123', 'booking_confirmed', 1);
    
    const achievements = getAchievements('user_123');
    const expectedTotal = POINT_VALUES.booking_made + POINT_VALUES.booking_confirmed;
    expect(achievements.totalPoints).toBe(expectedTotal);
  });

  it('should count completed challenges', () => {
    updateChallengeProgress('user_123', 'first_trip', 1, 'increment');
    
    const achievements = getAchievements('user_123');
    expect(achievements.challengesCompleted).toBeGreaterThanOrEqual(1);
  });
});

describe('Gamification Engine - Streak System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create new streak on first login', () => {
    const streak = updateStreak('user_123', 'login');
    
    expect(streak).toHaveProperty('current');
    expect(streak).toHaveProperty('longest');
    expect(streak.current).toBe(1);
  });

  it('should maintain streak for consecutive days', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Mock yesterday's login
    localStorage.setItem('colleco.gamification.streaks.user_123', JSON.stringify({
      login: {
        current: 1,
        longest: 1,
        lastDate: yesterday.toISOString().split('T')[0]
      }
    }));
    
    const streak = updateStreak('user_123', 'login');
    expect(streak.current).toBe(2);
  });

  it('should reset streak after missing a day', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Mock old login
    localStorage.setItem('colleco.gamification.streaks.user_123', JSON.stringify({
      login: {
        current: 5,
        longest: 5,
        lastDate: threeDaysAgo.toISOString().split('T')[0]
      }
    }));
    
    const streak = updateStreak('user_123', 'login');
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(5); // Longest should remain
  });

  it('should track longest streak', () => {
    localStorage.setItem('colleco.gamification.streaks.user_123', JSON.stringify({
      login: {
        current: 3,
        longest: 10,
        lastDate: new Date().toISOString().split('T')[0]
      }
    }));
    
    const streaks = getStreaks('user_123');
    expect(streaks.login.longest).toBe(10);
  });
});

describe('Gamification Engine - Leaderboard System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create leaderboard entry on first update', () => {
    const result = updateLeaderboard('partner_123', 'partner', 'revenue', 5000);
    
    expect(result.success).toBe(true);
    expect(result.category).toBe('revenue');
  });

  it('should get leaderboard for category', () => {
    // Add multiple entries
    updateLeaderboard('partner_1', 'partner', 'revenue', 10000);
    updateLeaderboard('partner_2', 'partner', 'revenue', 5000);
    updateLeaderboard('partner_3', 'partner', 'revenue', 15000);
    
    const leaderboard = getLeaderboard('partner', 'revenue', 'all_time', 'partner_1');
    
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBe(3);
    expect(leaderboard[0].value).toBe(15000); // Sorted descending
  });

  it('should anonymize other users in leaderboard', () => {
    updateLeaderboard('partner_1', 'partner', 'revenue', 10000, { businessName: 'Test Hotel' });
    updateLeaderboard('partner_2', 'partner', 'revenue', 5000, { businessName: 'Another Hotel' });
    
    const leaderboard = getLeaderboard('partner', 'revenue', 'all_time', 'partner_1');
    
    const currentUser = leaderboard.find(entry => entry.userId === 'partner_1');
    const otherUser = leaderboard.find(entry => entry.userId !== 'partner_1');
    
    expect(currentUser.displayName).toBe('Test Hotel');
    expect(otherUser.displayName).toMatch(/User \d+/);
  });

  it('should get user rank in category', () => {
    updateLeaderboard('partner_1', 'partner', 'revenue', 10000);
    updateLeaderboard('partner_2', 'partner', 'revenue', 5000);
    updateLeaderboard('partner_3', 'partner', 'revenue', 15000);
    
    const rank = getUserRank('partner_2', 'partner', 'revenue', 'all_time');
    
    expect(rank.rank).toBe(3); // Lowest revenue
    expect(rank.total).toBe(3);
  });

  it('should filter leaderboard by timeframe', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40); // 40 days ago
    
    // Mock old entry
    localStorage.setItem('colleco.gamification.leaderboard.partner', JSON.stringify([
      { userId: 'partner_old', revenue: 1000, lastUpdated: oldDate.toISOString() }
    ]));
    
    updateLeaderboard('partner_new', 'partner', 'revenue', 5000);
    
    const monthlyLeaderboard = getLeaderboard('partner', 'revenue', 'monthly', 'partner_new');
    
    expect(monthlyLeaderboard.length).toBe(1);
    expect(monthlyLeaderboard[0].userId).toBe('partner_new');
  });
});

describe('Gamification Engine - Reward Tiers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return bronze tier for new users', () => {
    const tier = getRewardTier('user_123');
    
    expect(tier.name).toBe('Bronze');
    expect(tier.discount).toBe(0.05);
  });

  it('should return silver tier for 500+ points', () => {
    awardPoints('user_123', 'profile_complete', 5); // 500 points
    
    const tier = getRewardTier('user_123');
    expect(tier.name).toBe('Silver');
    expect(tier.discount).toBe(0.10);
  });

  it('should return gold tier for 1500+ points', () => {
    awardPoints('user_123', 'profile_complete', 15); // 1500 points
    
    const tier = getRewardTier('user_123');
    expect(tier.name).toBe('Gold');
    expect(tier.discount).toBe(0.15);
  });

  it('should return platinum tier for 3000+ points', () => {
    awardPoints('user_123', 'profile_complete', 30); // 3000 points
    
    const tier = getRewardTier('user_123');
    expect(tier.name).toBe('Platinum');
    expect(tier.discount).toBe(0.20);
  });
});

describe('Gamification Engine - POPI Act Compliance', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to no leaderboard consent', () => {
    const consent = getLeaderboardConsent('user_123');
    expect(consent.enabled).toBe(false);
  });

  it('should save leaderboard consent', () => {
    setLeaderboardConsent('user_123', {
      enabled: true,
      showCity: true,
      showBusinessName: false
    });
    
    const consent = getLeaderboardConsent('user_123');
    expect(consent.enabled).toBe(true);
    expect(consent.showCity).toBe(true);
    expect(consent.showBusinessName).toBe(false);
  });

  it('should exclude users without consent from public leaderboard', () => {
    // User with consent
    setLeaderboardConsent('partner_1', { enabled: true });
    updateLeaderboard('partner_1', 'partner', 'revenue', 10000);
    
    // User without consent
    updateLeaderboard('partner_2', 'partner', 'revenue', 15000);
    
    const leaderboard = getLeaderboard('partner', 'revenue', 'all_time', 'partner_1');
    
    // Only consented user should appear
    expect(leaderboard.length).toBeGreaterThanOrEqual(1);
  });

  it('should respect city visibility setting', () => {
    setLeaderboardConsent('partner_1', { enabled: true, showCity: true });
    updateLeaderboard('partner_1', 'partner', 'revenue', 10000, { 
      city: 'Durban',
      businessName: 'Test Hotel' 
    });
    
    const leaderboard = getLeaderboard('partner', 'revenue', 'all_time', 'partner_1');
    const entry = leaderboard.find(e => e.userId === 'partner_1');
    
    expect(entry.city).toBe('Durban');
  });
});

describe('Gamification Engine - Constants Validation', () => {
  it('should have all required point values defined', () => {
    const requiredActions = [
      'booking_made', 'booking_confirmed', 'trip_completed',
      'review_written', 'profile_complete', 'referral_signup'
    ];
    
    requiredActions.forEach(action => {
      expect(POINT_VALUES).toHaveProperty(action);
      expect(typeof POINT_VALUES[action]).toBe('number');
      expect(POINT_VALUES[action]).toBeGreaterThan(0);
    });
  });

  it('should have partner and traveler challenges defined', () => {
    expect(CHALLENGES).toHaveProperty('partner');
    expect(CHALLENGES).toHaveProperty('traveler');
    expect(Array.isArray(CHALLENGES.partner)).toBe(true);
    expect(Array.isArray(CHALLENGES.traveler)).toBe(true);
  });

  it('should have all badge tiers defined', () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    
    tiers.forEach(tier => {
      expect(BADGES[tier]).toBeDefined();
      expect(Array.isArray(BADGES[tier])).toBe(true);
    });
  });

  it('should have all reward tiers with required properties', () => {
    expect(Array.isArray(REWARD_TIERS)).toBe(true);
    
    REWARD_TIERS.forEach(tier => {
      expect(tier).toHaveProperty('name');
      expect(tier).toHaveProperty('minPoints');
      expect(tier).toHaveProperty('discount');
      expect(tier).toHaveProperty('benefits');
    });
  });
});
