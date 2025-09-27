import React from 'react';
import ReactDOM from 'react-dom/client';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import './index.css';
import App from './App';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);