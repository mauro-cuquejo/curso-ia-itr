/**
 * Modelo de Perfil de Usuario
 * 
 * @description Define el modelo de perfil extendido de usuario con información
 * adicional como biografía, fecha de nacimiento, ubicación y preferencias.
 * Complementa el modelo User con datos opcionales y configuraciones personales.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/connection');

/**
 * Clase del modelo UserProfile
 * 
 * @class UserProfile
 * @extends {Model}
 * @description Modelo para información extendida del perfil de usuario
 * con datos personales y preferencias del sistema
 * 
 * @since 1.0.0
 */
class UserProfile extends Model {
  /**
   * Calcula la edad del usuario basada en su fecha de nacimiento
   * 
   * @method getAge
   * @description Calcula la edad actual del usuario en años completos
   * 
   * @returns {number|null} Edad en años o null si no hay fecha de nacimiento
   * 
   * @example
   * const profile = await UserProfile.findByPk(1);
   * const age = profile.getAge(); // 25
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getAge() {
    if (!this.birth_date) {
      return null;
    }

    const today = new Date();
    const birthDate = new Date(this.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Obtiene la ubicación completa como string
   * 
   * @method getFullLocation
   * @description Combina ciudad y país para obtener la ubicación completa
   * 
   * @returns {string} Ubicación completa o cadena vacía
   * 
   * @example
   * const profile = await UserProfile.findByPk(1);
   * console.log(profile.getFullLocation()); // "Madrid, España"
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getFullLocation() {
    const parts = [];
    if (this.city) parts.push(this.city);
    if (this.country) parts.push(this.country);
    return parts.join(', ');
  }

  /**
   * Verifica si el perfil está completo
   * 
   * @method isComplete
   * @description Verifica si los campos principales del perfil están llenos
   * 
   * @returns {boolean} true si el perfil está completo
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  isComplete() {
    const requiredFields = ['bio', 'birth_date', 'country', 'city'];
    return requiredFields.every(field => this[field] && this[field].toString().trim() !== '');
  }

  /**
   * Obtiene el porcentaje de completitud del perfil
   * 
   * @method getCompletionPercentage
   * @description Calcula el porcentaje de campos completados del perfil
   * 
   * @returns {number} Porcentaje de completitud (0-100)
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getCompletionPercentage() {
    const allFields = ['bio', 'birth_date', 'gender', 'country', 'city', 'timezone', 'language'];
    const completedFields = allFields.filter(field => 
      this[field] && this[field].toString().trim() !== ''
    );
    
    return Math.round((completedFields.length / allFields.length) * 100);
  }

  /**
   * Obtiene la configuración de idioma con fallback
   * 
   * @method getLanguage
   * @description Obtiene el idioma configurado o el idioma por defecto
   * 
   * @returns {string} Código de idioma
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  getLanguage() {
    return this.language || 'es';
  }

  /**
   * Verifica si es mayor de edad
   * 
   * @method isAdult
   * @description Verifica si el usuario es mayor de 18 años
   * 
   * @returns {boolean} true si es mayor de edad
   * 
   * @since 1.0.0
   * @author ITR Team
   */
  isAdult() {
    const age = this.getAge();
    return age !== null && age >= 18;
  }
}

