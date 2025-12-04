/**
 * Middleware de Autenticación
 * 
 * @description Middleware para verificar tokens JWT, validar sesiones activas
 * y proteger rutas que requieren autenticación. Incluye funcionalidades
 * para verificar roles y permisos específicos.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');
const serverConfig = require('../config/server');

/**
 * Middleware para verificar token JWT y autenticación
 * 
 * @async
 * @function authenticateToken
 * @description Verifica que el token JWT sea válido, que el usuario exista
 * y que la sesión esté activa. Añade la información del usuario al objeto req.
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.headers - Headers de la petición
 * @param {string} req.headers.authorization - Header de autorización con Bearer token
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {Promise<void>} Continúa al siguiente middleware o retorna error
 * 
 * @throws {401} TOKEN_MISSING - No se proporcionó token
 * @throws {401} TOKEN_INVALID - Token malformado o inválido
 * @throws {401} TOKEN_EXPIRED - Token expirado
 * @throws {401} SESSION_INVALID - Sesión inválida o inactiva
 * @throws {401} USER_NOT_FOUND - Usuario no encontrado
 * @throws {401} USER_INACTIVE - Usuario inactivo
 * 
 * @example
 * // Proteger una ruta
 * router.get('/protected', authenticateToken, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // Verificar que el token esté presente
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_MISSING',
        message: 'Token de acceso requerido'
      });
    }

    // Verificar y decodificar el token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, serverConfig.JWT.SECRET);
    } catch (jwtError) {
      let errorCode = 'TOKEN_INVALID';
      let message = 'Token inválido';
      
      if (jwtError.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
        message = 'Token expirado';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorCode = 'TOKEN_INVALID';
        message = 'Token malformado';
      }
      
      return res.status(401).json({
        success: false,
        error: errorCode,
        message
      });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
      include: [{
        association: 'profile',
        required: false
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      return res.status(401).json({
        success: false,
        error: 'USER_INACTIVE',
        message: 'Usuario inactivo'
      });
    }

    // Verificar la sesión activa (si sessionId está en el token)
    if (decoded.sessionId) {
      const session = await UserSession.findOne({
        where: {
          id: decoded.sessionId,
          user_id: user.id,
          is_active: true
        }
      });

      if (!session || !session.isValid()) {
        return res.status(401).json({
          success: false,
          error: 'SESSION_INVALID',
          message: 'Sesión inválida o expirada'
        });
      }

      // Actualizar última actividad de la sesión
      await session.update({ last_activity: new Date() });
      
      // Añadir información de sesión al request
      req.session = session;
    }

    // Añadir información del usuario al request
    req.user = user;
    req.userId = user.id;
    req.tokenData = decoded;

    // Actualizar último login si ha pasado más de 1 hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!user.last_login || user.last_login < oneHourAgo) {
      await user.updateLastLogin();
    }

    next();

  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Error interno de autenticación'
    });
  }
}

/**
 * Middleware opcional de autenticación
 * 
 * @async
 * @function optionalAuth
 * @description Middleware que verifica autenticación si hay token presente,
 * pero permite continuar sin autenticación si no hay token
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {Promise<void>} Continúa al siguiente middleware
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // No hay token, continuar sin autenticación
    return next();
  }
  
  // Si hay token, aplicar autenticación normal
  // pero no enviar error si falla, solo log
  try {
    await authenticateToken(req, res, next);
  } catch (error) {
    console.log('ℹ️ Token opcional inválido, continuando sin autenticación');
    next();
  }
}

/**
 * Middleware para verificar roles específicos
 * 
 * @function requireRole
 * @description Factory function que crea middleware para verificar roles específicos
 * 
 * @param {...string} roles - Roles permitidos
 * 
 * @returns {Function} Middleware que verifica roles
 * 
 * @example
 * router.get('/admin', authenticateToken, requireRole('admin'), handler);
 * router.post('/moderate', authenticateToken, requireRole('admin', 'moderator'), handler);
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Autenticación requerida'
      });
    }

    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Permisos insuficientes para esta acción',
        required_roles: roles,
        user_role: userRole
      });
    }

    next();
  };
}

/**
 * Middleware para verificar que el usuario esté verificado
 * 
 * @function requireVerifiedEmail
 * @description Verifica que el usuario tenga su email verificado
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {void} Continúa al siguiente middleware o retorna error
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Autenticación requerida'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Email no verificado. Verifica tu email para continuar.'
    });
  }

  next();
}

/**
 * Middleware para verificar propiedad de recurso
 * 
 * @function requireOwnership
 * @description Verifica que el usuario autenticado sea el propietario del recurso
 * o tenga permisos de administrador
 * 
 * @param {string} paramName - Nombre del parámetro que contiene el user_id
 * 
 * @returns {Function} Middleware que verifica propiedad
 * 
 * @example
 * // Para ruta /users/:userId/profile
 * router.get('/users/:userId/profile', authenticateToken, requireOwnership('userId'), handler);
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function requireOwnership(paramName = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Autenticación requerida'
      });
    }

    const resourceUserId = parseInt(req.params[paramName]);
    const currentUserId = req.user.id;
    const userRole = req.user.role || 'user';

    // Permitir si es el propietario o es admin
    if (resourceUserId === currentUserId || userRole === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: 'No tienes permisos para acceder a este recurso'
    });
  };
}

/**
 * Middleware para rate limiting por usuario
 * 
 * @function userRateLimit
 * @description Aplica rate limiting específico por usuario autenticado
 * 
 * @param {Object} options - Opciones de rate limiting
 * @param {number} options.maxRequests - Máximo número de requests
 * @param {number} options.windowMs - Ventana de tiempo en milisegundos
 * 
 * @returns {Function} Middleware de rate limiting
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function userRateLimit(options = {}) {
  const { maxRequests = 100, windowMs = 15 * 60 * 1000 } = options;
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next(); // No rate limit para usuarios no autenticados
    }

    const userId = req.user.id;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }
    
    const requests = userRequests.get(userId);
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas peticiones, intenta más tarde',
        retry_after: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    userRequests.set(userId, validRequests);
    
    next();
  };
}

/**
 * Middleware para logging de actividad de usuario
 * 
 * @function logUserActivity
 * @description Registra la actividad del usuario para auditoría
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {void} Continúa al siguiente middleware
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function logUserActivity(req, res, next) {
  if (req.user) {
    const activity = {
      userId: req.user.id,
      action: `${req.method} ${req.path}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    // Log asíncrono para no bloquear la respuesta
    setImmediate(() => {
      console.log(`👤 Actividad usuario ${activity.userId}: ${activity.action} desde ${activity.ip}`);
    });
  }
  
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireVerifiedEmail,
  requireOwnership,
  userRateLimit,
  logUserActivity
};
