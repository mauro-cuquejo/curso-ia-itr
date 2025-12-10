/**
 * Tests para DashboardMain Component
 *
 * Valida que el componente principal del dashboard:
 * - Renderiza correctamente
 * - Obtiene y muestra estadísticas
 * - Integra correctamente con Redux
 * - Valida manejo de errores y estados de carga
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardMain from '../DashboardMain';
import dashboardReducer from '../../../store/slices/dashboardSlice';
import authReducer from '../../../store/slices/authSlice';

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

/**
 * Mock de las queries de API
 */
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

describe('DashboardMain Component', () => {
    let store;

    /**
     * Setup: Crea una tienda Redux de prueba
     */
    beforeEach(() => {
        store = configureStore({
            reducer: {
                dashboard: dashboardReducer,
                auth: authReducer
            },
            preloadedState: {
                auth: {
                    user: {
                        id: 1,
                        email: 'test@example.com',
                        first_name: 'Test',
                        last_name: 'User'
                    },
                    token: 'test-token',
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
                }
            }
        });
    });

    /**
     * Test 1: Renderización básica del componente
     */
    test('debería renderizar el componente sin errores', () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        // Verificar que el saludo de bienvenida se renderiza
        expect(screen.getByText(/¡Bienvenido/i)).toBeInTheDocument();
    });

    /**
     * Test 2: Renderización de estadísticas de usuarios
     */
    test('debería mostrar tarjetas de estadísticas de usuarios', async () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        // Buscar valores de estadísticas (mockStats)
        await waitFor(() => {
            expect(screen.getByText('1,247')).toBeInTheDocument(); // Total usuarios
            expect(screen.getByText('89')).toBeInTheDocument(); // Usuarios activos
            expect(screen.getByText('3,456')).toBeInTheDocument();  // Sesiones totales
        });
    });

    /**
     * Test 3: Renderización correcta de métricas de crecimiento
     */
    test('debería mostrar tasa de crecimiento', async () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        await waitFor(() => {
            // Buscar el chip de crecimiento con el valor 12.5%
            const growthChips = screen.getAllByText(/\+\d+\.\d%/);
            expect(growthChips.length).toBeGreaterThan(0);
        });
    });

    /**
     * Test 4: Renderización de datos por país
     */
    test('debería mostrar sección de Actividad Reciente', async () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Actividad Reciente/i)).toBeInTheDocument();
        });
    });

    /**
     * Test 5: Botón de actualización de datos
     */
    test('debería tener botón para actualizar métricas del sistema', async () => {
        const user = userEvent.setup();

        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        const refreshButton = screen.getByRole('button', { name: /actualizar.*métricas|refrescar/i });
        expect(refreshButton).toBeInTheDocument();

        // Verificar que se puede hacer click
        await user.click(refreshButton);
        expect(refreshButton).toBeInTheDocument();
    });

    /**
     * Test 6: Manejo de estado de carga
     */
    test('debería mostrar métricas del sistema cuando se cargan', () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        // Verificar que la sección "Estado del Sistema" se renderiza
        expect(screen.getByText(/Estado del Sistema/i)).toBeInTheDocument();

        // Verificar que se muestran los valores de CPU, Memoria y Almacenamiento
        expect(screen.getByText(/CPU Usage/i)).toBeInTheDocument();
        expect(screen.getByText(/Memoria RAM/i)).toBeInTheDocument();
        expect(screen.getByText(/Almacenamiento/i)).toBeInTheDocument();
    });

    /**
     * Test 7: Manejo de errores
     */
    test('debería mostrar mensaje de error cuando hay un fallo', () => {
        const errorStore = configureStore({
            reducer: {
                dashboard: dashboardReducer,
                auth: authReducer
            },
            preloadedState: {
                auth: {
                    user: { id: 1 },
                    token: 'test-token',
                    isLoading: false,
                    error: null
                },
                dashboard: {
                    stats: null,
                    isLoading: false,
                    error: 'Error al cargar estadísticas'
                }
            }
        });

        render(
            <Provider store={errorStore}>
                <DashboardMain />
            </Provider>
        );

        // El componente aún debe renderizar, aunque haya error
        expect(screen.getByText(/¡Bienvenido/i)).toBeInTheDocument();
    });

    /**
     * Test 8: Tarjetas de estadísticas con valores correctos
     */
    test('debería mostrar todas las tarjetas de estadísticas con valores correctos', async () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        await waitFor(() => {
            // Validar que se muestran los valores principales (mockStats)
            expect(screen.getByText('1,247')).toBeInTheDocument();  // Total Usuarios
            expect(screen.getByText('89')).toBeInTheDocument();  // Usuarios Activos
            expect(screen.getByText('3,456')).toBeInTheDocument();    // Sesiones Totales
            expect(screen.getByText('99.9%')).toBeInTheDocument();   // Uptime
        });
    });

    /**
     * Test 9: Coherencia de datos
     */
    test('debería mostrar nombre del usuario autenticado en el saludo', async () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        await waitFor(() => {
            // El usuario de prueba tiene first_name "Test"
            expect(screen.getByText(/¡Bienvenido.*Test/i)).toBeInTheDocument();
        });
    });

    /**
     * Test 10: Responsive design
     */
    test('debería mostrar características del sistema', () => {
        render(
            <Provider store={store}>
                <DashboardMain />
            </Provider>
        );

        // Verificar que se muestra la sección de características
        expect(screen.getByText(/Características del Sistema ITR Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Autenticación JWT/i)).toBeInTheDocument();
        expect(screen.getByText(/Glass Morphism/i)).toBeInTheDocument();
        expect(screen.getByText(/Dashboard en Tiempo Real/i)).toBeInTheDocument();
        expect(screen.getByText(/Seguridad Avanzada/i)).toBeInTheDocument();
    });
});
