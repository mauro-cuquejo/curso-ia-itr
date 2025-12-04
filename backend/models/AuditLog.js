/**
 * Modelo de Log de Auditoría
 * 
 * @description Define el modelo de auditoría para rastrear cambios en todos los
 * modelos del sistema. Registra operaciones CRUD con información detallada
 * del usuario, cambios realizados y metadatos de la operación.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../database/connection');

/**
 * Clase del modelo AuditLog
 * 
 * @class AuditLog
 * @extends {Model}
 * @description Modelo para registrar todas las operaciones de auditoría
 * del sistema con información detallada de cambios
 * 
 * @since 1.0.0
 */
class AuditLog extends Model {
  /**
   * Obtiene una descripción legible de la acción realizada
   * 
   * @method getActionDescription
   * @description Genera una descripción en español de la acción de auditoría
   * 
   * @returns {string} Descripción de la acción
   * 
   * @example
   * const log = await AuditLog.findByPk(1);
   * console.log(log.getActionDescription()); // "Creó usuario"
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getActionDescription() {
    const actionMap = {
      CREATE: 'Creó',
      UPDATE: 'Actualizó', 
      DELETE: 'Eliminó'
    };
    
    const action = actionMap[this.action] || 'Modificó';
    const tableName = this.table_name.replace('_', ' ');
    
    return `${action} ${tableName}`;
  }

  /**
   * Obtiene los campos que cambiaron en la operación
   * 
   * @method getChangedFields
   * @description Compara old_values y new_values para identificar cambios
   * 
   * @returns {Array<string>} Array con los nombres de campos modificados
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getChangedFields() {
    if (!this.old_values || !this.new_values) {
      return [];
    }

    const oldValues = typeof this.old_values === 'string' 
      ? JSON.parse(this.old_values) 
      : this.old_values;
    const newValues = typeof this.new_values === 'string'
      ? JSON.parse(this.new_values)
      : this.new_values;

    const changedFields = [];
    
    // Comparar valores nuevos con antiguos
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        changedFields.push(key);
      }
    });

    return changedFields;
  }

  /**
   * Verifica si un campo específico fue modificado
   * 
   * @method wasFieldChanged
   * @description Verifica si un campo específico fue modificado en esta operación
   * 
   * @param {string} fieldName - Nombre del campo a verificar
   * 
   * @returns {boolean} true si el campo fue modificado
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  wasFieldChanged(fieldName) {
    return this.getChangedFields().includes(fieldName);
  }

  /**
   * Obtiene información del dispositivo desde el user_agent
   * 
   * @method getDeviceInfo
   * @description Extrae información básica del dispositivo desde el user agent
   * 
   * @returns {Object} Información del dispositivo
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getDeviceInfo() {
    if (!this.user_agent) {
      return { browser: 'Desconocido', os: 'Desconocido' };
    }

    const ua = this.user_agent.toLowerCase();
    let browser = 'Desconocido';
    let os = 'Desconocido';

    // Detectar navegador
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // Detectar OS
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios')) os = 'iOS';

    return { browser, os };
  }
}

// Definición del modelo con Sequelize
AuditLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del log de auditoría'
  },

  table_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [1, 100],
        msg: 'El nombre de tabla debe tener entre 1 y 100 caracteres'
      }
    },
    comment: 'Nombre de la tabla afectada'
  },

  record_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'El ID del registro debe ser mayor a 0'
      }
    },
    comment: 'ID del registro afectado'
  },

  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false,
    comment: 'Tipo de acción realizada'
  },

  old_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Valores anteriores del registro (para UPDATE y DELETE)'
  },

  new_values: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Valores nuevos del registro (para CREATE y UPDATE)'
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'ID del usuario que realizó la acción'
  },

  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: {
        msg: 'Debe ser una dirección IP válida'
      }
    },
    comment: 'Dirección IP desde donde se realizó la acción'
  },

  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User Agent del navegador/cliente'
  },

  additional_info: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información adicional de contexto'
  },

  error_details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detalles de error si la operación falló'
  },

  execution_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo de ejecución en milisegundos'
  }
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false, // Los logs de auditoría no se actualizan
  
  // Hooks para el ciclo de vida del modelo
  hooks: {
    /**
     * Hook beforeCreate - Validaciones antes de crear log
     * 
     * @param {AuditLog} auditLog - Instancia del log a crear
     * @param {Object} options - Opciones de Sequelize
     */
    beforeCreate: async (auditLog, options) => {
      // Validar que los valores JSON sean válidos
      if (auditLog.old_values && typeof auditLog.old_values === 'string') {
        try {
          JSON.parse(auditLog.old_values);
        } catch (error) {
          throw new Error('old_values debe ser un JSON válido');
        }
      }

      if (auditLog.new_values && typeof auditLog.new_values === 'string') {
        try {
          JSON.parse(auditLog.new_values);
        } catch (error) {
          throw new Error('new_values debe ser un JSON válido');
        }
      }
    },

