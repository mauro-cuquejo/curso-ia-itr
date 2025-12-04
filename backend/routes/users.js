/**
 * Rutas de Usuarios
 * 
 * @description Define todas las rutas para la gestión de usuarios:
 * CRUD completo, búsqueda, filtros y operaciones administrativas.
 * Incluye validaciones de entrada y middleware de autorización.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

// Importar controladores
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
} = require('../controllers/userController');

// Importar middleware
const { 
  authenticateToken, 
  requireRole,
  requireOwnership,
  logUserActivity 
} = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * Validaciones para creación de usuario
 * 
 * @constant {Array} createUserValidations
 * @description Array de validaciones para crear usuarios
 * 
 * @since 1.0.0
 */
const createUserValidations = [
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

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Estado inválido')
];

/**
 * Validaciones para actualización de usuario
 * 
 * @constant {Array} updateUserValidations
 * @description Array de validaciones para actualizar usuarios
 * 
 * @since 1.0.0
 */
const updateUserValidations = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ min: 5, max: 255 })
    .withMessage('El email debe tener entre 5 y 255 caracteres'),
  
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El apellido debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('phone')
    .optional()
    .isMobilePhone(['es-ES'])
    .withMessage('Debe ser un número de teléfono válido'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Estado inválido')
];

/**
 * Validaciones para parámetros de consulta
 * 
 * @constant {Array} queryValidations
 * @description Array de validaciones para parámetros de consulta
 * 
 * @since 1.0.0
 */
