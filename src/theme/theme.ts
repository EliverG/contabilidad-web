import { createTheme } from '@mui/material/styles'

const themeApp = createTheme({
  palette: {
    primary: {
      main: '#43A047',         // Verde moderno (tipo "verde bosque suave")
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#66BB6A',         // Verde más claro, complementario al primario
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#81C784',         // Verde pasto claro, para info amigable
      contrastText: '#1B1B1B',
    },
    success: {
      main: '#388E3C',         // Verde intenso para estados de éxito
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FBC02D',         // Amarillo vibrante pero no chillón
      contrastText: '#1B1B1B',
    },
    error: {
      main: '#E53935',         // Rojo moderado
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAF9',       // Fondo casi blanco con tono verdoso muy sutil
      paper: '#FFFFFF',         // Elementos sobre fondo claro
    },
    divider: '#E0E0E0',         // Gris suave para separar sin molestar
    text: {
      primary: '#1B1B1B',       // Negro suave para lectura
      secondary: '#4F4F4F',     // Gris oscuro para detalles
    },
  },
  shape: {
    borderRadius: 8,            // Ligero redondeo moderno
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default themeApp
