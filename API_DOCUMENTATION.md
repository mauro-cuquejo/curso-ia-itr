# 📊 ITR Dashboard API - Documentación Completa

Documentación técnica completa de la API RESTful del ITR Dashboard con ejemplos detallados, códigos de respuesta y esquemas de datos.

## 🌐 Información General

- **Base URL**: `http://localhost:5000/api`
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticación**: JWT Bearer Token
- **Versión**: 1.0.0

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. El token debe incluirse en el header `Authorization` de todas las peticiones protegidas.

### Header de Autenticación
```http
Authorization: Bearer <token_jwt>
```

### Flujo de Autenticación
1. **Registro/Login** → Obtener token JWT
2. **Incluir token** en headers de peticiones protegidas
3. **Refresh token** antes de expiración
4. **Logout** para invalidar sesión

---

# 🔑 Endpoints de Autenticación

## 📝 Registro de Usuario

**Endpoint**: `POST /api/auth/register`  
**Acceso**: Público

### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+34600000000"
}
```

### Validaciones
- **email**: Email válido, único, 5-255 caracteres
- **password**: Mínimo 6 caracteres, debe contener mayúscula, minúscula y número
- **first_name**: 1-100 caracteres, solo letras y espacios
- **last_name**: 1-100 caracteres, solo letras y espacios
- **phone**: Opcional, formato móvil español

### Response Success (201)
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+34600000000",
      "status": "active",
      "email_verified": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-16T10:30:00.000Z",
    "session_id": 1
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Datos de entrada inválidos",
  "details": [
    {
      "field": "email",
      "message": "Debe ser un email válido"
    }
  ]
}
```

### Response Error (409)
```json
{
  "success": false,
  "error": "EMAIL_EXISTS",
  "message": "Este email ya está registrado"
}
```

---

## 🔓 Login de Usuario

**Endpoint**: `POST /api/auth/login`  
**Acceso**: Público

### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "remember_me": false
}
```

### Parámetros
- **email**: Email del usuario
- **password**: Contraseña del usuario
- **remember_me**: Opcional, extiende duración del token a 7 días

### Response Success (200)
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "status": "active",
      "last_login": "2024-01-15T10:30:00.000Z",
      "profile": {
        "bio": "Perfil de Juan Pérez",
        "country": "España",
        "city": "Madrid"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-16T10:30:00.000Z",
    "session_id": 1
  }
}
```

### Response Error (401)
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Credenciales inválidas"
}
```

---

## 👤 Usuario Actual

**Endpoint**: `GET /api/auth/me`  
**Acceso**: Privado (requiere token)

### Headers
```http
Authorization: Bearer <token_jwt>
```

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+34600000000",
      "status": "active",
      "last_login": "2024-01-15T10:30:00.000Z",
      "profile": {
        "bio": "Desarrollador Full Stack",
        "birth_date": "1990-05-15",
        "country": "España",
        "city": "Madrid",
        "language": "es"
      }
    },
    "session_info": {
      "active_sessions_count": 2,
      "current_session": {
        "id": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "last_activity": "2024-01-15T12:00:00.000Z",
        "ip_address": "192.168.1.100"
      }
    }
  }
}
```

---

## 🔄 Refresh Token

**Endpoint**: `POST /api/auth/refresh`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-16T10:30:00.000Z"
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "error": "TOKEN_NOT_REFRESHABLE",
  "message": "El token aún es válido por más de 2 horas"
}
```

---

## 🚪 Logout

**Endpoint**: `POST /api/auth/logout`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## 🚪 Logout All

**Endpoint**: `POST /api/auth/logout-all`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "message": "Todas las sesiones cerradas exitosamente",
  "sessions_closed": 3
}
```

---

# 👥 Endpoints de Usuarios

## 📋 Listar Usuarios

**Endpoint**: `GET /api/users`  
**Acceso**: Privado (requiere token)

### Query Parameters
- **page**: Número de página (default: 1)
- **limit**: Elementos por página (default: 10, max: 100)
- **search**: Término de búsqueda en nombre, apellido o email
- **status**: Filtro por estado (active, inactive, suspended)
- **sort**: Campo de ordenamiento (created_at, first_name, last_name, email, last_login)
- **order**: Dirección (ASC, DESC)

