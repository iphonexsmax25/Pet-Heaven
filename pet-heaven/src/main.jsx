import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { PetsProvider } from './context/PetsContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { migrateLegacyStorage } from './utils/storage.js';
import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';

migrateLegacyStorage(); // must run before the providers read localStorage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <PetsProvider>
            <App />
          </PetsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
