/**
 * Middleware de Manejo de Errores
 * 
 * @description Middleware centralizado para el manejo de errores en toda la aplicación.
 * Captura errores de validación, base de datos, autenticación y otros errores del sistema,
 * devolviendo respuestas estructuradas y registrando información de auditoría.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

const { ValidationError, DatabaseError, UniqueConstraintError } = require('sequelize');

/**
 * Middleware para manejar rutas no encontradas (404)
 * 
 * @function notFound
 * @description Middleware que captura todas las rutas no definidas
 * y devuelve un error 404 estructurado
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {void} Respuesta JSON con error 404
 * 
 * @example
 * // Usar al final de todas las rutas
 * app.use(notFound);
 * app.use(errorHandler);
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function notFound(req, res, next) {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  
  // Log de ruta no encontrada
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl} desde IP: ${req.ip}`);
  
  next(error);
}

/**
 * Middleware principal para manejo de errores
 * 
 * @function errorHandler
 * @description Middleware centralizado que procesa todos los errores de la aplicación,
 * los clasifica por tipo y devuelve respuestas apropiadas con logging detallado
 * 
 * @param {Error} err - Objeto de error capturado
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar (no utilizada aquí)
 * 
 * @returns {void} Respuesta JSON con información del error
 * 
 * @example
 * // Error de validación
 * // Response: { success: false, error: "VALIDATION_ERROR", message: "...", details: [...] }
 * 
 * // Error de base de datos
 * // Response: { success: false, error: "DATABASE_ERROR", message: "..." }
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log del error con contexto
  logError(err, req);

  // Error de validación de Sequelize
  if (err instanceof ValidationError) {
    const message = 'Error de validación de datos';
    const details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));

    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message,
      details
    });
  }

  // Error de constrainte único (email duplicado, etc.)
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'campo';
    const message = `El ${field} ya está en uso`;

    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message,
      field
    });
  }

  // Error general de base de datos
  if (err instanceof DatabaseError) {
    const message = process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error de base de datos';

    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_INVALID',
      message: 'Token de acceso inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Token de acceso expirado'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'JSON malformado en el cuerpo de la petición'
    });
  }

  // Error de multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'FILE_TOO_LARGE',
      message: 'El archivo es demasiado grande'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'TOO_MANY_FILES',
      message: 'Demasiados archivos'
    });
  }

  // Errores personalizados con código de estado
  if (err.status || err.statusCode) {
    const statusCode = err.status || err.statusCode;
    const errorCode = err.code || 'CUSTOM_ERROR';
    
    return res.status(statusCode).json({
      success: false,
      error: errorCode,
      message: err.message || 'Error personalizado'
    });
  }

  // Errores específicos de negocio
  if (err.code) {
    const statusCodes = {
      'USER_NOT_FOUND': 404,
      'INVALID_CREDENTIALS': 401,
      'ACCESS_DENIED': 403,
      'RESOURCE_NOT_FOUND': 404,
      'BUSINESS_RULE_VIOLATION': 400,
      'EXTERNAL_SERVICE_ERROR': 502
    };

    const statusCode = statusCodes[err.code] || 400;

    return res.status(statusCode).json({
      success: false,
      error: err.code,
      message: err.message
    });
  }

  // Error interno del servidor (por defecto)
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
}

/**
 * Registra errores con contexto detallado
 * 
 * @function logError
 * @description Registra errores con información de contexto para debugging
 * y análisis posterior
 * 
 * @param {Error} err - Error a registrar
 * @param {Object} req - Objeto de petición Express con contexto
 * 
 * @returns {void}
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function logError(err, req) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      status: err.status || err.statusCode,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? '[PRESENTE]' : '[AUSENTE]'
      },
      body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
      params: req.params,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress
    },
    user: req.user ? {
      id: req.user.id,
      email: req.user.email
    } : null
  };

  // Log diferente según el tipo de error
  if (err.status >= 400 && err.status < 500) {
    // Errores del cliente (4xx)
    console.log('⚠️ Error del cliente:', JSON.stringify(errorInfo, null, 2));
  } else {
    // Errores del servidor (5xx) o sin status
    console.error('❌ Error del servidor:', JSON.stringify(errorInfo, null, 2));
  }
}

/**
 * Sanitiza el cuerpo de la petición para logging
 * 
 * @function sanitizeRequestBody
 * @description Elimina campos sensibles del cuerpo de la petición
 * antes de hacer log
 * 
 * @param {Object} body - Cuerpo de la petición
 * 
 * @returns {Object} Cuerpo sanitizado
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'confirmPassword', 'token', 'secret', 'key'];
  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[OCULTO]';
    }
  });

  return sanitized;
}

/**
 * Middleware para validar JSON en el cuerpo de peticiones
 * 
 * @function validateJSON
 * @description Middleware que valida que el JSON en el cuerpo sea válido
 * 
 * @param {Error} err - Error de parsing JSON
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {void} Continúa al siguiente middleware o retorna error
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function validateJSON(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'JSON malformado en el cuerpo de la petición',
      details: {
        position: err.body,
        received: req.get('Content-Type')
      }
    });
  }
  next(err);
}

/**
 * Middleware para manejar errores asíncronos
 * 
 * @function asyncHandler
 * @description Wrapper para funciones asíncronas que maneja automáticamente
 * los errores y los pasa al middleware de manejo de errores
 * 
 * @param {Function} fn - Función asíncrona a envolver
 * 
 * @returns {Function} Función middleware que maneja errores automáticamente
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Crea un error personalizado con código y status
 * 
 * @function createError
 * @description Factory function para crear errores estructurados
 * 
 * @param {string} message - Mensaje del error
 * @param {number} [status=500] - Código de estado HTTP
 * @param {string} [code] - Código de error personalizado
 * @param {Object} [details] - Detalles adicionales del error
 * 
 * @returns {Error} Error estructurado
 * 
 * @example
 * throw createError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function createError(message, status = 500, code = null, details = null) {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  if (code) error.code = code;
  if (details) error.details = details;
  return error;
}

/**
 * Middleware para rate limiting con manejo de errores
 * 
 * @function rateLimitErrorHandler
 * @description Maneja errores específicos de rate limiting
 * 
 * @param {Error} err - Error de rate limiting
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 * 
 * @returns {void} Respuesta de error o continúa
 * 
 * @since 1.0.0
 * @author ITR Team
 */
function rateLimitErrorHandler(err, req, res, next) {
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas peticiones, intenta más tarde',
      retry_after: err.retryAfter || 60
    });
  }
  next(err);
}

module.exports = {
  notFound,
  errorHandler,
  validateJSON,
  asyncHandler,
  createError,
  rateLimitErrorHandler,
  logError
};
