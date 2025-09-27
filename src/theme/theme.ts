import { createTheme } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: '#2B9CAE',      // Teal/Cyan blue
  secondary: '#04243C',    // Dark navy blue
  accent: '#e7500d',       // Orange/red accent
};

// Extend the theme to include custom accent color
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

// Create Material UI theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: '#5CBDD0',
      dark: '#1E6B79',
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      light: '#2A4A68',
      dark: '#021829',
      contrastText: '#ffffff',
    },
    accent: {
      main: colors.accent,
      light: '#FF7D47',
      dark: '#B23808',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f', // Keep standard error color
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: colors.secondary,
      secondary: '#5A6C7D',
    },
    divider: '#E0E4E7',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: colors.secondary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.secondary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: colors.secondary,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.secondary,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.secondary,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: colors.secondary,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: colors.secondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: colors.secondary,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 20px',
        },
        containedPrimary: {
          backgroundColor: colors.primary,
          '&:hover': {
            backgroundColor: '#1E6B79',
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          '&:hover': {
            backgroundColor: '#2A4A68',
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary,
          color: colors.primary,
          '&:hover': {
            backgroundColor: 'rgba(43, 156, 174, 0.04)',
            borderColor: colors.primary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(4, 36, 60, 0.1)',
          border: '1px solid #E0E4E7',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(4, 36, 60, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        colorPrimary: {
          backgroundColor: colors.primary,
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: colors.secondary,
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#E0E4E7',
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8FAFC',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: colors.secondary,
            borderBottom: `1px solid ${colors.primary}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#FAFBFC',
          },
          '&:hover': {
            backgroundColor: 'rgba(43, 156, 174, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.secondary,
          boxShadow: '0 2px 8px rgba(4, 36, 60, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: `1px solid #E0E4E7`,
        },
      },
    },
  },
});

export default theme;