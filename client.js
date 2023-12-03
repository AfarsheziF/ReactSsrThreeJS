import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import App from './app/app';
import theme from './theme';

import appConfig from './config/appConfig.json';

const cache = createCache({ key: 'css' });

function Client() {
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <BrowserRouter>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <App appConfig={appConfig} />
        </ThemeProvider>
      </CacheProvider>
    </BrowserRouter>
  );
}

const root = createRoot(document.querySelector('#root'));
root.render(<Client />);