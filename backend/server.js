/**
 * Servidor principal de la aplicación ITR Dashboard
 * 
 * @description Punto de entrada principal del backend. Configura Express,
 * middleware de seguridad, rutas principales y conexión a la base de datos.
 * Maneja el ciclo de vida del servidor con graceful shutdown.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Importar configuraciones
const { connectDB, sequelize } = require('./database/connection');
const serverConfig = require('./config/server');
const models = require('./models');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

// Importar middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

/**
 * Crea y configura la aplicación Express
 * 
 * @function createApp
 * @description Configura todos los middleware, rutas y manejo de errores
 * de la aplicación Express
 * 
 * @returns {Object} Aplicación Express configurada
 * 
 * @since 1.0.0
 */
function createApp() {
  const app = express();

  // Middleware de seguridad
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
      error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Middleware básico
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'ITR Dashboard API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health'
    });
  });

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

/**
 * Inicia el servidor HTTP
 * 
 * @async
 * @function startServer
 * @description Conecta a la base de datos, crea la aplicación Express
 * y inicia el servidor HTTP en el puerto especificado
 * 
 * @returns {Promise<void>} Promesa que resuelve cuando el servidor está listo
 * 
 * @throws {Error} Si no se puede conectar a la base de datos o iniciar el servidor
 * 
 * @since 1.0.0
 */
async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Base de datos conectada exitosamente');

    // Inicializar asociaciones y sincronizar modelos (sin alter para evitar conflictos en SQLite)
    models.initializeAssociations();
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos');

    // Crear aplicación Express
    const app = createApp();

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Recibida señal ${signal}. Cerrando servidor...`);
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        try {
          await sequelize.close();
          console.log('🗄️ Conexión a base de datos cerrada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error cerrando base de datos:', error);
          process.exit(1);
        }
      });
    };

    // Listeners para graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection en:', promise, 'razón:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor solo si es el archivo principal
if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
