import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Box,
  Alert
} from '@mui/material';
import { Close, Add, Delete } from '@mui/icons-material';
import { asientoContableService } from '../services/asientoContableService';
import type { AsientoContable } from '../types/AsientoContable';

interface Props {
  open: boolean;
  onClose: (actualizar?: boolean) => void;
  asientoId: number | null;
}

// Datos de ejemplo (deberían venir de APIs)
const periodosContables = [
  { id: 1, nombre: "Enero 2024" },
  { id: 2, nombre: "Febrero 2024" },
  { id: 3, nombre: "Marzo 2024" },
  { id: 4, nombre: "Abril 2024" },
  { id: 5, nombre: "Mayo 2024" },
  { id: 6, nombre: "Junio 2024" },
  { id: 7, nombre: "Julio 2024" }
];

const empresas = [
  { id: 1, nombre: "Empresa A" },
  { id: 2, nombre: "Empresa B" },
  { id: 3, nombre: "Empresa C" },
  { id: 4, nombre: "Empresa D" }
];

const tiposPartida = [
  { value: 'OPERATIVA', label: 'Operativa' },
  { value: 'APERTURA', label: 'Apertura' },
  { value: 'CIERRE', label: 'Cierre' },
  { value: 'AJUSTE', label: 'Ajuste' },
  { value: 'REGULARIZACION', label: 'Regularización' }
];

const cuentasContables = [
  { id: 1, codigo: "1", nombre: "ACTIVO" },
  { id: 2, codigo: "11", nombre: "ACTIVO CORRIENTE" },
  { id: 3, codigo: "1101", nombre: "Caja General" },
  { id: 4, codigo: "1102", nombre: "Bancos" },
  { id: 5, codigo: "1201", nombre: "Cuentas por Cobrar" },
  { id: 6, codigo: "2", nombre: "PASIVO" },
  { id: 7, codigo: "21", nombre: "PASIVO CORRIENTE" },
  { id: 8, codigo: "2101", nombre: "Cuentas por Pagar" },
  { id: 9, codigo: "3", nombre: "PATRIMONIO" },
  { id: 10, codigo: "4", nombre: "INGRESOS" },
  { id: 11, codigo: "5", nombre: "GASTOS" }
];

