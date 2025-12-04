/**
 * Controlador de Usuarios
 * 
 * @description Maneja todas las operaciones CRUD relacionadas con usuarios:
 * listado, creación, actualización, eliminación y búsqueda. Incluye
 * paginación, filtros, validación de datos y auditoría completa.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, UserProfile, UserSession, AuditLog } = require('../models');
const { createError } = require('../middleware/errorMiddleware');
const serverConfig = require('../config/server');

/**
 * Obtiene lista paginada de usuarios
 * 
 * @async
 * @function getUsers
 * @description Retorna lista paginada de usuarios con filtros opcionales,
 * búsqueda por texto y ordenamiento. Incluye información de perfil y sesiones.
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {number} [req.query.page=1] - Número de página
 * @param {number} [req.query.limit=10] - Elementos por página
 * @param {string} [req.query.search] - Término de búsqueda
 * @param {string} [req.query.status] - Filtro por estado
 * @param {string} [req.query.sort=created_at] - Campo de ordenamiento
 * @param {string} [req.query.order=DESC] - Dirección de ordenamiento
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con lista paginada de usuarios
 * 
 * @example
 * // GET /api/users?page=1&limit=10&search=juan&status=active
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "users": [...],
 * //     "pagination": {...}
 * //   }
 * // }
 * 
 * @throws {400} VALIDATION_ERROR - Parámetros de consulta inválidos
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function getUsers(req, res, next) {
  try {
    // Parámetros de paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      serverConfig.PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit) || serverConfig.PAGINATION.DEFAULT_LIMIT)
    );
    const offset = (page - 1) * limit;

    // Parámetros de búsqueda y filtros
    const { search, status, sort = 'created_at', order = 'DESC' } = req.query;

    // Construir condiciones WHERE
    const whereConditions = {};

    // Filtro por estado
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      whereConditions.status = status;
    }

    // Búsqueda por texto en nombre, apellido o email
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereConditions[Op.or] = [
        { first_name: { [Op.iLike]: searchTerm } },
        { last_name: { [Op.iLike]: searchTerm } },
        { email: { [Op.iLike]: searchTerm } }
      ];
    }

    // Validar campo de ordenamiento
    const allowedSortFields = ['created_at', 'updated_at', 'first_name', 'last_name', 'email', 'last_login'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    // Consulta principal con conteo
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      include: [
        {
          association: 'profile',
          required: false,
          attributes: ['bio', 'country', 'city', 'language']
        }
      ],
      order: [[sortField, sortOrder]],
      limit,
      offset,
      distinct: true
    });

    // Obtener información de sesiones activas para cada usuario
    const usersWithSessions = await Promise.all(
      users.map(async (user) => {
        const activeSessions = await UserSession.count({
          where: {
            user_id: user.id,
            is_active: true,
            expires_at: { [Op.gt]: new Date() }
          }
        });

        return {
          ...user.toJSON(),
          active_sessions: activeSessions,
          is_online: activeSessions > 0
        };
      })
    );

    // Información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      current_page: page,
      total_pages: totalPages,
      total_items: count,
      items_per_page: limit,
      has_next_page: hasNextPage,
      has_prev_page: hasPrevPage,
      next_page: hasNextPage ? page + 1 : null,
      prev_page: hasPrevPage ? page - 1 : null
    };

    res.json({
      success: true,
      data: {
        users: usersWithSessions,
        pagination,
        filters_applied: {
          search: search || null,
          status: status || null,
          sort: sortField,
          order: sortOrder
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene un usuario específico por ID
 * 
 * @async
 * @function getUserById
 * @description Retorna información detallada de un usuario específico
 * incluyendo perfil, sesiones activas y estadísticas
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con información del usuario
 * 
 * @example
 * // GET /api/users/123
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "user": {...},
 * //     "sessions": [...],
 * //     "stats": {...}
 * //   }
 * // }
 * 
 * @throws {400} INVALID_USER_ID - ID de usuario inválido
 * @throws {404} USER_NOT_FOUND - Usuario no encontrado
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function getUserById(req, res, next) {
  try {
    const userId = parseInt(req.params.id);

    // Validar ID
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_USER_ID',
        message: 'ID de usuario inválido'
      });
    }

    // Buscar usuario con información relacionada
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          association: 'profile',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    // Obtener sesiones activas
    const activeSessions = await UserSession.findAll({
      where: {
        user_id: userId,
        is_active: true
      },
      attributes: ['id', 'ip_address', 'user_agent', 'created_at', 'last_activity', 'expires_at'],
      order: [['last_activity', 'DESC']]
    });

    // Estadísticas del usuario
    const stats = {
      total_sessions: await UserSession.count({
        where: { user_id: userId }
      }),
      active_sessions: activeSessions.length,
      days_since_registration: Math.floor(
        (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
      ),
      last_login_days_ago: user.last_login 
        ? Math.floor((new Date() - new Date(user.last_login)) / (1000 * 60 * 60 * 24))
        : null
    };

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        sessions: activeSessions.map(session => ({
          ...session.toJSON(),
          time_remaining_minutes: session.getTimeRemaining(),
          is_valid: session.isValid()
        })),
        stats
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Crea un nuevo usuario
 * 
 * @async
 * @function createUser
 * @description Crea un nuevo usuario con validación de datos y
 * creación automática de perfil básico
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.body - Datos del nuevo usuario
 * @param {string} req.body.email - Email único del usuario
 * @param {string} req.body.password - Contraseña
 * @param {string} req.body.first_name - Nombre
 * @param {string} req.body.last_name - Apellido
 * @param {string} [req.body.phone] - Teléfono opcional
 * @param {string} [req.body.status=active] - Estado del usuario
 * @param {Object} req.user - Usuario que realiza la acción (para auditoría)
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con usuario creado
 * 
 * @example
 * // POST /api/users
 * // Body: {
 * //   "email": "nuevo@example.com",
 * //   "password": "Password123",
 * //   "first_name": "Ana",
 * //   "last_name": "García"
 * // }
 * 
 * @throws {400} VALIDATION_ERROR - Datos de entrada inválidos
 * @throws {409} EMAIL_EXISTS - Email ya registrado
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function createUser(req, res, next) {
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

    const { email, password, first_name, last_name, phone, status = 'active' } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

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
      status,
      created_by: req.user.id
    });

    // Crear perfil básico
    await UserProfile.create({
      user_id: user.id,
      bio: `Perfil de ${user.first_name} ${user.last_name}`,
      language: 'es',
      timezone: 'Europe/Madrid',
      created_by: req.user.id
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
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Respuesta exitosa (sin password)
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza un usuario existente
 * 
 * @async
 * @function updateUser
 * @description Actualiza los datos de un usuario existente con validación
 * y registro de auditoría de cambios
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario a actualizar
 * @param {Object} req.body - Datos a actualizar
 * @param {Object} req.user - Usuario que realiza la acción
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con usuario actualizado
 * 
 * @example
 * // PUT /api/users/123
 * // Body: { "first_name": "Juan Carlos", "status": "inactive" }
 * 
 * @throws {400} VALIDATION_ERROR - Datos de entrada inválidos
 * @throws {404} USER_NOT_FOUND - Usuario no encontrado
 * @throws {409} EMAIL_EXISTS - Email ya registrado por otro usuario
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function updateUser(req, res, next) {
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

    const userId = parseInt(req.params.id);
    const updateData = req.body;

    // Validar ID
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_USER_ID',
        message: 'ID de usuario inválido'
      });
    }

    // Buscar usuario existente
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    // Guardar valores anteriores para auditoría
    const oldValues = user.toJSON();

    // Verificar email único si se está actualizando
    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        where: { 
          email: updateData.email.toLowerCase(),
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'EMAIL_EXISTS',
          message: 'Este email ya está registrado por otro usuario'
        });
      }
    }

    // Campos permitidos para actualización
    const allowedFields = ['email', 'first_name', 'last_name', 'phone', 'status'];
    const fieldsToUpdate = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fieldsToUpdate[field] = updateData[field];
      }
    });

    // Normalizar email si se proporciona
    if (fieldsToUpdate.email) {
      fieldsToUpdate.email = fieldsToUpdate.email.toLowerCase();
    }

    // Agregar información de auditoría
    fieldsToUpdate.updated_by = req.user.id;

    // Actualizar usuario
    await user.update(fieldsToUpdate);

    // Registrar auditoría
    await AuditLog.createAuditLog({
      tableName: 'users',
      recordId: user.id,
      action: 'UPDATE',
      oldValues,
      newValues: user.toJSON(),
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Elimina un usuario (soft delete)
 * 
 * @async
 * @function deleteUser
 * @description Realiza soft delete de un usuario, manteniendo
 * el registro para auditoría pero marcándolo como eliminado
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario a eliminar
 * @param {Object} req.user - Usuario que realiza la acción
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON confirmando eliminación
 * 
 * @example
 * // DELETE /api/users/123
 * // Response: { "success": true, "message": "Usuario eliminado exitosamente" }
 * 
 * @throws {400} INVALID_USER_ID - ID de usuario inválido
 * @throws {404} USER_NOT_FOUND - Usuario no encontrado
 * @throws {403} CANNOT_DELETE_SELF - No se puede eliminar a sí mismo
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function deleteUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id);

    // Validar ID
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_USER_ID',
        message: 'ID de usuario inválido'
      });
    }

    // Verificar que no se esté eliminando a sí mismo
    if (userId === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'CANNOT_DELETE_SELF',
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Buscar usuario
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    // Guardar valores para auditoría
    const userValues = user.toJSON();

    // Invalidar todas las sesiones del usuario
    await UserSession.invalidateUserSessions(userId);

    // Soft delete del usuario
    await user.destroy();

    // Registrar auditoría
    await AuditLog.createAuditLog({
      tableName: 'users',
      recordId: userId,
      action: 'DELETE',
      oldValues: userValues,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      additionalInfo: {
        deletion_type: 'soft_delete'
      }
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Busca usuarios con filtros avanzados
 * 
 * @async
 * @function searchUsers
 * @description Búsqueda avanzada de usuarios con múltiples filtros
 * y opciones de ordenamiento
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.query - Parámetros de búsqueda
 * @param {string} [req.query.q] - Término de búsqueda general
 * @param {string} [req.query.status] - Filtro por estado
 * @param {string} [req.query.country] - Filtro por país
 * @param {string} [req.query.city] - Filtro por ciudad
 * @param {string} [req.query.online] - Solo usuarios online
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con resultados de búsqueda
 * 
 * @example
 * // GET /api/users/search?q=juan&status=active&country=España
 * 
 * @throws {400} VALIDATION_ERROR - Parámetros de búsqueda inválidos
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function searchUsers(req, res, next) {
  try {
    const { 
      q, 
      status, 
      country, 
      city, 
      online,
      page = 1, 
      limit = 20 
    } = req.query;

    // Construir condiciones de búsqueda
    const whereConditions = {};
    const profileConditions = {};

    // Búsqueda general por texto
    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereConditions[Op.or] = [
        { first_name: { [Op.iLike]: searchTerm } },
        { last_name: { [Op.iLike]: searchTerm } },
        { email: { [Op.iLike]: searchTerm } }
      ];
    }

    // Filtros específicos
    if (status) whereConditions.status = status;
    if (country) profileConditions.country = { [Op.iLike]: `%${country}%` };
    if (city) profileConditions.city = { [Op.iLike]: `%${city}%` };

    // Paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Consulta principal
    let query = {
      where: whereConditions,
      attributes: { exclude: ['password'] },
      include: [
        {
          association: 'profile',
          required: Object.keys(profileConditions).length > 0,
          where: Object.keys(profileConditions).length > 0 ? profileConditions : undefined
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset
    };

    const { count, rows: users } = await User.findAndCountAll(query);

    // Filtrar usuarios online si se solicita
    let finalUsers = users;
    if (online === 'true') {
      const usersWithSessions = await Promise.all(
        users.map(async (user) => {
          const activeSessionCount = await UserSession.count({
            where: {
              user_id: user.id,
              is_active: true,
              expires_at: { [Op.gt]: new Date() }
            }
          });

          return activeSessionCount > 0 ? { ...user.toJSON(), is_online: true } : null;
        })
      );

      finalUsers = usersWithSessions.filter(user => user !== null);
    } else {
      finalUsers = users.map(user => ({ ...user.toJSON(), is_online: false }));
    }

    res.json({
      success: true,
      data: {
        users: finalUsers,
        total_found: online === 'true' ? finalUsers.length : count,
        search_criteria: {
          text_search: q || null,
          status,
          country,
          city,
          online_only: online === 'true'
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_pages: Math.ceil(count / limitNum)
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
};
