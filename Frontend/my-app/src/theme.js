import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff', // Custom primary color
    },
    secondary: {
      main: '#ffcc80', // Custom secondary color
    },
    background: {
      default: '#212121', // Custom background color for dark theme
      card: '#212121', // Custom background color for light theme
      paper: '#212121', // Custom surface color for dark theme
      lines: 'linear-gradient(to right,#4f4f4f2e 1px,transparent 1px),linear-gradient(to bottom,#4f4f4f2e 1px,transparent 1px), radial-gradient(black 1px, transparent 0) -19px -19px/40px 40px',
    },
    // Add more customizations as needed
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#18181B', // Custom primary color
    },
    secondary: {
      main: '#ff5722', // Custom secondary color
    },
    background: {
      default: '#ffffff',
      card: '#ffffff', // Custom background color for light theme
      paper: '#f5f5f5', // Custom surface color for light theme
      lines: 'linear-gradient(to right,#4f4f4f2e 1px,transparent 1px),linear-gradient(to bottom,#8080800a 1px,transparent 1px), radial-gradient(black 1px, transparent 0) -19px -19px/40px 40px',
      
    },
    // Add more customizations as needed
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});