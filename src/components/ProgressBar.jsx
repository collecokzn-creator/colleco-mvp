import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressBar Component
 * Animated progress bar with customizable styling
 */
export default function ProgressBar({
  current,
  target,
  label,
  showPercentage = true,
  showValues = true,
  color = 'brand-orange',
  height = 'medium',
  animate = true,
  className = '',
}) {
  const percentage = Math.min((current / target) * 100, 100);

  const heightClasses = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };

  const colorClasses = {
    'brand-orange': 'bg-brand-orange',
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'purple': 'bg-purple-500',
    'gold': 'bg-yellow-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-gray-200 rounded-full ${heightClasses[height]} overflow-hidden`}>
        {animate ? (
          <motion.div
            className={`${colorClasses[color]} ${heightClasses[height]} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ) : (
          <div
            className={`${colorClasses[color]} ${heightClasses[height]} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {showValues && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {current.toLocaleString()} / {target.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
