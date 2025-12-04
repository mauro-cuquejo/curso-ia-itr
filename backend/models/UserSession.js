/**
 * Modelo de Sesión de Usuario
 * 
 * @description Define el modelo de sesiones de usuario para el manejo de tokens JWT,
 * control de sesiones activas y auditoría de accesos. Permite invalidar sesiones
 * específicas y rastrear la actividad de login de usuarios.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../database/connection');

/**
 * Clase del modelo UserSession
 * 
 * @class UserSession
 * @extends {Model}
 * @description Modelo para gestionar sesiones de usuario, tokens JWT
 * y control de acceso con información de auditoría
 * 
 * @since 1.0.0
 */
class UserSession extends Model {
  /**
   * Verifica si la sesión está activa y no ha expirado
   * 
   * @method isValid
   * @description Verifica que la sesión esté marcada como activa
   * y que no haya pasado la fecha de expiración
   * 
   * @returns {boolean} true si la sesión es válida y activa
   * 
   * @example
   * const session = await UserSession.findByPk(1);
   * if (session.isValid()) {
   *   console.log('Sesión válida');
   * }
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  isValid() {
    return this.is_active && new Date() < new Date(this.expires_at);
  }

  /**
   * Marca la sesión como inactiva
   * 
   * @async
   * @method invalidate
   * @description Marca la sesión como inactiva para invalidar el token
   * sin eliminarlo de la base de datos para mantener auditoría
   * 
   * @returns {Promise<UserSession>} Instancia actualizada de la sesión
   * 
   * @example
   * const session = await UserSession.findByPk(1);
   * await session.invalidate();
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  async invalidate() {
    this.is_active = false;
    return this.save();
  }

  /**
   * Verifica si la sesión ha expirado
   * 
   * @method isExpired
   * @description Compara la fecha actual con la fecha de expiración
   * 
   * @returns {boolean} true si la sesión ha expirado
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  isExpired() {
    return new Date() >= new Date(this.expires_at);
  }

  /**
   * Obtiene el tiempo restante de la sesión en minutos
   * 
   * @method getTimeRemaining
   * @description Calcula el tiempo restante hasta la expiración
   * 
   * @returns {number} Minutos restantes (0 si ya expiró)
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getTimeRemaining() {
    const now = new Date();
    const expires = new Date(this.expires_at);
    const diffMs = expires - now;
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }
}

// Definición del modelo con Sequelize
UserSession.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la sesión'
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'ID del usuario propietario de la sesión'
  },

  token_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'user_sessions_token_hash_unique',
      msg: 'Hash de token duplicado'
    },
    comment: 'Hash del token JWT para verificación'
  },

  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: {
        msg: 'Debe ser una dirección IP válida'
      }
    },
    comment: 'Dirección IP desde donde se creó la sesión'
  },

  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User Agent del navegador/cliente'
  },

  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Debe ser una fecha válida'
      },
      isAfter: {
        args: new Date().toISOString(),
        msg: 'La fecha de expiración debe ser futura'
      }
    },
    comment: 'Fecha y hora de expiración de la sesión'
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Indica si la sesión está activa'
  },

  last_activity: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última actividad registrada en esta sesión'
  },

  device_info: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información adicional del dispositivo (OS, browser, etc.)'
  },

  location_info: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información de geolocalización si está disponible'
  }
}, {
  sequelize,
  modelName: 'UserSession',
  tableName: 'user_sessions',
  timestamps: true,
  
  // Hooks para el ciclo de vida del modelo
  hooks: {
    /**
     * Hook beforeCreate - Configuraciones antes de crear sesión
     * 
     * @param {UserSession} session - Instancia de la sesión a crear
     * @param {Object} options - Opciones de Sequelize
     */
    beforeCreate: async (session, options) => {
      // Establecer última actividad al momento de creación
      session.last_activity = new Date();
    },

