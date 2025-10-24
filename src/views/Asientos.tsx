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
  CircularProgress
} from "@mui/material";
import { useState, useEffect } from 'react';
import HeaderCard from "../components/HeaderCard";
import NuevoAsientoModal from './NuevoAsientoModal';
import EditarAsientoModal from './EditarAsientoModal';
import { asientoContableService } from '../services/asientoContableService';
import type { AsientoContable } from '../types/AsientoContable';

export default function AsientosContables() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vista, setVista] = useState<"todos" | "apertura" | "cierre" | "operativa" | "ajuste" | "regularizacion">("todos");
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [asientoEditando, setAsientoEditando] = useState<number | null>(null);

  // Cargar asientos al montar el componente
  useEffect(() => {
    cargarAsientos();
  }, []);

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

  const filteredData = asientos.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  ).filter(item => {
    if (vista === "todos") return true;
    return item.tipo?.toLowerCase() === vista.toLowerCase();
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

  return (
    <>
      <Card>
        <HeaderCard
          title="Asientos Contables"
          subheader="En este módulo podrá gestionar todos los asientos contables."
        />
        <CardContent>
          <div className="p-6">
            {/* Selector de vista */}
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
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Débito</th>
                    <th className="border p-2">Crédito</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center p-4">
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
                          {/*<Button
                            variant="contained"
                            size="large"
                            color="inherit"
                            title="Visualizar"
                          >
                            <RemoveRedEye />
                          </Button>*/}
                          
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
                      <td colSpan={9} className="text-center p-4">
                        {busqueda ? 'No se encontraron resultados para la búsqueda' : 'No hay asientos contables registrados'}
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