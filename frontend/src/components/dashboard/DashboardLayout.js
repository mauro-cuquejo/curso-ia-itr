/**
 * Layout principal del Dashboard
 *
 * @description Layout con sidebar, header y área de contenido principal
 * para el dashboard ITR con diseño glass morphism.
 *
 * @author ITR Team
 * @since 1.0.0
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { glassStyles } from '../../styles/glassStyles';
import { itrColors } from '../../styles/theme';
import { logoutUser } from '../../store/slices/authSlice';

const drawerWidth = 280;

/**
 * Componente de layout del dashboard
 *
 * @component DashboardLayout
 * @description Layout principal con sidebar y header
 *
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Contenido principal
 * @returns {JSX.Element} Layout del dashboard
 *
 * @since 1.0.0
 */
function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  /**
   * Maneja el logout del usuario
   */
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
    setAnchorEl(null);
  };

  /**
   * Maneja el menú de usuario
   */
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Maneja el toggle del sidebar móvil
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /**
   * Items del menú de navegación
   */
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      active: true,
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/dashboard/users',
      active: false,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <AnalyticsIcon />,
      path: '/dashboard/analytics',
      active: false,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
      active: false,
    },
  ];

  /**
   * Componente del sidebar
   */
  const Sidebar = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo y título */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${itrColors.primary.blue}, ${itrColors.primary.purple})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ITR Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sistema de Gestión
          </Typography>
        </motion.div>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Menú de navegación */}
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={item.active}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(64, 82, 196, 0.1)',
                    border: '1px solid rgba(64, 82, 196, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(64, 82, 196, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(64, 82, 196, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: item.active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Información del usuario */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: itrColors.primary.blue,
            }}
          >
            {user?.first_name?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || 'usuario@itr.com'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const SidebarItem = styled(Box)(({ theme, active }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: `${theme.spacing(1.25)} ${theme.spacing(2)}`,
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    color: active ? '#5052C4' : theme.palette.text.secondary,
    backgroundColor: active ? 'rgba(80, 82, 196, 0.08)' : 'transparent',
    borderLeft: active ? '3px solid #5052C4' : '3px solid transparent',
    paddingLeft: active ? `calc(${theme.spacing(2)} - 3px)` : theme.spacing(2),
    fontWeight: active ? 500 : 400,
    '&:hover': {
      backgroundColor: 'rgba(80, 82, 196, 0.05)',
    },
  }));

  const SidebarContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: theme.spacing(2),
    height: '100%',
    overflow: 'auto',
  }));

  const ContentContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  }));

  const drawerContent = (
    <SidebarContainer>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#5052C4' }}>
        ITR Dashboard
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {menuItems.map((item) => (
        <SidebarItem
          key={item.id}
          active={activeMenu === item.id}
          onClick={() => {
            setActiveMenu(item.id);
            setMobileOpen(false);
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, fontWeight: activeMenu === item.id ? 500 : 400 }}>
            {item.label}
          </Typography>
        </SidebarItem>
      ))}

      <Divider sx={{ my: 2 }} />

      <List sx={{ mt: 2 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: '8px', mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon sx={{ fontSize: '20px' }} />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: '8px' }} onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon sx={{ fontSize: '20px' }} />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </SidebarContainer>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1201, backgroundColor: '#fff', color: '#333', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: '#5052C4' }}>
            ITR Dashboard
          </Typography>
          <Badge badgeContent={3} color="error">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Badge>
          <IconButton onClick={handleMenu} sx={{ ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#5052C4' }}>U</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Perfil</MenuItem>
            <MenuItem onClick={handleClose}>Configuración</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid #e0e0e0',
            pt: 10,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {drawerContent}
        </Box>
      </Drawer>

      {/* Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            backgroundColor: '#f8f9fa',
            pt: 8,
          },
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          {drawerContent}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 3,
          pt: 10,
          backgroundColor: '#f5f5f5',
          overflow: 'auto',
        }}
      >
        <ContentContainer>
          {children}
        </ContentContainer>
      </Box>
    </Box>
  );
}

export default DashboardLayout;


