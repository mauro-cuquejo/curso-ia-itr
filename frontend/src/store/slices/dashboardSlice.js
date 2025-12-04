/**
 * Slice de Redux para el Dashboard
 * 
 * @description Maneja el estado del dashboard incluyendo estadísticas,
 * métricas y datos en tiempo real.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Estado inicial del dashboard
 */
const initialState = {
  // Estado de carga
  loading: false,
  error: null,
  
  // Estadísticas del dashboard
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    systemUptime: 0,
    usersGrowth: 0,
    sessionsGrowth: 0,
    uptimeGrowth: 0,
  },
  
  // Métricas del sistema
  systemMetrics: {
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0,
    networkLatency: 0,
  },
  
  // Actividad reciente
  recentActivity: [],
  
  // Usuarios conectados
  connectedUsers: [],
  
  // Configuración del dashboard
  config: {
    refreshInterval: 30000, // 30 segundos
    autoRefresh: true,
    theme: 'light',
  },
};

/**
 * Thunk asíncrono para obtener estadísticas del dashboard
 * 
 * @function fetchDashboardStats
 * @description Obtiene las estadísticas principales del dashboard
 * 
 * @returns {Promise<Object>} Estadísticas del dashboard
 */
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // Simular llamada a la API
      // En una implementación real, aquí se haría la llamada al backend
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalUsers: 1247,
            activeUsers: 89,
            totalSessions: 3456,
            systemUptime: 99.9,
            usersGrowth: 12.5,
            sessionsGrowth: 8.3,
            uptimeGrowth: 0.1,
          });
        }, 1000);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk asíncrono para obtener métricas del sistema
 * 
 * @function fetchSystemMetrics
 * @description Obtiene las métricas del sistema en tiempo real
 * 
 * @returns {Promise<Object>} Métricas del sistema
 */
export const fetchSystemMetrics = createAsyncThunk(
  'dashboard/fetchSystemMetrics',
  async (_, { rejectWithValue }) => {
    try {
      // Simular llamada a la API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            storageUsage: Math.random() * 100,
            networkLatency: Math.random() * 100,
          });
        }, 500);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk asíncrono para obtener actividad reciente
 * 
 * @function fetchRecentActivity
 * @description Obtiene la actividad reciente del sistema
 * 
 * @returns {Promise<Array>} Lista de actividades recientes
 */
export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (_, { rejectWithValue }) => {
    try {
      // Simular llamada a la API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              type: 'success',
              message: 'Usuario admin@itr.com inició sesión',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              userId: 'admin@itr.com',
            },
            {
              id: 2,
              type: 'info',
              message: 'Nuevo usuario registrado: juan@example.com',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              userId: 'juan@example.com',
            },
            {
              id: 3,
              type: 'warning',
              message: 'Intento de login fallido desde IP 192.168.1.100',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              userId: null,
            },
            {
              id: 4,
              type: 'error',
              message: 'Error de conexión a la base de datos',
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              userId: null,
            },
          ]);
        }, 800);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Slice de Redux para el dashboard
 */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /**
     * Resetea el estado del dashboard
     */
    resetDashboard: (state) => {
      return { ...initialState };
    },
    
    /**
     * Actualiza la configuración del dashboard
     * 
     * @param {Object} state - Estado actual
     * @param {Object} action - Acción con payload de configuración
     */
    updateConfig: (state, action) => {
      state.config = { ...state.config, ...action.payload };
    },
    
    /**
     * Actualiza las métricas del sistema manualmente
     * 
     * @param {Object} state - Estado actual
     * @param {Object} action - Acción con payload de métricas
     */
    updateSystemMetrics: (state, action) => {
      state.systemMetrics = { ...state.systemMetrics, ...action.payload };
    },
    
    /**
     * Agrega una nueva actividad al historial
     * 
     * @param {Object} state - Estado actual
     * @param {Object} action - Acción con payload de actividad
     */
    addActivity: (state, action) => {
      state.recentActivity.unshift(action.payload);
      // Mantener solo las últimas 50 actividades
      if (state.recentActivity.length > 50) {
        state.recentActivity = state.recentActivity.slice(0, 50);
      }
    },
    
    /**
     * Limpia el historial de actividades
     * 
     * @param {Object} state - Estado actual
     */
    clearActivity: (state) => {
      state.recentActivity = [];
    },
    
    /**
     * Actualiza la lista de usuarios conectados
     * 
     * @param {Object} state - Estado actual
     * @param {Object} action - Acción con payload de usuarios
     */
    updateConnectedUsers: (state, action) => {
      state.connectedUsers = action.payload;
    },
    
    /**
     * Establece el estado de error
     * 
     * @param {Object} state - Estado actual
     * @param {Object} action - Acción con payload de error
     */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    /**
     * Limpia el estado de error
     * 
     * @param {Object} state - Estado actual
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboardStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchSystemMetrics
      .addCase(fetchSystemMetrics.pending, (state) => {
        // No cambiar loading para métricas en tiempo real
      })
      .addCase(fetchSystemMetrics.fulfilled, (state, action) => {
        state.systemMetrics = action.payload;
      })
      .addCase(fetchSystemMetrics.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // fetchRecentActivity
      .addCase(fetchRecentActivity.pending, (state) => {
        // No cambiar loading para actividad
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Exportar acciones
export const {
  resetDashboard,
  updateConfig,
  updateSystemMetrics,
  addActivity,
  clearActivity,
  updateConnectedUsers,
  setError,
  clearError,
} = dashboardSlice.actions;

// Selectores
export const selectDashboard = (state) => state.dashboard;
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectSystemMetrics = (state) => state.dashboard.systemMetrics;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectConnectedUsers = (state) => state.dashboard.connectedUsers;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardConfig = (state) => state.dashboard.config;

// Selectores computados
export const selectDashboardSummary = (state) => {
  const { stats, systemMetrics, recentActivity } = state.dashboard;
  return {
    totalUsers: stats.totalUsers,
    activeUsers: stats.activeUsers,
    systemHealth: systemMetrics.cpuUsage < 80 && systemMetrics.memoryUsage < 90 ? 'good' : 'warning',
    recentActivityCount: recentActivity.length,
    uptime: stats.systemUptime,
  };
};

export default dashboardSlice.reducer;




