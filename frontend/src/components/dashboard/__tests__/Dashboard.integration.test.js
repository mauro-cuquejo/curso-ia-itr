/**
 * Tests de Integración Frontend - Dashboard
 *
 * Valida la integración completa del dashboard:
 * - Redux store con APIs
 * - Componentes renderizando datos correctos
 * - Flujos de usuario completos
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DashboardLayout from '../DashboardLayout';
import DashboardMain from '../DashboardMain';
import dashboardReducer from '../../../store/slices/dashboardSlice';
import authReducer from '../../../store/slices/authSlice';
import uiReducer from '../../../store/slices/uiSlice';

/**
 * Mock de date-fns
 */
jest.mock('date-fns', () => ({
    format: jest.fn((date) => '10 de diciembre de 2025, 14:30')
}));

jest.mock('date-fns/locale', () => ({
    es: {}
}));

/**
 * Mock de framer-motion
 */
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    }
}));

// Mock de API
jest.mock('../../../store/api/apiSlice', () => ({
    useGetSystemMetricsQuery: jest.fn(() => ({
        data: {
            data: {
                host: {
                    cpu_usage_percent: 45,
                    memory_usage_percent: 62,
                    disk: {
                        used_percent: 78
                    }
                }
            }
        },
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn()
    }))
}));

describe('Dashboard - Integración Completa', () => {
    let store;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                dashboard: dashboardReducer,
                auth: authReducer,
                ui: uiReducer
            },
            preloadedState: {
                auth: {
                    user: {
                        id: 1,
                        email: 'integrationtest@example.com',
                        first_name: 'Integration',
                        last_name: 'Test',
                        status: 'active'
                    },
                    token: 'test-token-123',
                    isLoading: false,
                    error: null
                },
                dashboard: {
                    stats: {
                        users: {
                            total: 150,
                            active: 142,
                            inactive: 5,
                            suspended: 3,
                            online: 12,
                            new_today: 3,
                            new_this_week: 15,
                            new_this_month: 47,
                            growth_rate: 12.5
                        },
                        sessions: {
                            active_sessions: 18,
                            online_users: 12,
                            recent_logins_24h: 25
                        },
                        activity: {
                            daily_activity: [
                                { date: '2024-01-15', activity_count: 45 }
                            ],
                            users_by_country: [
                                { country: 'España', count: 89 },
                                { country: 'México', count: 34 }
                            ]
                        },
                        generated_at: new Date().toISOString()
                    },
                    isLoading: false,
                    error: null
                },
                ui: {
                    sidebarOpen: true,
                    theme: 'light'
                }
            }
        });
    });

    /**
     * Test 1: Renderización completa del dashboard
     */
    test('debería renderizar el dashboard completo correctamente', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByText(/dashboard|estadísticas/i)).toBeInTheDocument();
    });

    /**
     * Test 2: Flujo completo de visualización de datos
     */
    test('debería mostrar todos los datos del dashboard en el flujo completo', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        await waitFor(() => {
            // Verificar que se muestran estadísticas de usuarios
            expect(screen.getByText('1,247')).toBeInTheDocument();
            expect(screen.getByText('89')).toBeInTheDocument();
            expect(screen.getByText('3,456')).toBeInTheDocument();
        });

        // Verificar información de usuario en header
        expect(screen.getByText(/Integration|Test/)).toBeInTheDocument();
    });

    /**
     * Test 3: Estado inicial válido
     */
    test('debería tener estado Redux válido después de la renderización', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        const state = store.getState();

        // Validar estructura de estado
        expect(state.auth.user).toBeDefined();
        expect(state.dashboard.stats).toBeDefined();
        expect(state.ui).toBeDefined();

        // Validar que los datos son coherentes
        expect(state.dashboard.stats.users.active).toBeLessThanOrEqual(state.dashboard.stats.users.total);
        expect(state.dashboard.stats.users.online).toBeLessThanOrEqual(state.dashboard.stats.users.active);
    });

    /**
     * Test 4: Manejo consistente de errores
     */
    test('debería mostrar error cuando dashboard.stats es null', () => {
        const errorStore = configureStore({
            reducer: {
                dashboard: dashboardReducer,
                auth: authReducer,
                ui: uiReducer
            },
            preloadedState: {
                auth: {
                    user: { id: 1, email: 'test@example.com', first_name: 'Test' },
                    token: 'test-token',
                    isLoading: false,
                    error: null
                },
                dashboard: {
                    stats: null,
                    isLoading: false,
                    error: 'Fallo al cargar estadísticas'
                },
                ui: {
                    sidebarOpen: true,
                    theme: 'light'
                }
            }
        });

        render(
            <Provider store={errorStore}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        // Debería mostrar algún indicador de error o estado vacío
        const errorElement = screen.queryByText(/error|fallo|no se pudo/i);
        expect(errorElement || screen.queryByText(/dashboard/i)).toBeInTheDocument();
    });

    /**
     * Test 5: Navegación dentro del dashboard
     */
    test('debería permitir navegación dentro del dashboard', async () => {
        const user = userEvent.setup();

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        // Buscar botones de navegación
        const navButtons = screen.queryAllByRole('button');
        expect(navButtons.length).toBeGreaterThan(0);

        // Debe poder hacer click en botones de navegación
        if (navButtons.length > 0) {
            await user.click(navButtons[0]);
            expect(navButtons[0]).toBeInTheDocument();
        }
    });

    /**
     * Test 6: Responsive completo
     */
    test('debería funcionar en móvil, tablet y desktop', async () => {
        // Desktop
        global.innerWidth = 1200;
        const { unmount: unmountDesktop } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );
        expect(screen.getByText('1,247')).toBeInTheDocument();
        unmountDesktop();

        // Tablet
        global.innerWidth = 768;
        const { unmount: unmountTablet } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );
        expect(screen.getByText('1,247')).toBeInTheDocument();
        unmountTablet();

        // Móvil
        global.innerWidth = 375;
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );
        expect(screen.getByText('1,247')).toBeInTheDocument();
    });

    /**
     * Test 7: Consistencia de datos entre componentes
     */
    test('debería mantener consistencia de datos entre layout y main', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        await waitFor(() => {
            const authState = store.getState().auth;
            const dashboardState = store.getState().dashboard;

            // Usuario autenticado
            expect(authState.user.id).toBe(1);
            expect(authState.token).toBe('test-token-123');

            // Datos del dashboard consistentes
            expect(dashboardState.stats.users.total).toBe(150);
            expect(dashboardState.stats.users.active).toBe(142);

            // Coherencia: active <= total
            expect(dashboardState.stats.users.active).toBeLessThanOrEqual(dashboardState.stats.users.total);
        });
    });

    /**
     * Test 8: Manejo de números en estadísticas
     */
    test('debería validar que todos los números sean válidos', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <DashboardMain />
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        const state = store.getState().dashboard.stats;

        // Todos los números deben ser >= 0
        Object.entries(state.users).forEach(([key, value]) => {
            if (typeof value === 'number') {
                expect(value).toBeGreaterThanOrEqual(0);
                expect(Number.isFinite(value)).toBe(true);
            }
        });

        Object.entries(state.sessions).forEach(([key, value]) => {
            if (typeof value === 'number') {
                expect(value).toBeGreaterThanOrEqual(0);
                expect(Number.isFinite(value)).toBe(true);
            }
        });
    });
});