const queryValidations = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Estado inválido'),
  
  query('sort')
    .optional()
    .isIn(['created_at', 'updated_at', 'first_name', 'last_name', 'email', 'last_login'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Orden debe ser ASC o DESC')
];

// ======================
// RUTAS PÚBLICAS CON AUTENTICACIÓN
// ======================

/**
 * @route   GET /api/users
 * @desc    Obtener lista paginada de usuarios
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/users?page=1&limit=10&search=juan&status=active&sort=created_at&order=DESC
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Lista paginada de usuarios
 * @returns {Object} 400 - Parámetros de consulta inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/',
  authenticateToken,
  queryValidations,
  logUserActivity,
  asyncHandler(getUsers)
);

/**
 * @route   GET /api/users/search
 * @desc    Búsqueda avanzada de usuarios
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/users/search?q=juan&status=active&country=España&online=true
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Resultados de búsqueda
 * @returns {Object} 400 - Parámetros de búsqueda inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/search',
  authenticateToken,
  [
    query('q')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Término de búsqueda debe tener entre 2 y 100 caracteres'),
    query('online')
      .optional()
      .isBoolean()
      .withMessage('El parámetro online debe ser booleano'),
    ...queryValidations
  ],
  logUserActivity,
  asyncHandler(searchUsers)
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario específico por ID
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/users/123
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Información detallada del usuario
 * @returns {Object} 400 - ID de usuario inválido
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 404 - Usuario no encontrado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/:id',
  authenticateToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo')
  ],
  logUserActivity,
  asyncHandler(getUserById)
);

// ======================
// RUTAS ADMINISTRATIVAS
// ======================

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario (solo administradores)
 * @access  Privado (requiere rol admin)
 * @example
 * POST /api/users
 * Authorization: Bearer jwt_token_here
 * Content-Type: application/json
 * 
 * {
 *   "email": "nuevo@example.com",
 *   "password": "Password123",
 *   "first_name": "Ana",
 *   "last_name": "García",
 *   "phone": "+34600000000",
 *   "status": "active"
 * }
 * 
 * @returns {Object} 201 - Usuario creado exitosamente
 * @returns {Object} 400 - Datos de entrada inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 403 - Permisos insuficientes
 * @returns {Object} 409 - Email ya existe
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/',
  authenticateToken,
  requireRole('admin'),
  createUserValidations,
  logUserActivity,
  asyncHandler(createUser)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario existente
 * @access  Privado (requiere ser propietario o admin)
 * @example
 * PUT /api/users/123
 * Authorization: Bearer jwt_token_here
 * Content-Type: application/json
 * 
 * {
 *   "first_name": "Juan Carlos",
 *   "phone": "+34600000001",
 *   "status": "inactive"
 * }
 * 
 * @returns {Object} 200 - Usuario actualizado exitosamente
 * @returns {Object} 400 - Datos de entrada inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 403 - Permisos insuficientes
 * @returns {Object} 404 - Usuario no encontrado
 * @returns {Object} 409 - Email ya existe
 * @returns {Object} 500 - Error interno del servidor
 */
router.put('/:id',
  authenticateToken,
  requireOwnership('id'),
  updateUserValidations,
  logUserActivity,
  asyncHandler(updateUser)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (soft delete, solo administradores)
 * @access  Privado (requiere rol admin)
 * @example
 * DELETE /api/users/123
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Usuario eliminado exitosamente
 * @returns {Object} 400 - ID de usuario inválido
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 403 - Permisos insuficientes o intento de auto-eliminación
 * @returns {Object} 404 - Usuario no encontrado
 * @returns {Object} 500 - Error interno del servidor
 */
router.delete('/:id',
  authenticateToken,
  requireRole('admin'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo')
  ],
  logUserActivity,
  asyncHandler(deleteUser)
);

// ======================
// RUTAS DE GESTIÓN DE PERFIL
// ======================

/**
 * @route   GET /api/users/:id/profile
 * @desc    Obtener perfil de usuario
 * @access  Privado (requiere ser propietario o admin)
 * @example
 * GET /api/users/123/profile
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Perfil del usuario
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 403 - Permisos insuficientes
 * @returns {Object} 404 - Usuario o perfil no encontrado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/:id/profile',
  authenticateToken,
  requireOwnership('id'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo')
  ],
  asyncHandler(async (req, res) => {
    const { UserProfile } = require('../models');
    const userId = parseInt(req.params.id);

    const profile = await UserProfile.findOne({
      where: { user_id: userId },
      include: [{
        association: 'user',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'Perfil no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        profile: profile.toJSON(),
        completion_percentage: profile.getCompletionPercentage(),
        is_complete: profile.isComplete()
      }
    });
  })
);

/**
 * @route   PUT /api/users/:id/profile
 * @desc    Actualizar perfil de usuario
 * @access  Privado (requiere ser propietario o admin)
 * @example
 * PUT /api/users/123/profile
 * Authorization: Bearer jwt_token_here
 * Content-Type: application/json
 * 
 * {
 *   "bio": "Nueva biografía",
 *   "country": "España",
 *   "city": "Madrid",
 *   "language": "es"
 * }
 * 
 * @returns {Object} 200 - Perfil actualizado exitosamente
 * @returns {Object} 400 - Datos de entrada inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 403 - Permisos insuficientes
 * @returns {Object} 404 - Perfil no encontrado
 * @returns {Object} 500 - Error interno del servidor
 */
router.put('/:id/profile',
  authenticateToken,
  requireOwnership('id'),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de usuario debe ser un número entero positivo'),
    
    body('bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La biografía no puede exceder 1000 caracteres'),
    
    body('birth_date')
      .optional()
      .isISO8601()
      .withMessage('Fecha de nacimiento debe ser una fecha válida'),
    
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other'])
      .withMessage('Género inválido'),
    
    body('country')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('País debe tener entre 2 y 100 caracteres'),
    
    body('city')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Ciudad debe tener entre 2 y 100 caracteres'),
    
    body('language')
      .optional()
      .isIn(['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'])
      .withMessage('Idioma no soportado')
  ],
  logUserActivity,
  asyncHandler(async (req, res) => {
    const { UserProfile, AuditLog } = require('../models');
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    const profile = await UserProfile.findOne({
      where: { user_id: userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'Perfil no encontrado'
      });
    }

    const oldValues = profile.toJSON();

    // Campos permitidos para actualización
    const allowedFields = ['bio', 'birth_date', 'gender', 'country', 'city', 'timezone', 'language'];
    const fieldsToUpdate = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    fieldsToUpdate.updated_by = req.user.id;

    await profile.update(fieldsToUpdate);

    // Registrar auditoría
    await AuditLog.createAuditLog({
      tableName: 'user_profiles',
      recordId: profile.id,
      action: 'UPDATE',
      oldValues,
      newValues: profile.toJSON(),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        profile: profile.toJSON(),
        completion_percentage: profile.getCompletionPercentage()
      }
    });
  })
);

// ======================
// RUTAS DE ESTADÍSTICAS
// ======================

/**
 * @route   GET /api/users/stats/summary
 * @desc    Obtener estadísticas generales de usuarios
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/users/stats/summary
 * Authorization: Bearer jwt_token_here
 * 
 * @returns {Object} 200 - Estadísticas de usuarios
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/stats/summary',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { User, UserSession, UserProfile } = require('../models');
    const { Op } = require('sequelize');

    const [
      totalUsers,
      activeUsers,
      onlineUsers,
      newUsersThisMonth,
      profileStats
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: 'active' } }),
      UserSession.count({
        where: {
          is_active: true,
          expires_at: { [Op.gt]: new Date() }
        },
        distinct: 'user_id'
      }),
      User.count({
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      UserProfile.getDemographicStats()
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total_users: totalUsers,
          active_users: activeUsers,
          online_users: onlineUsers,
          new_users_this_month: newUsersThisMonth,
          inactive_users: totalUsers - activeUsers
        },
        demographics: profileStats,
        generated_at: new Date()
      }
    });
  })
);

module.exports = router;
