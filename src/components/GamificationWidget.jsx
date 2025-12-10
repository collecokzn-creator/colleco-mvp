import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Star, Flame, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievements, getStreaks, getRewardTier } from '../utils/gamificationEngine';

/**
 * GamificationWidget
 * Compact widget showing user's points, streak, and tier in header/dashboard
 */
export default function GamificationWidget({ userId, compact = false }) {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [rewardTier, setRewardTier] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [justEarnedPoints, setJustEarnedPoints] = useState(null);

  const loadData = useCallback(() => {
    const achievementsData = getAchievements(userId);
    const streaksData = getStreaks(userId);
    const tierData = getRewardTier(userId);

    setAchievements(achievementsData);
    setStreaks(streaksData);
    setRewardTier(tierData);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [loadData, userId]);

  useEffect(() => {
    // Listen for point awards
    const handlePointsAwarded = (event) => {
      if (event.detail.userId === userId) {
        setJustEarnedPoints(event.detail.points);
        loadData();

        // Clear animation after 3 seconds
        setTimeout(() => setJustEarnedPoints(null), 3000);
      }
    };

    window.addEventListener('gamification:points-awarded', handlePointsAwarded);
    return () => window.removeEventListener('gamification:points-awarded', handlePointsAwarded);
  }, [userId, loadData]);

  

  if (!achievements) return null;

  const points = achievements.totalPoints || 0;
  const streak = streaks?.login?.current || 0;
  const tier = rewardTier?.current;

  if (compact) {
    return (
      <button
        onClick={() => navigate('/gamification')}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-brand-orange to-amber-500 text-white rounded-full hover:shadow-lg transition-all"
      >
        <Trophy className="w-4 h-4" />
        <span className="font-bold text-sm">{points.toLocaleString()}</span>
        
        {streak > 0 && (
          <div className="flex items-center gap-1 border-l border-white/30 pl-2">
            <Flame className="w-3 h-3" />
            <span className="text-xs">{streak}</span>
          </div>
        )}

        {/* Points award animation */}
        <AnimatePresence>
          {justEarnedPoints && (
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -30, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute -top-6 right-0 text-green-400 font-bold text-sm whitespace-nowrap"
            >
              +{justEarnedPoints} pts
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap z-50">
            <p className="font-semibold">{tier?.name} Tier</p>
            <p className="text-gray-300">{points.toLocaleString()} points</p>
            {streak > 0 && <p className="text-orange-300">{streak}-day streak 🔥</p>}
            <p className="text-gray-400 mt-1">Click for details</p>
          </div>
        )}
      </button>
    );
  }

  // Full widget for dashboards
  return (
    <motion.div
      onClick={() => navigate('/gamification')}
      className="bg-gradient-to-br from-brand-orange to-amber-500 rounded-xl p-4 text-white cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10">
        <Trophy className="w-32 h-32 -mr-8 -mt-8" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-sm">Gamification</h3>
          </div>
          <ChevronRight className="w-4 h-4" />
        </div>

        <div className="space-y-2">
          {/* Points */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs">Total Points</span>
            <span className="text-2xl font-bold">{points.toLocaleString()}</span>
          </div>

          {/* Tier */}
          {tier && (
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs">Tier</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span className="font-semibold text-sm">{tier.name}</span>
              </div>
            </div>
          )}

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-xs">Daily Streak</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span className="font-semibold text-sm">{streak} days</span>
              </div>
            </div>
          )}

          {/* Badges */}
          {achievements.badges && achievements.badges.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="text-white/80 text-xs">Badges Earned</span>
              <span className="font-semibold text-sm">{achievements.badges.length}</span>
            </div>
          )}
        </div>

        {/* Points award animation */}
        <AnimatePresence>
          {justEarnedPoints && (
            <motion.div
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-300 font-bold text-3xl pointer-events-none"
            >
              +{justEarnedPoints}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
