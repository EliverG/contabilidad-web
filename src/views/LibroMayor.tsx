import { 
    Card, 
    CardContent, 
    IconButton, 
    InputBase, 
    MenuItem, 
    Select, 
    TextField, 
    Button 
} from "@mui/material";
import { 
    Clear, 
    Search, 
    PictureAsPdf, 
    Print, 
    FileDownload, 
    History 
} from "@mui/icons-material"; // 👈 Importamos el ícono de reloj
import HeaderCard from "../components/HeaderCard";
import { useState } from "react";

import HistorialdeBusquedaModal from "./HistorialdeBusquedaModal"; // 👈 Importar modal nueva

export default function LibroMayor() {
    const [cuenta, setCuenta] = useState("");
    const [fechaInicio, setFechaInicio] = useState("2024-01-01");
    const [fechaFin, setFechaFin] = useState("2024-12-31");
    const [centroCosto, setCentroCosto] = useState("Todos");
    const [proyecto, setProyecto] = useState("Todos");
    const [estado, setEstado] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");

    // 👇 Estado de modal Historial
    const [historialAbierto, setHistorialAbierto] = useState(false);
    const abrirHistorial = () => setHistorialAbierto(true);
    const cerrarHistorial = () => setHistorialAbierto(false);

    return (
        <Card>
            <HeaderCard
                title="Consulta del Libro Mayor"
                subheader="Filtre y exporte los movimientos de una cuenta contable."
            />
            <CardContent>
                <div className="p-6 space-y-6">

                    {/* Barra de exportación */}
                    <div className="flex justify-end gap-2">
                        {/* 👇 Nuevo botón de Historial */}
                        <Button 
                            variant="outlined" 
                            startIcon={<History />}
                            className="font-bold"
                            onClick={abrirHistorial}
                        >
                            Historial
                        </Button>

                        <Button 
                            variant="outlined" 
                            startIcon={<FileDownload />}
                            className="font-bold"
                        >
                            Excel
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<PictureAsPdf />}
                            className="font-bold"
                        >
                            PDF
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<Print />}
                            className="font-bold"
                        >
                            Imprimir
                        </Button>
                    </div>

                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Cuenta contable */}
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Cuenta contable *
                            </label>
                            <Select
                                value={cuenta}
                                onChange={(e) => setCuenta(e.target.value)}
                                displayEmpty
                                fullWidth
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
                        <div className="lg:col-span-1">
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
                                        style: { fontWeight: "bold" } // <-- Negrita en "Inicio"
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
                                        style: { fontWeight: "bold" } // <-- Negrita en "Fin"
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div></div>

                        {/* Centro de costo */}
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Centro de costo
                            </label>
                            <Select
                                value={centroCosto}
                                onChange={(e) => setCentroCosto(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="CC-100">CC-100</MenuItem>
                                <MenuItem value="CC-200">CC-200</MenuItem>
                            </Select>
                        </div>

                        {/* Proyecto */}
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Proyecto
                            </label>
                            <Select
                                value={proyecto}
                                onChange={(e) => setProyecto(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="P-001">Proyecto A</MenuItem>
                                <MenuItem value="P-002">Proyecto B</MenuItem>
                            </Select>
                        </div>

                        {/* Estado del asiento */}
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Estado del asiento
                            </label>
                            <Select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="Aprobado">Aprobado</MenuItem>
                                <MenuItem value="Borrador">Borrador</MenuItem>
                                <MenuItem value="Anulado">Anulado</MenuItem>
                            </Select>
                        </div>

                        {/* Buscar */}
                        <div>
                            <label className="block text-sm font-bold mb-1">
                                Buscar
                            </label>
                            <div className="flex items-center border rounded-md px-2">
                                <Search className="text-gray-500" />
                                <InputBase
                                    className="ml-2 flex-1"
                                    placeholder="Descripción, referencia..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                                <IconButton
                                    onClick={() => setBusqueda("")}
                                    size="small"
                                >
                                    <Clear fontSize="small" />
                                </IconButton>
                            </div>
                        </div>
                    </div>

                    {/* Estado vacío */}
                    <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                        <Search sx={{ fontSize: 48, color: "#9ca3af" }} />
                        <p className="mt-2">Seleccione una cuenta contable para ver sus movimientos</p>
                    </div>
                </div>
            </CardContent>

            {/* 👇 Modal Historial */}
            <HistorialdeBusquedaModal open={historialAbierto} onClose={cerrarHistorial} />
        </Card>
    );
}