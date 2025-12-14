import React from 'react';

/**
 * PageWrapper - Consistent container for all pages
 * Provides uniform padding, max-width, and responsive behavior
 */
export function PageWrapper({ children, className = '', maxWidth = '7xl' }) {
  const maxWidthClass = `max-w-${maxWidth}`;
  return (
    <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * PageHeader - Consistent page title and description
 */
export function PageHeader({ title, description, action, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-brown mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-lg text-brand-brown/70">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Section - Consistent section container with optional title
 */
export function Section({ title, children, className = '' }) {
  return (
    <section className={`mb-8 sm:mb-12 ${className}`}>
      {title && (
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-brown mb-6">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/**
 * Card - Consistent card component with brand styling
 */
export function Card({ children, className = '', hover = true, padding = 'default' }) {
  const paddingClass = padding === 'compact' ? 'p-4' : padding === 'large' ? 'p-8' : 'p-6';
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  
  return (
    <div className={`bg-white rounded-xl shadow-md border border-cream-border ${paddingClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * IconBox - Consistent icon container with brand gradient
 */
export function IconBox({ children, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md ${className}`}>
      {children}
    </div>
  );
}

/**
 * Grid - Responsive grid layouts
 */
export function Grid({ cols = 3, children, className = '', gap = '6' }) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${colsClasses[cols]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * EmptyState - Consistent empty state component
 */
export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="mb-4 flex justify-center">
          <IconBox size="lg">
            {icon}
          </IconBox>
        </div>
      )}
      <h3 className="text-xl font-bold text-brand-brown mb-2">{title}</h3>
      {description && (
        <p className="text-brand-brown/70 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

/**
 * LoadingSpinner - Consistent loading indicator
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-cream-border border-t-brand-orange ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * LoadingState - Full page loading state
 */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-brand-brown/70">{message}</p>
    </div>
  );
}

/**
 * Badge - Consistent badge/tag component
 */
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-cream-sand text-brand-brown',
    primary: 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default {
  PageWrapper,
  PageHeader,
  Section,
  Card,
  IconBox,
  Grid,
  EmptyState,
  LoadingSpinner,
  LoadingState,
  Badge,
};
