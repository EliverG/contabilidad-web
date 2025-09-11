import { Clear, CreateNewFolder, Delete, Edit, RemoveRedEye, NoteAddOutlined } from "@mui/icons-material";
import {Card,  CardContent,  Chip,  IconButton,  Button,  InputBase,  Paper,  ToggleButtonGroup,  ToggleButton,  Menu,  MenuItem} from "@mui/material";
import { useState } from 'react';
import HeaderCard from "../components/HeaderCard";
import NuevoAsientoModal from './NuevoAsientoModal';
import { ListOutlined, FileDownload } from "@mui/icons-material";

const dataEjemploAsientos = [
  {
    numero: "AST-991",
    fecha: "14/1/2024",
    descripcion: "Pago de factura de proveedores",
    referencia: "RIC-001",
    debito: "Q 3,490",
    credito: "Q 3,690",
    estado: "Contabilizado",
    usuario: "Juan Pérez",
    tipo: "Operativa",
    periodo: "Enero 2024",
    empresa: "Empresa A"
  },
  {
    numero: "AST-992",
    fecha: "15/1/2024",
    descripcion: "Venta de mercadería",
    referencia: "VEN-001",
    debito: "Q 580",
    credito: "Q 0",
    estado: "Pendiente",
    usuario: "Juan Pérez",
    tipo: "Operativa",
    periodo: "Enero 2024",
    empresa: "Empresa A"
  },
  {
    numero: "AST-993",
    fecha: "01/1/2024",
    descripcion: "Asiento de apertura",
    referencia: "AP-001",
    debito: "Q 10,000",
    credito: "Q 10,000",
    estado: "Contabilizado",
    usuario: "Admin",
    tipo: "Apertura",
    periodo: "Enero 2024",
    empresa: "Empresa B"
  },
  {
    numero: "AST-994",
    fecha: "31/1/2024",
    descripcion: "Asiento de cierre",
    referencia: "CI-001",
    debito: "Q 8,500",
    credito: "Q 8,500",
    estado: "Contabilizado",
    usuario: "Admin",
    tipo: "Cierre",
    periodo: "Enero 2024",
    empresa: "Empresa A"
  },
];

export default function AsientosContables() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vista, setVista] = useState<"todos" | "apertura" | "cierre" | "operativas" | "ajuste" | "regularizacion">("todos");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const filteredData = dataEjemploAsientos.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  ).filter(item => {
    if (vista === "todos") return true;
    return item.tipo?.toLowerCase() === vista.toLowerCase();
  });

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  }

  return (
    <>
      <Card>
        <HeaderCard
          title="Partidas Contables"
          subheader="En este módulo podrá gestionar todas las partidas contables."
        />
        <CardContent>
          <div className="p-6">
            {/* Selector de vista y botón de exportación */}
            <div className="flex justify-between items-center mb-4">
              <ToggleButtonGroup
                value={vista}
                exclusive
                onChange={(_, val) => val && setVista(val)}
                size="small"
                aria-label="tipo de partida"
              >
                <ToggleButton value="todos">Todas</ToggleButton>
                <ToggleButton value="apertura">Apertura</ToggleButton>
                <ToggleButton value="cierre">Cierre</ToggleButton>
                <ToggleButton value="operativa">Operativas</ToggleButton>
                <ToggleButton value="ajuste">Ajuste</ToggleButton>
                <ToggleButton value="regularizacion">Regularización</ToggleButton>
              </ToggleButtonGroup>

              {/*<Button
                variant="outlined"
                color="primary"
                startIcon={<FileDownload sx={{ fontSize: 20 }} />}
              >
                Exportar Todo
              </Button>*/}
            </div>

            <div className="flex justify-between mb-3">
              <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Buscar por número, descripción, referencia o usuario..."
                  inputProps={{ 'aria-label': 'search' }}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <IconButton
                  type="button"
                  sx={{ p: '10px' }}
                  aria-label="search"
                  onClick={() => setBusqueda("")}
                >
                  <Clear />
                </IconButton>
              </Paper>

              <Button
                id="basic-button"
                aria-controls={anchorEl ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
                onClick={handleClick}
                variant="contained"
                color="primary"
                startIcon={<NoteAddOutlined />}
              >
                Nueva Partida
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={() => { handleClose(); abrirModal(); }}>Partida Simple</MenuItem>
                <MenuItem onClick={handleClose}>Partida Compuesta</MenuItem>
                <MenuItem onClick={handleClose}>Partida de Ajuste</MenuItem>
              </Menu>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Número</th>
                    <th className="border p-2">Fecha</th>
                    <th className="border p-2">Descripción</th>
                    <th className="border p-2">Referencia</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Periodo</th>
                    <th className="border p-2">Empresa</th>
                    <th className="border p-2">Débito</th>
                    <th className="border p-2">Crédito</th>
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Usuario</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2">{item.numero}</td>
                        <td className="border p-2">{item.fecha}</td>
                        <td className="border p-2">{item.descripcion}</td>
                        <td className="border p-2">{item.referencia}</td>
                        <td className="border p-2">{item.tipo}</td>
                        <td className="border p-2">{item.periodo}</td>
                        <td className="border p-2">{item.empresa}</td>
                        <td className="border p-2">{item.debito}</td>
                        <td className="border p-2">{item.credito}</td>
                        <td
                          className={`text-center border gap-2 ${item.estado === "Contabilizado" ? "text-blue-500" : "text-red-500"
                            }`}
                        >
                          {item.estado}
                        </td>
                        <td className="border p-2">{item.usuario}</td>
                        <td className="flex gap-3 border justify-center p-2">
                          <Button
                            variant="contained"
                            size="large"
                            color="inherit"
                            title="Visualizar"
                          >
                            <RemoveRedEye />
                          </Button>
                          <Button
                            variant="contained"
                            size="large"
                            color="warning"
                            title="Editar"
                          >
                            <Edit />
                          </Button>
                          <Button
                            variant="contained"
                            size="large"
                            color="error"
                            title="Eliminar"
                          >
                            <Delete />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="text-center p-4">
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      <NuevoAsientoModal open={modalAbierto} onClose={cerrarModal} />
    </>
  );
}