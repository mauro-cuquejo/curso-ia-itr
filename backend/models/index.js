/**
 * Índice de modelos - Configuración centralizada
 * 
 * @description Inicializa todos los modelos y sus asociaciones de forma centralizada.
 * Proporciona una interfaz unificada para acceder a todos los modelos del sistema
 * y garantiza que todas las relaciones se establezcan correctamente.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { sequelize } = require('../database/connection');

// Importar todos los modelos
const User = require('./User');
const UserSession = require('./UserSession');
const UserProfile = require('./UserProfile');
const AuditLog = require('./AuditLog');

/**
 * Objeto con todos los modelos disponibles
 * 
 * @type {Object}
 * @description Contiene todos los modelos del sistema organizados
 * para fácil acceso y gestión de asociaciones
 * 
 * @since 1.0.0
 */
const models = {
  User,
  UserSession,
  UserProfile,
  AuditLog
};

/**
 * Inicializa todas las asociaciones entre modelos
 * 
 * @function initializeAssociations
 * @description Ejecuta el método associate de cada modelo que lo tenga definido
 * para establecer todas las relaciones entre modelos
 * 
 * @returns {void}
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function initializeAssociations() {
  console.log('🔗 Inicializando asociaciones de modelos...');
  
  Object.keys(models).forEach(modelName => {
    const model = models[modelName];
    if (model.associate) {
      model.associate(models);
      console.log(`✅ Asociaciones configuradas para modelo: ${modelName}`);
    }
  });
  
  console.log('🎯 Todas las asociaciones inicializadas correctamente');
}

/**
 * Sincroniza todos los modelos con la base de datos
 * 
 * @async
 * @function syncModels
 * @description Sincroniza la estructura de todos los modelos con la base de datos,
 * creando o modificando tablas según sea necesario
 * 
 * @param {Object} [options] - Opciones de sincronización
 * @param {boolean} [options.force=false] - Recrear tablas eliminando datos existentes
 * @param {boolean} [options.alter=true] - Modificar tablas existentes para coincidir con modelos
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando la sincronización termina
 * 
 * @throws {Error} Si ocurre un error durante la sincronización
 * 
 * @example
 * await syncModels({ alter: true });
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function syncModels(options = {}) {
  const defaultOptions = {
    force: false,
    alter: true
  };
  
  const syncOptions = { ...defaultOptions, ...options };
  
  try {
    console.log('📊 Iniciando sincronización de modelos...');
    
    if (syncOptions.force) {
      console.log('⚠️ ADVERTENCIA: Modo force activado - Se eliminarán todos los datos');
    }
    
    // Sincronizar en orden específico para respetar dependencias
    const syncOrder = [
      'User',
      'UserProfile', 
      'UserSession',
      'AuditLog'
    ];
    
    for (const modelName of syncOrder) {
      if (models[modelName]) {
        await models[modelName].sync(syncOptions);
        console.log(`✅ Modelo sincronizado: ${modelName}`);
      }
    }
    
    console.log('🎯 Todos los modelos sincronizados correctamente');
    
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    throw error;
  }
}

/**
 * Ejecuta migraciones de datos necesarias
 * 
 * @async
 * @function runMigrations
 * @description Ejecuta migraciones de datos o transformaciones necesarias
 * después de la sincronización de modelos
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando las migraciones terminan
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones de datos...');
    
    // Aquí se pueden agregar migraciones específicas de datos
    // Por ejemplo: actualizar campos, migrar datos, etc.
    
    console.log('✅ Migraciones completadas');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
}

/**
 * Crea datos de prueba para desarrollo
 * 
 * @async
 * @function createSeedData
 * @description Crea datos de prueba en la base de datos para desarrollo
 * Solo se ejecuta en entorno de desarrollo
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando los datos se crean
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function createSeedData() {
  if (process.env.NODE_ENV !== 'development') {
    console.log('ℹ️ Datos de prueba solo se crean en desarrollo');
    return;
  }
  
  try {
    console.log('🌱 Creando datos de prueba...');
    
    // Verificar si ya existen usuarios
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('ℹ️ Ya existen usuarios, omitiendo creación de datos de prueba');
      return;
    }
    
    // Crear usuario administrador de prueba
    const adminUser = await User.create({
      email: 'admin@itr.com',
      password: 'admin123',
      first_name: 'Administrador',
      last_name: 'ITR',
      phone: '+34600000000',
      status: 'active',
      email_verified: true
    });
    
    // Crear perfil para el administrador
    await UserProfile.create({
      user_id: adminUser.id,
      bio: 'Administrador del sistema ITR Dashboard',
      birth_date: '1990-01-01',
      gender: 'other',
      country: 'España',
      city: 'Madrid',
      timezone: 'Europe/Madrid',
      language: 'es',
      created_by: adminUser.id
    });
    
    // Crear usuarios de prueba adicionales
    const testUsers = [
      {
        email: 'juan.perez@example.com',
        password: 'password123',
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+34600000001',
        profile: {
          bio: 'Desarrollador Frontend especializado en React',
          birth_date: '1985-05-15',
          gender: 'male',
          country: 'España',
          city: 'Barcelona'
        }
      },
      {
        email: 'maria.garcia@example.com',
        password: 'password123',
        first_name: 'María',
        last_name: 'García',
        phone: '+34600000002',
        profile: {
          bio: 'Diseñadora UX/UI con pasión por el diseño centrado en el usuario',
          birth_date: '1992-08-22',
          gender: 'female',
          country: 'España',
          city: 'Valencia'
        }
      },
      {
        email: 'carlos.rodriguez@example.com',
        password: 'password123',
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        phone: '+34600000003',
        profile: {
          bio: 'Arquitecto de software con experiencia en microservicios',
          birth_date: '1988-03-10',
          gender: 'male',
          country: 'España',
          city: 'Sevilla'
        }
      }
    ];
    
    for (const userData of testUsers) {
      const user = await User.create({
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        status: 'active',
        email_verified: true
      });
      
      await UserProfile.create({
        user_id: user.id,
        ...userData.profile,
        timezone: 'Europe/Madrid',
        language: 'es',
        created_by: adminUser.id
      });
    }
    
    console.log('🎯 Datos de prueba creados exitosamente');
    console.log('📧 Usuario admin: admin@itr.com / admin123');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  }
}

/**
 * Inicializa todo el sistema de modelos
 * 
 * @async
 * @function initializeModels
 * @description Función principal que inicializa todo el sistema de modelos:
 * asociaciones, sincronización y datos de prueba
 * 
 * @param {Object} [options] - Opciones de inicialización
 * @param {boolean} [options.sync=true] - Sincronizar modelos
 * @param {boolean} [options.seed=false] - Crear datos de prueba
 * @param {Object} [options.syncOptions] - Opciones para la sincronización
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando la inicialización termina
 * 
 * @example
 * await initializeModels({ 
 *   sync: true, 
 *   seed: true,
 *   syncOptions: { alter: true }
 * });
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function initializeModels(options = {}) {
  const {
    sync = true,
    seed = false,
    syncOptions = { alter: true }
  } = options;
  
  try {
    console.log('🚀 Inicializando sistema de modelos...');
    
    // 1. Inicializar asociaciones
    initializeAssociations();
    
    // 2. Sincronizar modelos si está habilitado
    if (sync) {
      await syncModels(syncOptions);
      await runMigrations();
    }
    
    // 3. Crear datos de prueba si está habilitado
    if (seed) {
      await createSeedData();
    }
    
    console.log('🎯 Sistema de modelos inicializado correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando sistema de modelos:', error);
    throw error;
  }
}

/**
 * Verifica la integridad de las asociaciones
 * 
 * @async
 * @function validateAssociations
 * @description Verifica que todas las asociaciones estén configuradas correctamente
 * 
 * @returns {Promise<boolean>} true si todas las asociaciones son válidas
 * 
 * @since 1.0.0
 * @author ITR Team
 */
async function validateAssociations() {
  try {
    console.log('🔍 Validando asociaciones...');
    
    // Verificar asociaciones específicas
    const testUser = await User.findOne({
      include: [
        { association: 'profile' },
        { association: 'sessions' },
        { association: 'auditLogs' }
      ]
    });
    
    console.log('✅ Asociaciones validadas correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error validando asociaciones:', error);
    return false;
  }
}

// Agregar sequelize y modelos al objeto models para fácil acceso
models.sequelize = sequelize;
models.Sequelize = require('sequelize');

// Exportar funciones de utilidad
models.initializeAssociations = initializeAssociations;
models.syncModels = syncModels;
models.runMigrations = runMigrations;
models.createSeedData = createSeedData;
models.initializeModels = initializeModels;
models.validateAssociations = validateAssociations;

module.exports = models;
