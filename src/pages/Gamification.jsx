import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Award, Gift, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getActiveChallenges,
  getAchievements,
  getStreaks,
  getRewardTier,
  updateStreak,
} from '../utils/gamificationEngine';
import ChallengeCard from '../components/ChallengeCard';
import AchievementBadge from '../components/AchievementBadge';
import StreakCounter from '../components/StreakCounter';
import Leaderboards from '../components/Leaderboards';
import ProgressBar from '../components/ProgressBar';
import LeaderboardConsentBanner from '../components/LeaderboardConsentBanner';

/**
 * Gamification Page
 * Main dashboard for challenges, achievements, and leaderboards
 */
export default function Gamification() {
  // Local debug logger — enabled in dev or by `VITE_DEBUG_GAMIFICATION=1`
  const _log = (level, ...args) => {
    if (!(import.meta.env.DEV || import.meta?.env?.VITE_DEBUG_GAMIFICATION === '1')) return;
    // eslint-disable-next-line no-console
    if (level === 'error') console.error(...args);
    // eslint-disable-next-line no-console
    else if (level === 'warn') console.warn(...args);
    // eslint-disable-next-line no-console
    else console.log(...args);
  };
  const _navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('challenges');
  const [challengeFilter, setChallengeFilter] = useState('all');
  
  // Mock user data (in production, get from auth context)
  const userId = 'user_123';
  const userType = 'traveler'; // or 'partner'

  const [challenges, setChallenges] = useState([]);
  const [achievements, setAchievements] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [rewardTier, setRewardTier] = useState(null);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = () => {
    // Update login streak
    updateStreak(userId, 'login');
    
    // Load data
    const challengesData = getActiveChallenges(userId, userType);
    const achievementsData = getAchievements(userId);
    const streaksData = getStreaks(userId);
    const tierData = getRewardTier(userId);

    setChallenges(challengesData);
    setAchievements(achievementsData);
    setStreaks(streaksData);
    setRewardTier(tierData);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (challengeFilter === 'all') return true;
    if (challengeFilter === 'active') return !challenge.completed;
    if (challengeFilter === 'completed') return challenge.completed;
    return challenge.category === challengeFilter;
  });

  const tabs = [
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  const challengeFilters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'trips', label: 'Trips' },
    { id: 'geography', label: 'Geography' },
    { id: 'loyalty', label: 'Loyalty' },
    { id: 'social', label: 'Social' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* POPI Act Consent Banner */}
      <LeaderboardConsentBanner 
        userId={userId} 
        userType={userType}
        onConsent={(consent) => {
          _log('log', 'User consent updated:', consent);
          // Optionally reload data after consent
          loadGamificationData();
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-orange to-amber-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Gamification Center</h1>
          </div>
          <p className="text-white/90">
            Complete challenges, earn badges, and climb the leaderboards
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Points */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-4 border-2 border-brand-orange"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-brand-orange" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {achievements?.totalPoints?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">Total Points</p>
          </motion.div>

          {/* Challenges Completed */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {achievements?.challengesCompleted || 0}
            </p>
            <p className="text-sm text-gray-600">Challenges Completed</p>
          </motion.div>

          {/* Badges Earned */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {achievements?.badges?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Badges Earned</p>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {streaks?.login?.current || 0}
            </p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </motion.div>
        </div>

        {/* Streak & Reward Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StreakCounter
            current={streaks?.login?.current || 0}
            best={streaks?.login?.best || 0}
            label="Daily Login Streak"
            size="large"
            showBest={true}
            animate={true}
          />

          {/* Reward Tier Progress */}
          {rewardTier && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-brand-orange" />
                <h3 className="text-xl font-bold text-gray-900">Reward Tier</h3>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: rewardTier.current.color }}>
                    {rewardTier.current.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {achievements?.totalPoints?.toLocaleString() || 0} points
                  </p>
                </div>
                
                {rewardTier.next && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next: {rewardTier.next.name}</p>
                    <p className="text-xs text-gray-500">
                      {rewardTier.pointsToNext.toLocaleString()} more points
                    </p>
                  </div>
                )}
              </div>

              {rewardTier.next && (
                <ProgressBar
                  current={achievements?.totalPoints || 0}
                  target={rewardTier.next.minPoints}
                  showValues={false}
                  color="purple"
                  height="medium"
                />
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Benefits:</p>
                <ul className="space-y-1">
                  {rewardTier.current.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-3 font-semibold text-sm whitespace-nowrap
                    flex items-center gap-2 border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div>
              {/* Challenge Filters */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {challengeFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setChallengeFilter(filter.id)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
                      transition-colors
                      ${challengeFilter === filter.id
                        ? 'bg-brand-orange text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Challenge Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    showBadge={true}
                  />
                ))}
              </div>

              {filteredChallenges.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No challenges found</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Badges</h3>
              
              {achievements?.badges && achievements.badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {achievements.badges.map(badgeId => (
                    <AchievementBadge
                      key={badgeId}
                      badgeId={badgeId}
                      size="large"
                      unlocked={true}
                      showName={true}
                      showTier={true}
                      animate={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No badges earned yet</p>
                  <p className="text-sm text-gray-400">Complete challenges to earn your first badge!</p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <Leaderboards
              userType={userType}
              userId={userId}
              initialCategory="points"
              initialTimeframe="all"
            />
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Available Rewards</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-green-600" />
                    <h4 className="font-bold text-green-900">10% Travel Discount</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Use your points to get 10% off your next booking
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-700">500 points</span>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                      Redeem
                    </button>
                  </div>
                </div>

                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 opacity-60">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-gray-600" />
                    <h4 className="font-bold text-gray-900">Free Room Upgrade</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Automatic upgrade to the next room category
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-700">2000 points</span>
                    <button disabled className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-semibold cursor-not-allowed">
                      Not Enough Points
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
