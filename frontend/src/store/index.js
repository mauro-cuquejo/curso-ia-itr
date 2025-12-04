/**
 * Configuración principal de Redux Store
 * 
 * @description Configuración centralizada de Redux Toolkit con RTK Query,
 * middleware personalizado, persistencia y configuración de desarrollo.
 * Incluye todos los slices y APIs del sistema.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Importar slices
import authSlice from './slices/authSlice';
import usersSlice from './slices/usersSlice';
import uiSlice from './slices/uiSlice';
import dashboardSlice from './slices/dashboardSlice';

// Importar API slice
import { apiSlice } from './api/apiSlice';

/**
 * Middleware personalizado para logging en desarrollo
 * 
 * @function loggerMiddleware
 * @description Middleware que registra acciones en modo desarrollo
 * 
 * @param {Object} store - Store de Redux
 * @returns {Function} Middleware function
 * 
 * @since 1.0.0
 */
const loggerMiddleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔥 Action: ${action.type}`);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);
    const result = next(action);
    console.log('Next State:', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

/**
 * Middleware para manejo de errores
 * 
 * @function errorMiddleware
 * @description Captura y procesa errores de acciones
 * 
 * @param {Object} store - Store de Redux
 * @returns {Function} Middleware function
 * 
 * @since 1.0.0
 */
const errorMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('❌ Error in action:', action.type, error);
    
    // Dispatch error action if available
    if (store.dispatch) {
      store.dispatch({
        type: 'ui/setError',
        payload: {
          message: error.message || 'Error inesperado',
          action: action.type,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    throw error;
  }
};

/**
 * Configuración del store principal
 * 
 * @constant {Object} store
 * @description Store configurado con Redux Toolkit, RTK Query y middleware
 * 
 * @since 1.0.0
 */
export const store = configureStore({
  reducer: {
    // API slice para todas las queries
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // Slices de estado
    auth: authSlice,
    users: usersSlice,
    ui: uiSlice,
    dashboard: dashboardSlice,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas action types para RTK Query
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
        // Ignorar estos paths en el state
        ignoredPaths: ['api'],
      },
      // Configuración de inmutabilidad
      immutableCheck: {
        warnAfter: 32,
      },
    })
      // Agregar RTK Query middleware
      .concat(apiSlice.middleware)
      // Agregar middleware personalizado solo en desarrollo
      .concat(
        process.env.NODE_ENV === 'development' 
          ? [loggerMiddleware, errorMiddleware]
          : [errorMiddleware]
      ),
      
  // Habilitar Redux DevTools en desarrollo
  devTools: process.env.NODE_ENV === 'development' && {
    name: 'ITR Dashboard',
    trace: true,
    traceLimit: 25,
  },
  
  // Configuración adicional
  preloadedState: undefined,
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers(),
});

// Configurar listeners para RTK Query
setupListeners(store.dispatch);

/**
 * Tipos de TypeScript para el store (si se usa TypeScript)
 * 
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */
export const RootState = store.getState;
export const AppDispatch = store.dispatch;

/**
 * Selectores de alto nivel para acceso rápido al estado
 * 
 * @constant {Object} rootSelectors
 * @description Selectores para acceder a partes comunes del estado
 * 
 * @since 1.0.0
 */
export const rootSelectors = {
  // Estado de autenticación
  selectAuth: (state) => state.auth,
  selectIsAuthenticated: (state) => state.auth.isAuthenticated,
  selectCurrentUser: (state) => state.auth.user,
  selectAuthToken: (state) => state.auth.token,
  
  // Estado de usuarios
  selectUsers: (state) => state.users,
  selectUsersList: (state) => state.users.list,
  selectUsersLoading: (state) => state.users.loading,
  
  // Estado de UI
  selectUI: (state) => state.ui,
  selectTheme: (state) => state.ui.theme,
  selectSidebarOpen: (state) => state.ui.sidebarOpen,
  selectLoading: (state) => state.ui.loading,
  selectError: (state) => state.ui.error,
  selectSuccess: (state) => state.ui.success,
};

/**
 * Acciones de alto nivel para operaciones comunes
 * 
 * @constant {Object} rootActions
 * @description Acciones agrupadas para fácil importación
 * 
 * @since 1.0.0
 */
export const rootActions = {
  // Acciones de auth
  auth: authSlice.actions,
  
  // Acciones de users
  users: usersSlice.actions,
  
  // Acciones de UI
  ui: uiSlice.actions,
};

/**
 * Función para limpiar el store (logout, reset, etc.)
 * 
 * @function resetStore
 * @description Resetea todos los slices a su estado inicial
 * 
 * @returns {void}
 * 
 * @since 1.0.0
 */
export const resetStore = () => {
  store.dispatch(authSlice.actions.logout());
  store.dispatch(usersSlice.actions.reset());
  store.dispatch(uiSlice.actions.reset());
  
  // Limpiar cache de RTK Query
  store.dispatch(apiSlice.util.resetApiState());
};

/**
 * Función para obtener estado actual del store
 * 
 * @function getStoreState
 * @description Obtiene snapshot del estado actual
 * 
 * @returns {Object} Estado actual del store
 * 
 * @since 1.0.0
 */
export const getStoreState = () => store.getState();

/**
 * Función para suscribirse a cambios del store
 * 
 * @function subscribeToStore
 * @description Suscribe listener a cambios del store
 * 
 * @param {Function} listener - Función a ejecutar en cambios
 * @returns {Function} Función para desuscribirse
 * 
 * @since 1.0.0
 */
export const subscribeToStore = (listener) => store.subscribe(listener);

/**
 * Funciones de utilidad para el store
 * 
 * @constant {Object} storeUtils
 * @description Utilidades para trabajar con el store
 * 
 * @since 1.0.0
 */
export const storeUtils = {
  /**
   * Verifica si hay operaciones en curso
   * @param {Object} state - Estado del store
   * @returns {boolean} True si hay loading activo
   */
  hasLoadingOperations: (state) => {
    return state.ui.loading || 
           state.users.loading || 
           Object.values(state.api?.queries || {}).some(query => query?.status === 'pending');
  },
  
  /**
   * Obtiene todos los errores activos
   * @param {Object} state - Estado del store
   * @returns {Array} Lista de errores
   */
  getAllErrors: (state) => {
    const errors = [];
    
    if (state.ui.error) errors.push({ type: 'ui', ...state.ui.error });
    if (state.auth.error) errors.push({ type: 'auth', ...state.auth.error });
    if (state.users.error) errors.push({ type: 'users', ...state.users.error });
    
    return errors;
  },
  
  /**
   * Verifica si el usuario está autenticado
   * @param {Object} state - Estado del store
   * @returns {boolean} True si está autenticado
   */
  isUserAuthenticated: (state) => {
    return state.auth.isAuthenticated && state.auth.token && state.auth.user;
  },
  
  /**
   * Obtiene información básica del usuario actual
   * @param {Object} state - Estado del store
   * @returns {Object|null} Información del usuario o null
   */
  getCurrentUserInfo: (state) => {
    if (!storeUtils.isUserAuthenticated(state)) return null;
    
    return {
      id: state.auth.user.id,
      name: `${state.auth.user.first_name} ${state.auth.user.last_name}`,
      email: state.auth.user.email,
      role: state.auth.user.role || 'user',
      avatar: state.auth.user.avatar_url,
    };
  },
};

/**
 * Hook personalizado para acceso al store (para uso en componentes)
 * 
 * @function useAppStore
 * @description Hook que combina dispatch y selectores comunes
 * 
 * @returns {Object} Objeto con dispatch y selectores
 * 
 * @since 1.0.0
 */
export const useAppStore = () => {
  // Esta función sería usada en un hook personalizado
  // que importaría useDispatch y useSelector
  return {
    dispatch: store.dispatch,
    getState: store.getState,
    selectors: rootSelectors,
    actions: rootActions,
    utils: storeUtils,
  };
};

/**
 * Configuración de persistencia (para localStorage)
 * 
 * @constant {Object} persistConfig
 * @description Configuración para persistir estado en localStorage
 * 
 * @since 1.0.0
 */
export const persistConfig = {
  key: 'itr-dashboard-root',
  version: 1,
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  whitelist: ['auth', 'ui'], // Solo persistir auth y ui
  blacklist: ['users', 'api'], // No persistir users y api (se recargan)
  transforms: [
    // Transform para limpiar datos sensibles antes de persistir
    {
      in: (state, key) => {
        if (key === 'auth' && state?.token) {
          // No persistir el token completo, solo un flag
          return {
            ...state,
            token: state.token ? '***PERSISTED***' : null,
          };
        }
        return state;
      },
      out: (state, key) => {
        if (key === 'auth' && state?.token === '***PERSISTED***') {
          // El token real se obtiene del localStorage directamente
          return {
            ...state,
            token: localStorage.getItem('itr-auth-token'),
          };
        }
        return state;
      },
    },
  ],
};

// Exportar store como default
export default store;
