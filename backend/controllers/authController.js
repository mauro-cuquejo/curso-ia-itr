/**
 * Controlador de Autenticación
 * 
 * @description Maneja todas las operaciones relacionadas con autenticación:
 * registro, login, logout, refresh de tokens y verificación de usuarios.
 * Incluye validación de datos, gestión de sesiones y auditoría de accesos.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User, UserSession, UserProfile, AuditLog } = require('../models');
const serverConfig = require('../config/server');
const { createError } = require('../middleware/errorMiddleware');

/**
 * Registra un nuevo usuario en el sistema
 * 
 * @async
 * @function register
 * @description Crea un nuevo usuario con validación de datos, verificación
 * de email único y creación automática de perfil básico
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.body - Datos del nuevo usuario
 * @param {string} req.body.email - Email único del usuario
 * @param {string} req.body.password - Contraseña (mínimo 6 caracteres)
 * @param {string} req.body.first_name - Nombre del usuario
 * @param {string} req.body.last_name - Apellido del usuario
 * @param {string} [req.body.phone] - Teléfono opcional
 * @param {string} req.ip - Dirección IP del cliente
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con usuario creado y token
 * 
 * @example
 * // POST /api/auth/register
 * // Body: {
 * //   "email": "usuario@example.com",
 * //   "password": "password123",
 * //   "first_name": "Juan",
 * //   "last_name": "Pérez"
 * // }
 * // Response: {
 * //   "success": true,
 * //   "message": "Usuario registrado exitosamente",
 * //   "data": { "user": {...}, "token": "...", "expires_at": "..." }
 * // }
 * 
 * @throws {400} VALIDATION_ERROR - Datos de entrada inválidos
 * @throws {409} EMAIL_EXISTS - Email ya registrado
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function register(req, res, next) {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { email, password, first_name, last_name, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'Este email ya está registrado'
      });
    }

    // Crear el usuario
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      first_name,
      last_name,
      phone,
      status: 'active'
    });

    // Crear perfil básico
    await UserProfile.create({
      user_id: user.id,
      bio: `Perfil de ${user.first_name} ${user.last_name}`,
      language: 'es',
      timezone: 'Europe/Madrid',
      created_by: user.id
    });

    // Generar token JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      type: 'access'
    };

    const token = jwt.sign(tokenPayload, serverConfig.JWT.SECRET, {
      expiresIn: serverConfig.JWT.EXPIRES_IN
    });

    // Crear sesión
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await UserSession.create({
      user_id: user.id,
      token_hash: tokenHash,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      expires_at: expiresAt
    });

    // Registrar auditoría
    await AuditLog.createAuditLog({
      tableName: 'users',
      recordId: user.id,
      action: 'CREATE',
      newValues: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status
      },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Respuesta exitosa (sin password)
    const userResponse = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userResponse,
        token,
        expires_at: expiresAt,
        session_id: session.id
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Autentica un usuario y genera token de acceso
 * 
 * @async
 * @function login
 * @description Valida credenciales, actualiza último login,
 * crea sesión activa y genera token JWT
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.body - Credenciales de login
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {boolean} [req.body.remember_me] - Mantener sesión activa más tiempo
 * @param {string} req.ip - Dirección IP del cliente
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con token y datos del usuario
 * 
 * @example
 * // POST /api/auth/login
 * // Body: { "email": "usuario@example.com", "password": "password123" }
 * // Response: {
 * //   "success": true,
 * //   "message": "Login exitoso",
 * //   "data": { "user": {...}, "token": "...", "expires_at": "..." }
 * // }
 * 
 * @throws {400} VALIDATION_ERROR - Datos de entrada inválidos
 * @throws {401} INVALID_CREDENTIALS - Credenciales incorrectas
 * @throws {401} USER_INACTIVE - Usuario inactivo
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function login(req, res, next) {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { email, password, remember_me = false } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [{
        association: 'profile',
        required: false
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      return res.status(401).json({
        success: false,
        error: 'USER_INACTIVE',
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Actualizar último login
    await user.updateLastLogin();

    // Calcular expiración del token
    const expirationTime = remember_me ? '7d' : serverConfig.JWT.EXPIRES_IN;
    const expiresAt = new Date();
    if (remember_me) {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 24);
    }

    // Generar token JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      type: 'access'
    };

    const token = jwt.sign(tokenPayload, serverConfig.JWT.SECRET, {
      expiresIn: expirationTime
    });

    // Crear nueva sesión
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await UserSession.create({
      user_id: user.id,
      token_hash: tokenHash,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      expires_at: expiresAt,
      device_info: {
        remember_me,
        login_time: new Date()
      }
    });

    // Invalidar sesiones antiguas si hay demasiadas (máximo 5 activas)
    const activeSessions = await UserSession.getActiveSessions(user.id);
    if (activeSessions.length > 5) {
      const oldestSessions = activeSessions
        .sort((a, b) => a.last_activity - b.last_activity)
        .slice(0, activeSessions.length - 5);
      
      for (const oldSession of oldestSessions) {
        await oldSession.invalidate();
      }
    }

    // Registrar auditoría de login
    await AuditLog.createAuditLog({
      tableName: 'users',
      recordId: user.id,
      action: 'UPDATE',
      oldValues: { last_login: user.last_login },
      newValues: { last_login: new Date(), login_action: 'LOGIN' },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      additionalInfo: {
        session_id: session.id,
        remember_me
      }
    });

    // Respuesta exitosa
    const userResponse = user.toJSON();
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        token,
        expires_at: expiresAt,
        session_id: session.id
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Cierra la sesión del usuario actual
 * 
 * @async
 * @function logout
 * @description Invalida la sesión actual y registra el logout
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.user - Usuario autenticado
 * @param {Object} req.session - Sesión actual
 * @param {string} req.ip - Dirección IP del cliente
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON confirmando logout
 * 
 * @example
 * // POST /api/auth/logout
 * // Headers: { "Authorization": "Bearer token" }
 * // Response: { "success": true, "message": "Logout exitoso" }
 * 
 * @throws {401} AUTHENTICATION_REQUIRED - Token requerido
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function logout(req, res, next) {
  try {
    const user = req.user;
    const session = req.session;

    if (session) {
      // Invalidar sesión actual
      await session.invalidate();
    }

    // Registrar auditoría de logout
    await AuditLog.createAuditLog({
      tableName: 'users',
      recordId: user.id,
      action: 'UPDATE',
      newValues: { logout_action: 'LOGOUT' },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      additionalInfo: {
        session_id: session?.id
      }
    });

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene información del usuario autenticado
 * 
 * @async
 * @function me
 * @description Retorna información completa del usuario actual
 * incluyendo su perfil y estadísticas de sesiones
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.user - Usuario autenticado
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con información del usuario
 * 
 * @example
 * // GET /api/auth/me
 * // Headers: { "Authorization": "Bearer token" }
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "user": {...},
 * //     "profile": {...},
 * //     "session_info": {...}
 * //   }
 * // }
 * 
 * @throws {401} AUTHENTICATION_REQUIRED - Token requerido
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function me(req, res, next) {
  try {
    const user = req.user;

    // Obtener información adicional del usuario
    const userWithDetails = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          association: 'profile',
          required: false
        }
      ]
    });

    // Obtener estadísticas de sesiones
    const activeSessions = await UserSession.getActiveSessions(user.id);
    const sessionInfo = {
      active_sessions_count: activeSessions.length,
      current_session: req.session ? {
        id: req.session.id,
        created_at: req.session.created_at,
        last_activity: req.session.last_activity,
        ip_address: req.session.ip_address
      } : null
    };

    res.json({
      success: true,
      data: {
        user: userWithDetails,
        session_info: sessionInfo
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Refresca el token de acceso
 * 
 * @async
 * @function refreshToken
 * @description Genera un nuevo token de acceso si el actual está próximo a expirar
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.user - Usuario autenticado
 * @param {Object} req.session - Sesión actual
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con nuevo token
 * 
 * @example
 * // POST /api/auth/refresh
 * // Headers: { "Authorization": "Bearer token" }
 * // Response: {
 * //   "success": true,
 * //   "data": { "token": "...", "expires_at": "..." }
 * // }
 * 
 * @throws {401} AUTHENTICATION_REQUIRED - Token requerido
 * @throws {400} TOKEN_NOT_REFRESHABLE - Token no necesita renovación
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function refreshToken(req, res, next) {
  try {
    const user = req.user;
    const session = req.session;

    if (!session) {
      return res.status(400).json({
        success: false,
        error: 'SESSION_REQUIRED',
        message: 'Sesión requerida para refrescar token'
      });
    }

    // Verificar si el token necesita renovación (menos de 2 horas restantes)
    const timeRemaining = session.getTimeRemaining();
    if (timeRemaining > 120) { // 2 horas en minutos
      return res.status(400).json({
        success: false,
        error: 'TOKEN_NOT_REFRESHABLE',
        message: 'El token aún es válido por más de 2 horas'
      });
    }

    // Generar nuevo token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      type: 'access'
    };

    const newToken = jwt.sign(tokenPayload, serverConfig.JWT.SECRET, {
      expiresIn: serverConfig.JWT.EXPIRES_IN
    });

    // Actualizar sesión con nuevo token y expiración
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newTokenHash = crypto.createHash('sha256').update(newToken).digest('hex');
    await session.update({
      token_hash: newTokenHash,
      expires_at: newExpiresAt,
      last_activity: new Date()
    });

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken,
        expires_at: newExpiresAt
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Cierra todas las sesiones del usuario
 * 
 * @async
 * @function logoutAll
 * @description Invalida todas las sesiones activas del usuario
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.user - Usuario autenticado
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON confirmando logout de todas las sesiones
 * 
 * @example
 * // POST /api/auth/logout-all
 * // Headers: { "Authorization": "Bearer token" }
 * // Response: {
 * //   "success": true,
 * //   "message": "Todas las sesiones cerradas",
 * //   "sessions_closed": 3
 * // }
 * 
 * @throws {401} AUTHENTICATION_REQUIRED - Token requerido
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function logoutAll(req, res, next) {
  try {
    const user = req.user;

    // Invalidar todas las sesiones del usuario
    const closedSessions = await UserSession.invalidateUserSessions(user.id);

    // Registrar auditoría
    await AuditLog.createAuditLog({
      tableName: 'users',
      recordId: user.id,
      action: 'UPDATE',
      newValues: { logout_all_action: 'LOGOUT_ALL_SESSIONS' },
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      additionalInfo: {
        sessions_closed: closedSessions
      }
    });

    res.json({
      success: true,
      message: 'Todas las sesiones cerradas exitosamente',
      sessions_closed: closedSessions
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  refreshToken,
  logoutAll
};
