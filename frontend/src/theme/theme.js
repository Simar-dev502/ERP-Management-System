import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8' },
          secondary: { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
          success: { main: '#059669', light: '#34d399', dark: '#047857' },
          warning: { main: '#d97706', light: '#fbbf24', dark: '#b45309' },
          error: { main: '#dc2626', light: '#f87171', dark: '#b91c1c' },
          background: { default: '#f0f2f5', paper: '#ffffff' },
          text: { primary: '#1e293b', secondary: '#64748b' },
        }
      : {
          primary: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6' },
          secondary: { main: '#a78bfa', light: '#c4b5fd', dark: '#8b5cf6' },
          success: { main: '#34d399', light: '#6ee7b7', dark: '#10b981' },
          warning: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b' },
          error: { main: '#f87171', light: '#fca5a5', dark: '#ef4444' },
          background: { default: '#0f172a', paper: '#1e293b' },
          text: { primary: '#f1f5f9', secondary: '#94a3b8' },
        }),
  },
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
});

export default getTheme;
