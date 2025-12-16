/**
 * Página principal del Dashboard
 *
 * Envuelve el layout y el contenido principal.
 */
import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardMain from '../components/dashboard/DashboardMain';

function DashboardPage({ children }) {
    return (
        <DashboardLayout>
            {children || <DashboardMain />}
        </DashboardLayout>
    );
}

export default DashboardPage;
