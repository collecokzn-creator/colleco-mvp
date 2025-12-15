const ACHIEVEMENTS_KEY = "colleco.gamification.achievements";
const LEADERBOARDS_KEY = "colleco.gamification.leaderboards";
const STREAKS_KEY = "colleco.gamification.streaks";
const PROGRESS_KEY = "colleco.gamification.progress";
const PARTNER_CHALLENGES = {
  // Revenue Challenges
  revenue_starter: {
    id: "revenue_starter",
    name: "First R10K",
    description: "Earn your first R10,000 in revenue",
    type: "partner",
    category: "revenue",
    target: 1e4,
    reward: { points: 500, badge: "revenue_bronze" },
    difficulty: "easy"
  },
  revenue_pro: {
    id: "revenue_pro",
    name: "Revenue Champion",
    description: "Reach R100,000 in total revenue",
    type: "partner",
    category: "revenue",
    target: 1e5,
    reward: { points: 2500, badge: "revenue_gold" },
    difficulty: "hard"
  },
  monthly_target: {
    id: "monthly_target",
    name: "Monthly Goal",
    description: "Hit R50,000 revenue in a single month",
    type: "partner",
    category: "revenue",
    target: 5e4,
    timeframe: "monthly",
    reward: { points: 1e3, badge: "monthly_star" },
    difficulty: "medium"
  },
  // Booking Challenges
  booking_milestone_10: {
    id: "booking_milestone_10",
    name: "10 Bookings",
    description: "Receive 10 confirmed bookings",
    type: "partner",
    category: "bookings",
    target: 10,
    reward: { points: 200, badge: "booking_bronze" },
    difficulty: "easy"
  },
  booking_milestone_100: {
    id: "booking_milestone_100",
    name: "100 Bookings",
    description: "Reach 100 confirmed bookings",
    type: "partner",
    category: "bookings",
    target: 100,
    reward: { points: 1500, badge: "booking_gold" },
    difficulty: "hard"
  },
  // Occupancy Challenges
  high_occupancy: {
    id: "high_occupancy",
    name: "Fully Booked",
    description: "Maintain 90%+ occupancy for 30 days",
    type: "partner",
    category: "occupancy",
    target: 90,
    duration: 30,
    reward: { points: 800, badge: "occupancy_champion" },
    difficulty: "medium"
  },
  // Rating Challenges
  five_star_streak: {
    id: "five_star_streak",
    name: "5-Star Streak",
    description: "Get 10 consecutive 5-star reviews",
    type: "partner",
    category: "rating",
    target: 10,
    threshold: 5,
    reward: { points: 1200, badge: "excellence_badge" },
    difficulty: "hard"
  },
  // Engagement Challenges
  quick_responder: {
    id: "quick_responder",
    name: "Quick Responder",
    description: "Respond to 20 inquiries within 1 hour",
    type: "partner",
    category: "engagement",
    target: 20,
    timeLimit: 60,
    // minutes
    reward: { points: 300, badge: "responsive_partner" },
    difficulty: "medium"
  },
  // Point Milestone Challenges (auto-complete)
  point_milestone_500: {
    id: "point_milestone_500",
    name: "Rising Star",
    description: "Earn 500 total points",
    type: "partner",
    category: "points",
    target: 500,
    reward: { points: 0, badge: "revenue_bronze" },
    difficulty: "easy"
  },
  point_milestone_1500: {
    id: "point_milestone_1500",
    name: "Star Performer",
    description: "Earn 1500 total points",
    type: "partner",
    category: "points",
    target: 1500,
    reward: { points: 0, badge: "revenue_silver" },
    difficulty: "medium"
  },
  point_milestone_3000: {
    id: "point_milestone_3000",
    name: "Elite Partner",
    description: "Earn 3000 total points",
    type: "partner",
    category: "points",
    target: 3e3,
    reward: { points: 0, badge: "revenue_gold" },
    difficulty: "hard"
  }
};
const TRAVELER_CHALLENGES = {
  // Trip Challenges
  first_trip: {
    id: "first_trip",
    name: "First Adventure",
    description: "Complete your first trip",
    type: "traveler",
    category: "trips",
    target: 1,
    reward: { points: 100, badge: "explorer_bronze" },
    difficulty: "easy"
  },
  trip_milestone_10: {
    id: "trip_milestone_10",
    name: "Seasoned Traveler",
    description: "Complete 10 trips",
    type: "traveler",
    category: "trips",
    target: 10,
    reward: { points: 1e3, badge: "explorer_gold" },
    difficulty: "medium"
  },
  // Geography Challenges
  province_explorer: {
    id: "province_explorer",
    name: "Province Explorer",
    description: "Visit all 9 provinces of South Africa",
    type: "traveler",
    category: "geography",
    target: 9,
    reward: { points: 2e3, badge: "sa_explorer" },
    difficulty: "hard"
  },
  country_collector: {
    id: "country_collector",
    name: "Globe Trotter",
    description: "Visit 5 different countries",
    type: "traveler",
    category: "geography",
    target: 5,
    reward: { points: 1500, badge: "globe_trotter" },
    difficulty: "medium"
  },
  // Loyalty Challenges
  loyalty_tier_silver: {
    id: "loyalty_tier_silver",
    name: "Silver Status",
    description: "Reach Silver tier in loyalty program",
    type: "traveler",
    category: "loyalty",
    target: "silver",
    reward: { points: 500, badge: "loyal_silver" },
    difficulty: "easy"
  },
  loyalty_tier_platinum: {
    id: "loyalty_tier_platinum",
    name: "Platinum Elite",
    description: "Reach Platinum tier in loyalty program",
    type: "traveler",
    category: "loyalty",
    target: "platinum",
    reward: { points: 3e3, badge: "loyal_platinum" },
    difficulty: "hard"
  },
  // Spending Challenges
  big_spender: {
    id: "big_spender",
    name: "Big Spender",
    description: "Spend R50,000+ on travel",
    type: "traveler",
    category: "spending",
    target: 5e4,
    reward: { points: 2500, badge: "vip_traveler" },
    difficulty: "hard"
  },
  // Social Challenges
  referral_champion: {
    id: "referral_champion",
    name: "Referral Champion",
    description: "Refer 5 friends who complete a booking",
    type: "traveler",
    category: "social",
    target: 5,
    reward: { points: 1e3, badge: "ambassador" },
    difficulty: "medium"
  },
  // Review Challenges
  reviewer: {
    id: "reviewer",
    name: "Helpful Reviewer",
    description: "Write 10 verified reviews",
    type: "traveler",
    category: "reviews",
    target: 10,
    reward: { points: 400, badge: "trusted_reviewer" },
    difficulty: "easy"
  },
  // Point Milestone Challenges (auto-complete)
  traveler_point_milestone_500: {
    id: "traveler_point_milestone_500",
    name: "Adventure Starter",
    description: "Earn 500 total points",
    type: "traveler",
    category: "points",
    target: 500,
    reward: { points: 0, badge: "explorer_bronze" },
    difficulty: "easy"
  },
  traveler_point_milestone_1500: {
    id: "traveler_point_milestone_1500",
    name: "Experienced Traveler",
    description: "Earn 1500 total points",
    type: "traveler",
    category: "points",
    target: 1500,
    reward: { points: 0, badge: "loyal_silver" },
    difficulty: "medium"
  },
  traveler_point_milestone_3000: {
    id: "traveler_point_milestone_3000",
    name: "Elite Traveler",
    description: "Earn 3000 total points",
    type: "traveler",
    category: "points",
    target: 3e3,
    reward: { points: 0, badge: "explorer_gold" },
    difficulty: "hard"
  }
};
const BADGE_DEFINITIONS = {
  // Partner Badges
  revenue_bronze: { name: "Revenue Starter", tier: "bronze", icon: "🥉", color: "#CD7F32" },
  revenue_silver: { name: "Revenue Builder", tier: "silver", icon: "🥈", color: "#C0C0C0" },
  revenue_gold: { name: "Revenue Champion", tier: "gold", icon: "🥇", color: "#FFD700" },
  booking_bronze: { name: "Booking Starter", tier: "bronze", icon: "📅", color: "#CD7F32" },
  booking_gold: { name: "Booking Master", tier: "gold", icon: "🏆", color: "#FFD700" },
  occupancy_champion: { name: "Occupancy Champion", tier: "gold", icon: "🎯", color: "#FFD700" },
  excellence_badge: { name: "Excellence Badge", tier: "platinum", icon: "⭐", color: "#E5E4E2" },
  responsive_partner: { name: "Quick Responder", tier: "silver", icon: "⚡", color: "#C0C0C0" },
  monthly_star: { name: "Monthly Star", tier: "gold", icon: "🌟", color: "#FFD700" },
  // Traveler Badges
  explorer_bronze: { name: "First Explorer", tier: "bronze", icon: "🗺️", color: "#CD7F32" },
  explorer_gold: { name: "Seasoned Traveler", tier: "gold", icon: "✈️", color: "#FFD700" },
  sa_explorer: { name: "SA Explorer", tier: "platinum", icon: "🇿🇦", color: "#E5E4E2" },
  globe_trotter: { name: "Globe Trotter", tier: "gold", icon: "🌍", color: "#FFD700" },
  loyal_silver: { name: "Loyal Silver", tier: "silver", icon: "💎", color: "#C0C0C0" },
  loyal_platinum: { name: "Loyal Platinum", tier: "platinum", icon: "👑", color: "#E5E4E2" },
  vip_traveler: { name: "VIP Traveler", tier: "platinum", icon: "💳", color: "#E5E4E2" },
  ambassador: { name: "Ambassador", tier: "gold", icon: "🎖️", color: "#FFD700" },
  trusted_reviewer: { name: "Trusted Reviewer", tier: "silver", icon: "✍️", color: "#C0C0C0" }
};
function getActiveChallenges(userId, userType = "traveler") {
  const allChallenges = userType === "partner" ? PARTNER_CHALLENGES : TRAVELER_CHALLENGES;
  const progressData = getProgressData(userId);
  return Object.values(allChallenges).map((challenge) => {
    const progress = progressData[challenge.id] || { current: 0, completed: false };
    return {
      ...challenge,
      title: challenge.name,
      progress: progress.current,
      completed: progress.completed,
      completedAt: progress.completedAt,
      percentComplete: Math.min(progress.current / challenge.target * 100, 100)
    };
  });
}
function updateChallengeProgress(userId, challengeId, value, operation = "increment") {
  const progressData = getProgressData(userId);
  const challenge = { ...PARTNER_CHALLENGES, ...TRAVELER_CHALLENGES }[challengeId];
  if (!challenge) {
    return { success: false, message: "Challenge not found" };
  }
  const current = progressData[challengeId] || { current: 0, completed: false };
  let newValue;
  if (operation === "increment") {
    newValue = current.current + value;
  } else if (operation === "set") {
    newValue = value;
  } else {
    newValue = Math.max(current.current, value);
  }
  if (challenge.cap !== false) {
    newValue = Math.min(newValue, challenge.target);
  }
  progressData[challengeId] = {
    current: newValue,
    completed: current.completed || newValue >= challenge.target,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!current.completed && newValue >= challenge.target) {
    progressData[challengeId].completed = true;
    progressData[challengeId].completedAt = (/* @__PURE__ */ new Date()).toISOString();
    const reward = awardChallengeReward(userId, challenge);
    saveProgressData(userId, progressData);
    return {
      success: true,
      completed: true,
      progress: newValue,
      target: challenge.target,
      percentComplete: 100,
      challenge,
      reward,
      message: `🎉 Challenge completed: ${challenge.name}! +${challenge.reward.points} points`
    };
  }
  saveProgressData(userId, progressData);
  return {
    success: true,
    completed: false,
    progress: newValue,
    target: challenge.target,
    percentComplete: newValue / challenge.target * 100
  };
}
function awardChallengeReward(userId, challenge) {
  const achievements = getAchievements(userId);
  const pointsAwarded = challenge.reward.points;
  if (challenge.reward.badge) {
    achievements.badges = achievements.badges || [];
    if (!achievements.badges.includes(challenge.reward.badge)) {
      achievements.badges.push(challenge.reward.badge);
      achievements.lastBadgeEarned = {
        badgeId: challenge.reward.badge,
        earnedAt: (/* @__PURE__ */ new Date()).toISOString(),
        challengeId: challenge.id
      };
    }
  }
  achievements.totalPoints = (achievements.totalPoints || 0) + pointsAwarded;
  achievements.challengesCompleted = (achievements.challengesCompleted || 0) + 1;
  saveAchievements(userId, achievements);
  return {
    points: pointsAwarded,
    badge: challenge.reward.badge,
    badgeDetails: BADGE_DEFINITIONS[challenge.reward.badge],
    totalPoints: achievements.totalPoints
  };
}
function getAchievements(userId) {
  try {
    const data = localStorage.getItem(`${ACHIEVEMENTS_KEY}.${userId}`);
    return data ? JSON.parse(data) : {
      badges: [],
      totalPoints: 0,
      challengesCompleted: 0,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return {
      badges: [],
      totalPoints: 0,
      challengesCompleted: 0,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
function saveAchievements(userId, achievements) {
  localStorage.setItem(`${ACHIEVEMENTS_KEY}.${userId}`, JSON.stringify(achievements));
}
function getProgressData(userId) {
  try {
    const data = localStorage.getItem(`${PROGRESS_KEY}.${userId}`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
function saveProgressData(userId, progressData) {
  localStorage.setItem(`${PROGRESS_KEY}.${userId}`, JSON.stringify(progressData));
}
function updateStreak(userId, action = "login") {
  const streaks = getStreaks(userId);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  const streak = streaks[action] || { current: 0, best: 0, longest: 0, lastDate: null };
  if (streak.lastDate === today) {
    return streak;
  }
  if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }
  streak.best = Math.max(streak.best, streak.current);
  streak.longest = Math.max(streak.longest || streak.best, streak.current);
  streak.lastDate = today;
  streaks[action] = streak;
  saveStreaks(userId, streaks);
  if (streak.current === 7) {
    updateChallengeProgress(userId, "week_streak", 1, "increment");
  } else if (streak.current === 30) {
    updateChallengeProgress(userId, "month_streak", 1, "increment");
  }
  return streak;
}
function getStreaks(userId) {
  try {
    const data = localStorage.getItem(`${STREAKS_KEY}.${userId}`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
function saveStreaks(userId, streaks) {
  localStorage.setItem(`${STREAKS_KEY}.${userId}`, JSON.stringify(streaks));
}
function anonymizeUserData(entry, currentUserId) {
  const isCurrentUser = entry.userId === currentUserId;
  const consent = getLeaderboardConsent(entry.userId);
  if (isCurrentUser) {
    return {
      ...entry,
      isCurrentUser: true,
      displayName: entry.metadata?.businessName || entry.metadata?.name || "You",
      city: consent.showCity ? entry.metadata?.city : void 0
    };
  }
  return {
    userId: `anon_${entry.rank}`,
    // Anonymized ID
    rank: entry.rank,
    value: entry.value,
    isCurrentUser: false,
    displayName: consent.showBusinessName && entry.metadata?.businessName ? entry.metadata.businessName : `User ${entry.rank}`,
    ...consent.showCity && entry.metadata?.city && { city: entry.metadata.city },
    metadata: {
      // No personal information - only anonymized display name
      name: `User ${entry.rank}`
    },
    lastUpdated: entry.lastUpdated
  };
}
function getLeaderboard(type = "partner", category = "revenue", timeframe = "all", currentUserId = null) {
  try {
    const data = localStorage.getItem(LEADERBOARDS_KEY);
    const leaderboards = data ? JSON.parse(data) : {};
    const normalizedTimeframe = timeframe === "all_time" ? "all" : timeframe;
    const key = `${type}_${category}_${normalizedTimeframe}`;
    const rawLeaderboard = leaderboards[key] || [];
    return rawLeaderboard.map((entry) => anonymizeUserData(entry, currentUserId));
  } catch {
    return [];
  }
}
function getUserRank(userId, userType, category, timeframe = "all") {
  const leaderboard = getLeaderboard(userType, category, timeframe, userId);
  const entry = leaderboard.find((e) => e.userId === userId);
  return entry ? { rank: entry.rank, total: leaderboard.length } : { rank: null, total: 0 };
}
function getLeaderboardConsent(userId) {
  try {
    const data = localStorage.getItem(`colleco.gamification.consent.${userId}`);
    const parsed = data ? JSON.parse(data) : null;
    return parsed || {
      enabled: false,
      // Opt-in required for POPI Act compliance
      showCity: false,
      showBusinessName: false,
      consentDate: null
    };
  } catch {
    return {
      enabled: false,
      showCity: false,
      showBusinessName: false,
      consentDate: null
    };
  }
}
function setLeaderboardConsent(userId, consent) {
  const consentData = {
    enabled: consent.enabled || false,
    showCity: consent.showCity || false,
    showBusinessName: consent.showBusinessName || false,
    consentDate: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0"
    // Track consent version for auditing
  };
  localStorage.setItem(`colleco.gamification.consent.${userId}`, JSON.stringify(consentData));
  return { success: true, consent: consentData };
}
const REWARD_TIERS = [
  {
    minPoints: 0,
    name: "Bronze",
    benefits: ["5% booking discount", "Priority email support"],
    color: "#CD7F32",
    discount: 5
  },
  {
    minPoints: 500,
    name: "Silver",
    benefits: ["10% booking discount", "Priority phone support", "Free trip insurance"],
    color: "#C0C0C0",
    discount: 10
  },
  {
    minPoints: 1500,
    name: "Gold",
    benefits: ["15% booking discount", "24/7 concierge", "Free upgrades", "Lounge access"],
    color: "#FFD700",
    discount: 15
  },
  {
    minPoints: 3e3,
    name: "Platinum",
    benefits: ["20% booking discount", "Personal travel advisor", "Complimentary transfers", "VIP experiences"],
    color: "#E5E4E2",
    discount: 20
  }
];
function getRewardTier(userId) {
  const achievements = getAchievements(userId);
  const points = achievements.totalPoints || 0;
  let currentTier = { ...REWARD_TIERS[0], discount: 0.05 };
  for (const tier of REWARD_TIERS) {
    if (points >= tier.minPoints) {
      currentTier = { ...tier, discount: tier.discount / 100 };
    }
  }
  return currentTier;
}
({
  partner: Object.values(PARTNER_CHALLENGES).map((c) => ({ ...c, title: c.name })),
  traveler: Object.values(TRAVELER_CHALLENGES).map((c) => ({ ...c, title: c.name }))
});
const BADGES = {
  bronze: Object.entries(BADGE_DEFINITIONS).filter(([_k, v]) => v.tier === "bronze").map(([id, badge]) => ({ id, ...badge })),
  silver: Object.entries(BADGE_DEFINITIONS).filter(([_k, v]) => v.tier === "silver").map(([id, badge]) => ({ id, ...badge })),
  gold: Object.entries(BADGE_DEFINITIONS).filter(([_k, v]) => v.tier === "gold").map(([id, badge]) => ({ id, ...badge })),
  platinum: Object.entries(BADGE_DEFINITIONS).filter(([_k, v]) => v.tier === "platinum").map(([id, badge]) => ({ id, ...badge }))
};
export {
  BADGES as B,
  getStreaks as a,
  getRewardTier as b,
  getLeaderboard as c,
  getUserRank as d,
  getLeaderboardConsent as e,
  getActiveChallenges as f,
  getAchievements as g,
  setLeaderboardConsent as s,
  updateStreak as u
};
//# sourceMappingURL=gamificationEngine-BquAD8q6.js.map
