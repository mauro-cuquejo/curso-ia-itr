/**
 * Tema personalizado de Material-UI para ITR Dashboard
 * 
 * @description Configuración completa del tema con paleta de colores ITR,
 * tipografía, componentes personalizados y efectos glass morphism.
 * Define todos los colores, sombras y estilos del sistema de diseño.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import { createTheme } from '@mui/material/styles';

// ======================
// PALETA DE COLORES ITR
// ======================

/**
 * Colores principales del sistema ITR
 * 
 * @constant {Object} itrColors
 * @description Definición de todos los colores del sistema de diseño ITR
 * 
 * @since 1.0.0
 */
export const itrColors = {
  // Colores Principales
  primary: {
    blue: '#4052C4',      // Azul principal ITR
    purple: '#8036DA',    // Morado principal ITR
    light: '#61B6DD',     // Azul claro ITR
  },
  
  // Colores Secundarios
  secondary: {
    1: '#7482DE',
    2: '#2B3B9B',
    3: '#AB6EF4',
    4: '#5A1FA3',
    5: '#A0DAF4',
    6: '#408FB4',
  },
  
  // Glass Effect Variables
  glass: {
    background: 'rgba(64, 82, 196, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdrop: '10px',
    overlay: 'rgba(128, 54, 218, 0.05)',
  },
  
  // Estados
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Grises
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

/**
 * Configuración de sombras personalizadas
 * 
 * @constant {Array} customShadows
 * @description Sombras optimizadas para efectos glass morphism
 * 
 * @since 1.0.0
 */
const customShadows = [
  'none',
  '0 1px 3px rgba(64, 82, 196, 0.1), 0 1px 2px rgba(64, 82, 196, 0.06)',
  '0 4px 6px rgba(64, 82, 196, 0.1), 0 2px 4px rgba(64, 82, 196, 0.06)',
  '0 10px 15px rgba(64, 82, 196, 0.1), 0 4px 6px rgba(64, 82, 196, 0.05)',
  '0 20px 25px rgba(64, 82, 196, 0.1), 0 10px 10px rgba(64, 82, 196, 0.04)',
  '0 25px 50px rgba(64, 82, 196, 0.15), 0 12px 24px rgba(64, 82, 196, 0.08)',
  // Continuando con más niveles...
  ...Array(19).fill(0).map((_, i) => 
    `0 ${4 + i * 2}px ${8 + i * 4}px rgba(64, 82, 196, ${0.1 + i * 0.01})`
  )
];

/**
 * Tema principal de Material-UI
 * 
 * @constant {Object} theme
 * @description Configuración completa del tema con todos los componentes personalizados
 * 
 * @since 1.0.0
 */
export const theme = createTheme({
  // ======================
  // PALETA DE COLORES
  // ======================
  palette: {
    mode: 'light',
    primary: {
      main: itrColors.primary.blue,
      light: itrColors.primary.light,
      dark: itrColors.secondary[2],
      contrastText: '#ffffff',
    },
    secondary: {
      main: itrColors.primary.purple,
      light: itrColors.secondary[3],
      dark: itrColors.secondary[4],
      contrastText: '#ffffff',
    },
    error: {
      main: itrColors.status.error,
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    warning: {
      main: itrColors.status.warning,
      light: '#FCD34D',
      dark: '#D97706',
    },
    success: {
      main: itrColors.status.success,
      light: '#6EE7B7',
      dark: '#059669',
    },
    info: {
      main: itrColors.status.info,
      light: '#93C5FD',
      dark: '#1D4ED8',
    },
    background: {
      default: '#F8FAFC',
      paper: 'rgba(255, 255, 255, 0.9)',
      glass: itrColors.glass.background,
    },
    text: {
      primary: itrColors.gray[900],
      secondary: itrColors.gray[600],
      disabled: itrColors.gray[400],
    },
    divider: itrColors.gray[200],
    action: {
      hover: 'rgba(64, 82, 196, 0.04)',
      selected: 'rgba(64, 82, 196, 0.08)',
      disabled: itrColors.gray[300],
      disabledBackground: itrColors.gray[100],
    },
  },

  // ======================
  // TIPOGRAFÍA
  // ======================
  typography: {
    fontFamily: '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: itrColors.gray[600],
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },

  // ======================
  // ESPACIADO Y FORMA
  // ======================
  spacing: 8,
  shape: {
    borderRadius: 12,
  },

  // ======================
  // SOMBRAS
  // ======================
  shadows: customShadows,

  // ======================
  // BREAKPOINTS
  // ======================
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  // ======================
  // COMPONENTES PERSONALIZADOS
  // ======================
  components: {
    // Botones
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: customShadows[2],
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${itrColors.primary.blue} 0%, ${itrColors.primary.purple} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${itrColors.secondary[2]} 0%, ${itrColors.secondary[4]} 100%)`,
          },
        },
        outlined: {
          borderColor: itrColors.primary.blue,
          color: itrColors.primary.blue,
          '&:hover': {
            backgroundColor: 'rgba(64, 82, 196, 0.04)',
            borderColor: itrColors.secondary[2],
          },
        },
      },
    },

    // Cards con efecto glass
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${itrColors.glass.border}`,
          boxShadow: customShadows[3],
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: customShadows[4],
          },
        },
      },
    },

    // Inputs y campos de formulario
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(5px)',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: itrColors.gray[300],
            },
            '&:hover fieldset': {
              borderColor: itrColors.primary.blue,
            },
            '&.Mui-focused fieldset': {
              borderColor: itrColors.primary.blue,
              borderWidth: 2,
            },
          },
        },
      },
    },

    // AppBar personalizada
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${itrColors.glass.border}`,
          boxShadow: customShadows[1],
          color: itrColors.gray[900],
        },
      },
    },

    // Drawer personalizado
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${itrColors.glass.border}`,
        },
      },
    },

    // Chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: 'rgba(64, 82, 196, 0.1)',
          color: itrColors.primary.blue,
          border: `1px solid rgba(64, 82, 196, 0.2)`,
        },
        colorPrimary: {
          backgroundColor: 'rgba(64, 82, 196, 0.1)',
          color: itrColors.primary.blue,
        },
        colorSecondary: {
          backgroundColor: 'rgba(128, 54, 218, 0.1)',
          color: itrColors.primary.purple,
        },
      },
    },

    // Tab personalizados
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          color: itrColors.gray[600],
          '&.Mui-selected': {
            color: itrColors.primary.blue,
          },
        },
      },
    },

    // Indicador de tabs
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: `linear-gradient(90deg, ${itrColors.primary.blue}, ${itrColors.primary.purple})`,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },

    // Data Grid personalizada
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'rgba(64, 82, 196, 0.05)',
            borderBottom: `1px solid ${itrColors.glass.border}`,
            fontWeight: 600,
          },
          '& .MuiDataGrid-row': {
            borderBottom: `1px solid ${itrColors.gray[100]}`,
            '&:hover': {
              backgroundColor: 'rgba(64, 82, 196, 0.02)',
            },
          },
        },
      },
    },

    // Paper personalizado
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${itrColors.glass.border}`,
        },
      },
    },

    // Iconos de estado
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${itrColors.primary.blue}, ${itrColors.primary.purple})`,
        },
      },
    },
  },
});

