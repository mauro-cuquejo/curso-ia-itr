/**
 * Modelo de Usuario
 * 
 * @description Define el modelo de usuario con Sequelize, incluyendo validaciones,
 * asociaciones, hooks para el hash de passwords y métodos de instancia.
 * Maneja la auditoría y versionado automático de registros.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../database/connection');
const serverConfig = require('../config/server');

/**
 * Clase del modelo User
 * 
 * @class User
 * @extends {Model}
 * @description Modelo principal de usuario con métodos para autenticación,
 * validación y gestión de información personal
 * 
 * @since 1.0.0
 */
class User extends Model {
  /**
   * Compara password en texto plano con el hash almacenado
   * 
   * @async
   * @method comparePassword
   * @description Utiliza bcrypt para comparar de forma segura el password
   * proporcionado con el hash almacenado en la base de datos
   * 
   * @param {string} candidatePassword - Password en texto plano a verificar
   * 
   * @returns {Promise<boolean>} true si el password coincide, false en caso contrario
   * 
   * @example
   * const user = await User.findByPk(1);
   * const isValid = await user.comparePassword('password123');
   * if (isValid) {
   *   console.log('Password correcto');
   * }
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Actualiza la fecha de último login
   * 
   * @async
   * @method updateLastLogin
   * @description Actualiza el campo last_login con la fecha y hora actual
   * 
   * @returns {Promise<User>} Instancia actualizada del usuario
   * 
   * @example
   * const user = await User.findByPk(1);
   * await user.updateLastLogin();
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  async updateLastLogin() {
    this.last_login = new Date();
    return this.save();
  }

  /**
   * Serializa datos del usuario para JSON (sin password)
   * 
   * @method toJSON
   * @description Override del método toJSON para excluir campos sensibles
   * como el password del objeto serializado
   * 
   * @returns {Object} Objeto usuario sin campos sensibles
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }

  /**
   * Obtiene el nombre completo del usuario
   * 
   * @method getFullName
   * @description Concatena first_name y last_name para obtener el nombre completo
   * 
   * @returns {string} Nombre completo del usuario
   * 
   * @example
   * const user = await User.findByPk(1);
   * console.log(user.getFullName()); // "Juan Pérez"
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getFullName() {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  /**
   * Verifica si el usuario está activo
   * 
   * @method isActive
   * @description Verifica si el usuario tiene status 'active'
   * 
   * @returns {boolean} true si el usuario está activo
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  isActive() {
    return this.status === 'active';
  }
}

// Definición del modelo con Sequelize
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del usuario'
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'users_email_unique',
      msg: 'Este email ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      },
      len: {
        args: [5, 255],
        msg: 'El email debe tener entre 5 y 255 caracteres'
      }
    },
    comment: 'Email único del usuario'
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'El password debe tener al menos 6 caracteres'
      }
    },
    comment: 'Password hasheado con bcrypt'
  },

  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [1, 100],
        msg: 'El nombre debe tener entre 1 y 100 caracteres'
      },
      isAlpha: {
        msg: 'El nombre solo puede contener letras'
      }
    },
    comment: 'Nombre del usuario'
  },

  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [1, 100],
        msg: 'El apellido debe tener entre 1 y 100 caracteres'
      },
      isAlpha: {
        msg: 'El apellido solo puede contener letras'
      }
    },
    comment: 'Apellido del usuario'
  },

  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'El teléfono debe tener entre 10 y 20 caracteres'
      }
    },
    comment: 'Número de teléfono del usuario'
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    allowNull: false,
    comment: 'Estado del usuario en el sistema'
  },

  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Debe ser una URL válida'
      }
    },
    comment: 'URL del avatar del usuario'
  },

  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora del último login'
  },

  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Indica si el email ha sido verificado'
  },

  // Campos de auditoría
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que creó este registro'
  },

  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que actualizó este registro'
  },

  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    comment: 'Versión del registro para control de concurrencia optimista'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  paranoid: true, // Soft delete
  deletedAt: 'deleted_at',
  
  // Hooks para el ciclo de vida del modelo
  hooks: {
    /**
     * Hook beforeCreate - Hashea el password antes de crear
     * 
     * @param {User} user - Instancia del usuario a crear
     * @param {Object} options - Opciones de Sequelize
     */
    beforeCreate: async (user, options) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(serverConfig.BCRYPT.SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);
      }
      
      // Normalizar email a lowercase
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }

      // Capitalizar nombres
      if (user.first_name) {
        user.first_name = user.first_name.charAt(0).toUpperCase() + 
                          user.first_name.slice(1).toLowerCase();
      }
      if (user.last_name) {
        user.last_name = user.last_name.charAt(0).toUpperCase() + 
                         user.last_name.slice(1).toLowerCase();
      }
    },

    /**
     * Hook beforeUpdate - Hashea el password si fue modificado
     * 
     * @param {User} user - Instancia del usuario a actualizar
     * @param {Object} options - Opciones de Sequelize
     */
    beforeUpdate: async (user, options) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(serverConfig.BCRYPT.SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);
      }

      // Incrementar versión para control de concurrencia
      if (user.changed() && user.changed().length > 0) {
        user.version += 1;
      }

      // Normalizar email si cambió
      if (user.changed('email')) {
        user.email = user.email.toLowerCase().trim();
      }
    },

    /**
     * Hook afterCreate - Log de auditoría después de crear
     * 
     * @param {User} user - Instancia del usuario creado
     * @param {Object} options - Opciones de Sequelize
     */
    afterCreate: async (user, options) => {
      console.log(`✅ Usuario creado: ${user.email} (ID: ${user.id})`);
    },

    /**
     * Hook afterUpdate - Log de auditoría después de actualizar
     * 
     * @param {User} user - Instancia del usuario actualizado
     * @param {Object} options - Opciones de Sequelize
     */
    afterUpdate: async (user, options) => {
      console.log(`📝 Usuario actualizado: ${user.email} (ID: ${user.id})`);
    }
  },

  // Índices para optimización
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['last_login']
    },
    {
      fields: ['created_at']
    }
  ]
});

/**
 * Define las asociaciones del modelo User
 * 
 * @function defineAssociations
 * @description Establece las relaciones del modelo User con otros modelos
 * 
 * @param {Object} models - Objeto con todos los modelos disponibles
 * 
 * @since 1.0.0
 * @author ITR Team
 */
User.associate = function(models) {
  // Relación con UserSession (un usuario puede tener múltiples sesiones)
  User.hasMany(models.UserSession, {
    foreignKey: 'user_id',
    as: 'sessions'
  });

  // Relación con UserProfile (un usuario tiene un perfil)
  User.hasOne(models.UserProfile, {
    foreignKey: 'user_id',
    as: 'profile'
  });

  // Relación con AuditLog (un usuario puede tener múltiples logs de auditoría)
  User.hasMany(models.AuditLog, {
    foreignKey: 'user_id',
    as: 'auditLogs'
  });

  // Auto-relación para created_by y updated_by
  User.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  User.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater'
  });
};

module.exports = User;
