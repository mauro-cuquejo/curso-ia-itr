<!-- Instrucciones para Copilot / agentes AI en el repositorio ITR Dashboard -->

Este archivo contiene el contexto y las instrucciones prácticas para que un agente AI (o un nuevo desarrollador) sea productivo rápidamente en este repositorio.

1) Resumen general
- Estructura monorepo con dos componentes principales: `backend/` (Node.js + Express + Sequelize + SQLite) y `frontend/` (React + Redux Toolkit + Material-UI).
- Flujo primario: `npm run dev` (raíz) arranca backend y frontend en paralelo; existen scripts específicos por OS: `start.bat` (Windows) y `start.sh` (Unix). Ambos crean `.env` si faltan.

2) Entradas clave y configuración
- Backend: `backend/server.js` — crea la app Express, registra rutas y gestiona la conexión con la DB.
- DB: `backend/database/connection.js` — Sequelize configurado para SQLite (habilita `PRAGMA journal_mode = WAL` y `PRAGMA foreign_keys = ON`).
- Frontend: `frontend/src/index.js` — punto de entrada React; lee `REACT_APP_API_URL` desde `frontend/.env`.
- Scripts globales: `package.json` en la raíz contiene `predev`, `dev`, `install-all`, `clean` (usa `copyfiles`, `concurrently`, `rimraf`).

3) Flujo de desarrollo (comandos útiles)
- Instalar todo: `npm run install-all` o por paquete (`cd backend && npm install`, `cd frontend && npm install --legacy-peer-deps`).
- Inicio rápido recomendado:
  - Windows: `start.bat`
  - Unix: `./start.sh`
  - Alternativa: `npm run setup` seguido de `npm run dev`
- Iniciar solo backend: `npm run server` (desde la raíz invoca `cd backend && npm run dev`).

4) Convenciones y patrones del proyecto
- Backend usa CommonJS; frontend usa ES modules.
- Modelos Sequelize en `backend/models` y asociaciones inicializadas por `models.initializeAssociations()` (ver `models/index.js`).
- Controladores en `backend/controllers` siguen patrón MVC y son usados directamente por rutas en `backend/routes`.
- Validaciones de entrada usan `express-validator` (ej.: `backend/routes/auth.js`).

5) Puntos de integración y comportamiento externo
- La ruta del archivo SQLite viene de `backend/config/server.js` — evita hardcodear rutas en pruebas y migraciones.
- La API expone endpoints bajo `/api/*` (health check en `/health`).
- El frontend consume la API usando `REACT_APP_API_URL` (default `http://localhost:5000/api`).

6) Tests y lint
- Backend: `cd backend && npm test` (Jest + Supertest).
- Frontend: `cd frontend && npm test` (React Testing Library).

7) Seguridad de archivos generados
- `.gitignore` ya cubre `backend/database/*.db`, `*.db-wal`, `*.db-shm`. Si creas fixtures en tests, ubícalos en `tmp/` o añade reglas a `.gitignore`.

8) Tareas ejemplo que el agente puede llevar a cabo
- Añadir una ruta: crear función en `backend/controllers`, registrar en `backend/routes/*` y añadir tests en `backend/tests`.
- Corregir llamadas API en frontend: revisar `frontend/src/services` y `frontend/src/store/api/apiSlice.js` si usa RTK Query.

9) Reglas rápidas cuando no estés seguro
- Copia patrones de `backend/routes` → `backend/controllers` para mantener consistencia.
- Usa `backend/config/server.js` para obtener puertos, secretos y ruta de DB.

Si quieres, traduzco esto a otro lenguaje o añado ejemplos concretos (pequeños snippets de código) para rutas, tests o scripts. Puedo iterar según tus preferencias.
