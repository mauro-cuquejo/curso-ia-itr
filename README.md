# ITR Dashboard App

Sistema completo de gestión de usuarios con autenticación JWT, dashboard administrativo y diseño glass morphism con paleta de colores ITR.

## 🎯 Características Principales

- ✅ **Backend Node.js** con Express y arquitectura MVC
- ✅ **Frontend React** con Redux Toolkit y Material-UI
- ✅ **Base de datos SQLite** con Sequelize ORM
- ✅ **Autenticación JWT** completa con sesiones
- ✅ **Glass Morphism** con paleta ITR corporativa
- ✅ **CRUD usuarios** completo con auditoría
- ✅ **Dashboard en tiempo real** con estadísticas
- ✅ **API RESTful** documentada
- ✅ **Responsive design** optimizado

## 🛠️ Tecnologías

### Backend
- **Node.js**: 20.17.0 LTS
- **Express**: 4.19.2
- **Sequelize**: 6.37.3
- **SQLite3**: 5.1.7
- **JWT**: 9.0.2
- **Bcrypt**: 2.4.3

### Frontend
- **React**: 18.3.1
- **Redux Toolkit**: 2.2.7
- **Material-UI**: 6.1.1
- **Framer Motion**: 11.11.1
- **Axios**: 1.7.7

## 🎨 Paleta de Colores ITR

```css
/* Colores Principales */
--primary-blue: #4052C4;     /* Azul principal ITR */
--primary-purple: #8036DA;   /* Morado principal ITR */
--primary-light: #61B6DD;    /* Azul claro ITR */

/* Glass Effect */
--glass-bg: rgba(64, 82, 196, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-backdrop: blur(10px);
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20.17.0 LTS (recomendado, funciona con versiones superiores)
- npm 10.8.2 (o superior)

### 🎯 **INICIO RÁPIDO (Configuración Automática)**

#### **Opción 1: Script Automático (Recomendado)**
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

#### **Opción 2: NPM Scripts**
```bash
# Configuración completa automática
npm run setup

# Ejecutar proyecto (crea .env automáticamente)
npm run dev
```

### 📋 **Instalación Manual (si prefieres paso a paso)**

#### 1. Instalar Dependencias
```bash
# Todas las dependencias con configuración automática
npm run install-all

# O instalar por separado:
cd backend && npm install
cd frontend && npm install --legacy-peer-deps
```

#### 2. Configurar Variables de Entorno
```bash
# Automático: copiar configuración de desarrollo
cp env.example .env

# Manual: editar .env con tus configuraciones personalizadas
```

#### 3. Ejecutar Proyecto
```bash
# Desarrollo (Backend + Frontend simultáneo)
npm run dev

# Solo Backend
npm run server

# Solo Frontend  
npm run client

# Verificar estado
npm run status
```

### 🔧 **Scripts Disponibles**

```bash
# Configuración y ejecución
npm run setup          # Instalación completa + configuración
npm run dev            # Ejecutar desarrollo (backend + frontend)
npm run server         # Solo backend
npm run client         # Solo frontend

# Utilidades
npm run build          # Build para producción
npm run start          # Servidor producción
npm run test           # Tests backend + frontend
npm run lint           # Linting código
npm run status         # Verificar estado servicios

# Mantenimiento
npm run clean          # Limpiar node_modules
npm run reset          # Limpiar + reinstalar todo
```

### ⚡ **Configuración Automática de .env**

El proyecto incluye configuración automática que:

- ✅ **Crea .env** automáticamente desde `env.example`
- ✅ **Configura frontend** con variables React necesarias
- ✅ **Instala dependencias** con flags correctos
- ✅ **Verifica puertos** y libera si están ocupados
- ✅ **Inicia servicios** en orden correcto

**Variables configuradas automáticamente:**
```env
# Backend
PORT=5000
NODE_ENV=development
JWT_SECRET=itr_dashboard_secret_super_seguro_2024_desarrollo

