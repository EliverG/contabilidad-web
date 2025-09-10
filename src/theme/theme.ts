import { createTheme } from "@mui/material/styles";

const themeApp = createTheme({
  palette: {
    primary: {
      main: "#1E88E5",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#4FC3F7",
      contrastText: "#1B1B1B",
    },
    info: {
      main: "#1565C0",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#388E3C",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FBC02D",
      contrastText: "#1B1B1B",
    },
    error: {
      main: "#E53935",
      contrastText: "#FFFFFF",
    },
    background: {
      paper: "#EDEDED",
    },
    divider: "#E0E0E0",
    text: {
      primary: "#1B1B1B",
      secondary: "#4F4F4F",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default themeApp;