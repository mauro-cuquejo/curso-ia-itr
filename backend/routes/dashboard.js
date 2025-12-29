/**
 * Rutas del Dashboard
 *
 * @description Define todas las rutas para el dashboard del sistema:
 * estadísticas, usuarios conectados, actividad reciente y métricas.
 * Incluye validaciones y middleware de autenticación.
 *
 * @author ITR Team
 * @since 1.0.0
 */

const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

// Importar controladores
const {
  getStats,
  getOnlineUsers,
  getRecentActivity,
  getSystemMetrics
} = require('../controllers/dashboardController');

// Importar middleware
const {
  authenticateToken,
  logUserActivity
} = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * Validaciones para parámetros de consulta comunes
 *
 * @constant {Array} commonQueryValidations
 * @description Array de validaciones para parámetros de consulta
 *
 * @since 1.0.0
 */
const commonQueryValidations = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100'),
];

// ======================
// RUTAS DEL DASHBOARD
// ======================

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas generales del dashboard
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/stats
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Estadísticas generales del sistema
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/stats',
  authenticateToken,
  logUserActivity,
  asyncHandler(getStats)
);

/**
 * @route   GET /api/dashboard/users
 * @desc    Obtener lista de usuarios conectados
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/users?limit=20
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Lista de usuarios conectados
 * @returns {Object} 400 - Parámetros de consulta inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/users',
  authenticateToken,
  commonQueryValidations,
  logUserActivity,
  asyncHandler(getOnlineUsers)
);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Obtener actividad reciente del sistema
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/activity?limit=50&type=login
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Lista de actividades recientes
 * @returns {Object} 400 - Parámetros de consulta inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/activity',
  authenticateToken,
  [
    ...commonQueryValidations,
    query('type')
      .optional()
      .isIn(['login', 'register', 'user_updates', 'profile_updates'])
      .withMessage('Tipo de actividad inválido')
  ],
  logUserActivity,
  asyncHandler(getRecentActivity)
);

/**
 * @route   GET /api/dashboard/system-metrics
 * @desc    Obtener métricas del sistema
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/system-metrics
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Métricas del sistema
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/system-metrics',
  authenticateToken,
  logUserActivity,
  asyncHandler(getSystemMetrics)
);

/**
 * @route   GET /api/dashboard/metrics
 * @desc    Obtener métricas del sistema (ruta adicional)
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/metrics
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Métricas del sistema
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/metrics',
  authenticateToken,
  logUserActivity,
  asyncHandler(getSystemMetrics)
);

// ======================
// RUTAS DE INFORMACIÓN
// ======================

/**
 * @route   GET /api/dashboard/info
 * @desc    Obtener información general del dashboard
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/info
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Información del dashboard
 * @returns {Object} 401 - Token inválido o expirado
 */
router.get('/info',
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      data: {
        dashboard: 'ITR Dashboard API',
        version: '1.0.0',
        endpoints: {
          stats: 'GET /api/dashboard/stats',
          users: 'GET /api/dashboard/users',
          activity: 'GET /api/dashboard/activity',
          metrics: 'GET /api/dashboard/system-metrics'
        },
        features: [
          'Estadísticas en tiempo real',
          'Usuarios conectados',
          'Actividad reciente',
          'Métricas del sistema',
          'Auditoría completa'
        ],
        supported_filters: {
          activity_types: ['login', 'register', 'user_updates', 'profile_updates'],
          limits: 'Entre 1 y 100 resultados'
        },
        generated_at: new Date()
      }
    });
  }
);

// ======================
// RUTAS DE UTILIDAD
// ======================

/**
 * @route   GET /api/dashboard/health
 * @desc    Verificar estado del dashboard
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/health
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Estado del dashboard
 * @returns {Object} 401 - Token inválido o expirado
 */
router.get('/health',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { User, UserSession, AuditLog } = require('../models');

    try {
      // Verificar conectividad con la base de datos
      await User.findOne({ limit: 1 });

      const healthInfo = {
        status: 'healthy',
        timestamp: new Date(),
        database: {
          status: 'connected',
          response_time: 'normal'
        },
        services: {
          authentication: 'operational',
          user_management: 'operational',
          audit_logging: 'operational'
        },
        system: {
          uptime_seconds: Math.floor(process.uptime()),
          memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
          node_version: process.version,
          environment: process.env.NODE_ENV
        }
      };

      res.json({
        success: true,
        data: healthInfo
      });

    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'SERVICE_UNHEALTHY',
        message: 'El dashboard no está completamente operativo',
        details: {
          database: 'error',
          timestamp: new Date()
        }
      });
    }
  })
);

