import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Custom hook to get theme-aware colors
export const useThemeColors = () => {
  const theme = useTheme();
  
  return {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    accent: theme.palette.error.main, // Using error color for accent (#e7500d)
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    background: theme.palette.background.default,
    surface: theme.palette.background.paper,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    
    // Alpha variants for subtle backgrounds
    primaryAlpha: alpha(theme.palette.primary.main, 0.1),
    secondaryAlpha: alpha(theme.palette.secondary.main, 0.1),
    accentAlpha: alpha(theme.palette.error.main, 0.1),
    successAlpha: alpha(theme.palette.success.main, 0.1),
    warningAlpha: alpha(theme.palette.warning.main, 0.1),
  };
};

// Status color mapping utility
export const getStatusColor = (status: string, theme: any) => {
  const statusColors = {
    mapped: theme.palette.success.main,
    pending: theme.palette.warning.main,
    rejected: theme.palette.error.main,
    unmapped: theme.palette.text.secondary,
    loading: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
  };
  
  return statusColors[status as keyof typeof statusColors] || theme.palette.text.secondary;
};

// Confidence score color utility
export const getConfidenceColor = (confidence: number, theme: any) => {
  if (confidence >= 90) return theme.palette.success.main;
  if (confidence >= 80) return theme.palette.warning.main;
  if (confidence >= 70) return theme.palette.error.main;
  return theme.palette.text.disabled;
};

// Common shadow styles
export const shadowStyles = {
  card: '0 2px 8px rgba(4, 36, 60, 0.1)',
  elevated: '0 4px 16px rgba(4, 36, 60, 0.15)',
  popup: '0 8px 32px rgba(4, 36, 60, 0.2)',
};

// Export theme colors as constants for use in non-React contexts
export const themeColors = {
  primary: '#2B9CAE',
  secondary: '#04243C',
  accent: '#e7500d',
  primaryLight: '#5CBDD0',
  primaryDark: '#1E6B79',
  secondaryLight: '#2A4A68',
  secondaryDark: '#021829',
  accentLight: '#FF7D47',
  accentDark: '#B23808',
};

export default {
  useThemeColors,
  getStatusColor,
  getConfidenceColor,
  shadowStyles,
  themeColors,
};