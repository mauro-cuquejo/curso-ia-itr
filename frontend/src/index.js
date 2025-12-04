/**
 * Punto de entrada principal de la aplicación React
 * 
 * @description Configura el renderizado de React con Redux Provider,
 * Theme Provider de Material-UI y configuración global de la aplicación.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

// Store de Redux
import { store } from './store';

// Tema personalizado
import { theme } from './styles/theme';

// Componente principal
import App from './App';

// Estilos globales
import './styles/globalStyles.css';

/**
 * Configuración principal de la aplicación
 * 
 * @function AppRoot
 * @description Envuelve la aplicación con todos los providers necesarios
 * 
 * @returns {JSX.Element} Aplicación configurada con providers
 * 
 * @since 1.0.0
 */
function AppRoot() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

// Obtener elemento root del DOM
const container = document.getElementById('root');
const root = createRoot(container);

// Renderizar la aplicación
root.render(<AppRoot />);

// Remover loader inicial
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  setTimeout(() => {
    initialLoader.style.opacity = '0';
    setTimeout(() => {
      initialLoader.remove();
    }, 300);
  }, 500);
}

// Hot Module Replacement (HMR) para desarrollo
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    root.render(<NextApp />);
  });
}
