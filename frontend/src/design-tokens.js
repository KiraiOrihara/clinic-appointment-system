export const designTokens = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#059669',
    secondaryHover: '#047857',
    background: '#f8fafc',
    card: '#ffffff',
    border: '#e5e7eb',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    container: '1rem',
    section: '2rem',
    card: '1.5rem'
  },
  typography: {
    h1: 'text-3xl sm:text-4xl font-bold text-gray-900',
    h2: 'text-2xl sm:text-3xl font-semibold text-gray-900',
    h3: 'text-xl sm:text-2xl font-semibold text-gray-900',
    h4: 'text-lg font-semibold text-gray-900',
    bodyLarge: 'text-lg text-gray-700',
    bodyNormal: 'text-base text-gray-600',
    bodySmall: 'text-sm text-gray-500',
    caption: 'text-xs text-gray-500'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
};

// Standard CSS classes for consistent styling
export const standardClasses = {
  // Container classes
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  sectionSpacing: 'py-8 sm:py-12',
  
  // Card classes
  card: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
  cardHeader: 'border-b border-gray-200 pb-4 mb-4',
  cardHover: 'hover:shadow-md transition-shadow duration-200',
  
  // Button classes
  btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200',
  btnSecondary: 'bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200',
  btnOutline: 'border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200',
  btnGhost: 'text-gray-600 hover:text-gray-900 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200',
  btnSm: 'py-2 px-4 text-sm',
  btnLg: 'py-4 px-8 text-lg',
  
  // Form classes
  formInput: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200',
  formLabel: 'block text-sm font-medium text-gray-700 mb-2',
  formError: 'text-red-600 text-sm mt-1',
  formGroup: 'mb-6',
  
  // Typography classes
  heading1: 'text-3xl sm:text-4xl font-bold text-gray-900',
  heading2: 'text-2xl sm:text-3xl font-semibold text-gray-900',
  heading3: 'text-xl sm:text-2xl font-semibold text-gray-900',
  heading4: 'text-lg font-semibold text-gray-900',
  bodyLarge: 'text-lg text-gray-700',
  bodyNormal: 'text-base text-gray-600',
  bodySmall: 'text-sm text-gray-500',
  caption: 'text-xs text-gray-500',
  
  // Layout classes
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center justify-center',
  
  // Status classes
  statusSuccess: 'bg-green-100 text-green-800',
  statusWarning: 'bg-yellow-100 text-yellow-800',
  statusError: 'bg-red-100 text-red-800',
  statusInfo: 'bg-blue-100 text-blue-800',
  
  // Interactive classes
  interactive: 'hover:bg-gray-50 transition-colors duration-200 cursor-pointer',
  interactivePrimary: 'hover:bg-blue-50 transition-colors duration-200 cursor-pointer'
};

// Helper function for inline styles
export const inlineStyles = {
  // Color helpers
  primary: { color: designTokens.colors.primary },
  secondary: { color: designTokens.colors.secondary },
  background: { backgroundColor: designTokens.colors.background },
  card: { backgroundColor: designTokens.colors.card },
  
  // Spacing helpers
  container: { maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' },
  section: { padding: '3rem 0' },
  
  // Typography helpers
  h1: { fontSize: '2rem', fontWeight: 'bold', color: designTokens.colors.text.primary },
  h2: { fontSize: '1.5rem', fontWeight: '600', color: designTokens.colors.text.primary },
  h3: { fontSize: '1.25rem', fontWeight: '600', color: designTokens.colors.text.primary },
  
  // Card helpers
  card: {
    backgroundColor: designTokens.colors.card,
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: designTokens.shadows.sm,
    border: `1px solid ${designTokens.colors.border}`,
    padding: designTokens.spacing.card
  },
  
  // Button helpers
  btnPrimary: {
    backgroundColor: designTokens.colors.primary,
    color: designTokens.colors.text.inverse,
    padding: '0.75rem 1.5rem',
    borderRadius: designTokens.borderRadius.md,
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  btnPrimaryHover: {
    backgroundColor: designTokens.colors.primaryHover
  }
};
