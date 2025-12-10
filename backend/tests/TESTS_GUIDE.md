# 🧪 Tests del Dashboard - ITR Dashboard

Documentación completa de los tests automatizados para el dashboard del ITR, incluyendo backend y frontend.

## 📋 Índice de Tests

### Backend Tests
- `backend/tests/dashboard.test.js` - Tests de todos los endpoints del dashboard

### Frontend Tests
- `frontend/src/components/dashboard/__tests__/DashboardMain.test.js` - Tests del componente principal
- `frontend/src/components/dashboard/__tests__/DashboardLayout.test.js` - Tests del layout
- `frontend/src/components/dashboard/__tests__/Dashboard.integration.test.js` - Tests de integración

---

## 🚀 Cómo Ejecutar los Tests

### Backend Tests

#### Ejecutar todos los tests del backend:
```bash
cd backend
npm test
```

#### Ejecutar solo tests del dashboard:
```bash
cd backend
npm test dashboard.test.js
```

#### Ejecutar en modo watch (re-ejecuta al cambiar archivos):
```bash
cd backend
npm run test:watch
```

#### Ejecutar con cobertura:
```bash
cd backend
npm test -- --coverage
```

---

### Frontend Tests

#### Ejecutar todos los tests del frontend:
```bash
cd frontend
npm test
```

#### Ejecutar solo tests del dashboard:
```bash
cd frontend
npm test DashboardMain.test.js
npm test DashboardLayout.test.js
npm test Dashboard.integration.test.js
```

#### Ejecutar en modo watch:
```bash
cd frontend
npm test -- --watch
```

#### Ejecutar con cobertura:
```bash
cd frontend
npm test -- --coverage
```

---

## 📊 Cobertura de Tests

### Backend - `/api/dashboard/stats` (8 tests)
✅ Autenticación - Token requerido
✅ Estructura de respuesta completa
✅ Objeto `users` con todos los campos
✅ Objeto `sessions` con todos los campos
✅ Objeto `activity` con arrays tipados
✅ Timestamp válido en `generated_at`
✅ Coherencia de números
✅ Manejo de token inválido

### Backend - `/api/dashboard/users` (5 tests)
✅ Autenticación requerida
✅ Lista de usuarios conectados
✅ Respeto de parámetro `limit`
✅ Estructura de usuario en lista
✅ Rechazo de `limit` inválido

### Backend - `/api/dashboard/activity` (5 tests)
✅ Autenticación requerida
✅ Lista de actividades
✅ Estructura de registro de actividad
✅ Filtrado por tipo
✅ Respeto de parámetro `limit`

### Backend - `/api/dashboard/system-metrics` (5 tests)
✅ Autenticación requerida
✅ Métricas del sistema completas
✅ Estructura de database metrics
✅ Estructura de sessions metrics
✅ Estructura de api metrics

### Backend - Tests de Integración (3 tests)
✅ Datos consistentes en todas las llamadas
✅ Números dentro de rangos válidos
✅ Timestamps consistentes

**Total Backend: 26 tests**

---

### Frontend - DashboardMain Component (10 tests)
✅ Renderización sin errores
✅ Mostrar tarjetas de estadísticas
✅ Mostrar tasa de crecimiento
✅ Mostrar datos por país
✅ Botón de actualización
✅ Estado de carga
✅ Manejo de errores
✅ Valores correctos en tarjetas
✅ Coherencia de datos
✅ Responsive design

### Frontend - DashboardLayout Component (15 tests)
✅ Renderización básica
✅ Renderización del header
✅ Renderización del sidebar
✅ Contenedor de contenido
✅ Menú de usuario
✅ Botón de logout
✅ Nombre de usuario visible
✅ Toggle sidebar en móvil
✅ Estructura correcta de layout
✅ Notificaciones en header
✅ Accesibilidad de menú
✅ Responsive (pequeña, mediana, grande)
✅ Persistencia de estado del sidebar
✅ Avatar/Icono de usuario
✅ Rutas de navegación

