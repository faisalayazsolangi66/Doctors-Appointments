/**
 * Medical Theme Color System
 * Defines all color tokens for the appointment booking system
 * Colors are healthcare-inspired with modern, cool vibes
 */

export const colors = {
  // Primary Colors - Trust, Healthcare, Professional
  primary: {
    50: '#ecf8f5',
    100: '#d1ece8',
    200: '#a3d9d5',
    300: '#75c6c2',
    400: '#47b3af',
    500: '#0891b2', // Main primary - Teal
    600: '#0891b2',
    700: '#067a8e',
    800: '#056476',
    900: '#044d5c',
  },

  // Secondary Colors - Innovation, Modern Care
  secondary: {
    50: '#f5f0ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#cec2fd',
    400: '#a78bfa',
    500: '#8b5cf6', // Main secondary - Purple
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Accent Colors - Professional, Medical
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#0369a1', // Main accent - Medical Blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#0c4a6e',
    900: '#082f49',
  },

  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error/Danger Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors for Status
  status: {
    pending: '#f59e0b',    // Orange/Amber
    confirmed: '#10b981',  // Green
    completed: '#0369a1',  // Medical Blue
    cancelled: '#ef4444',  // Red
    noShow: '#8b5cf6',     // Purple
  },
};

/**
 * Tailwind CSS Color Tokens
 * Used in tailwind.config.ts extend.colors
 */
export const tailwindColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  status: colors.status,
};

/**
 * CSS Custom Properties (CSS Variables)
 * Add these to globals.css for theme support
 */
export const cssVariables = `
  /* Primary Colors - Teal */
  --primary-50: #ecf8f5;
  --primary-100: #d1ece8;
  --primary-200: #a3d9d5;
  --primary-300: #75c6c2;
  --primary-400: #47b3af;
  --primary-500: #0891b2;
  --primary-600: #0891b2;
  --primary-700: #067a8e;
  --primary-800: #056476;
  --primary-900: #044d5c;

  /* Secondary Colors - Purple */
  --secondary-50: #f5f0ff;
  --secondary-100: #ede9fe;
  --secondary-200: #ddd6fe;
  --secondary-300: #cec2fd;
  --secondary-400: #a78bfa;
  --secondary-500: #8b5cf6;
  --secondary-600: #7c3aed;
  --secondary-700: #6d28d9;
  --secondary-800: #5b21b6;
  --secondary-900: #4c1d95;

  /* Accent Colors - Medical Blue */
  --accent-50: #eff6ff;
  --accent-100: #dbeafe;
  --accent-200: #bfdbfe;
  --accent-300: #93c5fd;
  --accent-400: #60a5fa;
  --accent-500: #0369a1;
  --accent-600: #0284c7;
  --accent-700: #0369a1;
  --accent-800: #0c4a6e;
  --accent-900: #082f49;

  /* Semantic Status Colors */
  --status-pending: #f59e0b;
  --status-confirmed: #10b981;
  --status-completed: #0369a1;
  --status-cancelled: #ef4444;
  --status-no-show: #8b5cf6;

  /* Base Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #9ca3af;
  --border-color: #e5e7eb;
  --shadow-color: rgba(0, 0, 0, 0.1);
`;

/**
 * Color Usage Guidelines
 * 
 * Primary (Teal): Main brand color, call-to-action buttons, primary links
 * Secondary (Purple): Highlights, accents, secondary buttons
 * Accent (Medical Blue): Important information, status badges, active states
 * Success (Green): Booking confirmed, available slots
 * Warning (Orange): Pending appointments, important notices
 * Error (Red): Cancellations, errors, no-show appointments
 * Neutral (Gray): Text, backgrounds, borders
 */