# Frontend  
REACT_APP_API_URL=http://localhost:5000/api
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
```

## 📁 Estructura del Proyecto

```
itr-dashboard-app/
├── backend/                     # Servidor Node.js
│   ├── controllers/            # Controladores MVC
│   │   ├── authController.js   # Autenticación
│   │   ├── userController.js   # Gestión usuarios
│   │   └── dashboardController.js # Dashboard
│   ├── models/                 # Modelos Sequelize
│   │   ├── User.js            # Modelo usuario
│   │   ├── UserSession.js     # Sesiones
│   │   ├── UserProfile.js     # Perfiles
│   │   └── AuditLog.js        # Auditoría
│   ├── routes/                # Rutas Express
│   │   ├── auth.js           # Rutas autenticación
│   │   ├── users.js          # Rutas usuarios
│   │   └── dashboard.js      # Rutas dashboard
│   ├── middleware/           # Middleware custom
│   │   ├── authMiddleware.js # Autenticación
│   │   └── errorMiddleware.js # Manejo errores
│   ├── database/            # Configuración DB
│   │   └── connection.js    # Conexión SQLite
│   ├── config/              # Configuraciones
│   │   └── server.js        # Config servidor
│   └── server.js            # Punto entrada
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── common/     # Componentes comunes
│   │   │   ├── auth/       # Componentes auth
│   │   │   └── dashboard/  # Componentes dashboard
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── store/          # Redux store
│   │   │   ├── slices/     # Redux slices
│   │   │   └── api/        # RTK Query APIs
│   │   ├── services/       # Servicios HTTP
│   │   ├── styles/         # Estilos y tema
│   │   └── utils/          # Utilidades
│   └── public/             # Archivos públicos
├── env.example             # Variables de entorno
├── package.json           # Scripts principales
└── README.md             # Documentación
```

## 🔐 API Endpoints

### Autenticación
```
POST   /api/auth/register    # Registro usuario
POST   /api/auth/login       # Login usuario  
POST   /api/auth/logout      # Logout usuario
GET    /api/auth/me          # Usuario actual
POST   /api/auth/refresh     # Refresh token
```

### Usuarios
```
GET    /api/users            # Listar usuarios
GET    /api/users/:id        # Usuario específico
POST   /api/users            # Crear usuario
PUT    /api/users/:id        # Actualizar usuario
DELETE /api/users/:id        # Eliminar usuario
GET    /api/users/search     # Buscar usuarios
```

### Dashboard
```
GET    /api/dashboard/stats     # Estadísticas generales
GET    /api/dashboard/users     # Usuarios conectados
GET    /api/dashboard/activity  # Actividad reciente
```

## 📊 Base de Datos

### Tablas Principales
- **users**: Información básica de usuarios
- **user_profiles**: Perfiles extendidos
- **user_sessions**: Sesiones JWT activas
- **audit_logs**: Registro de auditoría

### Características
- **Soft delete** para usuarios
- **Auditoría completa** de cambios
- **Sesiones múltiples** por usuario
- **Versionado optimista** de registros

## 🎨 Diseño Glass Morphism

### Características del Diseño
- **Transparencias** con backdrop-filter
- **Bordes sutiles** con gradientes
- **Sombras suaves** multicapa
- **Animaciones fluidas** con Framer Motion
- **Responsive** para todos los dispositivos

### Componentes Glass
- Cards con efecto cristal
- Sidebar translúcido
- Modales con overlay blur
- Botones con gradientes ITR
- Inputs con transparencia

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend + Backend
npm run server          # Solo backend
npm run client          # Solo frontend

# Producción
npm run build           # Build frontend
npm start              # Servidor producción

# Utilidades
npm run install-all    # Instalar todo
npm run clean         # Limpiar node_modules
npm run reset         # Limpiar + reinstalar

# Backend específico
cd backend
npm run dev           # Desarrollo con nodemon
npm run start         # Producción
npm run lint          # ESLint
npm run test          # Tests

# Frontend específico  
cd frontend
npm start            # Desarrollo
npm run build        # Build producción
npm run lint         # ESLint
npm run test         # Tests React
```

## 🧪 Testing

### Backend
```bash
cd backend
npm test              # Jest + Supertest
npm run test:watch   # Watch mode
npm run test:coverage # Cobertura
```

### Frontend
```bash
cd frontend
npm test              # React Testing Library
npm run test:coverage # Cobertura
```

## 🚀 Deployment

### Build Producción
```bash
# Build frontend
npm run build

# El build se crea en frontend/build/
# Servir archivos estáticos desde backend
```

### Variables Producción
```env
NODE_ENV=production
JWT_SECRET=tu_jwt_super_secreto_produccion
PORT=5000
FRONTEND_URL=https://tu-dominio.com
```

## 📝 Logging y Auditoría

### Características
- **Logs estructurados** con contexto
- **Auditoría completa** de operaciones CRUD
- **Tracking** de sesiones y logins
- **Middleware** de logging personalizado
- **Rotación** de logs en producción

### Tipos de Logs
- Autenticación y autorización
- Operaciones CRUD en usuarios
- Errores y excepciones
- Métricas de performance
- Actividad de API

## 🔒 Seguridad

### Medidas Implementadas
- **Bcrypt** para hash de passwords
- **JWT** con expiración configurable
- **Rate limiting** por IP y usuario
- **CORS** configurado
- **Headers** de seguridad (Helmet)
- **Validación** de inputs
- **Sanitización** de datos
- **Auditoría** completa

### Configuración JWT
- Tokens con expiración de 24h
- Refresh tokens disponibles
- Invalidación de sesiones
- Múltiples sesiones por usuario
- Cleanup automático de tokens expirados

## 📈 Monitoreo

### Métricas Disponibles
- Usuarios activos/conectados
- Sesiones por IP
- Actividad por hora/día
- Estadísticas de API
- Performance de base de datos
- Métricas de memoria y CPU

### Dashboard Analytics
- Gráficos en tiempo real
- Estadísticas de crecimiento
- Actividad de usuarios
- Distribución geográfica
- Métricas de sistema

## 🤝 Contribución

### Estándares de Código
- **ESLint** configurado
- **Prettier** para formateo
- **Commits** descriptivos
- **JSDoc** para documentación
- **CommonJS** para backend
- **ES Modules** para frontend

### Workflow
1. Fork del repositorio
2. Crear branch feature
3. Commits con descripción clara
4. Tests pasando
5. Pull request con descripción

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 👥 Equipo ITR

Desarrollado por el equipo ITR con las mejores prácticas de desarrollo web moderno.

---

## 🆘 Troubleshooting

### Problemas Comunes

#### Error de conexión a base de datos
```bash
# Verificar permisos de directorio
chmod 755 backend/database/
```

#### Puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3001
```

#### Dependencias incompatibles
```bash
# Reset completo
npm run reset
```

#### Token expirado
```bash
# Limpiar localStorage
localStorage.clear()
```

### Contacto y Soporte

Para soporte técnico o consultas sobre el proyecto:
- Email: soporte@itr.com
- Documentación: Ver carpeta `/docs`
- Issues: GitHub Issues

---

**¡Proyecto ITR Dashboard listo para desarrollo y producción!** 🚀
