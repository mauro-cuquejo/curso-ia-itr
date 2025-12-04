# PROMPT PARA DESARROLLO DE APLICACIÓN COMPLETA ITR

## 🎯 OBJETIVO GENERAL
Desarrollar una aplicación web completa con React.js y Node.js que incluya sistema de autenticación, dashboard de usuarios y estilo corporativo ITR con efectos glass modernos.

## 🚨 ADVERTENCIA CRÍTICA - VERSIONES FIJAS
**⚠️ EXTREMADAMENTE IMPORTANTE:**
- **TODAS** las librerías deben instalarse con versiones **EXACTAS**
- **NUNCA** usar caret `^` ni tilde `~` en package.json
- Las versiones especificadas son las **más actuales y compatibles** entre sí
- Esto es **CRÍTICO** para la estabilidad del proyecto
- **NO NEGOCIABLE**: Seguir las versiones exactas proporcionadas

### 🔒 RAZONES CRÍTICAS:
1. **Estabilidad garantizada** entre todas las dependencias
2. **Reproducibilidad exacta** en todos los entornos
3. **Evitar breaking changes** automáticos
4. **Compatibilidad verificada** entre todas las librerías
5. **Control total** sobre actualizaciones

---

## 🔮 FRONTEND - REACT.JS

### 📋 REQUERIMIENTOS TÉCNICOS
- **Framework:** React.js (última versión LTS)
- **Gestor de Estado:** Redux Toolkit con RTK Query
- **HTTP Client:** Axios para peticiones HTTP
- **Hooks:** React Hooks personalizados y de Redux
- **UI Framework:** Material-UI (MUI) v5
- **Estilo:** Glass morphism con paleta ITR

### 🚨 VERSIONES FIJAS CRÍTICAS - FRONTEND
**⚠️ IMPORTANTÍSIMO: Usar versiones EXACTAS sin ^ ni ~ para máxima estabilidad**

```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-scripts": "5.0.1",
    "@reduxjs/toolkit": "2.2.7",
    "react-redux": "9.1.2",
    "redux": "5.0.1",
    "axios": "1.7.7",
    "@mui/material": "6.1.1",
    "@mui/icons-material": "6.1.1",
    "@mui/lab": "6.0.0-beta.10",
    "@mui/x-data-grid": "7.18.0",
    "@emotion/react": "11.13.3",
    "@emotion/styled": "11.13.0",
    "react-router-dom": "6.26.2",
    "react-hook-form": "7.53.0",
    "yup": "1.4.0",
    "@hookform/resolvers": "3.9.0",
    "framer-motion": "11.11.1",
    "date-fns": "4.1.0"
  },
  "devDependencies": {
    "@types/react": "18.3.8",
    "@types/react-dom": "18.3.0",
    "typescript": "5.6.2",
    "@testing-library/react": "16.0.1",
    "@testing-library/jest-dom": "6.5.0",
    "@testing-library/user-event": "14.5.2",
    "eslint": "8.57.1",
    "prettier": "3.3.3"
  }
}
```

**🔐 INSTALACIÓN EXACTA:**
```bash
npm install react@18.3.1 react-dom@18.3.1 react-scripts@5.0.1 @reduxjs/toolkit@2.2.7 react-redux@9.1.2 redux@5.0.1 axios@1.7.7 @mui/material@6.1.1 @mui/icons-material@6.1.1 @mui/lab@6.0.0-beta.10 @mui/x-data-grid@7.18.0 @emotion/react@11.13.3 @emotion/styled@11.13.0 react-router-dom@6.26.2 react-hook-form@7.53.0 yup@1.4.0 @hookform/resolvers@3.9.0 framer-motion@11.11.1 date-fns@4.1.0
```

### 🎨 PALETA DE COLORES ITR
```css
/* Colores Principales */
--primary-blue: #4052C4;     /* Azul principal ITR */
--primary-purple: #8036DA;   /* Morado principal ITR */
--primary-light: #61B6DD;    /* Azul claro ITR */

/* Colores Secundarios */
--secondary-1: #7482DE;
--secondary-2: #2B3B9B;
--secondary-3: #AB6EF4;
--secondary-4: #5A1FA3;
--secondary-5: #A0DAF4;
--secondary-6: #408FB4;

/* Glass Effect Variables */
--glass-bg: rgba(64, 82, 196, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-backdrop: blur(10px);
```

