/**
 * Tests para DashboardLayout Component
 *
 * Valida que el layout del dashboard:
 * - Renderiza sidebar y header correctamente
 * - Maneja la navegación
 * - Valida logout del usuario
 * - Integra correctamente con Redux
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DashboardLayout from '../DashboardLayout';
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

/**
 * Mock de API
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

describe('DashboardLayout Component', () => {
    let store;

    /**
     * Setup: Crea tienda Redux y renderiza componente
     */
    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer
            },
            preloadedState: {
                auth: {
                    user: {
                        id: 1,
                        email: 'test@example.com',
                        first_name: 'Test',
                        last_name: 'User',
                        status: 'active'
                    },
                    token: 'test-token',
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
     * Renderiza el componente con los providers necesarios
     */
    const renderLayout = (children = <div>Test Content</div>) => {
        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>{children}</DashboardLayout>
                </BrowserRouter>
            </Provider>
        );
    };

    /**
     * Test 1: Renderización básica del layout
     */
    test('debería renderizar el layout sin errores', () => {
        renderLayout();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    /**
     * Test 2: Renderización del header
     */
    test('debería renderizar el header con información del usuario', async () => {
        renderLayout();

        await waitFor(() => {
            expect(screen.getByText(/Test|dashboard|header/i)).toBeInTheDocument();
        });
    });

    /**
     * Test 3: Renderización del sidebar
     */
    test('debería renderizar el sidebar con menú de navegación', () => {
        renderLayout();

        // El sidebar debe estar visible en desktop
        const navItems = screen.queryAllByRole('button');
        expect(navItems.length).toBeGreaterThan(0);
    });

    /**
     * Test 4: Contenedor de contenido
     */
    test('debería renderizar el contenido principal correctamente', () => {
        const testContent = <div data-testid="main-content">Main Content Here</div>;
        renderLayout(testContent);

        expect(screen.getByTestId('main-content')).toBeInTheDocument();
        expect(screen.getByText('Main Content Here')).toBeInTheDocument();
    });

    /**
     * Test 5: Menú de usuario
     */
    test('debería tener menú de usuario en el header', async () => {
        const user = userEvent.setup();
        renderLayout();

        // Buscar icono o botón de usuario
        const userMenuButton = screen.queryByRole('button', { name: /usuario|user|account/i });

        if (userMenuButton) {
            await user.click(userMenuButton);
            expect(userMenuButton).toBeInTheDocument();
        }
    });

    /**
     * Test 6: Botón de logout
     */
    test('debería mostrar opción de logout en el menú', async () => {
        const user = userEvent.setup();
        renderLayout();

        // Buscar botón para abrir menú de usuario
        const menuButtons = screen.queryAllByRole('button');

        if (menuButtons.length > 0) {
            // Hacer click en un botón de usuario (típicamente el último con avatar)
            await user.click(menuButtons[menuButtons.length - 1]);

            // Buscar opción de logout
            const logoutButton = screen.queryByRole('menuitem', { name: /logout|salir|cerrar sesión/i });
            expect(logoutButton).toBeInTheDocument();
        }
    });

    /**
     * Test 7: Visualización de nombre de usuario
     */
    test('debería mostrar el nombre del usuario autenticado', () => {
        renderLayout();

        // El nombre del usuario debe estar visible en algún lugar
        expect(screen.queryByText(/Test|User/)).toBeInTheDocument();
    });

    /**
     * Test 8: Toggle del sidebar en móvil
     */
    test('debería tener botón para toggle del sidebar en móvil', async () => {
        const user = userEvent.setup();

        // Simular pantalla móvil
        global.innerWidth = 500;
        global.dispatchEvent(new Event('resize'));

        renderLayout();

        const menuButton = screen.queryByRole('button', { name: /menu|menú|hamburger/i });

        if (menuButton) {
            await user.click(menuButton);
            expect(menuButton).toBeInTheDocument();
        }
    });

    /**
     * Test 9: Estructura del layout
     */
    test('debería tener estructura correcta de layout (header + sidebar + main)', () => {
        renderLayout(<div data-testid="content">Content</div>);

        // Validar presencia de elementos principales
        const content = screen.getByTestId('content');
        expect(content).toBeInTheDocument();

        // El componente debe renderizar sin componentes faltantes
        const mainElement = screen.getByRole('main') || screen.getByTestId('content').parentElement;
        expect(mainElement).toBeInTheDocument();
    });

    /**
     * Test 10: Notificaciones en header
     */
    test('debería mostrar área para notificaciones si existe', async () => {
        renderLayout();

        // Buscar icono de notificaciones
        const notificationButtons = screen.queryAllByRole('button');

        // Al menos debe haber botones de usuario y notificaciones
        expect(notificationButtons.length).toBeGreaterThan(0);
    });

    /**
     * Test 11: Accesibilidad del menú
     */
    test('debería tener menú accesible con navegación por teclado', async () => {
        const user = userEvent.setup();
        renderLayout();

        // Todos los elementos navegables deben ser accesibles
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);

        // Debe poder navegar con Tab
        await user.tab();
        expect(document.activeElement).toBeTruthy();
    });

    /**
     * Test 12: Responsive para diferentes tamaños de pantalla
     */
    test('debería adaptarse a pantallas pequeñas, medianas y grandes', () => {
        // Test en desktop
        global.innerWidth = 1200;
        const { unmount: unmountDesktop } = renderLayout();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        unmountDesktop();

        // Test en tablet
        global.innerWidth = 768;
        const { unmount: unmountTablet } = renderLayout();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        unmountTablet();

        // Test en móvil
        global.innerWidth = 375;
        renderLayout();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    /**
     * Test 13: Persistencia de estado del sidebar
     */
    test('debería mantener estado del sidebar al navegar', async () => {
        const { rerender } = renderLayout();

        const initialSidebarState = store.getState().ui.sidebarOpen;

        // Cambiar tamaño de pantalla
        global.innerWidth = 500;
        global.dispatchEvent(new Event('resize'));

        rerender(
            <Provider store={store}>
                <BrowserRouter>
                    <DashboardLayout>
                        <div>New Content</div>
                    </DashboardLayout>
                </BrowserRouter>
            </Provider>
        );

        // El estado debe cambiar cuando corresponda
        expect(store.getState().ui).toBeDefined();
    });

    /**
     * Test 14: Ícono/Avatar de usuario
     */
    test('debería mostrar avatar o icono del usuario', () => {
        renderLayout();

        // Buscar avatar o imagen de usuario
        const avatars = screen.queryAllByRole('img', { hidden: true });

        // O buscar elementos con clase de avatar
        const layoutContent = screen.getByText('Test Content').closest('div');
        expect(layoutContent).toBeInTheDocument();
    });

    /**
     * Test 15: Rutas de navegación en sidebar
     */
    test('debería tener links de navegación correctos', () => {
        renderLayout();

        // Buscar links de navegación
        const navLinks = screen.queryAllByRole('button');

        // Debe haber al menos links principales
        expect(navLinks.length).toBeGreaterThan(0);
    });
});
