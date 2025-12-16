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

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

function DashboardUsersPage() {
  return (
    <DashboardPage>
      <UsersPage />
    </DashboardPage>
  );
}

function DashboardReportsPage() {
  return (
    <DashboardPage>
      <ReportsPage />
    </DashboardPage>
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
          path="/dashboard/users"
          element={
            isAuthenticated ? <DashboardUsersPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            isAuthenticated ? <DashboardReportsPage /> : <Navigate to="/login" replace />
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
