/**
 * Componente principal de la aplicación ITR Dashboard
 * 
 * @description Componente raíz que maneja las rutas principales, autenticación
 * y layout general de la aplicación con efectos glass morphism.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

// Importar componentes
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardMain from './components/dashboard/DashboardMain';

/**
 * Página de Login
 * 
 * @component LoginPage
 * @description Página de login con formulario completo
 * 
 * @returns {JSX.Element} Página de login
 * 
 * @since 1.0.0
 */
function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #4052C4 0%, #8036DA 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <LoginForm />
    </Box>
  );
}

function RegisterPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #4052C4 0%, #8036DA 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <RegisterForm />
    </Box>
  );
}

/**
 * Página de Dashboard
 * 
 * @component DashboardPage
 * @description Dashboard completo con layout y contenido
 * 
 * @returns {JSX.Element} Página de dashboard
 * 
 * @since 1.0.0
 */
function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardMain />
    </DashboardLayout>
  );
}

/**
 * Componente principal de la aplicación
 * 
 * @component App
 * @description Componente raíz con routing y layout principal
 * 
 * @returns {JSX.Element} Aplicación completa
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function App() {
  // Estado de autenticación desde Redux (por ahora siempre false)
  const isAuthenticated = useSelector((state) => state?.auth?.isAuthenticated || false);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage />} 
        />
        <Route 
          path="/register" 
          element={<RegisterPage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Box>
  );
}

export default App;
