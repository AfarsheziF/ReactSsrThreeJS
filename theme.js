import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#556cd6',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  // transitions: {
  //   duration: {
  //     enteringScreen: 5000,
  //     leavingScreen: 5000,
  //   }
  // }
  // components: {
  //   // Name of the component
  //   MenuItem: {
  //     styleOverrides: {
  //       // Name of the slot
  //       root: {
  //         color: '#fff'
  //       },
  //     },
  //   },
  //   Select: {
  //     styleOverrides: {
  //       // Name of the slot
  //       root: {
  //         color: '#fff'
  //       },
  //     },
  //   }
  // }
});

export default theme;
