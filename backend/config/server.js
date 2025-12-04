/**
 * Configuración del servidor
 * 
 * @description Configuración centralizada del servidor Express con todas
 * las constantes y configuraciones necesarias para el entorno de producción
 * y desarrollo.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

module.exports = {
  // Configuración del servidor
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configuración JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'itr_dashboard_secret_2024',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Configuración de base de datos
  DATABASE: {
    PATH: process.env.DB_PATH || './database/app.db',
    LOGGING: process.env.NODE_ENV === 'development'
  },

  // Configuración de CORS
  CORS: {
    ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
    CREDENTIALS: true
  },

  // Configuración de Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: process.env.NODE_ENV === 'production' ? 100 : 1000,
    MESSAGE: 'Demasiadas peticiones desde esta IP'
  },

  // Configuración de Bcrypt
  BCRYPT: {
    SALT_ROUNDS: 12
  },

  // Configuración de archivos
  FILES: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Configuración de cookies
  COOKIES: {
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'strict'
  }
};
