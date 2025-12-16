/**
 * Página de Login
 *
 * Renderiza el formulario de login dentro de un fondo con gradiente.
 */
import React from 'react';
import { Box } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #4052C4 0%, #8036DA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <LoginForm />
        </Box>
    );
}

export default LoginPage;
