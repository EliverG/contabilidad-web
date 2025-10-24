import { Clear, Delete, Edit, RemoveRedEye, NoteAddOutlined } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  InputBase,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid
} from "@mui/material";
import { useState, useEffect } from 'react';
import HeaderCard from "../components/HeaderCard";
import NuevoAsientoModal from './NuevoAsientoModal';
import EditarAsientoModal from './EditarAsientoModal';
import { asientoContableService } from '../services/asientoContableService';
import type { AsientoContable } from '../types/AsientoContable';

// ✅ SERVICIOS REALES PARA EMPRESAS Y PERIODOS
import { empresaService, type Empresa } from '../services/empresaService';
import { periodoService, type Periodo } from '../services/periodoService';

export default function AsientosContables() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vista, setVista] = useState<"todos" | "apertura" | "cierre" | "operativa" | "ajuste" | "regularizacion">("todos");
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [asientoEditando, setAsientoEditando] = useState<number | null>(null);

  // ✅ NUEVOS ESTADOS PARA FILTROS
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState<number>(0); // 0 = Todas
  const [filtroPeriodo, setFiltroPeriodo] = useState<number>(0); // 0 = Todos
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Cargar datos iniciales y asientos al montar el componente
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // ✅ FUNCIÓN PARA CARGAR DATOS INICIALES
  const cargarDatosIniciales = async () => {
    try {
      setCargandoDatos(true);
      console.log('🔄 Cargando datos iniciales para AsientosContables...');

      const [empresasData, periodosData] = await Promise.all([
        empresaService.getAll(),
        periodoService.getAll()
      ]);

      console.log('📊 Datos recibidos:', {
        empresas: empresasData,
        periodos: periodosData
      });

      setEmpresas(empresasData);
      setPeriodos(periodosData);

      // Cargar asientos después de tener los datos iniciales
      await cargarAsientos();

    } catch (error: any) {
      console.error('❌ Error al cargar datos iniciales:', error);
      mostrarSnackbar('Error al cargar empresas y periodos: ' + error.message, 'error');
      setEmpresas([]);
      setPeriodos([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  const cargarAsientos = async () => {
    try {
      setLoading(true);
      const data = await asientoContableService.getAll();
      setAsientos(data);
    } catch (error) {
      console.error('Error al cargar asientos:', error);
      mostrarSnackbar('Error al cargar los asientos contables', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ FILTRADO COMBINADO (búsqueda + tipo + empresa + periodo)
  const filteredData = asientos.filter((item) => {
    // Filtro de búsqueda en texto
    const coincideBusqueda = Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(busqueda.toLowerCase())
    );

    // Filtro por tipo de asiento
    const coincideTipo = vista === "todos" || item.tipo?.toLowerCase() === vista.toLowerCase();

    // ✅ Filtro por empresa
    const coincideEmpresa = filtroEmpresa === 0 || item.idEmpresa === filtroEmpresa;

    // ✅ Filtro por periodo
    const coincidePeriodo = filtroPeriodo === 0 || item.idPeriodo === filtroPeriodo;

    return coincideBusqueda && coincideTipo && coincideEmpresa && coincidePeriodo;
  });

  const abrirModal = () => setModalAbierto(true);
  
  const cerrarModal = (actualizar: boolean = false) => {
    setModalAbierto(false);
    if (actualizar) {
      cargarAsientos();
      mostrarSnackbar('Asiento creado exitosamente', 'success');
    }
  };

  // Función para abrir el modal de edición
  const abrirModalEditar = (id: number) => {
    setAsientoEditando(id);
    setModalEditarAbierto(true);
  };

  // Función para cerrar el modal de edición
  const cerrarModalEditar = (actualizar: boolean = false) => {
    setModalEditarAbierto(false);
    setAsientoEditando(null);
    if (actualizar) {
      cargarAsientos(); // Recargar la lista si se actualizó algo
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este asiento?')) {
      try {
        await asientoContableService.delete(id);
        mostrarSnackbar('Asiento eliminado exitosamente', 'success');
        cargarAsientos();
      } catch (error) {
        console.error('Error al eliminar asiento:', error);
        mostrarSnackbar('Error al eliminar el asiento', 'error');
      }
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO') => {
    try {
      await asientoContableService.updateEstado(id, nuevoEstado);
      mostrarSnackbar('Estado actualizado exitosamente', 'success');
      cargarAsientos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      mostrarSnackbar('Error al cambiar el estado', 'error');
    }
  };

  // ✅ FUNCIÓN PARA LIMPIAR TODOS LOS FILTROS
  const limpiarFiltros = () => {
    setBusqueda("");
    setVista("todos");
    setFiltroEmpresa(0);
    setFiltroPeriodo(0);
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-GT');
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'CONTABILIZADO': return 'success';
      case 'BORRADOR': return 'warning';
      case 'ANULADO': return 'error';
      default: return 'default';
    }
  };

  const getTipoTexto = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'APERTURA': 'Apertura',
      'CIERRE': 'Cierre', 
      'OPERATIVA': 'Operativa',
      'AJUSTE': 'Ajuste',
      'REGULARIZACION': 'Regularización',
      'SIMPLE': 'Simple',
      'COMPUESTA': 'Compuesta'
    };
    return tipos[tipo] || tipo;
  };

  // ✅ OBTENER NOMBRES PARA MOSTRAR EN LA TABLA
  const obtenerNombreEmpresa = (idEmpresa: number) => {
    const empresa = empresas.find(e => e.id === idEmpresa);
    return empresa ? empresa.nombre : 'N/A';
  };

  const obtenerNombrePeriodo = (idPeriodo: number) => {
    const periodo = periodos.find(p => p.id === idPeriodo);
    return periodo ? periodo.nombre : 'N/A';
  };

  return (
    <>
      <Card>
        <HeaderCard
          title="Asientos Contables"
          subheader="En este módulo podrá gestionar todos los asientos contables."
        />
        <CardContent>
          <div className="p-6">
            {/* ✅ NUEVA SECCIÓN DE FILTROS AVANZADOS */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filtros Avanzados
              </Typography>
              
              {cargandoDatos ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Cargando empresas y periodos...</Typography>
                </Box>
              ) : (
                <Grid container spacing={2} alignItems="center">
                  {/* Filtro por Empresa */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Filtrar por Empresa"
                      value={filtroEmpresa}
                      onChange={(e) => setFiltroEmpresa(Number(e.target.value))}
                      size="small"
                    >
                      <MenuItem value={0}>Todas las empresas</MenuItem>
                      {empresas.map((empresa) => (
                        <MenuItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Filtro por Periodo */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Filtrar por Periodo"
                      value={filtroPeriodo}
                      onChange={(e) => setFiltroPeriodo(Number(e.target.value))}
                      size="small"
                    >
                      <MenuItem value={0}>Todos los periodos</MenuItem>
                      {periodos.map((periodo) => (
                        <MenuItem key={periodo.id} value={periodo.id}>
                          {periodo.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Botón limpiar filtros */}
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={limpiarFiltros}
                      startIcon={<Clear />}
                    >
                      Limpiar Filtros
                    </Button>
                  </Grid>

                  {/* Contador de resultados */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary" align="right">
                      Mostrando {filteredData.length} de {asientos.length} asientos
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>

            {/* Selector de vista por tipo (EXISTENTE) */}
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
            </div>

            {/* Búsqueda y botón nuevo (EXISTENTE) */}
            <div className="flex justify-between mb-3">
              <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Buscar por número, descripción, referencia..."
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
                onClick={abrirModal}
                variant="contained"
                color="primary"
                startIcon={<NoteAddOutlined />}
              >
                Nueva Partida
              </Button>
            </div>

            {/* Tabla ACTUALIZADA con nuevas columnas */}
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Número</th>
                    <th className="border p-2">Fecha</th>
                    <th className="border p-2">Descripción</th>
                    <th className="border p-2">Referencia</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Empresa</th> {/* ✅ NUEVA COLUMNA */}
                    <th className="border p-2">Periodo</th> {/* ✅ NUEVA COLUMNA */}
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Débito</th>
                    <th className="border p-2">Crédito</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="text-center p-4">
                        <div className="flex justify-center items-center">
                          <CircularProgress size={24} />
                          <span className="ml-2">Cargando asientos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border p-2 font-mono">{item.numeroAsiento}</td>
                        <td className="border p-2">{formatearFecha(item.fecha)}</td>
                        <td className="border p-2 max-w-xs" title={item.descripcion}>
                          {item.descripcion}
                        </td>
                        <td className="border p-2">{item.referencia || '-'}</td>
                        <td className="border p-2">{getTipoTexto(item.tipo)}</td>
                        <td className="border p-2">{obtenerNombreEmpresa(item.idEmpresa)}</td> {/* ✅ NUEVA COLUMNA */}
                        <td className="border p-2">{obtenerNombrePeriodo(item.idPeriodo)}</td> {/* ✅ NUEVA COLUMNA */}
                        <td className="border p-2 text-center">
                          <Chip 
                            label={item.estado} 
                            color={getColorEstado(item.estado)}
                            size="small"
                          />
                        </td>
                        <td className="border p-2 text-right font-mono">{formatearMoneda(item.totalDebito)}</td>
                        <td className="border p-2 text-right font-mono">{formatearMoneda(item.totalCredito)}</td>
                        <td className="flex gap-3 border justify-center p-2">
                          <Button
                            variant="contained"
                            size="large"
                            color="warning"
                            title="Editar"
                            onClick={() => abrirModalEditar(item.id)}
                          >
                            <Edit />
                          </Button>

                          <Button
                            variant="contained"
                            size="large"
                            color="error"
                            title="Eliminar"
                            onClick={() => handleEliminar(item.id)}
                          >
                            <Delete />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="text-center p-4">
                        {busqueda || filtroEmpresa !== 0 || filtroPeriodo !== 0 || vista !== "todos" 
                          ? 'No se encontraron resultados para los filtros aplicados' 
                          : 'No hay asientos contables registrados'
                        }
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

      <EditarAsientoModal open={modalEditarAbierto} onClose={cerrarModalEditar} asientoId={asientoEditando} />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}