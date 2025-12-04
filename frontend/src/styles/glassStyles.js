/**
 * Estilos Glass Morphism para ITR Dashboard
 * 
 * @description Definición de estilos glass morphism reutilizables con efectos
 * de transparencia, blur y gradientes. Incluye variaciones para diferentes
 * casos de uso y estados de interacción.
 * 
 * @author ITR Team
 * @since 1.0.0
 */

import { itrColors } from './theme';

/**
 * Configuraciones base para efectos glass
 * 
 * @constant {Object} glassConfig
 * @description Configuraciones predefinidas para diferentes intensidades de glass
 * 
 * @since 1.0.0
 */
export const glassConfig = {
  // Configuraciones de blur
  blur: {
    light: '5px',
    medium: '10px',
    heavy: '20px',
    extreme: '30px',
  },
  
  // Configuraciones de transparencia
  opacity: {
    subtle: 0.7,
    medium: 0.8,
    strong: 0.9,
    solid: 0.95,
  },
  
  // Configuraciones de borde
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    strong: 'rgba(255, 255, 255, 0.3)',
  },
};

/**
 * Factory para crear efectos glass personalizados
 * 
 * @function createGlassEffect
 * @description Genera estilos glass personalizados basados en parámetros
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number} [options.opacity=0.8] - Opacidad del fondo
 * @param {string} [options.blur='10px'] - Intensidad del blur
 * @param {string} [options.borderColor] - Color del borde
 * @param {number} [options.borderRadius=16] - Radio del borde
 * @param {string} [options.background] - Color de fondo personalizado
 * 
 * @returns {Object} Objeto de estilos CSS
 * 
 * @example
 * const myGlass = createGlassEffect({
 *   opacity: 0.9,
 *   blur: '15px',
 *   borderRadius: 20
 * });
 * 
 * @since 1.0.0
 * @author ITR Team
 */
export const createGlassEffect = ({
  opacity = 0.8,
  blur = '10px',
  borderColor = glassConfig.border.medium,
  borderRadius = 16,
  background = '#ffffff'
} = {}) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur})`,
  WebkitBackdropFilter: `blur(${blur})`, // Safari support
  border: `1px solid ${borderColor}`,
  borderRadius: borderRadius,
  boxShadow: `
    0 8px 32px rgba(64, 82, 196, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5)
  `,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0) 50%, 
      rgba(255, 255, 255, 0.1) 100%
    )`,
    pointerEvents: 'none',
  },
});

/**
 * Estilos glass predefinidos
 * 
 * @constant {Object} glassStyles
 * @description Colección de estilos glass listos para usar
 * 
 * @since 1.0.0
 */