### 🖥️ PANTALLAS A DESARROLLAR

#### 1. **LOGIN**
```
CARACTERÍSTICAS:
- Formulario con email y password
- Validación en tiempo real
- Loading states con Material UI
- Glass card effect
- Gradiente de fondo con colores ITR
- Animaciones suaves
- Responsive design
- Manejo de errores elegante
```

#### 2. **DASHBOARD**
```
CARACTERÍSTICAS:
- Header con información del usuario logueado
- Sidebar de navegación con glass effect
- Tabla/Grid de usuarios registrados
- Funcionalidades:
  * Listado paginado de usuarios
  * Búsqueda y filtros
  * Información de última conexión
  * Estados online/offline
- Cards con glass morphism
- Gráficos/estadísticas básicas
- Logout functionality
```

### 🏗️ ARQUITECTURA FRONTEND
```
src/
├── components/
│   ├── common/
│   │   ├── GlassCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Layout.jsx
│   ├── auth/
│   │   └── LoginForm.jsx
│   └── dashboard/
│       ├── UserTable.jsx
│       ├── UserCard.jsx
│       └── StatsCards.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useUsers.js
│   └── useGlassEffect.js
├── store/
│   ├── index.js
│   ├── slices/
│   │   ├── authSlice.js
│   │   └── usersSlice.js
│   └── api/
│       └── apiSlice.js
├── services/
│   └── axiosConfig.js
├── styles/
│   ├── theme.js
│   ├── glassStyles.js
│   └── globalStyles.css
└── utils/
    ├── constants.js
    └── helpers.js
```

### 🎭 ESTILO GLASS MORPHISM
```css
ESPECIFICACIONES:
- Fondo semi-transparente con blur
- Bordes sutiles con gradientes
- Sombras suaves y profundidad
- Efectos hover elegantes
- Transiciones fluidas
- Paleta ITR integrada
- Responsive breakpoints
```

### 🔗 HOOKS PERSONALIZADOS REQUERIDOS
```javascript
// useAuth.js - Manejo de autenticación
// useUsers.js - Gestión de usuarios
// useGlassEffect.js - Efectos glass dinámicos
// useLocalStorage.js - Persistencia local
```

---

## ⚙️ BACKEND - NODE.JS

### 📋 REQUERIMIENTOS TÉCNICOS
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Base de Datos:** SQLite3 (en memoria y persistente)
- **Arquitectura:** MVC (Model-View-Controller)
- **ORM:** Sequelize para SQLite
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** express-validator
- **Cors:** cors middleware

### 🚨 VERSIONES FIJAS CRÍTICAS - BACKEND
**⚠️ IMPORTANTÍSIMO: Usar versiones EXACTAS sin ^ ni ~ para máxima estabilidad**

```json
{
  "dependencies": {
    "express": "4.19.2",
    "sequelize": "6.37.3",
    "sqlite3": "5.1.7",
    "bcryptjs": "2.4.3",
    "jsonwebtoken": "9.0.2",
    "cors": "2.8.5",
    "helmet": "7.1.0",
    "express-validator": "7.2.0",
    "express-rate-limit": "7.4.0",
    "morgan": "1.10.0",
    "dotenv": "16.4.5",
    "compression": "1.7.4",
    "cookie-parser": "1.4.6",
    "multer": "1.4.5-lts.1",
    "express-session": "1.18.0",
    "uuid": "10.0.0"
  },
  "devDependencies": {
    "nodemon": "3.1.4",
    "jest": "29.7.0",
    "supertest": "7.0.0",
    "@types/node": "22.7.4",
    "eslint": "8.57.1",
    "prettier": "3.3.3",
    "concurrently": "9.0.1"
  },
  "engines": {
    "node": "20.17.0",
    "npm": "10.8.2"
  }
}
```