### Ejemplo Request
```http
GET /api/users?page=1&limit=20&search=juan&status=active&sort=created_at&order=DESC
Authorization: Bearer <token_jwt>
```

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@example.com",
        "status": "active",
        "last_login": "2024-01-15T10:30:00.000Z",
        "created_at": "2024-01-10T09:00:00.000Z",
        "profile": {
          "bio": "Desarrollador Frontend",
          "country": "España",
          "city": "Madrid"
        },
        "active_sessions": 1,
        "is_online": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "items_per_page": 10,
      "has_next_page": true,
      "has_prev_page": false,
      "next_page": 2,
      "prev_page": null
    },
    "filters_applied": {
      "search": "juan",
      "status": "active",
      "sort": "created_at",
      "order": "DESC"
    }
  }
}
```

---

## 👤 Usuario Específico

**Endpoint**: `GET /api/users/:id`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@example.com",
      "phone": "+34600000000",
      "status": "active",
      "last_login": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-10T09:00:00.000Z",
      "profile": {
        "bio": "Desarrollador Frontend especializado en React",
        "birth_date": "1990-05-15",
        "gender": "male",
        "country": "España",
        "city": "Madrid",
        "language": "es"
      }
    },
    "sessions": [
      {
        "id": 1,
        "ip_address": "192.168.1.100",
        "created_at": "2024-01-15T10:30:00.000Z",
        "last_activity": "2024-01-15T12:00:00.000Z",
        "expires_at": "2024-01-16T10:30:00.000Z",
        "time_remaining_minutes": 1350,
        "is_valid": true
      }
    ],
    "stats": {
      "total_sessions": 15,
      "active_sessions": 1,
      "days_since_registration": 5,
      "last_login_days_ago": 0
    }
  }
}
```

### Response Error (404)
```json
{
  "success": false,
  "error": "USER_NOT_FOUND",
  "message": "Usuario no encontrado"
}
```

---

## ➕ Crear Usuario

**Endpoint**: `POST /api/users`  
**Acceso**: Privado (requiere rol admin)

### Request Body
```json
{
  "email": "nuevo@example.com",
  "password": "Password123",
  "first_name": "Ana",
  "last_name": "García",
  "phone": "+34600000000",
  "status": "active"
}
```

