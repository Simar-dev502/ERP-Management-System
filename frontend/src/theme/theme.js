import { createTheme } from '@mui/material/styles';

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
            secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
            background: { default: '#f5f5f5', paper: '#ffffff' },
          }
        : {
            primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
            secondary: { main: '#ce93d8', light: '#f3e5f5', dark: '#ab47bc' },
            background: { default: '#121212', paper: '#1e1e1e' },
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: 'none' },
        },
      },
    },
  });

export default getTheme;