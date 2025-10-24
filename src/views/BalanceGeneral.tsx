// BalanceGeneral.tsx - VERSIÓN ACTUALIZADA CON REPORTES
import { Clear, FileDownload, PictureAsPdf, Summarize, ListAlt } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from "@mui/material";
import { useState, useEffect } from 'react';
import HeaderCard from "../components/HeaderCard";
import { balanceGeneralService } from '../services/balanceGeneralService.ts';
import type { BalanceGeneral, CuentaBalance } from '../types/BalanceGeneral';
import type { ReporteDetallado, ReporteSeccion, AsientoDetallado, MovimientoSeccion } from '../types/Reportes';

// Servicios para obtener datos reales
import { empresaService, type Empresa } from '../services/empresaService';
import { periodoService, type Periodo } from '../services/periodoService';

// Interfaces para las pestañas del diálogo
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BalanceGeneral() {
  // Estados principales
  const [empresaId, setEmpresaId] = useState<number>(1);
  const [periodoId, setPeriodoId] = useState<number>(1);
  const [balance, setBalance] = useState<BalanceGeneral | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Estados para datos iniciales
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // ✅ NUEVOS ESTADOS PARA REPORTES
  const [dialogoReportes, setDialogoReportes] = useState(false);
  const [tabReporteActivo, setTabReporteActivo] = useState(0);
  const [reporteDetallado, setReporteDetallado] = useState<ReporteDetallado | null>(null);
  const [reporteSeccion, setReporteSeccion] = useState<ReporteSeccion | null>(null);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<'ACTIVO' | 'PASIVO' | 'PATRIMONIO'>('ACTIVO');

  // ✅ FUNCIÓN PARA CARGAR DATOS INICIALES
  const cargarDatosIniciales = async () => {
    try {
      setCargandoDatos(true);
      setError(null);

      console.log('🔄 Cargando datos iniciales...');

      const [empresasData, periodosData] = await Promise.all([
        empresaService.getAll(),
        periodoService.getAll()
      ]);

      console.log('📊 Datos recibidos del backend:', {
        empresas: empresasData,
        periodos: periodosData
      });

      setEmpresas(empresasData);
      setPeriodos(periodosData);

      if (empresasData.length > 0) {
        setEmpresaId(empresasData[0].id);
      }
      if (periodosData.length > 0) {
        setPeriodoId(periodosData[0].id);
      }

    } catch (error: any) {
      console.error('❌ Error al cargar datos iniciales:', error);
      setError('Error al cargar datos iniciales: ' + error.message);
      mostrarSnackbar('Error al cargar empresas y periodos: ' + error.message, 'error');
      setEmpresas([]);
      setPeriodos([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  // ✅ EFFECT PARA CARGAR DATOS AL INICIAR
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const mostrarSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const generarBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Generando balance para:', { empresaId, periodoId });

      const balanceData = await balanceGeneralService.generarBalance(empresaId, periodoId);
      setBalance(balanceData);

      console.log('✅ Balance generado:', balanceData);
      mostrarSnackbar('Balance general generado exitosamente', 'success');
    } catch (error: any) {
      console.error('❌ Error al generar balance:', error);
      const mensajeError = error.message || 'Error desconocido al generar balance';
      setError(mensajeError);
      mostrarSnackbar(`Error al generar balance: ${mensajeError}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVAS FUNCIONES PARA REPORTES
  const abrirDialogoReportes = () => {
    setDialogoReportes(true);
    setTabReporteActivo(0);
    setReporteDetallado(null);
    setReporteSeccion(null);
  };

  const cerrarDialogoReportes = () => {
    setDialogoReportes(false);
    setReporteDetallado(null);
    setReporteSeccion(null);
  };

  const generarReporteDetallado = async () => {
    try {
      setCargandoReporte(true);
      console.log('🔄 Generando reporte detallado...');

      const reporte = await balanceGeneralService.generarReporteDetallado(empresaId, periodoId);
      setReporteDetallado(reporte);

      console.log('✅ Reporte detallado generado:', reporte);
      mostrarSnackbar('Reporte detallado generado exitosamente', 'success');
    } catch (error: any) {
      console.error('❌ Error al generar reporte detallado:', error);
      mostrarSnackbar(`Error al generar reporte detallado: ${error.message}`, 'error');
    } finally {
      setCargandoReporte(false);
    }
  };

  const generarReporteSeccion = async (seccion: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO') => {
    try {
      setCargandoReporte(true);
      setSeccionActiva(seccion);
      console.log(`🔄 Generando reporte de ${seccion}...`);

      const reporte = await balanceGeneralService.generarReporteSeccion(empresaId, periodoId, seccion);
      setReporteSeccion(reporte);

      console.log(`✅ Reporte de ${seccion} generado:`, reporte);
      mostrarSnackbar(`Reporte de ${seccion.toLowerCase()} generado exitosamente`, 'success');
    } catch (error: any) {
      console.error(`❌ Error al generar reporte de ${seccion}:`, error);
      mostrarSnackbar(`Error al generar reporte de ${seccion.toLowerCase()}: ${error.message}`, 'error');
    } finally {
      setCargandoReporte(false);
    }
  };

  const exportarPDF = async (tipoReporte: string, seccion?: string) => {
  try {
    console.log(`🔄 Exportando ${tipoReporte} a PDF...`);
    
    await balanceGeneralService.exportarPDF(empresaId, periodoId, tipoReporte, seccion);
    
    mostrarSnackbar('PDF generado y descargado exitosamente', 'success');
  } catch (error: any) {
    console.error('❌ Error al exportar PDF:', error);
    mostrarSnackbar(`Error al exportar PDF: ${error.message}`, 'error');
  }
};

const exportarExcel = async (tipoReporte: string, seccion?: string) => {
  try {
    console.log(`🔄 Exportando ${tipoReporte} a Excel...`);
    
    await balanceGeneralService.exportarExcel(empresaId, periodoId, tipoReporte, seccion);
    
    mostrarSnackbar('Excel generado y descargado exitosamente', 'success');
  } catch (error: any) {
    console.error('❌ Error al exportar Excel:', error);
    mostrarSnackbar(`Error al exportar Excel: ${error.message}`, 'error');
  }
};

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(monto);
  };

  const formatearNumero = (numero: number) => {
    return new Intl.NumberFormat('es-GT').format(numero);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-GT');
  };

  // ✅ COMPONENTES PARA RENDERIZAR REPORTES
  const renderTablaReporteDetallado = () => {
    if (!reporteDetallado) return null;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asiento</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cuenta</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Débito</TableCell>
              <TableCell align="right">Crédito</TableCell>
              <TableCell>Centro Costo</TableCell>
              <TableCell>Proyecto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reporteDetallado.asientos.map((asiento, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {asiento.numeroAsiento}
                  </Typography>
                </TableCell>
                <TableCell>{formatearFecha(asiento.fecha)}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontFamily="monospace">
                      {asiento.codigoCuenta}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {asiento.nombreCuenta}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {asiento.descripcionMovimiento || asiento.descripcionAsiento}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {asiento.debito > 0 ? formatearMoneda(asiento.debito) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {asiento.credito > 0 ? formatearMoneda(asiento.credito) : '-'}
                </TableCell>
                <TableCell>
                  {asiento.centroCosto ? (
                    <Chip 
                      label={asiento.centroCosto.codigo} 
                      size="small" 
                      variant="outlined" 
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {asiento.proyecto ? (
                    <Chip 
                      label={asiento.proyecto.codigo} 
                      size="small" 
                      variant="outlined" 
                    />
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderTablaReporteSeccion = () => {
    if (!reporteSeccion) return null;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asiento</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cuenta</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Débito</TableCell>
              <TableCell align="right">Crédito</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reporteSeccion.movimientos.map((movimiento, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {movimiento.numeroAsiento}
                  </Typography>
                </TableCell>
                <TableCell>{formatearFecha(movimiento.fecha)}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontFamily="monospace">
                      {movimiento.codigoCuenta}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {movimiento.nombreCuenta}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {movimiento.descripcionMovimiento || movimiento.descripcionAsiento}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {movimiento.debito > 0 ? formatearMoneda(movimiento.debito) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {movimiento.credito > 0 ? formatearMoneda(movimiento.credito) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ✅ RENDER TABLA CUENTAS (existente)
  const renderTablaCuentas = (cuentas: CuentaBalance[], titulo: string, color: string) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        sx={{
          p: 2,
          backgroundColor: color,
          color: 'white',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px'
        }}
      >
        {titulo}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="20%">Código</TableCell>
            <TableCell width="60%">Nombre de Cuenta</TableCell>
            <TableCell width="20%" align="right">Saldo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cuentas.length > 0 ? (
            cuentas.map((cuenta, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {cuenta.codigo}
                  </Typography>
                </TableCell>
                <TableCell>{cuenta.nombreCuenta}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                  {formatearMoneda(cuenta.saldo)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                <Typography color="textSecondary">
                  No hay cuentas {titulo.toLowerCase()} para mostrar
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const balanceCuadrado = balance &&
    Math.abs(balance.totalActivos - (balance.totalPasivos + balance.totalPatrimonio)) < 0.01;

  return (
    <>
      <Card>
        <HeaderCard
          title="Balance General"
          subheader="Genera y visualiza el balance general de la empresa para un período específico."
        />
        <CardContent>
          <div className="p-6">
            {/* Mostrar error general si existe */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Controles de filtro */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Parámetros del Balance
              </Typography>

              {cargandoDatos ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Cargando empresas y periodos...</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    select
                    label="Empresa"
                    value={empresaId}
                    onChange={(e) => setEmpresaId(Number(e.target.value))}
                    sx={{ minWidth: 200 }}
                    size="small"
                    disabled={loading}
                  >
                    {empresas.map((empresa) => (
                      <MenuItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Periodo Contable"
                    value={periodoId}
                    onChange={(e) => setPeriodoId(Number(e.target.value))}
                    sx={{ minWidth: 200 }}
                    size="small"
                    disabled={loading}
                  >
                    {periodos.map((periodo) => (
                      <MenuItem key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained"
                    onClick={generarBalance}
                    disabled={loading || cargandoDatos}
                    startIcon={loading ? <CircularProgress size={20} /> : <PictureAsPdf />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Generando...' : 'Generar Balance'}
                  </Button>

                  {/* ✅ BOTÓN NUEVO PARA REPORTES */}
                  {balance && (
                    <Button
                      variant="outlined"
                      onClick={abrirDialogoReportes}
                      startIcon={<Summarize />}
                      sx={{ minWidth: 180 }}
                    >
                      Ver Reportes
                    </Button>
                  )}
                </Box>
              )}
            </Paper>

            {/* Resultados del Balance */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Generando balance general...
                  </Typography>
                </Box>
              </Box>
            ) : balance ? (
              <>
                {/* Encabezado del Balance */}
                <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        BALANCE GENERAL
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        {empresas.find(e => e.id === empresaId)?.nombre} - {periodos.find(p => p.id === periodoId)?.nombre}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Generado el: {new Date(balance.fechaGeneracion).toLocaleDateString('es-GT')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<PictureAsPdf />}
                        onClick={() => exportarPDF('BALANCE_GENERAL')}
                        variant="outlined"
                        size="small"
                      >
                        PDF
                      </Button>
                      <Button
                        startIcon={<FileDownload />}
                        onClick={() => exportarExcel('BALANCE_GENERAL')}
                        variant="outlined"
                        size="small"
                      >
                        Excel
                      </Button>
                    </Box>
                  </Box>

                  <Chip
                    label={balanceCuadrado ? "BALANCE CUADRADO ✓" : "BALANCE NO CUADRADO ✗"}
                    color={balanceCuadrado ? "success" : "error"}
                    variant="filled"
                  />
                </Paper>

                {/* Sección de Activos */}
                {renderTablaCuentas(balance.activos, "ACTIVOS", '#1976d2')}

                {/* Sección de Pasivos y Patrimonio en columnas */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Pasivos */}
                  <Box sx={{ flex: 1 }}>
                    <TableContainer component={Paper}>
                      <Typography
                        variant="h6"
                        sx={{
                          p: 2,
                          backgroundColor: '#dc004e',
                          color: 'white',
                          borderTopLeftRadius: '4px',
                          borderTopRightRadius: '4px'
                        }}
                      >
                        PASIVOS
                      </Typography>
                      <Table>
                        <TableBody>
                          {balance.pasivos.map((cuenta, index) => (
                            <TableRow key={index} hover>
                              <TableCell width="30%">
                                <Typography variant="body2" fontFamily="monospace">
                                  {cuenta.codigo}
                                </Typography>
                              </TableCell>
                              <TableCell width="50%">{cuenta.nombreCuenta}</TableCell>
                              <TableCell width="20%" align="right" sx={{ fontFamily: 'monospace' }}>
                                {formatearMoneda(cuenta.saldo)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell colSpan={2}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Total Pasivos:
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {formatearMoneda(balance.totalPasivos)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Patrimonio */}
                  <Box sx={{ flex: 1 }}>
                    <TableContainer component={Paper}>
                      <Typography
                        variant="h6"
                        sx={{
                          p: 2,
                          backgroundColor: '#2e7d32',
                          color: 'white',
                          borderTopLeftRadius: '4px',
                          borderTopRightRadius: '4px'
                        }}
                      >
                        PATRIMONIO
                      </Typography>
                      <Table>
                        <TableBody>
                          {balance.patrimonio.map((cuenta, index) => (
                            <TableRow key={index} hover>
                              <TableCell width="30%">
                                <Typography variant="body2" fontFamily="monospace">
                                  {cuenta.codigo}
                                </Typography>
                              </TableCell>
                              <TableCell width="50%">{cuenta.nombreCuenta}</TableCell>
                              <TableCell width="20%" align="right" sx={{ fontFamily: 'monospace' }}>
                                {formatearMoneda(cuenta.saldo)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell colSpan={2}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Total Patrimonio:
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {formatearMoneda(balance.totalPatrimonio)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>

                {/* Resumen y Ecuación Contable */}
                <Paper sx={{ p: 3, mt: 3, backgroundColor: '#e8f5e8' }}>
                  <Typography variant="h6" gutterBottom align="center">
                    RESUMEN DEL BALANCE
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Activos
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontFamily: 'monospace' }}>
                        {formatearMoneda(balance.totalActivos)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Pasivos
                      </Typography>
                      <Typography variant="h6" color="secondary" sx={{ fontFamily: 'monospace' }}>
                        {formatearMoneda(balance.totalPasivos)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Patrimonio
                      </Typography>
                      <Typography variant="h6" color="success.main" sx={{ fontFamily: 'monospace' }}>
                        {formatearMoneda(balance.totalPatrimonio)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                    <Typography variant="h6" align="center" gutterBottom>
                      ECUACIÓN CONTABLE
                    </Typography>
                    <Typography variant="h5" align="center" sx={{ fontFamily: 'monospace' }}>
                      {formatearMoneda(balance.totalActivos)} = {formatearMoneda(balance.totalPasivos)} + {formatearMoneda(balance.totalPatrimonio)}
                    </Typography>
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Chip
                        label={balanceCuadrado ?
                          "✓ LA ECUACIÓN CONTABLE SE CUMPLE" :
                          "✗ LA ECUACIÓN CONTABLE NO SE CUMPLE"}
                        color={balanceCuadrado ? "success" : "error"}
                        size="medium"
                      />
                    </Box>
                  </Box>
                </Paper>
              </>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <PictureAsPdf sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="textSecondary">
                  Balance General
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Selecciona una empresa y período contable, luego haz clic en "Generar Balance" para visualizar el reporte.
                </Typography>
              </Paper>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ DIÁLOGO DE REPORTES */}
      <Dialog 
        open={dialogoReportes} 
        onClose={cerrarDialogoReportes}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Summarize />
            Reportes Detallados - Balance General
          </Box>
          <Typography variant="body2" color="textSecondary">
            {empresas.find(e => e.id === empresaId)?.nombre} - {periodos.find(p => p.id === periodoId)?.nombre}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={tabReporteActivo}
            onChange={(_, nuevoValor) => setTabReporteActivo(nuevoValor)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Reporte Detallado Completo" />
            <Tab label="Reporte por Sección" />
          </Tabs>

          <TabPanel value={tabReporteActivo} index={0}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Reporte Detallado Completo
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Muestra todos los asientos contables que afectan las cuentas de balance (Activos, Pasivos, Patrimonio) con detalle completo.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={generarReporteDetallado}
                  disabled={cargandoReporte}
                  startIcon={cargandoReporte ? <CircularProgress size={20} /> : <ListAlt />}
                >
                  {cargandoReporte ? 'Generando...' : 'Generar Reporte Detallado'}
                </Button>
                
                {reporteDetallado && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      onClick={() => exportarPDF('DETALLADO')}
                    >
                      Exportar PDF
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => exportarExcel('DETALLADO')}
                    >
                      Exportar Excel
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {cargandoReporte ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderTablaReporteDetallado()
            )}
          </TabPanel>

          <TabPanel value={tabReporteActivo} index={1}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Reporte por Sección
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Genera reportes específicos para cada sección del balance general.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant={seccionActiva === 'ACTIVO' ? 'contained' : 'outlined'}
                  onClick={() => generarReporteSeccion('ACTIVO')}
                  disabled={cargandoReporte}
                >
                  Activos
                </Button>
                <Button
                  variant={seccionActiva === 'PASIVO' ? 'contained' : 'outlined'}
                  onClick={() => generarReporteSeccion('PASIVO')}
                  disabled={cargandoReporte}
                >
                  Pasivos
                </Button>
                <Button
                  variant={seccionActiva === 'PATRIMONIO' ? 'contained' : 'outlined'}
                  onClick={() => generarReporteSeccion('PATRIMONIO')}
                  disabled={cargandoReporte}
                >
                  Patrimonio
                </Button>
              </Box>

              {reporteSeccion && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => exportarPDF('SECCION', reporteSeccion.seccion)}
                  >
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownload />}
                    onClick={() => exportarExcel('SECCION', reporteSeccion.seccion)}
                  >
                    Exportar Excel
                  </Button>
                </Box>
              )}
            </Box>

            {cargandoReporte ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderTablaReporteSeccion()
            )}
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarDialogoReportes}>Cerrar</Button>
        </DialogActions>
      </Dialog>

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