### Response Success (201)
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "user": {
      "id": 2,
      "email": "nuevo@example.com",
      "first_name": "Ana",
      "last_name": "García",
      "phone": "+34600000000",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## ✏️ Actualizar Usuario

**Endpoint**: `PUT /api/users/:id`  
**Acceso**: Privado (requiere ser propietario o admin)

### Request Body
```json
{
  "first_name": "Juan Carlos",
  "phone": "+34600000001",
  "status": "active"
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "juan@example.com",
      "first_name": "Juan Carlos",
      "last_name": "Pérez",
      "phone": "+34600000001",
      "status": "active",
      "updated_at": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

---

## ❌ Eliminar Usuario

**Endpoint**: `DELETE /api/users/:id`  
**Acceso**: Privado (requiere rol admin)

### Response Success (200)
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## 🔍 Buscar Usuarios

**Endpoint**: `GET /api/users/search`  
**Acceso**: Privado (requiere token)

### Query Parameters
- **q**: Término de búsqueda general
- **status**: Filtro por estado
- **country**: Filtro por país
- **city**: Filtro por ciudad
- **online**: Solo usuarios online (true/false)

### Ejemplo Request
```http
GET /api/users/search?q=juan&status=active&country=España&online=true
Authorization: Bearer <token_jwt>
```

---

# 📊 Endpoints del Dashboard

## 📈 Estadísticas Generales

**Endpoint**: `GET /api/dashboard/stats`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 142,
      "inactive": 5,
      "suspended": 3,
      "online": 12,
      "new_today": 3,
      "new_this_week": 15,
      "new_this_month": 47,
      "growth_rate": 12.5
    },
    "sessions": {
      "active_sessions": 18,
      "online_users": 12,
      "recent_logins_24h": 25
    },
    "activity": {
      "daily_activity": [
        {
          "date": "2024-01-15",
          "activity_count": 45
        }
      ],
      "users_by_country": [
        {
          "country": "España",
          "count": 89
        },
        {
          "country": "México",
          "count": 34
        }
      ]
    },
    "generated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## 👥 Usuarios Conectados

**Endpoint**: `GET /api/dashboard/users`  
**Acceso**: Privado (requiere token)

### Query Parameters
- **limit**: Límite de resultados (default: 20, max: 50)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "online_users": [
      {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "last_login": "2024-01-15T10:30:00.000Z",
        "location": "Madrid, España",
        "session_info": {
          "ip_address": "192.168.1.100",
          "last_activity": "2024-01-15T12:00:00.000Z",
          "session_duration": 90,
          "expires_in": 1350
        },
        "total_active_sessions": 1
      }
    ],
    "total_online": 12,
    "showing": 12,
    "generated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## 📋 Actividad Reciente

**Endpoint**: `GET /api/dashboard/activity`  
**Acceso**: Privado (requiere token)

### Query Parameters
- **limit**: Límite de resultados (default: 50, max: 100)
- **type**: Tipo de actividad (login, register, user_updates, profile_updates)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "type": "user_login",
        "description": "Usuario inició sesión",
        "details": {},
        "user": {
          "id": 1,
          "name": "Juan Pérez",
          "email": "juan@example.com"
        },
        "target_record": {
          "table": "users",
          "record_id": 1
        },
        "metadata": {
          "ip_address": "192.168.1.100",
          "user_agent": {
            "browser": "Chrome",
            "os": "macOS"
          }
        },
        "timestamp": "2024-01-15T12:00:00.000Z",
        "time_ago": "Hace 5 minutos"
      }
    ],
    "total_shown": 25,
    "filters_applied": {
      "type": "all",
      "limit": 50
    },
    "generated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## ⚙️ Métricas del Sistema

**Endpoint**: `GET /api/dashboard/system-metrics`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "database": {
      "total_users": 150,
      "total_sessions": 245,
      "total_audit_logs": 1250,
      "expired_sessions_to_cleanup": 12
    },
    "sessions": {
      "average_duration_minutes": 180,
      "sessions_by_ip": [
        {
          "ip_address": "192.168.1.100",
          "session_count": 5
        }
      ],
      "total_sessions_24h": 45
    },
    "api": {
      "requests_24h": 1250,
      "hourly_distribution": [
        {
          "hour": 10,
          "count": 125
        }
      ],
      "peak_hour": {
        "hour": 14,
        "count": 180
      }
    },
    "system": {
      "uptime_hours": 72,
      "memory_usage": {
        "rss": 52428800,
        "heapTotal": 29360128,
        "heapUsed": 15023456
      },
      "node_version": "v20.17.0",
      "environment": "development"
    },
    "generated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

# 🔧 Gestión de Perfiles

## 👤 Obtener Perfil

**Endpoint**: `GET /api/users/:id/profile`  
**Acceso**: Privado (requiere ser propietario o admin)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "user_id": 1,
      "bio": "Desarrollador Full Stack especializado en React y Node.js",
      "birth_date": "1990-05-15",
      "gender": "male",
      "country": "España",
      "city": "Madrid",
      "timezone": "Europe/Madrid",
      "language": "es",
      "phone_alt": "+34600000001",
      "website": "https://juanperez.dev",
      "social_links": {
        "linkedin": "https://linkedin.com/in/juanperez",
        "github": "https://github.com/juanperez"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        },
        "privacy": {
          "profile_visibility": "public",
          "show_email": false,
          "show_phone": false
        },
        "theme": {
          "mode": "auto",
          "color_scheme": "itr"
        }
      },
      "created_at": "2024-01-10T09:00:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@example.com"
      }
    },
    "completion_percentage": 85,
    "is_complete": true
  }
}
```

---

## ✏️ Actualizar Perfil

**Endpoint**: `PUT /api/users/:id/profile`  
**Acceso**: Privado (requiere ser propietario o admin)

### Request Body
```json
{
  "bio": "Nueva biografía actualizada",
  "country": "España",
  "city": "Barcelona",
  "language": "es",
  "website": "https://nuevositio.com",
  "preferences": {
    "notifications": {
      "email": false,
      "push": true
    },
    "theme": {
      "mode": "dark"
    }
  }
}
```

### Response Success (200)
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "profile": {
      "id": 1,
      "bio": "Nueva biografía actualizada",
      "country": "España",
      "city": "Barcelona",
      "language": "es",
      "website": "https://nuevositio.com",
      "updated_at": "2024-01-15T12:30:00.000Z"
    },
    "completion_percentage": 90
  }
}
```

---

# 📊 Estadísticas y Métricas

## 📈 Resumen de Usuarios

**Endpoint**: `GET /api/users/stats/summary`  
**Acceso**: Privado (requiere token)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_users": 150,
      "active_users": 142,
      "online_users": 12,
      "new_users_this_month": 47,
      "inactive_users": 8
    },
    "demographics": {
      "gender": [
        {
          "gender": "male",
          "count": 89
        },
        {
          "gender": "female",
          "count": 53
        }
      ],
      "countries": [
        {
          "country": "España",
          "count": 89
        },
        {
          "country": "México",
          "count": 34
        }
      ],
      "languages": [
        {
          "language": "es",
          "count": 120
        },
        {
          "language": "en",
          "count": 30
        }
      ]
    },
    "generated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

---

# 🔒 Códigos de Estado HTTP

## Códigos de Éxito
- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente

## Códigos de Error del Cliente
- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Permisos insuficientes
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: email duplicado)
- **422 Unprocessable Entity**: Error de validación
- **429 Too Many Requests**: Rate limit excedido

## Códigos de Error del Servidor
- **500 Internal Server Error**: Error interno del servidor
- **502 Bad Gateway**: Error de servicio externo
- **503 Service Unavailable**: Servicio no disponible

---

# 🔍 Códigos de Error Específicos

## Autenticación
- `TOKEN_MISSING`: No se proporcionó token
- `TOKEN_INVALID`: Token malformado o inválido
- `TOKEN_EXPIRED`: Token expirado
- `INVALID_CREDENTIALS`: Credenciales incorrectas
- `USER_INACTIVE`: Usuario inactivo
- `SESSION_INVALID`: Sesión inválida o expirada

## Validación
- `VALIDATION_ERROR`: Error de validación de datos
- `EMAIL_EXISTS`: Email ya registrado
- `INVALID_USER_ID`: ID de usuario inválido
- `DUPLICATE_ENTRY`: Entrada duplicada

## Autorización
- `INSUFFICIENT_PERMISSIONS`: Permisos insuficientes
- `ACCESS_DENIED`: Acceso denegado
- `CANNOT_DELETE_SELF`: No se puede eliminar a sí mismo

## Recursos
- `USER_NOT_FOUND`: Usuario no encontrado
- `PROFILE_NOT_FOUND`: Perfil no encontrado
- `SESSION_NOT_FOUND`: Sesión no encontrada

---

# 🛠️ Rate Limiting

## Límites por Defecto
- **General**: 100 requests por 15 minutos por IP
- **Login**: 5 intentos por 15 minutos por IP
- **Registro**: 3 registros por hora por IP

## Headers de Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Respuesta de Rate Limit (429)
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Demasiadas peticiones, intenta más tarde",
  "retry_after": 900
}
```