    /**
     * Hook afterCreate - Log después de crear registro de auditoría
     * 
     * @param {AuditLog} auditLog - Instancia del log creado
     * @param {Object} options - Opciones de Sequelize
     */
    afterCreate: async (auditLog, options) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 Auditoría registrada: ${auditLog.action} en ${auditLog.table_name} (ID: ${auditLog.record_id})`);
      }
    }
  },

  // Índices para optimización de consultas
  indexes: [
    {
      fields: ['table_name']
    },
    {
      fields: ['record_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['ip_address']
    },
    // Índices compuestos para consultas frecuentes
    {
      fields: ['table_name', 'record_id']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['table_name', 'action', 'created_at']
    }
  ],

  // Scopes para consultas comunes
  scopes: {
    byTable: (tableName) => ({
      where: {
        table_name: tableName
      }
    }),

    byUser: (userId) => ({
      where: {
        user_id: userId
      }
    }),

    byAction: (action) => ({
      where: {
        action: action
      }
    }),

    recent: {
      order: [['created_at', 'DESC']],
      limit: 50
    },

    today: {
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    },

    lastWeek: {
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }
  }
});

/**
 * Define las asociaciones del modelo AuditLog
 * 
 * @function defineAssociations
 * @description Establece las relaciones del modelo AuditLog con otros modelos
 * 
 * @param {Object} models - Objeto con todos los modelos disponibles
 * 
 * @since 1.0.0
 * @author ITR Team
 */
AuditLog.associate = function(models) {
  // Relación con User (un log pertenece a un usuario)
  AuditLog.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

/**
 * Métodos estáticos del modelo
 */

/**
 * Crea un registro de auditoría
 * 
 * @async
 * @function createAuditLog
 * @description Crea un nuevo registro de auditoría con la información proporcionada
 * 
 * @param {Object} data - Datos del log de auditoría
 * @param {string} data.tableName - Nombre de la tabla
 * @param {number} data.recordId - ID del registro
 * @param {string} data.action - Acción realizada (CREATE, UPDATE, DELETE)
 * @param {Object} [data.oldValues] - Valores anteriores
 * @param {Object} [data.newValues] - Valores nuevos
 * @param {number} [data.userId] - ID del usuario
 * @param {string} [data.ipAddress] - Dirección IP
 * @param {string} [data.userAgent] - User Agent
 * @param {Object} [data.additionalInfo] - Información adicional
 * 
 * @returns {Promise<AuditLog>} Registro de auditoría creado
 * 
 * @since 1.0.0
 * @author ITR Team
 */
AuditLog.createAuditLog = async function(data) {
  return this.create({
    table_name: data.tableName,
    record_id: data.recordId,
    action: data.action,
    old_values: data.oldValues,
    new_values: data.newValues,
    user_id: data.userId,
    ip_address: data.ipAddress,
    user_agent: data.userAgent,
    additional_info: data.additionalInfo
  });
};

/**
 * Obtiene el historial de cambios de un registro
 * 
 * @async
 * @function getRecordHistory
 * @description Obtiene todo el historial de cambios de un registro específico
 * 
 * @param {string} tableName - Nombre de la tabla
 * @param {number} recordId - ID del registro
 * 
 * @returns {Promise<AuditLog[]>} Array con el historial de cambios
 * 
 * @since 1.0.0
 * @author ITR Team
 */
AuditLog.getRecordHistory = async function(tableName, recordId) {
  return this.findAll({
    where: {
      table_name: tableName,
      record_id: recordId
    },
    include: [{
      association: 'user',
      attributes: ['id', 'first_name', 'last_name', 'email']
    }],
    order: [['created_at', 'DESC']]
  });
};

/**
 * Obtiene estadísticas de actividad por periodo
 * 
 * @async
 * @function getActivityStats
 * @description Obtiene estadísticas de actividad agrupadas por acción y tabla
 * 
 * @param {Date} [startDate] - Fecha de inicio (por defecto últimos 30 días)
 * @param {Date} [endDate] - Fecha de fin (por defecto ahora)
 * 
 * @returns {Promise<Object[]>} Estadísticas de actividad
 * 
 * @since 1.0.0
 * @author ITR Team
 */
AuditLog.getActivityStats = async function(startDate, endDate) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  return this.findAll({
    attributes: [
      'table_name',
      'action',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      created_at: {
        [Op.between]: [start, end]
      }
    },
    group: ['table_name', 'action'],
    order: [
      ['table_name', 'ASC'],
      ['action', 'ASC']
    ]
  });
};

/**
 * Limpia logs antiguos de auditoría
 * 
 * @async
 * @function cleanOldLogs
 * @description Elimina logs de auditoría más antiguos que el periodo especificado
 * 
 * @param {number} [days=365] - Días de retención (por defecto 365 días)
 * 
 * @returns {Promise<number>} Número de logs eliminados
 * 
 * @since 1.0.0
 * @author ITR Team
 */
AuditLog.cleanOldLogs = async function(days = 365) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const deletedCount = await this.destroy({
    where: {
      created_at: {
        [Op.lt]: cutoffDate
      }
    }
  });

  console.log(`🧹 ${deletedCount} logs de auditoría eliminados (más antiguos que ${days} días)`);
  return deletedCount;
};

module.exports = AuditLog;