**🔐 INSTALACIÓN EXACTA BACKEND:**
```bash
npm install express@4.19.2 sequelize@6.37.3 sqlite3@5.1.7 bcryptjs@2.4.3 jsonwebtoken@9.0.2 cors@2.8.5 helmet@7.1.0 express-validator@7.2.0 express-rate-limit@7.4.0 morgan@1.10.0 dotenv@16.4.5 compression@1.7.4 cookie-parser@1.4.6 multer@1.4.5-lts.1 express-session@1.18.0 uuid@10.0.0
```

**🔧 DEV DEPENDENCIES:**
```bash
npm install -D nodemon@3.1.4 jest@29.7.0 supertest@7.0.0 @types/node@22.7.4 eslint@8.57.1 prettier@3.3.3 concurrently@9.0.1
```

### 🏗️ ARQUITECTURA MVC
```
backend/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── dashboardController.js
├── models/
│   ├── User.js
│   ├── UserSession.js
│   └── AuditLog.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   └── dashboard.js
├── middleware/
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   └── auditMiddleware.js
├── database/
│   ├── connection.js
│   ├── migrations/
│   └── seeders/
├── services/
│   ├── authService.js
│   ├── userService.js
│   └── auditService.js
├── utils/
│   ├── jwt.js
│   ├── bcrypt.js
│   └── validators.js
└── config/
    ├── database.js
    └── server.js
```

### 🗄️ ESTRUCTURA DE BASE DE DATOS

#### **Tabla: users**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    avatar_url VARCHAR(500),
    last_login DATETIME,
    email_verified BOOLEAN DEFAULT FALSE,
    -- Campos de Auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    version INTEGER DEFAULT 1
);
```

#### **Tabla: user_sessions**
```sql
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    -- Campos de Auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **Tabla: audit_logs**
```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    -- Campos de Auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **Tabla: user_profiles**
```sql
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT,
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'es',
    -- Campos de Auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 🔄 ENDPOINTS CRUD REQUERIDOS

#### **Autenticación**
```
POST   /api/auth/register    - Registro de usuario
POST   /api/auth/login       - Login de usuario
POST   /api/auth/logout      - Logout de usuario
POST   /api/auth/refresh     - Refresh token
GET    /api/auth/me          - Información del usuario logueado
```

#### **Gestión de Usuarios**
```
GET    /api/users            - Listar usuarios (paginado)
GET    /api/users/:id        - Obtener usuario específico
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario (soft delete)
GET    /api/users/search     - Búsqueda de usuarios
```

#### **Dashboard**
```
GET    /api/dashboard/stats     - Estadísticas generales
GET    /api/dashboard/users     - Usuarios activos/conectados
GET    /api/dashboard/activity  - Actividad reciente
```

### 🔐 MIDDLEWARE REQUERIDOS
```javascript
// authMiddleware.js - Verificación de JWT
// validationMiddleware.js - Validación de datos
// auditMiddleware.js - Registro de auditoría
// rateLimitMiddleware.js - Límite de peticiones
// corsMiddleware.js - Configuración CORS
```

### 🛡️ SEGURIDAD
```
- Bcrypt para hash de passwords
- JWT para autenticación
- Validación de inputs
- Rate limiting
- CORS configurado
- Headers de seguridad
- Sanitización de datos
```

---

## 🚀 CONFIGURACIÓN Y DESPLIEGUE

### 🚨 VERSIONES DE RUNTIME CRÍTICAS
```json
{
  "engines": {
    "node": "20.17.0",
    "npm": "10.8.2"
  }
}
```

**🔐 VERIFICACIÓN DE VERSIONES:**
```bash
# Verificar Node.js
node --version  # Debe mostrar: v20.17.0

# Verificar npm
npm --version   # Debe mostrar: 10.8.2

# Si tienes versiones diferentes, instalar Node.js 20.17.0 LTS
```

### **Scripts Package.json ROOT**
```json
{
  "name": "itr-dashboard-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && npm run dev",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start",
    "install-all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "clean": "rm -rf node_modules frontend/node_modules backend/node_modules",
    "reset": "npm run clean && npm run install-all"
  },
  "devDependencies": {
    "concurrently": "9.0.1"
  },
  "engines": {
    "node": "20.17.0",
    "npm": "10.8.2"
  }
}
```