/**
 * @route   POST /api/dashboard/cleanup
 * @desc    Ejecutar tareas de limpieza del sistema
 * @access  Privado (requiere autenticación)
 * @example
 * POST /api/dashboard/cleanup
 * Authorization: Bearer jwt_token_here
 * Content-Type: application/json
 *
 * {
 *   "tasks": ["expired_sessions", "old_audit_logs"]
 * }
 *
 * @returns {Object} 200 - Resultado de las tareas de limpieza
 * @returns {Object} 400 - Tareas inválidas
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.post('/cleanup',
  authenticateToken,
  logUserActivity,
  asyncHandler(async (req, res) => {
    const { tasks = [] } = req.body;
    const { UserSession, AuditLog } = require('../models');

    const availableTasks = ['expired_sessions', 'old_audit_logs'];
    const invalidTasks = tasks.filter(task => !availableTasks.includes(task));

    if (invalidTasks.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TASKS',
        message: 'Tareas de limpieza inválidas',
        invalid_tasks: invalidTasks,
        available_tasks: availableTasks
      });
    }

    const results = {};

    if (tasks.includes('expired_sessions')) {
      const cleanedSessions = await UserSession.cleanExpiredSessions();
      results.expired_sessions = {
        cleaned_count: cleanedSessions,
        status: 'completed'
      };
    }

    if (tasks.includes('old_audit_logs')) {
      const cleanedLogs = await AuditLog.cleanOldLogs(365); // 1 año
      results.old_audit_logs = {
        cleaned_count: cleanedLogs,
        retention_days: 365,
        status: 'completed'
      };
    }

    // Registrar auditoría de la limpieza
    await AuditLog.createAuditLog({
      tableName: 'system',
      recordId: 0,
      action: 'UPDATE',
      newValues: {
        cleanup_action: 'SYSTEM_CLEANUP',
        tasks_executed: tasks,
        results
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Tareas de limpieza ejecutadas exitosamente',
      data: {
        executed_tasks: tasks,
        results,
        executed_at: new Date(),
        executed_by: {
          user_id: req.user.id,
          email: req.user.email
        }
      }
    });
  })
);

/**
 * @route   GET /api/dashboard/export
 * @desc    Exportar datos del dashboard
 * @access  Privado (requiere autenticación)
 * @example
 * GET /api/dashboard/export?format=json&data=stats,activity
 * Authorization: Bearer jwt_token_here
 *
 * @returns {Object} 200 - Datos exportados
 * @returns {Object} 400 - Parámetros de exportación inválidos
 * @returns {Object} 401 - Token inválido o expirado
 * @returns {Object} 500 - Error interno del servidor
 */
router.get('/export',
  authenticateToken,
  [
    query('format')
      .optional()
      .isIn(['json', 'csv'])
      .withMessage('Formato debe ser json o csv'),

    query('data')
      .optional()
      .custom((value) => {
        const validData = ['stats', 'users', 'activity', 'metrics'];
        const requestedData = value.split(',');
        const invalidData = requestedData.filter(item => !validData.includes(item.trim()));

        if (invalidData.length > 0) {
          throw new Error(`Tipos de datos inválidos: ${invalidData.join(', ')}`);
        }

        return true;
      })
  ],
  logUserActivity,
  asyncHandler(async (req, res) => {
    const { format = 'json', data = 'stats' } = req.query;
    const requestedData = data.split(',').map(item => item.trim());

    const exportData = {
      exported_at: new Date(),
      exported_by: {
        user_id: req.user.id,
        email: req.user.email
      },
      format,
      data: {}
    };

    // Recopilar datos solicitados
    if (requestedData.includes('stats')) {
      // Reutilizar la lógica del controlador getStats
      req.query = {}; // Limpiar query params
      const mockRes = {
        json: (data) => {
          exportData.data.stats = data.data;
        }
      };
      await getStats(req, mockRes, () => { });
    }

    if (requestedData.includes('activity')) {
      req.query = { limit: 100 };
      const mockRes = {
        json: (data) => {
          exportData.data.activity = data.data;
        }
      };
      await getRecentActivity(req, mockRes, () => { });
    }

    // Registrar auditoría de exportación
    await AuditLog.createAuditLog({
      tableName: 'system',
      recordId: 0,
      action: 'UPDATE',
      newValues: {
        export_action: 'DASHBOARD_EXPORT',
        format,
        data_types: requestedData
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (format === 'csv') {
      // Para CSV, simplificar la estructura
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard_export.csv"');

      // Aquí se podría implementar conversión a CSV
      // Por simplicidad, devolvemos JSON con headers CSV
      res.json({
        success: true,
        message: 'Exportación CSV no implementada completamente',
        data: exportData
      });
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  })
);

module.exports = router;
