/**
 * Slice de Autenticación para Redux
 * 
 * @description Maneja el estado de autenticación, login, logout y datos del usuario.
 * Incluye acciones síncronas y asíncronas para gestión completa de autenticación.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

/**
 * Estado inicial de autenticación
 * 
 * @constant {Object} initialState
 * @description Estado inicial del slice de autenticación
 * 
 * @since 1.0.0
 */
const initialState = {
  // Estado de autenticación
  isAuthenticated: false,
  user: null,
  token: null,
  sessionId: null,
  
  // Estados de carga
  loading: false,
  loginLoading: false,
  logoutLoading: false,
  
  // Estados de error
  error: null,
  loginError: null,
  
  // Información adicional
  lastLogin: null,
  sessionExpiry: null,
  rememberMe: false,
};

/**
 * Slice de autenticación
 * 
 * @constant {Object} authSlice
 * @description Slice principal para manejo de autenticación
 * 
 * @since 1.0.0
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // =====================================
    // ACCIONES DE LOGIN
    // =====================================
    
    /**
     * Inicia el proceso de login
     */
    loginStart: (state) => {
      state.loginLoading = true;
      state.loginError = null;
      state.error = null;
    },
    
    /**
     * Login exitoso
     */
    loginSuccess: (state, action) => {
      const { user, token, sessionId, expiresAt } = action.payload;
      
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.sessionId = sessionId;
      state.sessionExpiry = expiresAt;
      state.lastLogin = new Date().toISOString();
      
      state.loginLoading = false;
      state.loading = false;
      state.loginError = null;
      state.error = null;
      
      // Guardar token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('itr-auth-token', token);
        localStorage.setItem('itr-user-data', JSON.stringify(user));
      }
    },
    
    /**
     * Error en login
     */
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.loginLoading = false;
      state.loading = false;
      state.loginError = action.payload;
      state.error = action.payload;
      
      // Limpiar datos de autenticación
      state.user = null;
      state.token = null;
      state.sessionId = null;
      state.sessionExpiry = null;
    },
    
    // =====================================
    // ACCIONES DE LOGOUT
    // =====================================
    
    /**
     * Inicia el proceso de logout
     */
    logoutStart: (state) => {
      state.logoutLoading = true;
    },
    
    /**
     * Logout exitoso
     */
    logout: (state) => {
      // Resetear todo el estado de autenticación
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.sessionId = null;
      state.sessionExpiry = null;
      state.lastLogin = null;
      state.rememberMe = false;
      
      state.logoutLoading = false;
      state.loading = false;
      state.error = null;
      state.loginError = null;
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('itr-auth-token');
        localStorage.removeItem('itr-user-data');
        localStorage.removeItem('itr-session-data');
      }
    },
    
    // =====================================
    // ACCIONES DE REGISTRO
    // =====================================
    
    /**
     * Registro exitoso (similar a login)
     */
    registerSuccess: (state, action) => {
      const { user, token, sessionId, expiresAt } = action.payload;
      
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.sessionId = sessionId;
      state.sessionExpiry = expiresAt;
      state.lastLogin = new Date().toISOString();
      
      state.loading = false;
      state.error = null;
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('itr-auth-token', token);
        localStorage.setItem('itr-user-data', JSON.stringify(user));
      }
    },
    
    // =====================================
    // ACCIONES DE ACTUALIZACIÓN
    // =====================================
    
    /**
     * Actualizar datos del usuario
     */
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Actualizar en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('itr-user-data', JSON.stringify(state.user));
        }
      }
    },
    
    /**
     * Actualizar token (refresh)
     */
    updateToken: (state, action) => {
      const { token, expiresAt } = action.payload;
      
      state.token = token;
      state.sessionExpiry = expiresAt;
      
      // Actualizar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('itr-auth-token', token);
      }
    },
    
    // =====================================
    // ACCIONES DE ESTADO
    // =====================================
    
    /**
     * Establecer estado de carga
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    /**
     * Establecer error
     */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.loginLoading = false;
    },
    
    /**
     * Limpiar errores
     */
    clearError: (state) => {
      state.error = null;
      state.loginError = null;
    },
    
    /**
     * Establecer Remember Me
     */
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    
    // =====================================
    // ACCIONES DE RESTAURACIÓN
    // =====================================
    
    /**
     * Restaurar sesión desde localStorage
     */
    restoreSession: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('itr-auth-token');
        const userData = localStorage.getItem('itr-user-data');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            
            state.isAuthenticated = true;
            state.user = user;
            state.token = token;
            state.lastLogin = user.last_login || null;
            
            // Verificar si el token sigue siendo válido (básico)
            // En una implementación real, se verificaría con el servidor
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            
            if (tokenData.exp && tokenData.exp < now) {
              // Token expirado, hacer logout
              authSlice.caseReducers.logout(state);
            }
          } catch (error) {
            // Error parseando datos, limpiar
            authSlice.caseReducers.logout(state);
          }
        }
      }
    },
    
    /**
     * Verificar expiración de sesión
     */
    checkSessionExpiry: (state) => {
      if (state.sessionExpiry) {
        const now = new Date();
        const expiry = new Date(state.sessionExpiry);
        
        if (now >= expiry) {
          // Sesión expirada
          authSlice.caseReducers.logout(state);
        }
      }
    },
    
    // =====================================
    // RESETEO COMPLETO
    // =====================================
    
    /**
     * Resetear estado completo
     */
    reset: (state) => {
      Object.assign(state, initialState);
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('itr-auth-token');
        localStorage.removeItem('itr-user-data');
        localStorage.removeItem('itr-session-data');
      }
    },
  },
});