### **Variables de Entorno**
```env
# Backend
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h
DB_PATH=./database/app.db

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=ITR Dashboard
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

### **Funcionalidad**
- [x] Sistema de login funcional
- [x] Dashboard con listado de usuarios
- [x] CRUD completo de usuarios
- [x] Autenticación JWT
- [x] Auditoría completa

### **Técnicos**
- [x] **VERSIONES FIJAS:** Todas las librerías con versiones exactas (SIN ^ ni ~)
- [x] Redux configurado correctamente
- [x] Hooks personalizados implementados
- [x] Material UI integrado
- [x] Glass morphism aplicado
- [x] Arquitectura MVC en backend
- [x] Base de datos SQLite funcional
- [x] **NODE.JS:** Versión exacta 20.17.0 LTS
- [x] **NPM:** Versión exacta 10.8.2

### **Estilo**
- [x] Paleta ITR implementada
- [x] Glass effect en todas las cards
- [x] Responsive design
- [x] Animaciones suaves
- [x] UX/UI moderno

### **Seguridad**
- [x] Passwords hasheados
- [x] JWT implementado
- [x] Validaciones de entrada
- [x] Manejo de errores
- [x] Auditoría de cambios

---

## 🎯 ENTREGABLES ESPERADOS

1. **Frontend React** con todas las funcionalidades
2. **Backend Node.js** con API completa
3. **Base de datos** SQLite configurada
4. **📚 Documentación completa** con README estructurado
5. **📝 Docstrings JSDoc** en todas las funciones para auto-documentación
6. **📊 Documentación de API** con todos los endpoints
7. **🔧 Variables de entorno** configuradas y documentadas
8. **Scripts** de despliegue
9. **Tests básicos** (opcional pero recomendado)

---

## 📚 DOCUMENTACIÓN CRÍTICA REQUERIDA

### 📖 README Estructurado y Completo
**El README debe incluir obligatoriamente:**

- **🎯 Descripción del proyecto** con badges profesionales
- **📋 Tabla de contenidos** navegable
- **✨ Características principales** destacadas
- **🚨 Versiones críticas** de todas las tecnologías
- **🛠️ Instalación paso a paso** con verificaciones
- **🚀 Comandos de ejecución** detallados
- **📁 Estructura del proyecto** completa y visual
- **🎨 Paleta de colores ITR** con códigos hex exactos
- **📊 API Endpoints** principales documentados
- **🎯 Scripts disponibles** con explicaciones
- **🐛 Troubleshooting** para problemas comunes
- **🔧 Configuración** de variables de entorno
- **🤝 Guía de contribución** y estándares

### 📝 Auto-documentación JSDoc OBLIGATORIA

**TODAS las funciones del backend deben incluir:**
```javascript
/**
 * Descripción clara y concisa de la función
 * 
 * @async
 * @function nombreFuncion
 * @description Descripción detallada de lo que hace la función,
 * incluyendo lógica de negocio y efectos secundarios
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} req.body - Datos del cuerpo de la petición
 * @param {string} req.body.campo - Descripción del campo específico
 * @param {number} [req.userId] - ID del usuario (opcional para auditoría)
 * @param {string} req.ip - Dirección IP del cliente
 * 
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Promise<void>} Respuesta JSON con estructura específica
 * 
 * @example
 * // POST /api/endpoint
 * // Body: { campo: "valor" }
 * // Response: { success: true, data: {...} }
 * 
 * @throws {400} CODIGO_ERROR - Descripción específica del error
 * @throws {401} UNAUTHORIZED - Si no está autenticado
 * @throws {500} Error interno del servidor
 * 
 * @since 1.0.0
 * @author ITR Team
 */
