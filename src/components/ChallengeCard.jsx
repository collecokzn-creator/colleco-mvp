import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trophy, Clock, Target } from 'lucide-react';
import ProgressBar from './ProgressBar';
import AchievementBadge from './AchievementBadge';

/**
 * ChallengeCard Component
 * Displays a challenge with progress and rewards
 */
export default function ChallengeCard({ 
  challenge, 
  onClaim,
  showBadge = true,
  compact = false,
}) {
  const {
    name,
    description,
    progress = 0,
    target,
    completed,
    completedAt,
    reward,
    difficulty,
    category,
    percentComplete,
  } = challenge;

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  const categoryIcons = {
    revenue: '💰',
    bookings: '📅',
    occupancy: '🎯',
    rating: '⭐',
    engagement: '💬',
    trips: '✈️',
    geography: '🗺️',
    loyalty: '💎',
    spending: '💳',
    social: '👥',
    reviews: '✍️',
  };

  if (compact) {
    return (
      <motion.div
        className={`
          bg-white rounded-lg p-4 border-2
          ${completed ? 'border-green-500 bg-green-50' : 'border-gray-200'}
        `}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{categoryIcons[category] || '🎯'}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{name}</h4>
              <ProgressBar
                current={progress}
                target={target}
                showValues={false}
                showPercentage={false}
                height="small"
                animate={false}
              />
            </div>
          </div>
          
          {completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <span className="text-sm font-semibold text-gray-600">
              {percentComplete?.toFixed(0)}%
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-md overflow-hidden border-2
        ${completed ? 'border-green-500' : 'border-gray-100'}
        hover:shadow-lg transition-shadow
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className={`p-4 ${completed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-brand-orange to-amber-500'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-md">
              {categoryIcons[category] || '🎯'}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <p className="text-sm text-white/90">{description}</p>
            </div>
          </div>
          
          {completed && (
            <CheckCircle2 className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[difficulty]}`}>
            {difficulty?.toUpperCase()}
          </span>
          {challenge.timeframe && (
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {challenge.timeframe}
            </span>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4">
        {!completed ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Progress
                </span>
                <span className="text-sm font-semibold text-brand-orange">
                  {progress.toLocaleString()} / {target.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                current={progress}
                target={target}
                showValues={false}
                height="large"
                animate={true}
              />
            </div>
          </>
        ) : (
          <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                Completed {completedAt && `on ${new Date(completedAt).toLocaleDateString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Rewards Section */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">Rewards</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">+{reward.points}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
              
              {showBadge && reward.badge && (
                <div className="flex items-center gap-2">
                  <div className="w-px h-10 bg-gray-300" />
                  <AchievementBadge
                    badgeId={reward.badge}
                    size="small"
                    unlocked={completed}
                    showName={false}
                    animate={false}
                  />
                </div>
              )}
            </div>

            {completed && onClaim && (
              <button
                onClick={() => onClaim(challenge)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Claim
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
