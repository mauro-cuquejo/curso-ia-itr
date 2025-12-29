# ITR Dashboard — Instrucciones para Agentes de IA

Estas pautas hacen que un agente sea productivo de inmediato en este monorepo (backend Node/Express + frontend React). Enfócate en los archivos y patrones especificados aquí; evita suposiciones fuera de lo observable.

## Panorama General
- **Arquitectura**: Monorepo con [backend/](backend) (API REST, SQLite/Sequelize) y [frontend/](frontend) (React 18 + Redux Toolkit + RTK Query + MUI).
- **Flujo**: Frontend consume API en `REACT_APP_API_URL` vía RTK Query; el backend adjunta JWT, valida entradas y expone endpoints bajo `/api/*`.
- **Puntos clave**: Health check en [backend/server.js](backend/server.js#L48-L64), CORS dev hacia `http://localhost:3000`, documentación extensa en [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Comandos de Desarrollo (no obvios)
- **Setup**: `npm run setup` crea `.env` desde [env.example](env.example) e instala deps; en Windows usa [start.bat](start.bat).
- **Dev simultáneo**: `npm run dev` ejecuta backend y frontend (requiere `.env`). En Windows, si falla por `cp`, ejecuta `npm run setup` o `start.bat` primero.
- **Solo servicios**: `npm run server` (backend), `npm run client` (frontend).
- **Utilidades**: `npm run status` (salud de servicios), `npm run reset` (limpia e instala), `npm run install-all`.

## Entorno y Configuración
- **.env raíz**: Variables backend (puerto, JWT). Se crea desde [env.example](env.example) por `setup`/`predev`.
- **Frontend .env**: En `frontend/.env` con `REACT_APP_API_URL`, `SKIP_PREFLIGHT_CHECK`, etc. Ver [QUICK_START.md](QUICK_START.md).
- **Proxy dev**: [frontend/package.json](frontend/package.json#L70) define `proxy: http://localhost:5000` para evitar CORS en dev.

## Backend — Patrones Clave
- **Entrada**: [backend/server.js](backend/server.js) crea `app`, configura seguridad (`helmet`, `rateLimit`), CORS, logging, compresión y rutas (`/api/auth`, `/api/users`, `/api/dashboard`).
- **Config central**: [backend/config/server.js](backend/config/server.js) consolida `PORT`, JWT, DB y límites.
- **Rutas/Controladores**:
  - Auth: [backend/routes/auth.js](backend/routes/auth.js) → [backend/controllers/authController.js](backend/controllers/authController.js). Validaciones con `express-validator`, middleware `authenticateToken`, `logUserActivity`.
  - Usuarios: [backend/routes/users.js](backend/routes/users.js) → [backend/controllers/userController.js](backend/controllers/userController.js). CRUD y búsqueda con validaciones de `query/param/body`.
  - Dashboard: [backend/routes/dashboard.js](backend/routes/dashboard.js) → [backend/controllers/dashboardController.js](backend/controllers/dashboardController.js).
- **Middleware de errores**: [backend/middleware/errorMiddleware.js](backend/middleware/errorMiddleware.js) provee `asyncHandler`, `errorHandler`, `notFound`.
- **Autenticación**: [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js) gestiona JWT, roles y auditoría de actividad.
- **Datos**: Sequelize en [backend/database/connection.js](backend/database/connection.js) y modelos en [backend/models/](backend/models) (`User`, `UserProfile`, `UserSession`, `AuditLog`).

## Frontend — Patrones Clave
- **Store**: [frontend/src/store/index.js](frontend/src/store/index.js) configura Redux Toolkit, RTK Query y middlewares (`loggerMiddleware` en dev, `errorMiddleware`). Selectores/acciones agrupadas en `rootSelectors/rootActions`.
- **RTK Query**: [frontend/src/store/api/apiSlice.js](frontend/src/store/api/apiSlice.js)
  - `baseUrl`: `process.env.REACT_APP_API_URL || http://localhost:5000/api`.
  - `prepareHeaders`: añade `Authorization: Bearer <token>` desde `state.auth.token`.
  - Tags: `Auth`, `User`, `Dashboard`; endpoints como `login`, `register`, `logout`, `getUsers`, `getDashboardStats`.
- **Slices**: [frontend/src/store/slices](frontend/src/store/slices)
  - `authSlice`: persistencia básica en `localStorage` (`itr-auth-token`, `itr-user-data`), acciones `loginStart/loginSuccess/loginFailure/logout` y `restoreSession`.
  - `usersSlice`, `dashboardSlice`, `uiSlice`: estado de listas, métricas y UI.
- **UI/Estilos**: Tema en [frontend/src/styles/theme.js](frontend/src/styles/theme.js) con paleta ITR; glass morphism en [frontend/src/styles/glassStyles.js](frontend/src/styles/glassStyles.js).

## Integración API — Ejemplos
- **Login (RTK Query + slice)**:
  - Usa `useLoginMutation()` y despacha acciones de `authSlice`. Ver ejemplo de uso en [frontend/src/components/auth/LoginForm.js](frontend/src/components/auth/LoginForm.js).
- **Listar usuarios**:
  - `useGetUsersQuery({ page, limit, search })` y consume `providesTags: ['User']` para cache.
- **Dashboard**:
  - `useGetDashboardStatsQuery()` y `useGetSystemMetricsQuery()`.

## Convenciones del Proyecto
- **Validación**: `express-validator` en rutas; usa `asyncHandler` para capturar errores async.
- **Seguridad**: `helmet`, `rate-limit`, `cors` configurado según `NODE_ENV`.
- **Rutas bajo `/api`**: Autenticación `Bearer` obligatoria en privadas; ver [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
- **Idiomas y JSDoc**: Comentarios y mensajes en español con JSDoc extensivo en backend.

## Problemas Comunes y Tips
- **Windows**: `npm run dev` ejecuta `predev: cp env.example .env` (comando Unix). Usa `npm run setup` o [start.bat](start.bat) para generar `.env` primero.
- **Variables Frontend**: Cambia `REACT_APP_API_URL` si el backend corre en puerto distinto; reinicia `react-scripts` tras cambios en `.env`.
- **JWT perdido**: `authSlice` guarda token en `localStorage`; usa `restoreSession` al montar la app.

---
¿Falta algo o hay comportamientos no documentados (p. ej., scripts adicionales o ajustes de despliegue)? Indícame para afinar estas instrucciones.