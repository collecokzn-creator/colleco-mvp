import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, DollarSign, Star, MapPin } from 'lucide-react';
import { getLeaderboard, getUserRank } from '../utils/gamificationEngine';

/**
 * Leaderboards Component
 * Interactive leaderboards with filtering
 */
export default function Leaderboards({ 
  userType = 'traveler', 
  userId,
  initialCategory = 'points',
  initialTimeframe = 'all',
}) {
  const [category, setCategory] = useState(initialCategory);
  const [timeframe, setTimeframe] = useState(initialTimeframe);

  const categories = userType === 'partner' 
    ? [
        { id: 'revenue', label: 'Revenue', icon: DollarSign },
        { id: 'bookings', label: 'Bookings', icon: Award },
        { id: 'rating', label: 'Rating', icon: Star },
      ]
    : [
        { id: 'points', label: 'Points', icon: Trophy },
        { id: 'trips', label: 'Trips', icon: MapPin },
        { id: 'countries', label: 'Countries', icon: Users },
      ];

  const timeframes = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all', label: 'All Time' },
  ];

  const leaderboard = getLeaderboard(userType, category, timeframe);
  const userRank = getUserRank(userId, userType, category, timeframe);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-600';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-brand-orange" />
          <h2 className="text-2xl font-bold text-gray-900">Leaderboards</h2>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap
                  flex items-center gap-2 transition-colors
                  ${category === cat.id
                    ? 'bg-brand-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`
                px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${timeframe === tf.id
                  ? 'bg-brand-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* User's Rank (if on leaderboard) */}
      {userRank && (
        <motion.div
          className="mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Your Rank</span>
            </div>
            <div className="flex items-center gap-2">
              {getRankIcon(userRank)}
              <span className="text-2xl font-bold text-blue-600">#{userRank}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No leaderboard data yet</p>
            <p className="text-sm text-gray-400">Be the first to climb the ranks!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === userId;
            
            return (
              <motion.div
                key={entry.userId}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${getRankBackground(entry.rank)}
                  ${isCurrentUser ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  {/* Rank & User */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                        {entry.metadata?.name || 'User'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      {entry.metadata?.location && (
                        <p className="text-sm text-gray-600">{entry.metadata.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {category === 'revenue' && 'R'}
                      {entry.value.toLocaleString()}
                      {category === 'rating' && ' ⭐'}
                    </p>
                    {entry.metadata?.subtitle && (
                      <p className="text-xs text-gray-500">{entry.metadata.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Top 3 Special Effects */}
                {entry.rank === 1 && (
                  <div className="mt-2 pt-2 border-t border-yellow-300">
                    <p className="text-xs text-yellow-700 font-semibold flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Champion
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination (if needed) */}
      {leaderboard.length >= 100 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Showing top 100 {userType}s</p>
        </div>
      )}
    </div>
  );
}
