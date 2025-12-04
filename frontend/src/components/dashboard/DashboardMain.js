/**
 * Componente principal del Dashboard
 * 
 * @description Dashboard principal con estadísticas, gráficos y resumen
 * de la aplicación ITR con diseño glass morphism.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar estilos y tema
import { glassStyles } from '../../styles/glassStyles';
import { itrColors } from '../../styles/theme';

// Importar acciones de Redux
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { useGetSystemMetricsQuery } from '../../store/api/apiSlice';

/**
 * Componente de tarjeta de estadística
 * 
 * @component StatCard
 * @description Tarjeta con estadística individual
 * 
 * @param {Object} props - Props del componente
 * @param {string} props.title - Título de la estadística
 * @param {string|number} props.value - Valor de la estadística
 * @param {string} props.subtitle - Subtítulo o descripción
 * @param {React.ReactNode} props.icon - Icono de la estadística
 * @param {string} props.color - Color de la estadística
 * @param {number} props.trend - Tendencia (positiva/negativa)
 * @returns {JSX.Element} Tarjeta de estadística
 */
function StatCard({ title, value, subtitle, icon, color = itrColors.primary.blue, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card sx={{ ...glassStyles.formContainer, height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                backgroundColor: color,
                mr: 2,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
            {trend !== undefined && (
              <Chip
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend > 0 ? 'success' : 'error'}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Componente de actividad reciente
 * 
 * @component RecentActivity
 * @description Lista de actividades recientes del sistema
 * 
 * @returns {JSX.Element} Lista de actividades
 */
function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'success',
      message: 'Usuario admin@itr.com inició sesión',
      time: new Date(Date.now() - 5 * 60 * 1000),
      icon: <CheckCircleIcon color="success" />,
    },
    {
      id: 2,
      type: 'info',
      message: 'Nuevo usuario registrado: juan@example.com',
      time: new Date(Date.now() - 15 * 60 * 1000),
      icon: <PersonAddIcon color="primary" />,
    },
    {
      id: 3,
      type: 'warning',
      message: 'Intento de login fallido desde IP 192.168.1.100',
      time: new Date(Date.now() - 30 * 60 * 1000),
      icon: <WarningIcon color="warning" />,
    },
    {
      id: 4,
      type: 'error',
      message: 'Error de conexión a la base de datos',
      time: new Date(Date.now() - 45 * 60 * 1000),
      icon: <ErrorIcon color="error" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card sx={{ ...glassStyles.formContainer, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: 1 }}>
            <Typography variant="h6" component="div" sx={{ flex: 1, fontWeight: 600 }}>
              Actividad Reciente
            </Typography>
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Box>

          <List sx={{ px: 1 }}>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    {activity.icon}
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={format(activity.time, 'PPp', { locale: es })}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem',
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Componente principal del Dashboard
 * 
 * @component DashboardMain
 * @description Dashboard principal con estadísticas y resumen
 * 
 * @returns {JSX.Element} Dashboard principal
 * 
 * @since 1.0.0
 */
function DashboardMain() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, stats } = useSelector((state) => state.dashboard || { loading: false, stats: null });
  const { data: systemMetrics, refetch: refetchSystem, isFetching: isFetchingSystem } = useGetSystemMetricsQuery(undefined, { skip: !user });

  // Cargar estadísticas del dashboard
  useEffect(() => {
    // Simular carga de estadísticas
    // En una implementación real, aquí se haría dispatch(fetchDashboardStats())
  }, [dispatch]);

  // Datos simulados para el dashboard
  const mockStats = {
    totalUsers: 1247,
    activeUsers: 89,
    totalSessions: 3456,
    systemUptime: 99.9,
    usersGrowth: 12.5,
    sessionsGrowth: 8.3,
    uptimeGrowth: 0.1,
  };

  return (
    <Box>
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            ¡Bienvenido, {user?.first_name || 'Usuario'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aquí tienes un resumen de tu sistema ITR Dashboard
          </Typography>
        </Box>
      </motion.div>

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Usuarios"
            value={mockStats.totalUsers.toLocaleString()}
            subtitle="Usuarios registrados"
            icon={<PeopleIcon />}
            color={itrColors.primary.blue}
            trend={mockStats.usersGrowth}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Activos"
            value={mockStats.activeUsers}
            subtitle="Conectados ahora"
            icon={<TrendingUpIcon />}
            color={itrColors.primary.purple}
            trend={5.2}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sesiones Totales"
            value={mockStats.totalSessions.toLocaleString()}
            subtitle="Este mes"
            icon={<SecurityIcon />}
            color={itrColors.primary.light}
            trend={mockStats.sessionsGrowth}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Uptime del Sistema"
            value={`${mockStats.systemUptime}%`}
            subtitle="Disponibilidad"
            icon={<SpeedIcon />}
            color="#4caf50"
            trend={mockStats.uptimeGrowth}
          />
        </Grid>
      </Grid>

      {/* Gráficos y contenido adicional */}
      <Grid container spacing={3}>
        {/* Actividad reciente */}
        <Grid item xs={12} md={6}>
          <RecentActivity />
        </Grid>

        {/* Estado del sistema */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ ...glassStyles.formContainer, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Estado del Sistema
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">CPU Usage</Typography>
                    <Typography variant="body2">{systemMetrics?.data?.host?.cpu_usage_percent ?? 0}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics?.data?.host?.cpu_usage_percent ?? 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(64, 82, 196, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: itrColors.primary.blue,
                      },
                    }} 
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Memoria RAM</Typography>
                    <Typography variant="body2">{systemMetrics?.data?.host?.memory_usage_percent ?? 0}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics?.data?.host?.memory_usage_percent ?? 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(128, 54, 218, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: itrColors.primary.purple,
                      },
                    }} 
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Almacenamiento</Typography>
                    <Typography variant="body2">{systemMetrics?.data?.host?.disk?.used_percent ?? 0}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics?.data?.host?.disk?.used_percent ?? 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(97, 182, 221, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: itrColors.primary.light,
                      },
                    }} 
                  />
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  fullWidth
                  sx={glassStyles.buttonSecondary}
                  onClick={() => refetchSystem()}
                  disabled={isFetchingSystem}
                >
                  {isFetchingSystem ? 'Actualizando...' : 'Actualizar Métricas'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box sx={{ mt: 4, p: 3, ...glassStyles.formContainer }}>
          <Typography variant="h6" gutterBottom>
            🎯 Características del Sistema ITR Dashboard
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  ✅
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Autenticación JWT
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  🎨
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Glass Morphism
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  📊
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dashboard en Tiempo Real
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  🔒
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seguridad Avanzada
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}

export default DashboardMain;


