import React from 'react';
import { motion } from 'framer-motion';
import { BADGES } from '../utils/gamificationEngine';

/**
 * AchievementBadge Component
 * Displays a single achievement badge with tier styling
 */
export default function AchievementBadge({ 
  badgeId, 
  size = 'medium', 
  unlocked = true, 
  showName = true,
  showTier = false,
  animate = true,
  onClick 
}) {
  const badge = BADGES[badgeId];
  
  if (!badge) {
    return null;
  }

  const sizeClasses = {
    small: 'w-12 h-12 text-xl',
    medium: 'w-16 h-16 text-3xl',
    large: 'w-24 h-24 text-5xl',
    xlarge: 'w-32 h-32 text-6xl',
  };

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-300 to-purple-500',
  };

  const badgeContent = (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br ${unlocked ? tierColors[badge.tier] : 'from-gray-200 to-gray-400'}
        flex items-center justify-center
        shadow-lg
        ${unlocked ? 'opacity-100' : 'opacity-40'}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
        relative
        border-4 ${unlocked ? 'border-white' : 'border-gray-300'}
      `}
      onClick={onClick}
      style={{
        filter: unlocked ? 'none' : 'grayscale(100%)',
      }}
    >
      <span className="filter drop-shadow-md">{badge.icon}</span>
      
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
          <span className="text-white text-2xl">🔒</span>
        </div>
      )}
    </div>
  );

  const content = (
    <div className="flex flex-col items-center gap-2">
      {badgeContent}
      
      {showName && (
        <div className="text-center">
          <p className={`font-semibold ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {badge.name}
          </p>
          {showTier && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {badge.tier}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (animate && unlocked) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
