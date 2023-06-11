import PropTypes from 'prop-types';
import { useMemo } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
//
import palette from './palette';
import shadows from './shadows';
import typography from './typography';
import GlobalStyles from './globalStyles';
import customShadows from './customShadows';
import componentsOverride from './overrides';

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

const lightTheme = createTheme({
  palette: {
    // mode: 'light',
    // primary: {
    //   main: '#2196f3', // Main color for primary elements
    // },
    // secondary: {
    //   main: '#f50057', // Main color for secondary elements
    // },
    // background: {
    //   default: '#ffffff', // Default background color
    //   paper: '#f5f5f5', // Background color for paper elements
    // },
    // text: {
    //   primary: '#000000', // Primary text color
    //   secondary: '#616161', // Secondary text color
    // },
  },
});

const darkTheme = createTheme({
  palette: {
    // mode: 'dark',
    // primary: {
    //   main: '#2196f3', // Main color for primary elements
    // },
    // secondary: {
    //   main: '#f50057', // Main color for secondary elements
    // },
    // background: {
    //   default: '#121212', // Default background color
    //   paper: '#1e1e1e', // Background color for paper elements
    // },
    // text: {
    //   primary: '#ffffff', // Primary text color
    //   secondary: '#b0bec5', // Secondary text color
    // },
  },
});

export { lightTheme, darkTheme };

export default function ThemeProvider({ children }) {
  const themeOptions = useMemo(
    () => ({
      palette,
      shape: { borderRadius: 6 },
      typography,
      shadows: shadows(),
      customShadows: customShadows(),
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
