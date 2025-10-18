import {
  Card,
  CardContent,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import {
  Clear,
  Search,
  PictureAsPdf,
  Print,
  FileDownload,
  History,
  Add,
} from "@mui/icons-material";
import HeaderCard from "../components/HeaderCard";
import { useState } from "react";
import HistorialdeBusquedaModal from "./HistorialdeBusquedaModal";
import NuevoLibroMayorModal from "./NuevoLibroMayorModal";


export default function LibroMayor() {
  const [cuenta, setCuenta] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>("2024-01-01");
  const [fechaFin, setFechaFin] = useState<string>("2024-12-31");
  const [centroCosto, setCentroCosto] = useState<string>("Todos");
  const [proyecto, setProyecto] = useState<string>("Todos");
  const [estado, setEstado] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modal Historial
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const abrirHistorial = () => setHistorialAbierto(true);
  const cerrarHistorial = () => setHistorialAbierto(false);

  // Modal Nuevo Libro Mayor
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const abrirNuevo = () => setNuevoAbierto(true);
  const cerrarNuevo = () => setNuevoAbierto(false);

  return (
    <Card>
      <HeaderCard
        title="Consulta del Libro Mayor"
        subheader="Filtre y exporte los movimientos de una cuenta contable."
      />

      <CardContent>
        <div className="p-6 space-y-6">
          {/* Barra de acciones */}
          <div className="flex justify-end gap-2">
            <Button
              variant="contained"
              startIcon={<Add />}
              className="font-bold"
              onClick={abrirNuevo}
            >
              Nuevo
            </Button>
            <Button
              variant="contained"
              startIcon={<History />}
              className="font-bold"
              onClick={abrirHistorial}
            >
              Historial
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              className="font-bold"
            >
              Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              className="font-bold"
            >
              PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<Print />}
              className="font-bold"
            >
              Imprimir
            </Button>
          </div>

          <Divider />

          {/* Filtros (más compacto) */}
          <div className="grid grid-cols-12 gap-3">
            {/* Cuenta contable */}
            <div className="col-span-12 md:col-span-4 mb-2">
              <label className="block text-sm font-bold mb-1">
                Cuenta contable *
              </label>
              <Select
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value as string)}
                displayEmpty
                size="small"
                sx={{ width: "auto", minWidth: 150 }}
                renderValue={(selected) => {
                  if (!selected) return <em>Seleccionar cuenta</em>;
                  const label =
                    selected === "C001"
                      ? "Caja General"
                      : selected === "C002"
                      ? "Bancos"
                      : selected === "C003"
                      ? "Cuentas por Cobrar"
                      : selected;
                  return label;
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar cuenta</em>
                </MenuItem>
                <MenuItem value="C001">Caja General</MenuItem>
                <MenuItem value="C002">Bancos</MenuItem>
                <MenuItem value="C003">Cuentas por Cobrar</MenuItem>
              </Select>
            </div>

            {/* Rango de fechas */}
            <div className="col-span-12 md:col-span-4 mb-2">
              <label className="block text-sm font-bold mb-1">
                Rango de fechas
              </label>
              <div className="flex flex-wrap items-end gap-2">
                <TextField
                  label="Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  size="small"
                  sx={{ width: "auto", minWidth: 150 }}
                  InputLabelProps={{
                    shrink: true,
                    style: { fontWeight: "bold" },
                  }}
                />
                <TextField
                  label="Fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  size="small"
                  sx={{ width: "auto", minWidth: 150 }}
                  InputLabelProps={{
                    shrink: true,
                    style: { fontWeight: "bold" },
                  }}
                />
              </div>
            </div>

            {/* Estado del asiento */}
            <div className="col-span-12 md:col-span-4 mb-2">
              <label className="block text-sm font-bold mb-1">
                Estado del asiento
              </label>
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value as string)}
                size="small"
                displayEmpty
                sx={{ width: "auto", minWidth: 150 }}
                renderValue={(selected) => selected || <em>Todos</em>}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Aprobado">Aprobado</MenuItem>
                <MenuItem value="Borrador">Borrador</MenuItem>
                <MenuItem value="Anulado">Anulado</MenuItem>
              </Select>
            </div>

            {/* Centro de costo */}
            <div className="col-span-12 md:col-span-4 mb-2">
              <label className="block text-sm font-bold mb-1">
                Centro de costo
              </label>
              <Select
                value={centroCosto}
                onChange={(e) => setCentroCosto(e.target.value as string)}
                size="small"
                displayEmpty
                sx={{ width: "auto", minWidth: 150 }}
                renderValue={(selected) => selected || <em>Todos</em>}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="CC-100">CC-100</MenuItem>
                <MenuItem value="CC-200">CC-200</MenuItem>
              </Select>
            </div>

            {/* Proyecto */}
            <div className="col-span-12 md:col-span-4 mb-2">
              <label className="block text-sm font-bold mb-1">Proyecto</label>
              <Select
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value as string)}
                size="small"
                displayEmpty
                sx={{ width: "auto", minWidth: 150 }}
                renderValue={(selected) => selected || <em>Todos</em>}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="P-001">P-001</MenuItem>
                <MenuItem value="P-002">P-002</MenuItem>
              </Select>
            </div>

            {/* Buscar */}
            <div className="col-span-12 md:col-span-8 mb-2">
              <label className="block text-sm font-bold mb-1">Buscar</label>
              <div className="flex items-center border rounded-md px-2">
                <Search className="text-gray-500" />
                <InputBase
                  className="ml-2 flex-1"
                  placeholder="Descripción, referencia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <IconButton onClick={() => setBusqueda("")} size="small">
                  <Clear fontSize="small" />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Estado vacío */}
          <div className="flex flex-col items-center justify-center text-gray-500 py-10">
            <Search sx={{ fontSize: 48, color: "#9ca3af" }} />
            <p className="mt-2">
              Seleccione una cuenta contable para ver sus movimientos
            </p>
          </div>
        </div>
      </CardContent>

      {/* Modales */}
      <HistorialdeBusquedaModal open={historialAbierto} onClose={cerrarHistorial} />
      <NuevoLibroMayorModal open={nuevoAbierto} onClose={cerrarNuevo} />
    </Card>
  );
}
