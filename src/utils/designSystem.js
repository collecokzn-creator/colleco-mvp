/**
 * CollEco Travel Design System
 * Centralized design tokens for consistent UI across all pages
 */

export const colors = {
  // Primary brand colors
  primary: '#F47C20',      // brand-orange
  primaryHover: '#E66D10',
  primaryLight: '#FFB347',
  
  // Secondary colors
  secondary: '#3A2C1A',    // brand-brown
  secondaryHover: '#2A1F10',
  
  // Accent colors
  accent: '#E6B422',       // brand-gold
  
  // Neutral colors
  cream: '#FFF8F1',
  creamSand: '#F3E9DC',
  creamHover: '#EADAC8',
  creamBorder: '#E7DAC6',
  
  // Surface colors
  surface: '#FFFFFF',
  
  // Text colors
  text: '#3A2C1A',
  textMuted: 'rgba(58, 44, 26, 0.7)',
  textLight: 'rgba(58, 44, 26, 0.6)',
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const typography = {
  // Font families
  fontSans: 'Inter, system-ui, -apple-system, sans-serif',
  fontCursive: 'cursive, Inter, sans-serif',
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

// Consistent component styles
export const componentStyles = {
  // Page container
  pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
  
  // Card
  card: 'bg-white rounded-xl shadow-md border border-cream-border p-6 hover:shadow-lg transition-shadow duration-300',
  cardCompact: 'bg-white rounded-lg shadow-sm border border-cream-border p-4 hover:shadow-md transition-shadow duration-300',
  
  // Section
  section: 'mb-8 sm:mb-12',
  sectionTitle: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-brown mb-6',
  sectionSubtitle: 'text-base sm:text-lg text-brand-brown/70 mb-4',
  
  // Grid layouts
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Icon container (brand-colored)
  iconContainer: 'w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md',
  iconContainerLg: 'w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-lg',
  
  // Buttons (primary)
  btnPrimary: 'px-6 py-3 bg-brand-orange text-white font-semibold rounded-lg shadow-md hover:bg-brand-orange/90 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:ring-offset-2',
  btnSecondary: 'px-6 py-3 bg-brand-brown text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown/90 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-brown/50 focus:ring-offset-2',
  btnOutline: 'px-6 py-3 bg-white text-brand-orange border-2 border-brand-orange font-semibold rounded-lg hover:bg-brand-orange hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:ring-offset-2',
  
  // Form inputs
  input: 'w-full px-4 py-2.5 border border-cream-border rounded-lg bg-white text-brand-brown placeholder:text-brand-brown/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all duration-300',
  select: 'w-full px-4 py-2.5 border border-cream-border rounded-lg bg-white text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all duration-300',
  
  // Loading states
  skeleton: 'animate-pulse bg-cream-sand rounded',
  spinner: 'animate-spin rounded-full border-4 border-cream-border border-t-brand-orange',
};

// Icon colors (always use brand colors)
export const iconColors = {
  primary: 'text-brand-orange',
  secondary: 'text-brand-brown',
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  muted: 'text-brand-brown/60',
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  componentStyles,
  iconColors,
  breakpoints,
};
