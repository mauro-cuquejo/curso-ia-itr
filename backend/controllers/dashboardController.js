/**
 * Controlador del Dashboard
 * 
 * @description Maneja todas las operaciones relacionadas con el dashboard:
 * estadísticas generales, actividad reciente, usuarios conectados y
 * métricas del sistema. Proporciona datos consolidados para la interfaz.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { Op, fn, col, literal } = require('sequelize');
const { User, UserSession, UserProfile, AuditLog } = require('../models');

/**
 * Obtiene estadísticas generales del dashboard
 * 
 * @async
 * @function getStats
 * @description Retorna estadísticas generales del sistema incluyendo
 * usuarios totales, activos, conectados y métricas de crecimiento
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con estadísticas del dashboard
 * 
 * @example
 * // GET /api/dashboard/stats
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "users": {...},
 * //     "activity": {...},
 * //     "growth": {...}
 * //   }
 * // }
 * 
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function getStats(req, res, next) {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Estadísticas de usuarios
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      newUsersLastMonth
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: 'active' } }),
      User.count({ where: { status: 'inactive' } }),
      User.count({ where: { status: 'suspended' } }),
      User.count({ where: { created_at: { [Op.gte]: last24Hours } } }),
      User.count({ where: { created_at: { [Op.gte]: last7Days } } }),
      User.count({ where: { created_at: { [Op.gte]: thisMonth } } }),
      User.count({ 
        where: { 
          created_at: { 
            [Op.between]: [lastMonth, thisMonth] 
          } 
        } 
      })
    ]);

    // Usuarios conectados (con sesiones activas)
    const onlineUsers = await UserSession.count({
      where: {
        is_active: true,
        expires_at: { [Op.gt]: now }
      },
      distinct: 'user_id'
    });

    // Sesiones activas
    const activeSessions = await UserSession.count({
      where: {
        is_active: true,
        expires_at: { [Op.gt]: now }
      }
    });

    // Actividad reciente (logins en las últimas 24 horas)
    const recentLogins = await AuditLog.count({
      where: {
        table_name: 'users',
        action: 'UPDATE',
        created_at: { [Op.gte]: last24Hours },
        new_values: {
          [Op.like]: '%login_action%'
        }
      }
    });

    // Cálculo de crecimiento mensual
    const monthlyGrowthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(2)
      : newUsersThisMonth > 0 ? 100 : 0;

    // Estadísticas por país (top 5)
    const usersByCountry = await UserProfile.findAll({
      attributes: [
        'country',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        country: { [Op.ne]: null }
      },
      group: ['country'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Actividad por días de la semana (últimos 7 días)
    const dailyActivity = await AuditLog.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'activity_count']
      ],
      where: {
        created_at: { [Op.gte]: last7Days }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          suspended: suspendedUsers,
          online: onlineUsers,
          new_today: newUsersToday,
          new_this_week: newUsersThisWeek,
          new_this_month: newUsersThisMonth,
          growth_rate: parseFloat(monthlyGrowthRate)
        },
        sessions: {
          active_sessions: activeSessions,
          online_users: onlineUsers,
          recent_logins_24h: recentLogins
        },
        activity: {
          daily_activity: dailyActivity,
          users_by_country: usersByCountry
        },
        generated_at: now,
        period: {
          last_24_hours: last24Hours,
          last_7_days: last7Days,
          last_30_days: last30Days,
          this_month: thisMonth
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene lista de usuarios conectados
 * 
 * @async
 * @function getOnlineUsers
 * @description Retorna lista de usuarios actualmente conectados
 * con información de sus sesiones activas
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {number} [req.query.limit=20] - Límite de resultados
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con usuarios conectados
 * 
 * @example
 * // GET /api/dashboard/users?limit=10
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "online_users": [...],
 * //     "total_online": 5
 * //   }
 * // }
 * 
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function getOnlineUsers(req, res, next) {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const now = new Date();

    // Obtener usuarios con sesiones activas
    const onlineUsers = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'last_login', 'created_at'],
      include: [
        {
          model: UserSession,
          as: 'sessions',
          where: {
            is_active: true,
            expires_at: { [Op.gt]: now }
          },
          attributes: ['id', 'ip_address', 'created_at', 'last_activity', 'expires_at'],
          required: true
        },
        {
          association: 'profile',
          attributes: ['country', 'city'],
          required: false
        }
      ],
      order: [
        [{ model: UserSession, as: 'sessions' }, 'last_activity', 'DESC']
      ],
      limit
    });

    // Procesar datos para incluir información adicional
    const processedUsers = onlineUsers.map(user => {
      const userData = user.toJSON();
      const latestSession = userData.sessions[0];
      
      return {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        last_login: userData.last_login,
        location: userData.profile ? 
          `${userData.profile.city || ''}, ${userData.profile.country || ''}`.replace(/^, |, $/, '') || null
          : null,
        session_info: {
          ip_address: latestSession.ip_address,
          last_activity: latestSession.last_activity,
          session_duration: Math.floor((now - new Date(latestSession.created_at)) / (1000 * 60)), // minutos
          expires_in: Math.floor((new Date(latestSession.expires_at) - now) / (1000 * 60)) // minutos
        },
        total_active_sessions: userData.sessions.length
      };
    });

    // Contar total de usuarios únicos online
    const totalOnline = await UserSession.count({
      where: {
        is_active: true,
        expires_at: { [Op.gt]: now }
      },
      distinct: 'user_id'
    });

    res.json({
      success: true,
      data: {
        online_users: processedUsers,
        total_online: totalOnline,
        showing: processedUsers.length,
        generated_at: now
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene actividad reciente del sistema
 * 
 * @async
 * @function getRecentActivity
 * @description Retorna lista de actividades recientes del sistema
 * incluyendo logins, registros y modificaciones importantes
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {number} [req.query.limit=50] - Límite de resultados
 * @param {string} [req.query.type] - Tipo de actividad a filtrar
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con actividad reciente
 * 
 * @example
 * // GET /api/dashboard/activity?limit=20&type=login
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "activities": [...],
 * //     "total_shown": 20
 * //   }
 * // }
 * 
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function getRecentActivity(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const { type } = req.query;

    // Construir filtros
    const whereConditions = {};

    // Filtrar por tipo de actividad si se especifica
    if (type) {
      switch (type) {
        case 'login':
          whereConditions.new_values = { [Op.like]: '%login_action%' };
          break;
        case 'register':
          whereConditions.action = 'CREATE';
          whereConditions.table_name = 'users';
          break;
        case 'user_updates':
          whereConditions.action = 'UPDATE';
          whereConditions.table_name = 'users';
          break;
        default:
          // Sin filtro específico
          break;
      }
    }

    // Obtener actividades recientes
    const activities = await AuditLog.findAll({
      where: whereConditions,
      include: [
        {
          association: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });

    // Procesar actividades para mostrar información legible
    const processedActivities = activities.map(activity => {
      const activityData = activity.toJSON();
      
      // Determinar tipo de actividad y descripción
      let activityType = 'unknown';
      let description = activity.getActionDescription();
      let details = {};

      // Analizar el tipo de actividad basado en los datos
      if (activityData.table_name === 'users') {
        if (activityData.action === 'CREATE') {
          activityType = 'user_register';
          description = 'Nuevo usuario registrado';
          details.email = activityData.new_values?.email;
        } else if (activityData.action === 'UPDATE') {
          if (activityData.new_values?.login_action) {
            activityType = 'user_login';
            description = 'Usuario inició sesión';
          } else if (activityData.new_values?.logout_action) {
            activityType = 'user_logout';
            description = 'Usuario cerró sesión';
          } else {
            activityType = 'user_update';
            description = 'Usuario actualizado';
            details.changed_fields = activity.getChangedFields();
          }
        } else if (activityData.action === 'DELETE') {
          activityType = 'user_delete';
          description = 'Usuario eliminado';
        }
      } else if (activityData.table_name === 'user_profiles') {
        activityType = 'profile_update';
        description = 'Perfil actualizado';
        details.changed_fields = activity.getChangedFields();
      }

      return {
        id: activityData.id,
        type: activityType,
        description,
        details,
        user: activityData.user ? {
          id: activityData.user.id,
          name: `${activityData.user.first_name} ${activityData.user.last_name}`,
          email: activityData.user.email
        } : null,
        target_record: {
          table: activityData.table_name,
          record_id: activityData.record_id
        },
        metadata: {
          ip_address: activityData.ip_address,
          user_agent: activityData.user_agent ? 
            activity.getDeviceInfo() : null
        },
        timestamp: activityData.created_at,
        time_ago: getTimeAgo(activityData.created_at)
      };
    });

    res.json({
      success: true,
      data: {
        activities: processedActivities,
        total_shown: processedActivities.length,
        filters_applied: {
          type: type || 'all',
          limit
        },
        generated_at: new Date()
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene métricas de rendimiento del sistema
 * 
 * @async
 * @function getSystemMetrics
 * @description Retorna métricas de rendimiento del sistema incluyendo
 * uso de base de datos, sesiones activas y estadísticas de API
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con métricas del sistema
 * 
 * @example
 * // GET /api/dashboard/system-metrics
 * // Response: {
 * //   "success": true,
 * //   "data": {
 * //     "database": {...},
 * //     "sessions": {...},
 * //     "api": {...}
 * //   }
 * // }
 * 
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function getSystemMetrics(req, res, next) {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Métricas del host (CPU, RAM, Disco) sin dependencias externas
    const os = require('os');
    const { exec } = require('child_process');

    const sampleCpuLoad = () => new Promise((resolve) => {
      const cpus1 = os.cpus();
      setTimeout(() => {
        const cpus2 = os.cpus();
        let idleDiff = 0;
        let totalDiff = 0;
        for (let i = 0; i < cpus1.length; i++) {
          const t1 = cpus1[i].times;
          const t2 = cpus2[i].times;
          const idle = t2.idle - t1.idle;
          const total = (t2.user - t1.user) + (t2.nice - t1.nice) + (t2.sys - t1.sys) + (t2.irq - t1.irq) + idle;
          idleDiff += idle;
          totalDiff += total;
        }
        const usage = totalDiff > 0 ? (1 - idleDiff / totalDiff) * 100 : 0;
        resolve(Math.round(usage));
      }, 200);
    });

    const getDiskUsage = () => new Promise((resolve) => {
      // macOS/Linux: usar df -k /
      exec('df -k /', (err, stdout) => {
        if (err || !stdout) return resolve(null);
        const lines = stdout.trim().split('\n');
        if (lines.length < 2) return resolve(null);
        const parts = lines[1].split(/\s+/);
        const totalKB = parseInt(parts[1], 10);
        const usedKB = parseInt(parts[2], 10);
        const availKB = parseInt(parts[3], 10);
        const usedPct = totalKB > 0 ? Math.round((usedKB / totalKB) * 100) : null;
        resolve({ totalKB, usedKB, availKB, usedPct });
      });
    });

    const [cpuUsagePercent, disk] = await Promise.all([
      sampleCpuLoad(),
      getDiskUsage(),
    ]);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

    // Métricas de base de datos
    const [
      totalRecords,
      totalSessions,
      totalAuditLogs,
      expiredSessions,
      averageSessionDuration
    ] = await Promise.all([
      User.count(),
      UserSession.count(),
      AuditLog.count(),
      UserSession.count({
        where: {
          expires_at: { [Op.lt]: now },
          is_active: true
        }
      }),
      UserSession.findAll({
        attributes: [
          // SQLite: promedio en segundos usando julianday
          [fn('AVG', literal('(julianday(expires_at) - julianday(created_at)) * 86400')), 'avg_duration_seconds']
        ],
        where: {
          created_at: { [Op.gte]: last24Hours }
        },
        raw: true
      })
    ]);

    // Actividad de API en las últimas 24 horas
    const apiActivity = await AuditLog.count({
      where: {
        created_at: { [Op.gte]: last24Hours }
      }
    });

    // Distribución de actividad por hora (últimas 24 horas)
    const hourlyActivity = await AuditLog.findAll({
      attributes: [
        [literal("strftime('%H', created_at)"), 'hour'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: last24Hours }
      },
      group: [literal("strftime('%H', created_at)")],
      order: [[literal("strftime('%H', created_at)"), 'ASC']],
      raw: true
    });

    // Métricas de sesiones por IP (top 10)
    const sessionsByIP = await UserSession.findAll({
      attributes: [
        'ip_address',
        [fn('COUNT', col('id')), 'session_count']
      ],
      where: {
        created_at: { [Op.gte]: last24Hours }
      },
      group: ['ip_address'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Tiempo promedio de sesión en minutos
    const avgDuration = averageSessionDuration[0]?.avg_duration_seconds 
      ? Math.round(averageSessionDuration[0].avg_duration_seconds / 60)
      : 0;

    res.json({
      success: true,
      data: {
        host: {
          cpu_usage_percent: cpuUsagePercent,
          memory_usage_percent: memUsagePercent,
          memory: {
            total_bytes: totalMem,
            used_bytes: usedMem,
            free_bytes: freeMem,
          },
          disk: disk ? {
            total_kb: disk.totalKB,
            used_kb: disk.usedKB,
            available_kb: disk.availKB,
            used_percent: disk.usedPct,
          } : null,
          loadavg: os.loadavg(),
          platform: os.platform(),
          arch: os.arch(),
        },
        database: {
          total_users: totalRecords,
          total_sessions: totalSessions,
          total_audit_logs: totalAuditLogs,
          expired_sessions_to_cleanup: expiredSessions
        },
        sessions: {
          average_duration_minutes: avgDuration,
          sessions_by_ip: sessionsByIP,
          total_sessions_24h: sessionsByIP.reduce((sum, item) => sum + parseInt(item.session_count), 0)
        },
        api: {
          requests_24h: apiActivity,
          hourly_distribution: hourlyActivity,
          peak_hour: hourlyActivity.reduce((max, current) => 
            parseInt(current.count) > parseInt(max.count || 0) ? current : max, {}
          )
        },
        system: {
          uptime_hours: Math.floor(process.uptime() / 3600),
          memory_usage: process.memoryUsage(),
          node_version: process.version,
          environment: process.env.NODE_ENV
        },
        generated_at: now
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Calcula tiempo transcurrido en formato legible
 * 
 * @function getTimeAgo
 * @description Convierte una fecha en una representación de tiempo transcurrido
 * 
 * @param {Date} date - Fecha a comparar
 * 
 * @returns {string} Tiempo transcurrido en formato legible
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Hace menos de 1 minuto';
  if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return new Date(date).toLocaleDateString('es-ES');
}

module.exports = {
  getStats,
  getOnlineUsers,
  getRecentActivity,
  getSystemMetrics
};