```

**TODOS los hooks del frontend deben incluir:**
```javascript
/**
 * Hook personalizado para funcionalidad específica
 * 
 * @function useCustomHook
 * @description Descripción detallada del hook, qué problema resuelve
 * y cómo se integra con el ecosistema de la aplicación
 * 
 * @param {Object} [options] - Opciones de configuración del hook
 * @param {boolean} [options.autoRefresh] - Si debe actualizar automáticamente
 * 
 * @returns {Object} Objeto con estados y funciones del hook
 * @returns {Array} return.data - Datos principales del hook
 * @returns {boolean} return.isLoading - Estado de carga
 * @returns {string|null} return.error - Error actual si existe
 * @returns {Function} return.refetch - Función para recargar datos
 * @returns {Function} return.reset - Función para resetear estado
 * 
 * @example
 * function Component() {
 *   const { data, isLoading, error, refetch } = useCustomHook({
 *     autoRefresh: true
 *   });
 *   
 *   if (isLoading) return <div>Cargando...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       {data.map(item => <div key={item.id}>{item.name}</div>)}
 *       <button onClick={refetch}>Refrescar</button>
 *     </div>
 *   );
 * }
 * 
 * @since 1.0.0
 * @author ITR Team
 */
```

**TODOS los componentes React deben incluir:**
```javascript
/**
 * Componente de interfaz de usuario
 * 
 * @component
 * @description Descripción del componente, su propósito y comportamiento.
 * Incluye información sobre cuándo y cómo usarlo.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos a mostrar
 * @param {Function} props.onAction - Callback para acciones
 * @param {boolean} [props.isVisible] - Si el componente es visible
 * @param {string} [props.className] - Clases CSS adicionales
 * 
 * @returns {JSX.Element} Elemento React renderizado
 * 
 * @example
 * <CustomComponent
 *   data={users}
 *   onAction={handleUserClick}
 *   isVisible={true}
 *   className="custom-style"
 * />
 * 
 * @since 1.0.0
 * @author ITR Team
 */
```

### 📊 Documentación de API COMPLETA

**Crear archivo API_DOCUMENTATION.md con:**

- **📍 Base URL** y configuración
- **🔐 Sistema de autenticación** completo
- **📋 Todos los endpoints** con ejemplos detallados
- **📥 Request examples** para cada endpoint
- **📤 Response examples** con estructuras completas
- **❌ Códigos de error** y manejo de errores
- **🔒 Rate limiting** y límites
- **📝 Headers requeridos** para cada llamada
- **🧪 Ejemplos de uso** en JavaScript/cURL
- **🔧 Configuración** de variables relevantes

### 🔧 Variables de Entorno DOCUMENTADAS

**Crear archivo env.example con:**

```env
# ========================================
# ITR Dashboard App - Variables de Entorno
# ========================================

# ===============================
# CONFIGURACIÓN DEL BACKEND
# ===============================

# Puerto del servidor backend
PORT=5000

# Entorno de ejecución (development, production, test)
NODE_ENV=development

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro_ITR_2024_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Base de datos SQLite
DB_PATH=./backend/database/app.db

# ===============================
# CONFIGURACIÓN DEL FRONTEND
# ===============================

# URL base de la API para React
REACT_APP_API_URL=http://localhost:5000/api

# Nombre de la aplicación
REACT_APP_APP_NAME=ITR Dashboard

# ===============================
# INSTRUCCIONES
# ===============================

# 1. Copia este archivo como .env
# 2. Cambia los valores según tu entorno
# 3. NUNCA commits el archivo .env
# 4. En producción, cambia todos los secrets
```

### 📋 CRITERIOS DE DOCUMENTACIÓN

**La documentación debe ser:**
- ✅ **Completa**: Cubrir todos los aspectos del proyecto
- ✅ **Clara**: Fácil de entender para cualquier desarrollador
- ✅ **Actualizada**: Reflejar el estado actual del código
- ✅ **Práctica**: Incluir ejemplos de uso reales
- ✅ **Profesional**: Nivel empresarial con formato consistente
- ✅ **Navegable**: Con índices y enlaces internos
- ✅ **Visual**: Con diagramas, badges y emojis apropiados

---

*Genera el código siguiendo exactamente estas especificaciones, **INCLUYENDO OBLIGATORIAMENTE** documentación completa con README estructurado, docstrings JSDoc en todas las funciones para auto-documentación, documentación de API completa y configuración de variables de entorno. Prioriza la funcionalidad, el estilo glass con paleta ITR, la arquitectura robusta solicitada Y la documentación completa de nivel profesional.*
