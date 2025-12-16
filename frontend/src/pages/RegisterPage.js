/**
 * Página de Registro
 *
 * Renderiza el formulario de registro con el mismo estilo que login.
 */
import React from 'react';
import { Box } from '@mui/material';
import RegisterForm from '../components/auth/RegisterForm';

function RegisterPage() {
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
            <RegisterForm />
        </Box>
    );
}

export default RegisterPage;