### Frontend - Dashboard Integration (8 tests)
✅ Renderización completa
✅ Visualización de todos los datos
✅ Estado Redux válido
✅ Manejo de errores
✅ Navegación dentro del dashboard
✅ Responsive completo
✅ Consistencia de datos entre componentes
✅ Validación de números

**Total Frontend: 33 tests**

**Total General: 59 tests**

---

## 🔍 Estructura de los Tests

### Backend

```javascript
describe('Dashboard API - Tests Integrales', () => {
  beforeAll() // Setup: crear usuario de prueba
  afterAll()  // Cleanup: eliminar datos de prueba

  describe('GET /api/dashboard/stats', () => {
    test('...') // Múltiples tests
  })

  describe('GET /api/dashboard/users', () => {
    test('...') // Múltiples tests
  })

  // ... más endpoints
})
```

### Frontend

```javascript
describe('DashboardMain Component', () => {
  beforeEach() // Setup: configurar Redux store

  test('debería renderizar sin errores', () => {
    render(<DashboardMain />)
    expect(...).toBeInTheDocument()
  })

  // ... más tests
})
```

---

## 📝 Datos de Prueba

### Backend
- **Usuario de prueba**: `dashtest[timestamp]@example.com`
- **Password**: `Test@1234` (válido según validaciones)
- **Sesión**: Activa por 24 horas
- **Perfil**: España, Madrid, español

### Frontend
- **Usuario autenticado**: `test@example.com`
- **Token**: Válido durante 24 horas
- **Datos iniciales**: Cargados en Redux store

---

## 🎯 Casos de Prueba Importantes

### Validaciones Críticas

#### Backend
1. **Autenticación**: Sin token → 401
2. **Coherencia de datos**:
   - `active + inactive + suspended <= total`
   - `online <= active`
   - `active_sessions >= online_users`
3. **Números válidos**: Todos >= 0 y tipo `number`
4. **Timestamps**: ISO 8601 válidos

#### Frontend
1. **Estado Redux**: Consistente entre componentes
2. **Renderización**: Todos los valores mostrados
3. **Responsive**: Funciona en 3 tamaños de pantalla
4. **Errores**: Mostrados correctamente

---

## ⚠️ Requisitos Para Ejecutar Tests

### Backend
- Node.js 20.17.0+
- Jest 29.7.0
- Supertest 7.0.0
- Base de datos SQLite configurada

### Frontend
- Node.js 20.17.0+
- React 18.3.1
- React Testing Library 16.0.1
- Redux Toolkit 2.2.7

---

## 🐛 Debugging de Tests

### Ver output completo de un test fallido:
```bash
npm test -- --verbose
```

### Ejecutar un test específico:
```bash
npm test -- --testNamePattern="debería retornar 401"
```

### Debug mode (detiene en debugger):
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📊 Cobertura Esperada

### Backend
- **Controllers**: >85%
- **Routes**: >80%
- **Models**: >70%

### Frontend
- **Components**: >80%
- **Store**: >75%

Ejecutar para ver cobertura actual:
```bash
npm test -- --coverage
```

---

## ✅ Checklist Antes de Hacer Commit

- [ ] Todos los tests pasan: `npm test`
- [ ] Cobertura >= 80%: `npm test -- --coverage`
- [ ] Sin warnings de linting: `npm run lint`
- [ ] Sin errores de TypeScript: `npm run type-check`
- [ ] Código formateado: `npm run format`

---

## 🔗 Referencias

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [API Documentation](../../API_DOCUMENTATION.md)

---

## 📞 Soporte

Si encuentras problemas al ejecutar los tests:

1. Asegúrate de que las dependencias estén instaladas:
   ```bash
   npm install
   ```

2. Limpia cache de Jest:
   ```bash
   npm test -- --clearCache
   ```

3. Revisa los errores en detalle:
   ```bash
   npm test -- --verbose
   ```

4. Verifica que la base de datos está configurada (backend):
   ```bash
   npm run db:migrate
   ```

---

**Última actualización**: Diciembre 2024
**QA Tester Agent**: v1.0.0