// Definición del modelo con Sequelize
UserProfile.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del perfil de usuario'
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: {
      name: 'user_profiles_user_id_unique',
      msg: 'Ya existe un perfil para este usuario'
    },
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'ID del usuario propietario del perfil'
  },

  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'La biografía no puede exceder 1000 caracteres'
      }
    },
    comment: 'Biografía o descripción personal del usuario'
  },

  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Debe ser una fecha válida'
      },
      isBefore: {
        args: new Date().toISOString(),
        msg: 'La fecha de nacimiento debe ser anterior a hoy'
      },
      isAfter: {
        args: '1900-01-01',
        msg: 'La fecha de nacimiento debe ser posterior a 1900'
      }
    },
    comment: 'Fecha de nacimiento del usuario'
  },

  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
    comment: 'Género del usuario'
  },

  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [2, 100],
        msg: 'El país debe tener entre 2 y 100 caracteres'
      }
    },
    comment: 'País de residencia del usuario'
  },

  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [2, 100],
        msg: 'La ciudad debe tener entre 2 y 100 caracteres'
      }
    },
    comment: 'Ciudad de residencia del usuario'
  },

  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Europe/Madrid',
    validate: {
      len: {
        args: [3, 50],
        msg: 'La zona horaria debe tener entre 3 y 50 caracteres'
      }
    },
    comment: 'Zona horaria del usuario'
  },

  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'es',
    allowNull: false,
    validate: {
      len: {
        args: [2, 10],
        msg: 'El idioma debe tener entre 2 y 10 caracteres'
      },
      isIn: {
        args: [['es', 'en', 'fr', 'de', 'it', 'pt', 'ca']],
        msg: 'Idioma no soportado'
      }
    },
    comment: 'Idioma preferido del usuario'
  },

  phone_alt: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'El teléfono alternativo debe tener entre 10 y 20 caracteres'
      }
    },
    comment: 'Teléfono alternativo del usuario'
  },

  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Debe ser una URL válida'
      }
    },
    comment: 'Sitio web personal del usuario'
  },

  social_links: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Enlaces a redes sociales (JSON con plataforma y URL)'
  },

  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profile_visibility: 'public',
        show_email: false,
        show_phone: false
      },
      theme: {
        mode: 'auto',
        color_scheme: 'itr'
      }
    },
    comment: 'Preferencias y configuraciones del usuario (JSON)'
  },

  // Campos de auditoría
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que creó este perfil'
  },

  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que actualizó este perfil'
  },

  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    comment: 'Versión del registro para control de concurrencia optimista'
  }
}, {
  sequelize,
  modelName: 'UserProfile',
  tableName: 'user_profiles',
  timestamps: true,
  
  // Hooks para el ciclo de vida del modelo
  hooks: {
    /**
     * Hook beforeCreate - Configuraciones antes de crear perfil
     * 
     * @param {UserProfile} profile - Instancia del perfil a crear
     * @param {Object} options - Opciones de Sequelize
     */
    beforeCreate: async (profile, options) => {
      // Normalizar datos de texto
      if (profile.bio) {
        profile.bio = profile.bio.trim();
      }
      
      if (profile.country) {
        profile.country = profile.country.charAt(0).toUpperCase() + 
                         profile.country.slice(1).toLowerCase();
      }
      
      if (profile.city) {
        profile.city = profile.city.charAt(0).toUpperCase() + 
                      profile.city.slice(1).toLowerCase();
      }

      // Validar estructura de preferences si está presente
      if (profile.preferences && typeof profile.preferences === 'object') {
        const defaultPrefs = {
          notifications: { email: true, push: true, sms: false },
          privacy: { profile_visibility: 'public', show_email: false, show_phone: false },
          theme: { mode: 'auto', color_scheme: 'itr' }
        };
        
        profile.preferences = { ...defaultPrefs, ...profile.preferences };
      }
    },

    /**
     * Hook beforeUpdate - Validaciones antes de actualizar
     * 
     * @param {UserProfile} profile - Instancia del perfil a actualizar
     * @param {Object} options - Opciones de Sequelize
     */
    beforeUpdate: async (profile, options) => {
      // Incrementar versión para control de concurrencia
      if (profile.changed() && profile.changed().length > 0) {
        profile.version += 1;
      }

      // Normalizar datos si cambiaron
      if (profile.changed('bio') && profile.bio) {
        profile.bio = profile.bio.trim();
      }
      
      if (profile.changed('country') && profile.country) {
        profile.country = profile.country.charAt(0).toUpperCase() + 
                         profile.country.slice(1).toLowerCase();
      }
      
      if (profile.changed('city') && profile.city) {
        profile.city = profile.city.charAt(0).toUpperCase() + 
                      profile.city.slice(1).toLowerCase();
      }
    },

    /**
     * Hook afterCreate - Log después de crear perfil
     * 
     * @param {UserProfile} profile - Instancia del perfil creado
     * @param {Object} options - Opciones de Sequelize
     */
    afterCreate: async (profile, options) => {
      console.log(`👤 Perfil creado para usuario ${profile.user_id}`);
    },

    /**
     * Hook afterUpdate - Log después de actualizar perfil
     * 
     * @param {UserProfile} profile - Instancia del perfil actualizado
     * @param {Object} options - Opciones de Sequelize
     */
    afterUpdate: async (profile, options) => {
      console.log(`📝 Perfil actualizado para usuario ${profile.user_id} (v${profile.version})`);
    }
  },

  // Índices para optimización
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['country']
    },
    {
      fields: ['city']
    },
    {
      fields: ['language']
    },
    {
      fields: ['created_at']
    },
    // Índice compuesto para búsquedas geográficas
    {
      fields: ['country', 'city']
    }
  ],

  // Scopes para consultas comunes
  scopes: {
    complete: {
      where: sequelize.literal(`
        bio IS NOT NULL AND bio != '' AND
        birth_date IS NOT NULL AND
        country IS NOT NULL AND country != '' AND
        city IS NOT NULL AND city != ''
      `)
    },

    byCountry: (country) => ({
      where: {
        country: country
      }
    }),

    byLanguage: (language) => ({
      where: {
        language: language
      }
    }),

    adults: {
      where: sequelize.literal(`
        birth_date IS NOT NULL AND
        date('now') - birth_date >= 18
      `)
    },

    recent: {
      order: [['created_at', 'DESC']],
      limit: 20
    }
  }
});

/**
 * Define las asociaciones del modelo UserProfile
 * 
 * @function defineAssociations
 * @description Establece las relaciones del modelo UserProfile con otros modelos
 * 
 * @param {Object} models - Objeto con todos los modelos disponibles
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserProfile.associate = function(models) {
  // Relación con User (un perfil pertenece a un usuario)
  UserProfile.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // Auto-relaciones para auditoría
  UserProfile.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  UserProfile.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater'
  });
};

/**
 * Métodos estáticos del modelo
 */

/**
 * Obtiene estadísticas demográficas
 * 
 * @async
 * @function getDemographicStats
 * @description Obtiene estadísticas demográficas de los perfiles
 * 
 * @returns {Promise<Object>} Estadísticas demográficas
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserProfile.getDemographicStats = async function() {
  const [genderStats, countryStats, languageStats] = await Promise.all([
    // Estadísticas por género
    this.findAll({
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        gender: {
          [DataTypes.Op.ne]: null
        }
      },
      group: ['gender']
    }),

    // Estadísticas por país (top 10)
    this.findAll({
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        country: {
          [DataTypes.Op.ne]: null
        }
      },
      group: ['country'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    }),

    // Estadísticas por idioma
    this.findAll({
      attributes: [
        'language',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['language']
    })
  ]);

  return {
    gender: genderStats,
    countries: countryStats,
    languages: languageStats
  };
};

/**
 * Busca perfiles por ubicación
 * 
 * @async
 * @function findByLocation
 * @description Busca perfiles en una ubicación específica
 * 
 * @param {string} [country] - País a buscar
 * @param {string} [city] - Ciudad a buscar
 * 
 * @returns {Promise<UserProfile[]>} Perfiles encontrados
 * 
 * @since 1.0.0
 * @author ITR Team
 */
UserProfile.findByLocation = async function(country, city) {
  const whereClause = {};
  
  if (country) {
    whereClause.country = {
      [DataTypes.Op.iLike]: `%${country}%`
    };
  }
  
  if (city) {
    whereClause.city = {
      [DataTypes.Op.iLike]: `%${city}%`
    };
  }

  return this.findAll({
    where: whereClause,
    include: [{
      association: 'user',
      attributes: ['id', 'first_name', 'last_name', 'email']
    }],
    order: [['country', 'ASC'], ['city', 'ASC']]
  });
};

module.exports = UserProfile;
