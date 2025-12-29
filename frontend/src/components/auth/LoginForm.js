/**
 * Componente de formulario de login
 *
 * @description Formulario de autenticación con validación, diseño glass morphism
 * y integración con Redux para manejo de estado de autenticación.
 *
 * @author ITR Team
 * @since 1.0.0
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Importar estilos y tema
// Estilos planos locales para evitar efectos glass/gradiente en auth

// Importar acciones de Redux
import { loginUser } from '../../store/slices/authSlice';

/**
 * Esquema de validación para el formulario de login
 */
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

/**
 * Componente de formulario de login
 *
 * @component LoginForm
 * @description Formulario completo de autenticación con validación
 *
 * @returns {JSX.Element} Formulario de login
 *
 * @since 1.0.0
 */
function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Maneja el envío del formulario de login
   *
   * @param {Object} data - Datos del formulario
   * @param {string} data.email - Email del usuario
   * @param {string} data.password - Contraseña del usuario
   */
  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data));

      if (result.payload?.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  /**
   * Alterna la visibilidad de la contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        elevation={1}
        sx={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'background.paper',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.shadows[1],
          '&:hover': { transform: 'none', boxShadow: (theme) => theme.shadows[1] },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                ITR Dashboard
              </Typography>
            </motion.div>

            <Typography variant="body1" color="text.secondary" mb={2}>
              Inicia sesión en tu cuenta
            </Typography>
          </Box>

          {/* Alert de error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo Email */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    },
                  }}
                />
              )}
            />

            {/* Campo Contraseña */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    },
                  }}
                />
              )}
            />

            {/* Botón de Login */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !isValid}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              disableElevation
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          {/* Información adicional */}
          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              ¿No tienes cuenta?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/register')}
                sx={{ color: 'primary.main', textTransform: 'none' }}
              >
                Regístrate aquí
              </Button>
            </Typography>
          </Box>

          {/* Demo credentials */}
          <Box mt={2} p={2} sx={{
            backgroundColor: 'rgba(64, 82, 196, 0.1)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              <strong>Credenciales de Demo:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Email: admin@itr.com
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Password: admin123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default LoginForm;