    /**
     * Hook afterCreate - Log de auditoría después de crear sesión
     * 
     * @param {UserSession} session - Instancia de la sesión creada
     * @param {Object} options - Opciones de Sequelize
     */
    afterCreate: async (session, options) => {
      console.log(`🔐 Nueva sesión creada para usuario ${session.user_id} desde IP: ${session.ip_address}`);
    },

    /**
     * Hook beforeUpdate - Actualizar timestamp de actividad
     * 
     * @param {UserSession} session - Instancia de la sesión a actualizar
     * @param {Object} options - Opciones de Sequelize
     */
    beforeUpdate: async (session, options) => {
      // Actualizar última actividad si no se está invalidando
      if (session.changed('is_active') && !session.is_active) {
        console.log(`🔒 Sesión ${session.id} invalidada para usuario ${session.user_id}`);
      } else if (session.changed() && session.changed().length > 0) {
        session.last_activity = new Date();
      }
    }
  },

  // Índices para optimización
  indexes: [
    {
      unique: true,
      fields: ['token_hash']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['last_activity']
    },
    // Índice compuesto para consultas frecuentes
    {
      fields: ['user_id', 'is_active', 'expires_at']
    }
  ],

  // Scopes para consultas comunes
  scopes: {
    active: {
      where: {
        is_active: true
      }
    },
    
    valid: {
      where: {
        is_active: true,
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    },

    expired: {
      where: {
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    },

    byUser: (userId) => ({
      where: {
        user_id: userId
      }
    }),

    recent: {
      order: [['created_at', 'DESC']],
      limit: 10
    }
  }
});

/**
 * Define las asociaciones del modelo UserSession
 * 
 * @function defineAssociations
 * @description Establece las relaciones del modelo UserSession con otros modelos
 * 
 * @param {Object} models - Objeto con todos los modelos disponibles
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserSession.associate = function(models) {
  // Relación con User (una sesión pertenece a un usuario)
  UserSession.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

/**
 * Métodos estáticos del modelo
 */

/**
 * Limpia sesiones expiradas de la base de datos
 * 
 * @async
 * @function cleanExpiredSessions
 * @description Elimina o marca como inactivas las sesiones que han expirado
 * 
 * @returns {Promise<number>} Número de sesiones limpiadas
 * 
 * @example
 * const cleaned = await UserSession.cleanExpiredSessions();
 * console.log(`${cleaned} sesiones expiradas limpiadas`);
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserSession.cleanExpiredSessions = async function() {
  const expiredCount = await this.update(
    { is_active: false },
    {
      where: {
        expires_at: {
          [Op.lt]: new Date()
        },
        is_active: true
      }
    }
  );
  
  console.log(`🧹 ${expiredCount[0]} sesiones expiradas marcadas como inactivas`);
  return expiredCount[0];
};

/**
 * Obtiene sesiones activas por usuario
 * 
 * @async
 * @function getActiveSessions
 * @description Obtiene todas las sesiones activas y válidas de un usuario
 * 
 * @param {number} userId - ID del usuario
 * 
 * @returns {Promise<UserSession[]>} Array de sesiones activas
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserSession.getActiveSessions = async function(userId) {
  return this.scope('valid').findAll({
    where: { user_id: userId },
    order: [['last_activity', 'DESC']]
  });
};

/**
 * Invalida todas las sesiones de un usuario
 * 
 * @async
 * @function invalidateUserSessions
 * @description Marca como inactivas todas las sesiones de un usuario específico
 * 
 * @param {number} userId - ID del usuario
 * 
 * @returns {Promise<number>} Número de sesiones invalidadas
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserSession.invalidateUserSessions = async function(userId) {
  const invalidatedCount = await this.update(
    { is_active: false },
    {
      where: {
        user_id: userId,
        is_active: true
      }
    }
  );
  
  console.log(`🔒 ${invalidatedCount[0]} sesiones invalidadas para usuario ${userId}`);
  return invalidatedCount[0];
};

module.exports = UserSession;
