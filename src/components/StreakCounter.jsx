import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * StreakCounter Component
 * Displays current streak with fire animation
 */
export default function StreakCounter({ 
  current, 
  best, 
  label = 'Daily Streak',
  size = 'medium',
  showBest = true,
  animate = true,
}) {
  const sizeClasses = {
    small: {
      container: 'px-3 py-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      number: 'text-lg',
    },
    medium: {
      container: 'px-4 py-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      number: 'text-2xl',
    },
    large: {
      container: 'px-6 py-4',
      icon: 'w-6 h-6',
      text: 'text-lg',
      number: 'text-3xl',
    },
  };

  const classes = sizeClasses[size];

  const getStreakColor = () => {
    if (current === 0) return 'text-gray-400';
    if (current < 7) return 'text-orange-500';
    if (current < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const streakColor = getStreakColor();

  const content = (
    <div className={`bg-white rounded-lg shadow-md ${classes.container} border-2 border-gray-100`}>
      <div className="flex items-center gap-3">
        <div className={`${streakColor} relative`}>
          <Flame className={classes.icon} />
          {current > 0 && animate && (
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Flame className={classes.icon} />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1">
          <p className={`${classes.text} text-gray-600`}>{label}</p>
          <p className={`${classes.number} font-bold ${streakColor}`}>
            {current} {current === 1 ? 'day' : 'days'}
          </p>
        </div>

        {showBest && best > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Best
            </p>
            <p className="text-sm font-semibold text-gray-700">{best} days</p>
          </div>
        )}
      </div>

      {current >= 7 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {current >= 7 && current < 30 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                Week Warrior! 🔥
              </span>
            )}
            {current >= 30 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Month Master! 🏆
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (animate && current > 0) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