const EditarAsientoModal: React.FC<Props> = ({ open, onClose, asientoId }) => {
  const [formData, setFormData] = useState({
    id: 0,
    numeroAsiento: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    referencia: '',
    estado: 'BORRADOR' as 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO',
    idPeriodo: 1,
    idEmpresa: 1,
    tipo: 'OPERATIVA' as 'APERTURA' | 'CIERRE' | 'OPERATIVA' | 'AJUSTE' | 'REGULARIZACION' | 'SIMPLE' | 'COMPUESTA',
    totalDebito: 0,
    totalCredito: 0,
    // Campos temporales para las líneas (en una implementación real vendrían del backend)
    lineas: [
      { idCuenta: 0, descripcion: '', debito: 0, credito: 0 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del asiento cuando se abre el modal
  useEffect(() => {
    if (open && asientoId) {
      cargarAsiento();
    }
  }, [open, asientoId]);

  const cargarAsiento = async () => {
    if (!asientoId) return;
    
    try {
      setCargando(true);
      setError(null);
      
      console.log('🔄 Cargando asiento con ID:', asientoId);
      const asiento = await asientoContableService.getById(asientoId);
      console.log('✅ Asiento cargado:', asiento);
      
      // Actualizar el formulario con los datos del asiento
      setFormData({
        id: asiento.id,
        numeroAsiento: asiento.numeroAsiento,
        fecha: asiento.fecha.split('T')[0], // Formatear fecha si viene completa
        descripcion: asiento.descripcion,
        referencia: asiento.referencia || '',
        estado: asiento.estado,
        idPeriodo: asiento.idPeriodo,
        idEmpresa: asiento.idEmpresa,
        tipo: asiento.tipo,
        totalDebito: asiento.totalDebito,
        totalCredito: asiento.totalCredito,
        // Por ahora usamos líneas de ejemplo, en una implementación real
        // esto vendría del backend con las líneas reales del asiento
        lineas: [
          { idCuenta: 3, descripcion: 'Línea de ejemplo 1', debito: asiento.totalDebito / 2, credito: 0 },
          { idCuenta: 4, descripcion: 'Línea de ejemplo 2', debito: 0, credito: asiento.totalCredito / 2 }
        ]
      });
      
    } catch (error: any) {
      console.error('❌ Error al cargar asiento:', error);
      setError(`Error al cargar el asiento: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idPeriodo' || name === 'idEmpresa' ? Number(value) : value
    }));
    setError(null);
  };

    const handleLineChange = (index: number, field: string, value: string | number) => {
        const nuevasLineas = [...formData.lineas];

        if ((field === 'debito' || field === 'credito') && parseFloat(value as string) < 0) {
            return;
        }

        nuevasLineas[index] = {
            ...nuevasLineas[index],
            [field]: field === 'debito' || field === 'credito' ? parseFloat(value as string) || 0 : value
        };

        setFormData(prev => ({
            ...prev,
            lineas: nuevasLineas
        }));
        setError(null);
    };

    const addNewLine = () => {
        setFormData(prev => ({
            ...prev,
            lineas: [...prev.lineas, { idCuenta: 0, descripcion: '', debito: 0, credito: 0 }]
        }));
    };

    const removeLine = (index: number) => {
        if (formData.lineas.length > 1) {
            const nuevasLineas = formData.lineas.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                lineas: nuevasLineas
            }));
        }
    };

    // Calcular totales en tiempo real
    const totalDebito = formData.lineas.reduce((sum, linea) => sum + (linea.debito || 0), 0);
    const totalCredito = formData.lineas.reduce((sum, linea) => sum + (linea.credito || 0), 0);
    const diferencia = totalDebito - totalCredito;

    const handleSubmit = async () => {
        console.log('🔍 Validando datos antes de actualizar...');

        // Validaciones
        if (!formData.descripcion.trim()) {
            setError('La descripción es obligatoria');
            return;
        }

        if (diferencia !== 0) {
            setError('Los totales de débito y crédito deben ser iguales');
            return;
        }

        const lineasSinCuenta = formData.lineas.filter(linea => linea.idCuenta === 0);
        if (lineasSinCuenta.length > 0) {
            setError('Todas las líneas deben tener una cuenta seleccionada');
            return;
        }

        // Verificar que al menos una línea tenga monto
        const lineasConMonto = formData.lineas.filter(linea => linea.debito > 0 || linea.credito > 0);
        if (lineasConMonto.length === 0) {
            setError('Al menos una línea debe tener monto en débito o crédito');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Preparar datos para el backend
            const asientoData: Partial<AsientoContable> = {
                numeroAsiento: formData.numeroAsiento,
                fecha: formData.fecha,
                descripcion: formData.descripcion,
                referencia: formData.referencia || null,
                estado: formData.estado,
                idPeriodo: 1, // Temporal - hardcodeado
                idEmpresa: 1, // Temporal - hardcodeado
                idUsuario: 1, // Temporal - hardcodeado
                tipo: formData.tipo,
                totalDebito: totalDebito,
                totalCredito: totalCredito
            };

            console.log('📤 Actualizando asiento con ID:', formData.id);
            console.log('📝 Datos a actualizar:', asientoData);

            // Usar el servicio de actualización real
            const asientoActualizado = await asientoContableService.update(formData.id, asientoData);
            console.log('✅ Asiento actualizado exitosamente:', asientoActualizado);

            // Mostrar mensaje de éxito
            alert('Asiento actualizado exitosamente');

            onClose(true); // Cerrar y actualizar lista

        } catch (error: any) {
            console.error('❌ Error al actualizar asiento:', error);
            setError(`Error al actualizar el asiento: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

  const handleClose = () => {
    setFormData({
      id: 0,
      numeroAsiento: '',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      referencia: '',
      estado: 'BORRADOR',
      idPeriodo: 1,
      idEmpresa: 1,
      tipo: 'OPERATIVA',
      totalDebito: 0,
      totalCredito: 0,
      lineas: [
        { idCuenta: 0, descripcion: '', debito: 0, credito: 0 }
      ]
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Editar Partida Contable {formData.numeroAsiento && `- ${formData.numeroAsiento}`}
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {cargando ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography>Cargando datos del asiento...</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {/* Campos principales */}
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Número de asiento *"
                  name="numeroAsiento"
                  value={formData.numeroAsiento}
                  onChange={handleInputChange}
                  margin="dense"
                  size="small"
                  required
                  disabled // Normalmente el número de asiento no se edita
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Fecha *"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  margin="dense"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de partida *"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleSelectChange}
                  margin="dense"
                  size="small"
                  required
                >
                  {tiposPartida.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción *"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  margin="dense"
                  multiline
                  rows={2}
                  placeholder="Descripción detallada del asiento contable..."
                  required
                />
              </Grid>
              
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Referencia"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleInputChange}
                  margin="dense"
                  size="small"
                  placeholder="FAC-001, DOC-123, etc."
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  select
                  label="Periodo *"
                  name="idPeriodo"
                  value={formData.idPeriodo}
                  onChange={handleSelectChange}
                  margin="dense"
                  size="small"
                  required
                >
                  {periodosContables.map((periodo) => (
                    <MenuItem key={periodo.id} value={periodo.id}>
                      {periodo.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  select
                  label="Empresa *"
                  name="idEmpresa"
                  value={formData.idEmpresa}
                  onChange={handleSelectChange}
                  margin="dense"
                  size="small"
                  required
                >
                  {empresas.map((empresa) => (
                    <MenuItem key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleSelectChange}
                  margin="dense"
                  size="small"
                >
                  <MenuItem value="BORRADOR">Borrador</MenuItem>
                  <MenuItem value="CONTABILIZADO">Contabilizado</MenuItem>
                  <MenuItem value="ANULADO">Anulado</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Líneas del Asiento
            </Typography>
            
            {formData.lineas.map((linea, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'grey.300' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      select
                      label="Cuenta Contable *"
                      value={linea.idCuenta}
                      onChange={(e) => handleLineChange(index, 'idCuenta', parseInt(e.target.value))}
                      margin="dense"
                      size="small"
                      required
                    >
                      <MenuItem value={0}>Seleccionar cuenta...</MenuItem>
                      {cuentasContables.map((cuenta) => (
                        <MenuItem key={cuenta.id} value={cuenta.id}>
                          {cuenta.codigo} - {cuenta.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Débito"
                      type="number"
                      value={linea.debito}
                      onChange={(e) => handleLineChange(index, 'debito', e.target.value)}
                      margin="dense"
                      size="small"
                      inputProps={{ 
                        min: 0,
                        step: 0.01,
                        style: { textAlign: 'right' } 
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Crédito"
                      type="number"
                      value={linea.credito}
                      onChange={(e) => handleLineChange(index, 'credito', e.target.value)}
                      margin="dense"
                      size="small"
                      inputProps={{ 
                        min: 0,
                        step: 0.01,
                        style: { textAlign: 'right' } 
                      }}
                    />
                  </Grid>

                  <Grid item xs={1}>
                    {formData.lineas.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeLine(index)}
                        size="small"
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descripción de la línea"
                      value={linea.descripcion}
                      onChange={(e) => handleLineChange(index, 'descripcion', e.target.value)}
                      margin="dense"
                      size="small"
                      placeholder="Descripción específica de esta línea..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button 
              startIcon={<Add />} 
              onClick={addNewLine}
              variant="outlined"
              disabled={loading}
            >
              Agregar Línea
            </Button>

            <Divider sx={{ my: 3 }} />
            
            {/* Totales */}
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="right">Total Débito</Typography>
                <Typography variant="h6" align="right" color="primary">
                  Q {totalDebito.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="right">Total Crédito</Typography>
                <Typography variant="h6" align="right" color="primary">
                  Q {totalCredito.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1" align="right">Diferencia</Typography>
                <Typography 
                  variant="h6" 
                  align="right"
                  color={diferencia === 0 ? 'success.main' : 'error.main'}
                >
                  Q {diferencia.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="secondary" 
          variant="outlined" 
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={diferencia !== 0 || loading || cargando}
        >
          {loading ? 'Actualizando...' : 'Actualizar Asiento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditarAsientoModal;