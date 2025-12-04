/**
 * Configuración y conexión de base de datos SQLite
 * 
 * @description Configura Sequelize para conectar con SQLite, define la configuración
 * de conexión y proporciona funciones para inicializar y gestionar la base de datos.
 * Incluye manejo de errores y logging según el entorno.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const serverConfig = require('../config/server');

/**
 * Instancia de Sequelize configurada para SQLite
 * 
 * @type {Sequelize}
 * @description Configuración de Sequelize con SQLite como motor de base de datos,
 * optimizada para desarrollo y producción con diferentes niveles de logging
 * 
 * @since 1.0.0
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: serverConfig.DATABASE.PATH,
  logging: serverConfig.DATABASE.LOGGING ? console.log : false,
  
  // Configuración del pool de conexiones
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // Configuraciones específicas de SQLite
  dialectOptions: {
    // Habilitar foreign keys
    // Note: En SQLite las foreign keys están deshabilitadas por defecto
  },

  // Configuración de modelos
  define: {
    // Timestamps automáticos
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    // Naming conventions
    underscored: true,
    freezeTableName: true,
    
    // Charset
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },

  // Configuración de timezone
  timezone: '+00:00'
});

/**
 * Conecta a la base de datos SQLite
 * 
 * @async
 * @function connectDB
 * @description Establece la conexión con la base de datos SQLite,
 * crea el directorio si no existe y verifica la conectividad
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando la conexión es exitosa
 * 
 * @throws {Error} Si no se puede conectar a la base de datos
 * 
 * @example
 * try {
 *   await connectDB();
 *   console.log('Base de datos conectada');
 * } catch (error) {
 *   console.error('Error conectando a DB:', error);
 * }
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function connectDB() {
  try {
    // Crear directorio de base de datos si no existe
    const dbDir = path.dirname(serverConfig.DATABASE.PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Directorio de base de datos creado: ${dbDir}`);
    }

    // Autenticar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida exitosamente');

    // Habilitar foreign keys en SQLite
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('🔗 Foreign keys habilitadas en SQLite');

    // Configurar WAL mode para mejor concurrencia
    await sequelize.query('PRAGMA journal_mode = WAL;');
    console.log('📝 WAL mode configurado en SQLite');

    return sequelize;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
}

/**
 * Cierra la conexión a la base de datos
 * 
 * @async
 * @function closeDB
 * @description Cierra la conexión de forma segura con la base de datos SQLite
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando la conexión se cierra
 * 
 * @throws {Error} Si ocurre un error al cerrar la conexión
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function closeDB() {
  try {
    await sequelize.close();
    console.log('🔌 Conexión a base de datos cerrada exitosamente');
  } catch (error) {
    console.error('❌ Error cerrando conexión a base de datos:', error);
    throw error;
  }
}

/**
 * Verifica el estado de la conexión a la base de datos
 * 
 * @async
 * @function checkConnection
 * @description Verifica si la conexión a la base de datos está activa
 * y funcionando correctamente
 * 
 * @returns {Promise<boolean>} true si la conexión está activa, false en caso contrario
 * 
 * @example
 * const isConnected = await checkConnection();
 * if (isConnected) {
 *   console.log('Base de datos disponible');
 * }
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function checkConnection() {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error);
    return false;
  }
}

/**
 * Inicializa la base de datos con configuraciones específicas
 * 
 * @async
 * @function initializeDB
 * @description Inicializa la base de datos con configuraciones específicas de SQLite,
 * ejecuta configuraciones PRAGMA necesarias y verifica la integridad
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando la inicialización es exitosa
 * 
 * @throws {Error} Si ocurre un error durante la inicialización
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function initializeDB() {
  try {
    // Configuraciones específicas de SQLite para optimización
    const pragmaQueries = [
      'PRAGMA foreign_keys = ON;',
      'PRAGMA journal_mode = WAL;',
      'PRAGMA synchronous = NORMAL;',
      'PRAGMA cache_size = 1000;',
      'PRAGMA temp_store = memory;',
      'PRAGMA mmap_size = 268435456;' // 256MB
    ];

    for (const query of pragmaQueries) {
      await sequelize.query(query);
    }

    console.log('⚙️ Configuraciones PRAGMA aplicadas a SQLite');
    
    // Verificar integridad de la base de datos
    const [results] = await sequelize.query('PRAGMA integrity_check;');
    if (results[0] && results[0].integrity_check === 'ok') {
      console.log('✅ Integridad de base de datos verificada');
    } else {
      console.warn('⚠️ Problemas de integridad detectados en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  connectDB,
  closeDB,
  checkConnection,
  initializeDB
};
