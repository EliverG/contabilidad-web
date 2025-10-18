import { AssuredWorkload, Calculate, CalendarMonth, ImportContacts, RequestPage } from "@mui/icons-material";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Business } from "@mui/icons-material";

export default function Navbar() {
    const navigate = useNavigate();

  return (
     <AppBar position="static">
      <Toolbar className="gap-2">
        <Typography variant="h6" sx={{ flexGrow: 2 }}>
          <AssuredWorkload /> Sistema de contabilidad
        </Typography>
        <Button onClick={() => navigate('/home/empresas')} color="inherit" startIcon={<Business />}>
          Empresas
        </Button>
        <Button onClick={() => navigate('/home/catalogo')} color="inherit" startIcon={<ImportContacts />}>
          Catálogo de Cuentas
        </Button>
        <Button onClick={() => navigate('/home/asientos')} color="inherit" startIcon={<RequestPage />}>
          Asientos Contables
        </Button>
        <Button onClick={() => navigate('/home/libro-diario')} color="inherit" startIcon={<Calculate />}>
          Libro Diario
        </Button>
        <Button onClick={() => navigate('/home/libro')} color="inherit" startIcon={<Calculate />}>
          Libro Mayor
        </Button>
        <Button onClick={() => navigate('/home/cierre')} color="inherit" startIcon={<CalendarMonth />}>
          Cierre Contable
        </Button>
        {/* <Button onClick={() => navigate('/home/reportes')} color="inherit" startIcon={<InsertChart />}>
          Reportes
        </Button> */}
      </Toolbar>
    </AppBar>
  );
}