/**
 * Estilos adicionales para efectos glass
 * 
 * @constant {Object} glassEffects
 * @description Estilos CSS para efectos glass morphism reutilizables
 * 
 * @since 1.0.0
 */
export const glassEffects = {
  // Glass card básica
  glassCard: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${itrColors.glass.border}`,
    borderRadius: 16,
    boxShadow: customShadows[3],
  },
  
  // Glass card intensa
  glassCardIntense: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${itrColors.glass.border}`,
    borderRadius: 20,
    boxShadow: customShadows[4],
  },
  
  // Glass overlay
  glassOverlay: {
    background: 'rgba(64, 82, 196, 0.1)',
    backdropFilter: 'blur(15px)',
    border: `1px solid ${itrColors.glass.border}`,
  },
  
  // Gradiente principal
  primaryGradient: {
    background: `linear-gradient(135deg, ${itrColors.primary.blue} 0%, ${itrColors.primary.purple} 100%)`,
  },
  
  // Gradiente secundario
  secondaryGradient: {
    background: `linear-gradient(135deg, ${itrColors.primary.light} 0%, ${itrColors.secondary[5]} 100%)`,
  },
};

/**
 * Utilidades de color
 * 
 * @constant {Object} colorUtils
 * @description Funciones auxiliares para manipular colores
 * 
 * @since 1.0.0
 */
export const colorUtils = {
  /**
   * Convierte hex a rgba
   * @param {string} hex - Color en formato hex
   * @param {number} alpha - Transparencia (0-1)
   * @returns {string} Color en formato rgba
   */
  hexToRgba: (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  /**
   * Obtiene color de estado
   * @param {string} status - Estado (success, warning, error, info)
   * @returns {string} Color correspondiente
   */
  getStatusColor: (status) => {
    return itrColors.status[status] || itrColors.gray[500];
  },
};

export default theme;