export const glassStyles = {
  // ======================
  // CARDS BÁSICAS
  // ======================
  
  /**
   * Card glass básica
   */
  card: {
    ...createGlassEffect({
      opacity: 0.8,
      blur: '10px',
      borderRadius: 16,
    }),
    padding: '24px',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `
        0 12px 40px rgba(64, 82, 196, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
  },

  /**
   * Card glass intensa para contenido principal
   */
  cardIntense: {
    ...createGlassEffect({
      opacity: 0.9,
      blur: '20px',
      borderRadius: 20,
    }),
    padding: '32px',
    transition: 'all 0.3s ease-in-out',
  },

  /**
   * Card glass sutil para elementos secundarios
   */
  cardSubtle: {
    ...createGlassEffect({
      opacity: 0.7,
      blur: '5px',
      borderRadius: 12,
    }),
    padding: '16px',
  },

  // ======================
  // NAVEGACIÓN
  // ======================

  /**
   * Sidebar glass con efecto de navegación
   */
  sidebar: {
    ...createGlassEffect({
      opacity: 0.9,
      blur: '20px',
      borderRadius: 0,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }),
    borderRight: `1px solid ${glassConfig.border.medium}`,
    borderLeft: 'none',
    borderTop: 'none',
    borderBottom: 'none',
    background: `linear-gradient(180deg, 
      rgba(255, 255, 255, 0.9) 0%,
      rgba(248, 250, 252, 0.9) 100%
    )`,
  },

  /**
   * AppBar glass para header
   */
  appBar: {
    ...createGlassEffect({
      opacity: 0.85,
      blur: '20px',
      borderRadius: 0,
    }),
    borderBottom: `1px solid ${glassConfig.border.medium}`,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    background: `linear-gradient(90deg, 
      rgba(255, 255, 255, 0.85) 0%,
      rgba(248, 250, 252, 0.85) 100%
    )`,
  },

  // ======================
  // FORMULARIOS
  // ======================

  /**
   * Contenedor de formulario con glass
   */
  formContainer: {
    ...createGlassEffect({
      opacity: 0.85,
      blur: '15px',
      borderRadius: 24,
    }),
    padding: '40px',
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%,
      rgba(248, 250, 252, 0.8) 100%
    )`,
  },

  /**
   * Input glass para campos de formulario
   */
  input: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
    border: `1px solid ${glassConfig.border.light}`,
    borderRadius: 12,
    transition: 'all 0.2s ease-in-out',
    '&:focus': {
      background: 'rgba(255, 255, 255, 0.9)',
      borderColor: itrColors.primary.blue,
      boxShadow: `0 0 0 3px ${itrColors.glass.background}`,
    },
    '&:hover': {
      borderColor: glassConfig.border.medium,
    },
  },

  // ======================
  // MODALES Y OVERLAYS
  // ======================

  /**
   * Modal glass con overlay
   */
  modal: {
    ...createGlassEffect({
      opacity: 0.95,
      blur: '25px',
      borderRadius: 24,
    }),
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.9) 100%
    )`,
    maxWidth: '90vw',
    maxHeight: '90vh',
  },

  /**
   * Overlay de fondo para modales
   */
  overlay: {
    background: 'rgba(64, 82, 196, 0.1)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },

  // ======================
  // BOTONES Y ACCIONES
  // ======================

  /**
   * Botón glass primario
   */
  buttonPrimary: {
    background: `linear-gradient(135deg, 
      ${itrColors.primary.blue} 0%, 
      ${itrColors.primary.purple} 100%
    )`,
    backdropFilter: 'blur(10px)',
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: 12,
    color: '#ffffff',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: `
        0 8px 25px rgba(64, 82, 196, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3)
      `,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },

  /**
   * Botón glass secundario
   */
  buttonSecondary: {
    ...createGlassEffect({
      opacity: 0.8,
      blur: '10px',
      borderRadius: 12,
    }),
    color: itrColors.primary.blue,
    borderColor: itrColors.primary.blue,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      background: `rgba(64, 82, 196, 0.1)`,
      transform: 'translateY(-1px)',
    },
  },

  // ======================
  // INDICADORES Y ESTADOS
  // ======================

  /**
   * Badge glass para notificaciones
   */
  badge: {
    background: `linear-gradient(135deg, 
      ${itrColors.status.error} 0%, 
      #FF6B6B 100%
    )`,
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 600,
  },

  /**
   * Chip glass para tags
   */
  chip: {
    ...createGlassEffect({
      opacity: 0.7,
      blur: '8px',
      borderRadius: 8,
    }),
    background: `rgba(64, 82, 196, 0.1)`,
    color: itrColors.primary.blue,
    borderColor: 'rgba(64, 82, 196, 0.2)',
    fontSize: '0.75rem',
    fontWeight: 500,
  },

  // ======================
  // EFECTOS ESPECIALES
  // ======================

  /**
   * Efecto glass con gradiente animado
   */
  animatedGradient: {
    ...createGlassEffect({
      opacity: 0.8,
      blur: '15px',
      borderRadius: 20,
    }),
    background: `linear-gradient(135deg, 
      rgba(64, 82, 196, 0.1) 0%,
      rgba(128, 54, 218, 0.1) 50%,
      rgba(97, 182, 221, 0.1) 100%
    )`,
    backgroundSize: '200% 200%',
    animation: 'gradientShift 8s ease infinite',
    '@keyframes gradientShift': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  },

  /**
   * Glass con efecto de brillo
   */
  glowEffect: {
    ...createGlassEffect({
      opacity: 0.85,
      blur: '12px',
      borderRadius: 16,
    }),
    boxShadow: `
      0 8px 32px rgba(64, 82, 196, 0.15),
      0 0 40px rgba(128, 54, 218, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5)
    `,
    '&:hover': {
      boxShadow: `
        0 12px 40px rgba(64, 82, 196, 0.2),
        0 0 60px rgba(128, 54, 218, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
  },

  // ======================
  // RESPONSIVE VARIANTS
  // ======================

  /**
   * Glass móvil optimizado
   */
  mobile: {
    ...createGlassEffect({
      opacity: 0.9,
      blur: '8px',
      borderRadius: 12,
    }),
    padding: '16px',
    // Reducir efectos en móvil para mejor rendimiento
    '@media (max-width: 768px)': {
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
    },
  },
};

/**
 * Utilidades para efectos glass
 * 
 * @constant {Object} glassUtils
 * @description Funciones auxiliares para manipular efectos glass
 * 
 * @since 1.0.0
 */
export const glassUtils = {
  /**
   * Combina múltiples efectos glass
   * @param {...Object} effects - Efectos a combinar
   * @returns {Object} Efecto combinado
   */
  combine: (...effects) => {
    return effects.reduce((combined, effect) => ({
      ...combined,
      ...effect,
    }), {});
  },

  /**
   * Ajusta la opacidad de un efecto glass
   * @param {Object} effect - Efecto base
   * @param {number} opacity - Nueva opacidad
   * @returns {Object} Efecto con opacidad ajustada
   */
  adjustOpacity: (effect, opacity) => ({
    ...effect,
    background: effect.background?.replace(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/,
      `rgba($1, $2, $3, ${opacity})`
    ),
  }),

  /**
   * Cambia el blur de un efecto glass
   * @param {Object} effect - Efecto base
   * @param {string} blur - Nuevo valor de blur
   * @returns {Object} Efecto con blur ajustado
   */
  adjustBlur: (effect, blur) => ({
    ...effect,
    backdropFilter: `blur(${blur})`,
    WebkitBackdropFilter: `blur(${blur})`,
  }),
};

/**
 * CSS variables para efectos glass
 * 
 * @constant {Object} glassCSSVariables
 * @description Variables CSS para uso en componentes styled
 * 
 * @since 1.0.0
 */
export const glassCSSVariables = {
  '--glass-bg': 'rgba(255, 255, 255, 0.8)',
  '--glass-border': 'rgba(255, 255, 255, 0.2)',
  '--glass-blur': '10px',
  '--glass-shadow': '0 8px 32px rgba(64, 82, 196, 0.1)',
  '--itr-primary': itrColors.primary.blue,
  '--itr-secondary': itrColors.primary.purple,
  '--itr-light': itrColors.primary.light,
};

export default glassStyles;