// =====================================
// SELECTORES
// =====================================

/**
 * Selectores para el estado de autenticación
 * 
 * @constant {Object} authSelectors
 * @description Selectores para acceder fácilmente al estado de auth
 * 
 * @since 1.0.0
 */
export const authSelectors = {
  // Estado principal
  selectAuth: (state) => state.auth,
  selectIsAuthenticated: (state) => state.auth.isAuthenticated,
  selectUser: (state) => state.auth.user,
  selectToken: (state) => state.auth.token,
  
  // Estados de carga
  selectLoading: (state) => state.auth.loading,
  selectLoginLoading: (state) => state.auth.loginLoading,
  selectLogoutLoading: (state) => state.auth.logoutLoading,
  
  // Estados de error
  selectError: (state) => state.auth.error,
  selectLoginError: (state) => state.auth.loginError,
  
  // Información adicional
  selectUserName: (state) => {
    const user = state.auth.user;
    return user ? `${user.first_name} ${user.last_name}` : null;
  },
  selectUserEmail: (state) => state.auth.user?.email,
  selectLastLogin: (state) => state.auth.lastLogin,
  selectSessionExpiry: (state) => state.auth.sessionExpiry,
  
  // Estados computados
  selectIsSessionValid: (state) => {
    const { isAuthenticated, sessionExpiry } = state.auth;
    if (!isAuthenticated || !sessionExpiry) return false;
    
    const now = new Date();
    const expiry = new Date(sessionExpiry);
    return now < expiry;
  },
  
  selectTimeUntilExpiry: (state) => {
    const { sessionExpiry } = state.auth;
    if (!sessionExpiry) return null;
    
    const now = new Date();
    const expiry = new Date(sessionExpiry);
    const diff = expiry - now;
    
    return diff > 0 ? Math.floor(diff / 1000 / 60) : 0; // minutos
  },
};

// Exportar acciones y reducer
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutStart,
  logout,
  registerSuccess,
  updateUser,
  updateToken,
  setLoading,
  setError,
  clearError,
  setRememberMe,
  restoreSession,
  checkSessionExpiry,
  reset,
} = authSlice.actions;

// Thunks
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await dispatch(
      apiSlice.endpoints.login.initiate(credentials)
    ).unwrap();

    const payload = response?.data || {};
    dispatch(
      loginSuccess({
        user: payload.user,
        token: payload.token,
        sessionId: payload.session_id,
        expiresAt: payload.expires_at,
      })
    );

    return { payload: { success: true, data: payload } };
  } catch (error) {
    const message = error?.data?.message || error?.error || 'Error en login';
    dispatch(loginFailure(message));
    return { payload: { success: false, error: message } };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    dispatch(logoutStart());
    await dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
  } catch (error) {
    // continuar con limpieza local aunque falle servidor
  } finally {
    dispatch(logout());
  }
  return { success: true };
};

export default authSlice.reducer;
