# 🚀 ITR Dashboard - Guía de Inicio Rápido

## ⚡ **EJECUTAR DE UNA SOLA VEZ**

### 🎯 **Opción 1: Script Automático (Ultra Rápido)**
```bash
# Linux/macOS
./start.sh

# Windows
start.bat
```

### 🎯 **Opción 2: NPM (Configuración + Ejecución)**
```bash
# Una sola línea - configuración completa
npm run setup && npm run dev
```

### 🎯 **Opción 3: Solo Ejecutar (si ya está configurado)**
```bash
npm run dev
```

---

## ✅ **¿Qué hace la configuración automática?**

1. **📦 Instala dependencias** con las configuraciones correctas
2. **⚙️ Crea .env** automáticamente desde `env.example`
3. **🔧 Configura React** con variables necesarias (`SKIP_PREFLIGHT_CHECK`, etc.)
4. **🚀 Ejecuta backend** en `http://localhost:5000`
5. **🌐 Ejecuta frontend** en `http://localhost:3000`
6. **🔍 Verifica puertos** y libera si están ocupados

---

## 📋 **Variables de Entorno Configuradas Automáticamente**

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=itr_dashboard_secret_super_seguro_2024_desarrollo
JWT_EXPIRES_IN=24h
DB_PATH=./backend/database/app.db
```

### Frontend (frontend/.env)
```env
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=ITR Dashboard
```

---

## 🌐 **URLs del Sistema**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | http://localhost:5000 | Servidor Node.js/Express |
| **Health Check** | http://localhost:5000/health | Estado del servidor |
| **API Info** | http://localhost:5000/api/auth/info | Información de la API |
| **Frontend** | http://localhost:3000 | Aplicación React |
| **Docs** | Ver README.md | Documentación completa |

---

## 🔧 **Scripts Disponibles**

```bash
# 🚀 INICIO Y CONFIGURACIÓN
npm run setup          # Configuración completa + instalación
npm run dev            # Ejecutar desarrollo (backend + frontend)
./start.sh             # Script automático (Linux/Mac)
start.bat              # Script automático (Windows)

# 🛠️ DESARROLLO
npm run server         # Solo backend
npm run client         # Solo frontend
npm run build          # Build para producción
npm run start          # Servidor producción

# 📊 UTILIDADES
npm run status         # Verificar estado servicios
npm run test           # Tests backend + frontend
npm run lint           # Linting código

# 🧹 MANTENIMIENTO
npm run clean          # Limpiar node_modules
npm run reset          # Limpiar + reinstalar todo
```

---

## 🎨 **Características del Sistema**

### **Frontend React**
- ✅ **React 18.3.1** con hooks y componentes funcionales
- ✅ **Redux Toolkit** para gestión de estado
- ✅ **Material-UI 6.1.1** con tema personalizado ITR
- ✅ **Glass Morphism** con efectos blur y transparencias
- ✅ **Paleta ITR** exacta (#4052C4, #8036DA, #61B6DD)
- ✅ **Responsive Design** para móviles y desktop

### **Backend Node.js**
- ✅ **Express.js** con arquitectura MVC
- ✅ **SQLite3** base de datos con Sequelize ORM
- ✅ **JWT Authentication** sistema completo
- ✅ **Bcrypt** para hash de passwords
- ✅ **CORS** configurado para desarrollo
- ✅ **Rate Limiting** y middleware de seguridad

### **Funcionalidades**
- ✅ **Sistema de autenticación** completo (register, login, logout)
- ✅ **Gestión de usuarios** con CRUD completo
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Auditoría** de acciones con logs
- ✅ **Sesiones** con tokens JWT y refresh
- ✅ **API RESTful** completamente documentada

---

## 🔥 **Demo de Uso**

### 1. **Clonar y Configurar**
```bash
git clone <repo>
cd itr-dashboard-app
npm run setup
```

### 2. **Ejecutar Proyecto**
```bash
npm run dev
```

### 3. **Probar APIs**
```bash
# Health check
curl http://localhost:5000/health

# Info de autenticación
curl http://localhost:5000/api/auth/info
```

### 4. **Abrir Frontend**
```
http://localhost:3000
```

---

## 🚨 **Solución de Problemas**

### **Error: Puerto ocupado**
```bash
# El script automático los libera, pero si persiste:
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### **Error: Dependencias**
```bash
# Reinstalar todo
npm run reset
```

### **Error: React ajv/dist/compile/codegen**
```bash
# Instalar con legacy peer deps (ya incluido en scripts)
cd frontend && npm install --legacy-peer-deps
```

---

## 📚 **Próximos Pasos**

1. **📖 Leer documentación**: `README.md` y `API_DOCUMENTATION.md`
2. **🧪 Probar APIs**: Usar Postman o curl con endpoints documentados
3. **🎨 Personalizar**: Modificar componentes React y estilos
4. **🔐 Implementar login**: Conectar frontend con backend
5. **📊 Expandir dashboard**: Agregar más funcionalidades

---

## 🎯 **TL;DR - Comando Único**

```bash
npm run setup && npm run dev
```

**¡Y ya tienes el proyecto completo funcionando!** 🚀

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
