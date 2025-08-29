import { createTheme } from '@mui/material/styles'

const themeApp = createTheme({
  palette: {
    primary: {
      main: '#000000',       // Base elegante
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5C6370',       // Gris carbón elegante
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#C1D3D9',       // Azul grisáceo muy suave
      contrastText: '#000000',
    },
    warning: {
      main: '#FCCE68',       // Azul grisáceo muy suave
      contrastText: '#000000',
    },
    background: {
      default: '#F5F5F3',    // Fondo cálido neutro
      paper: '#FFFFFF',
    },
    divider: '#DCDCDC',
    text: {
      primary: '#1A1A1A',
      secondary: '#6D6D6D',
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export default themeApp
