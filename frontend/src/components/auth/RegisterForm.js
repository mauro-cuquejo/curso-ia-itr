/**
 * Componente de formulario de registro
 * 
 * @component RegisterForm
 * @description Formulario para crear una nueva cuenta. Usa RTK Query para llamar al endpoint
 * de registro y, en caso de éxito, despacha registerSuccess y navega al dashboard.
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Email, Lock, Person, Visibility, VisibilityOff, HowToReg as RegisterIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Estilos planos locales para evitar efectos glass/gradiente en auth
import { useRegisterMutation } from '../../store/api/apiSlice';
import { registerSuccess } from '../../store/slices/authSlice';

const registerSchema = yup.object({
  first_name: yup.string().required('Nombre requerido'),
  last_name: yup.string().required('Apellido requerido'),
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número')
    .required('Contraseña requerida'),
});

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { first_name: '', last_name: '', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const result = await registerMutation(data).unwrap();
      const payload = result?.data || {};
      dispatch(
        registerSuccess({
          user: payload.user,
          token: payload.token,
          sessionId: payload.session_id,
          expiresAt: payload.expires_at,
        })
      );
      navigate('/dashboard');
    } catch (e) {
      // Mostrar error simple
      alert(e?.data?.message || 'Error en registro');
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        elevation={1}
        sx={{
          maxWidth: 480,
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
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary">Completa tus datos para comenzar</Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="first_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    },
                  }}
                />
              )}
            />

            <Controller
              name="last_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Apellido"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    },
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    },
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end" disabled={isLoading}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <RegisterIcon />}
              disableElevation
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RegisterForm;


