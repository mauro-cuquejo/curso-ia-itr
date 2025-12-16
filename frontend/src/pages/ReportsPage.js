/**
 * Página de Reportes y Analíticas
 *
 * Renderiza la sección de reportes y analíticas del sistema.
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente de página de reportes y analíticas
 * 
 * @component
 * @returns {JSX.Element} Interfaz de usuario de la página de reportes
 * 
 * @description
 * Renderiza la página de reportes del sistema, permitiendo visualizar
 * y analizar los reportes generados. Actualmente en construcción.
 */
function ReportsPage() {
    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#5052C4' }}>
                Reportes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Visualiza y analiza los reportes generados por el sistema.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    Página en construcción
                </Typography>
                {/* Aquí puedes agregar componentes o tablas para mostrar los reportes */}
            </Box>

        </Box>
    );
}

export default ReportsPage;