---

# 🔧 Filtros y Paginación

## Parámetros de Paginación
- **page**: Número de página (mínimo: 1)
- **limit**: Elementos por página (mínimo: 1, máximo: 100)

## Parámetros de Ordenamiento
- **sort**: Campo de ordenamiento
- **order**: Dirección (ASC, DESC)

## Parámetros de Filtro
- **search**: Búsqueda de texto
- **status**: Filtro por estado
- **country**: Filtro por país
- **city**: Filtro por ciudad

## Formato de Respuesta Paginada
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 95,
      "items_per_page": 10,
      "has_next_page": true,
      "has_prev_page": false,
      "next_page": 2,
      "prev_page": null
    }
  }
}
```

---

# 📝 Ejemplos con cURL

## Registro
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

## Obtener usuarios
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <token_jwt>"
```

## Crear usuario
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_jwt>" \
  -d '{
    "email": "nuevo@example.com",
    "password": "Password123",
    "first_name": "Nuevo",
    "last_name": "Usuario"
  }'
```

---

# 🐛 Troubleshooting

## Problemas Comunes

### Token Expirado
```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "Token expirado"
}
```
**Solución**: Usar endpoint `/api/auth/refresh` o hacer login nuevamente.

### Permisos Insuficientes
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "Permisos insuficientes para esta acción"
}
```
**Solución**: Verificar que el usuario tenga los permisos necesarios.

### Rate Limit Excedido
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Demasiadas peticiones, intenta más tarde"
}
```
**Solución**: Esperar el tiempo indicado en `retry_after`.

---

# 📞 Soporte

Para consultas sobre la API:
- **Email**: api-support@itr.com
- **Documentación**: GitHub Wiki
- **Issues**: GitHub Issues

---

**API ITR Dashboard v1.0.0** - Documentación completa y actualizada 🚀
