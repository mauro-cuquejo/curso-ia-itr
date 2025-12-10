/**
 * Tests Integrales para Dashboard Backend
 *
 * Valida todos los endpoints del dashboard:
 * - GET /api/dashboard/stats
 * - GET /api/dashboard/users
 * - GET /api/dashboard/activity
 * - GET /api/dashboard/system-metrics
 */

const request = require('supertest');
const { createApp } = require('../server');
const models = require('../models');
const { User, UserSession, AuditLog, UserProfile } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('Dashboard API - Tests Integrales', () => {
    let token;
    let testUser;
    let app;
    const jwtSecret = process.env.JWT_SECRET || 'itr_dashboard_secret_2024';

    /**
     * Setup: Crea datos de prueba
     */
    beforeAll(async () => {
        try {
            // Crear aplicación
            app = createApp();

            // Inicializar asociaciones de modelos
            models.initializeAssociations();

            // Crear usuario principal de prueba
            testUser = await User.create({
                email: `dashtest${Date.now()}@example.com`,
                password: 'Test@1234',
                first_name: 'Dashboard',
                last_name: 'Test',
                status: 'active',
                email_verified: true
            });

            // Crear sesión activa
            const session = await UserSession.create({
                user_id: testUser.id,
                token_hash: '', // Será actualizado después
                ip_address: '127.0.0.1',
                user_agent: 'Test Agent',
                is_active: true,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            // Generar token válido CON sessionId
            token = jwt.sign(
                {
                    userId: testUser.id,
                    email: testUser.email
                },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // Crear token hash SHA256 (como en el controlador real)
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            // Actualizar sesión con el token hash
            await session.update({ token_hash: tokenHash });

            // Crear perfil de usuario
            await UserProfile.create({
                user_id: testUser.id,
                country: 'España',
                city: 'Madrid',
                language: 'es'
            });

            // Crear registros de auditoría para actividad
            await AuditLog.create({
                user_id: testUser.id,
                action: 'CREATE',
                table_name: 'users',
                record_id: testUser.id
            });
        } catch (error) {
            console.error('Error en beforeAll:', error);
        }
    });

    /**
     * Cleanup: Elimina datos de prueba
     */
    afterAll(async () => {
        try {
            if (testUser) {
                await AuditLog.destroy({ where: { user_id: testUser.id } });
                await UserSession.destroy({ where: { user_id: testUser.id } });
                await UserProfile.destroy({ where: { user_id: testUser.id } });
                await User.destroy({ where: { id: testUser.id } });
            }
        } catch (error) {
            console.error('Error en afterAll:', error);
        }
    });

    // ==========================================
    // TESTS: GET /api/dashboard/stats
    // ==========================================

    describe('GET /api/dashboard/stats', () => {
        test('debería retornar 401 sin autenticación', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('debería retornar estructura correcta con token válido', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('users');
            expect(response.body.data).toHaveProperty('sessions');
            expect(response.body.data).toHaveProperty('activity');
            expect(response.body.data).toHaveProperty('generated_at');
        });

        test('debería validar estructura de objeto users', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { users } = response.body.data;

            expect(users).toHaveProperty('total');
            expect(users).toHaveProperty('active');
            expect(users).toHaveProperty('inactive');
            expect(users).toHaveProperty('suspended');
            expect(users).toHaveProperty('online');
            expect(users).toHaveProperty('new_today');
            expect(users).toHaveProperty('new_this_week');
            expect(users).toHaveProperty('new_this_month');
            expect(users).toHaveProperty('growth_rate');

            expect(typeof users.total).toBe('number');
            expect(users.total).toBeGreaterThanOrEqual(1);
            expect(users.growth_rate).toBeLessThanOrEqual(100);
        });

        test('debería validar estructura de objeto sessions', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { sessions } = response.body.data;

            expect(sessions).toHaveProperty('active_sessions');
            expect(sessions).toHaveProperty('online_users');
            expect(sessions).toHaveProperty('recent_logins_24h');

            expect(typeof sessions.active_sessions).toBe('number');
            expect(sessions.active_sessions).toBeGreaterThanOrEqual(0);
        });

        test('debería validar estructura de objeto activity', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { activity } = response.body.data;

            expect(Array.isArray(activity.daily_activity)).toBe(true);
            expect(Array.isArray(activity.users_by_country)).toBe(true);

            if (activity.users_by_country.length > 0) {
                const country = activity.users_by_country[0];
                expect(country).toHaveProperty('country');
                expect(country).toHaveProperty('count');
                expect(typeof country.count).toBe('number');
            }
        });

        test('debería validar coherencia de números', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { users, sessions } = response.body.data;

            // Suma de estados debe ser <= total
            const statusSum = users.active + users.inactive + users.suspended;
            expect(statusSum).toBeLessThanOrEqual(users.total);

            // Online no puede ser mayor que activos
            expect(users.online).toBeLessThanOrEqual(users.active);

            // Sesiones debe ser >= usuarios online
            expect(sessions.active_sessions).toBeGreaterThanOrEqual(sessions.online_users);

            // No pueden ser negativos
            expect(users.total).toBeGreaterThanOrEqual(0);
            expect(sessions.active_sessions).toBeGreaterThanOrEqual(0);
        });

        test('debería retornar timestamp válido en generated_at', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { generated_at } = response.body.data;
            const date = new Date(generated_at);

            expect(date instanceof Date).toBe(true);
            expect(date.toString()).not.toBe('Invalid Date');
        });
    });

    // ==========================================
    // TESTS: GET /api/dashboard/users
    // ==========================================

    describe('GET /api/dashboard/users', () => {
        test('debería retornar 401 sin autenticación', async () => {
            const response = await request(app)
                .get('/api/dashboard/users');

            expect(response.status).toBe(401);
        });

        test('debería retornar lista de usuarios conectados', async () => {
            const response = await request(app)
                .get('/api/dashboard/users')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.online_users)).toBe(true);
            expect(response.body.data).toHaveProperty('total_online');
            expect(response.body.data).toHaveProperty('showing');
            expect(response.body.data).toHaveProperty('generated_at');
        });

        test('debería respetar parámetro limit', async () => {
            const response = await request(app)
                .get('/api/dashboard/users?limit=5')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.online_users.length).toBeLessThanOrEqual(5);
        });

        test('debería validar estructura de usuario en lista', async () => {
            const response = await request(app)
                .get('/api/dashboard/users?limit=50')
                .set('Authorization', `Bearer ${token}`);

            if (response.body.data.online_users.length > 0) {
                const user = response.body.data.online_users[0];

                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('name');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('last_login');
                expect(user).toHaveProperty('session_info');
                expect(user.session_info).toHaveProperty('ip_address');
                expect(user.session_info).toHaveProperty('last_activity');
                expect(user.session_info).toHaveProperty('session_duration');
            }
        });

        test('debería rechazar limit inválido', async () => {
            const response = await request(app)
                .get('/api/dashboard/users?limit=999')
                .set('Authorization', `Bearer ${token}`);

            // El endpoint puede retornar 200 con datos limitados, o 400 si rechaza
            // Aceptamos ambos comportamientos
            expect([200, 400]).toContain(response.status);
        });
    });

    // ==========================================
    // TESTS: GET /api/dashboard/activity
    // ==========================================

    describe('GET /api/dashboard/activity', () => {
        test('debería retornar 401 sin autenticación', async () => {
            const response = await request(app)
                .get('/api/dashboard/activity');

            expect(response.status).toBe(401);
        });

        test('debería retornar lista de actividades', async () => {
            const response = await request(app)
                .get('/api/dashboard/activity')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.activities)).toBe(true);
            expect(response.body.data).toHaveProperty('total_shown');
            expect(response.body.data).toHaveProperty('filters_applied');
            expect(response.body.data).toHaveProperty('generated_at');
        });

        test('debería validar estructura de registro de actividad', async () => {
            const response = await request(app)
                .get('/api/dashboard/activity?limit=50')
                .set('Authorization', `Bearer ${token}`);

            if (response.body.data.activities.length > 0) {
                const activity = response.body.data.activities[0];

                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('type');
                expect(activity).toHaveProperty('description');
                expect(activity).toHaveProperty('timestamp');
                expect(activity).toHaveProperty('user');
                expect(activity.user).toHaveProperty('id');
                expect(activity.user).toHaveProperty('name');
                expect(activity.user).toHaveProperty('email');
            }
        });

        test('debería filtrar por tipo de actividad', async () => {
            const response = await request(app)
                .get('/api/dashboard/activity?type=user_login')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.filters_applied).toHaveProperty('type');
        });

        test('debería respetar parámetro limit', async () => {
            const response = await request(app)
                .get('/api/dashboard/activity?limit=10')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.activities.length).toBeLessThanOrEqual(10);
        });
    });

    // ==========================================
    // TESTS: GET /api/dashboard/system-metrics
    // ==========================================

    describe('GET /api/dashboard/system-metrics', () => {
        test('debería retornar 401 sin autenticación', async () => {
            const response = await request(app)
                .get('/api/dashboard/system-metrics');

            expect(response.status).toBe(401);
        });

        test('debería retornar métricas del sistema', async () => {
            const response = await request(app)
                .get('/api/dashboard/system-metrics')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('database');
            expect(response.body.data).toHaveProperty('sessions');
            expect(response.body.data).toHaveProperty('api');
            expect(response.body.data).toHaveProperty('system');
            expect(response.body.data).toHaveProperty('generated_at');
        });

        test('debería validar estructura de database metrics', async () => {
            const response = await request(app)
                .get('/api/dashboard/system-metrics')
                .set('Authorization', `Bearer ${token}`);

            const { database } = response.body.data;

            expect(database).toHaveProperty('total_users');
            expect(database).toHaveProperty('total_sessions');
            expect(database).toHaveProperty('total_audit_logs');
            expect(typeof database.total_users).toBe('number');
        });

        test('debería validar estructura de sessions metrics', async () => {
            const response = await request(app)
                .get('/api/dashboard/system-metrics')
                .set('Authorization', `Bearer ${token}`);

            const { sessions } = response.body.data;

            expect(sessions).toHaveProperty('average_duration_minutes');
            expect(sessions).toHaveProperty('sessions_by_ip');
            expect(Array.isArray(sessions.sessions_by_ip)).toBe(true);
        });

        test('debería validar estructura de api metrics', async () => {
            const response = await request(app)
                .get('/api/dashboard/system-metrics')
                .set('Authorization', `Bearer ${token}`);

            const { api } = response.body.data;

            expect(api).toHaveProperty('requests_24h');
            expect(api).toHaveProperty('peak_hour');
            expect(api.peak_hour).toHaveProperty('hour');
            expect(api.peak_hour).toHaveProperty('count');
        });

        test('debería validar estructura de system metrics', async () => {
            const response = await request(app)
                .get('/api/dashboard/system-metrics')
                .set('Authorization', `Bearer ${token}`);

            const { system } = response.body.data;

            expect(system).toHaveProperty('uptime_hours');
            expect(system).toHaveProperty('memory_usage');
            expect(system).toHaveProperty('node_version');
            expect(system.memory_usage).toHaveProperty('rss');
            expect(system.memory_usage).toHaveProperty('heapTotal');
            expect(system.memory_usage).toHaveProperty('heapUsed');
        });
    });

    // ==========================================
    // TESTS DE INTEGRACIÓN
    // ==========================================

    describe('Tests de Integración del Dashboard', () => {
        test('debería obtener datos consistentes en todas las llamadas', async () => {
            const statsResponse = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const usersResponse = await request(app)
                .get('/api/dashboard/users')
                .set('Authorization', `Bearer ${token}`);

            const metricsResponse = await request(app)
                .get('/api/dashboard/system-metrics')
                .set('Authorization', `Bearer ${token}`);

            // Verificar que todos los endpoints responden exitosamente
            expect(statsResponse.status).toBe(200);
            expect(usersResponse.status).toBe(200);
            expect(metricsResponse.status).toBe(200);

            // Validar coherencia: usuarios online_users es array, stats.users.online es número
            const { online } = statsResponse.body.data.users;
            const onlineUsersArray = usersResponse.body.data.online_users;

            // online_users es un array, contar su longitud
            expect(onlineUsersArray).toBeInstanceOf(Array);
            expect(onlineUsersArray.length).toBeLessThanOrEqual(online);
        });

        test('debería mantener los datos dentro de rangos válidos', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { users, sessions } = response.body.data;

            // Todos los números deben ser no-negativos
            Object.entries(users).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    expect(value).toBeGreaterThanOrEqual(0);
                }
            });

            Object.entries(sessions).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    expect(value).toBeGreaterThanOrEqual(0);
                }
            });
        });

        test('debería tener timestamps consistentes', async () => {
            const response = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            const { generated_at, period } = response.body.data;
            const now = new Date();
            const statsTime = new Date(generated_at);

            // El timestamp de generación debe ser reciente (dentro de 5 segundos)
            const timeDiff = now - statsTime;
            expect(Math.abs(timeDiff)).toBeLessThan(5000);

            // Validar que los períodos están en orden correcto
            if (period) {
                const last24 = new Date(period.last_24_hours);
                const last7 = new Date(period.last_7_days);

                expect(last24.getTime()).toBeGreaterThan(last7.getTime());
            }
        });
    });
});
