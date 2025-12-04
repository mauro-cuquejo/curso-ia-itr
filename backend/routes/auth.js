/**
 * Rutas de Autenticación
 * 
 * @description Define todas las rutas relacionadas con autenticación:
 * registro, login, logout, refresh de tokens y verificación de usuarios.
 * Incluye validaciones de entrada y middleware de autenticación.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Importar controladores
const {
  register,
  login,
  logout,
  me,
  refreshToken,
  logoutAll
} = require('../controllers/authController');

// Importar middleware
const { 
  authenticateToken, 
  logUserActivity 
} = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * Validaciones de entrada para registro
 * 
 * @constant {Array} registerValidations
 * @description Array de validaciones para el registro de usuarios
 * 
 * @since 1.0.0
 */
const registerValidations = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ min: 5, max: 255 })
    .withMessage('El email debe tener entre 5 y 255 caracteres'),
  
  body('password')
    .isLength({ min: 6, max: 255 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El apellido debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('phone')
    .optional()
    .isMobilePhone(['es-ES'])
    .withMessage('Debe ser un número de teléfono válido'),
];

/**
 * Validaciones de entrada para login
 * 
 * @constant {Array} loginValidations
 * @description Array de validaciones para el login de usuarios
 * 
 * @since 1.0.0
 */
const loginValidations = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  body('remember_me')
    .optional()
    .isBoolean()
    .withMessage('remember_me debe ser un valor booleano'),
];

// ======================
// RUTAS PÚBLICAS
// ======================

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Público
 * @example
 * POST /api/auth/register
 * Content-Type: application/json
 * 
 * {
 *   "email": "usuario@example.com",
 *   "password": "Password123",
 *   "first_name": "Juan",
 *   "last_name": "Pérez",
 *   "phone": "+34600000000"
 * }
 * 
 * @returns {Object} 201 - Usuario creado exitosamente
 * @returns {Object} 400 - Error de validación
 * @returns {Object} 409 - Email ya existe
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/register', 
  registerValidations,
  asyncHandler(register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario y obtener token
 * @access  Público
 * @example
 * POST /api/auth/login
 * Content-Type: application/json
 * 
 * {
 *   "email": "usuario@example.com",
 *   "password": "Password123",
 *   "remember_me": false
 * }
 * 
 * @returns {Object} 200 - Login exitoso con token
 * @returns {Object} 400 - Error de validación
 * @returns {Object} 401 - Credenciales inválidas
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/login',
  loginValidations,
  asyncHandler(login)
);

// ======================
// RUTAS PROTEGIDAS
// ======================

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Privado (requiere token)
 * @example
 * GET /api/auth/me
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Información del usuario
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/me',
  authenticateToken,
  logUserActivity,
  asyncHandler(me)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión actual
 * @access  Privado (requiere token)
 * @example
 * POST /api/auth/logout
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Logout exitoso
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/logout',
  authenticateToken,
  logUserActivity,
  asyncHandler(logout)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acceso
 * @access  Privado (requiere token)
 * @example
 * POST /api/auth/refresh
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Token renovado exitosamente
 * @returns {Object} 400 - Token no necesita renovación
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/refresh',
  authenticateToken,
  asyncHandler(refreshToken)
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Cerrar todas las sesiones del usuario
 * @access  Privado (requiere token)
 * @example
 * POST /api/auth/logout-all
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Todas las sesiones cerradas
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/logout-all',
  authenticateToken,
  logUserActivity,
  asyncHandler(logoutAll)
);

// ======================
// RUTAS DE UTILIDAD
// ======================

/**
 * @route   GET /api/auth/check
 * @desc    Verificar si el token es válido (sin renovar)
 * @access  Privado (requiere token)
 * @example
 * GET /api/auth/check
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Token válido
 * @returns {Object} 401 - Token inválido o expirado
 */
router.get('/check',
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user_id: req.user.id,
        email: req.user.email,
        session_valid: !!req.session,
        token_valid: true
      }
    });
  }
);

/**
 * @route   GET /api/auth/sessions
 * @desc    Obtener sesiones activas del usuario
 * @access  Privado (requiere token)
 * @example
 * GET /api/auth/sessions
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Lista de sesiones activas
 * @returns {Object} 401 - Token inválido o expirado
 */
router.get('/sessions',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { UserSession } = require('../models');
    
    const sessions = await UserSession.getActiveSessions(req.user.id);
    
    const sessionsData = sessions.map(session => ({
      id: session.id,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      created_at: session.created_at,
      last_activity: session.last_activity,
      expires_at: session.expires_at,
      time_remaining: session.getTimeRemaining(),
      is_current: req.session ? session.id === req.session.id : false
    }));

    res.json({
      success: true,
      data: {
        active_sessions: sessionsData,
        total_count: sessionsData.length
      }
    });
  })
);

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Cerrar una sesión específica
 * @access  Privado (requiere token)
 * @example
 * DELETE /api/auth/sessions/123
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Sesión cerrada exitosamente
 * @returns {Object} 404 - Sesión no encontrada
 * @returns {Object} 401 - Token inválido o expirado
 */
router.delete('/sessions/:sessionId',
  authenticateToken,
  logUserActivity,
  asyncHandler(async (req, res) => {
    const { UserSession } = require('../models');
    const sessionId = parseInt(req.params.sessionId);
    
    const session = await UserSession.findOne({
      where: {
        id: sessionId,
        user_id: req.user.id,
        is_active: true
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Sesión no encontrada'
      });
    }

    await session.invalidate();

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  })
);

// ======================
// RUTAS DE INFORMACIÓN
// ======================

/**
 * @route   GET /api/auth/info
 * @desc    Obtener información general de autenticación
 * @access  Público
 * @example
 * GET /api/auth/info
 * 
 * @returns {Object} 200 - Información del sistema de autenticación
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      system: 'ITR Dashboard Authentication',
      version: '1.0.0',
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        check: 'GET /api/auth/check',
        sessions: 'GET /api/auth/sessions'
      },
      requirements: {
        password: {
          min_length: 6,
          must_contain: ['lowercase', 'uppercase', 'number']
        },
        email: {
          format: 'valid_email_address',
          max_length: 255
        }
      },
      token: {
        type: 'JWT',
        default_expiration: '24h',
        header: 'Authorization: Bearer <token>'
      }
    }
  });
});

module.exports = router;
