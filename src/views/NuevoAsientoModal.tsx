import React, { useState } from 'react';
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
  Box
} from '@mui/material';
import { Close, Add, Delete } from '@mui/icons-material';
import { asientoContableService } from '../services/asientoContableService';
import type { AsientoContable } from '../types/AsientoContable';

interface Props {
  open: boolean;
  onClose: (actualizar?: boolean) => void;
}

const periodosContables = [
  { id: 1, nombre: "Enero 2024" },
  { id: 2, nombre: "Febrero 2024" },
  { id: 3, nombre: "Marzo 2024" },
  { id: 4, nombre: "Abril 2024" },
  { id: 5, nombre: "Mayo 2024" },
  { id: 6, nombre: "Junio 2024" }
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
  { value: 'REGULARIZACION', label: 'Regularización' },
  { value: 'SIMPLE', label: 'Simple' },
  { value: 'COMPUESTA', label: 'Compuesta' }
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

const NuevoAsientoModal: React.FC<Props> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    numeroAsiento: `AST-${Math.floor(Math.random() * 1000)}`,
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    referencia: '',
    estado: 'BORRADOR' as 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO',
    idPeriodo: 1,
    idEmpresa: 1,
    tipo: 'OPERATIVA' as 'APERTURA' | 'CIERRE' | 'OPERATIVA' | 'AJUSTE' | 'REGULARIZACION' | 'SIMPLE' | 'COMPUESTA',
    lineas: [
      { idCuenta: 0, descripcion: '', debito: 0, credito: 0 }
    ]
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineChange = (index: number, field: string, value: string | number) => {
    const nuevasLineas = [...formData.lineas];
    
    // Validar que no se ingresen valores negativos
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

  // Calcular totales
  const totalDebito = formData.lineas.reduce((sum, linea) => sum + (linea.debito || 0), 0);
  const totalCredito = formData.lineas.reduce((sum, linea) => sum + (linea.credito || 0), 0);
  const diferencia = totalDebito - totalCredito;

  const handleSubmit = async () => {
    if (diferencia !== 0) {
      alert('Los totales de débito y crédito deben ser iguales');
      return;
    }

    // Validar que al menos una línea tenga cuenta seleccionada
    if (formData.lineas.some(linea => linea.idCuenta === 0)) {
      alert('Todas las líneas deben tener una cuenta seleccionada');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar al backend
      const asientoData: Omit<AsientoContable, 'id'> = {
        numeroAsiento: formData.numeroAsiento,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        referencia: formData.referencia || null,
        estado: formData.estado,
        idPeriodo: 1, //formData.idPeriodo,
        idEmpresa: 1, //formData.idEmpresa,
        idUsuario: 1, // Esto debería venir del contexto de autenticación
        tipo: formData.tipo,
        totalDebito: totalDebito,
        totalCredito: totalCredito
      };

      console.log('Enviando asiento:', asientoData);
      await asientoContableService.create(asientoData);
      onClose(true); // Cerrar y actualizar lista
    } catch (error: any) {
      console.error('Error al crear asiento:', error);
      alert(`Error al crear el asiento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Nueva Partida</Typography>
          <IconButton onClick={() => onClose()} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Primera fila: Número, Fecha, Tipo */}
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Número de asiento *"
              name="numeroAsiento"
              value={formData.numeroAsiento}
              onChange={handleInputChange}
              margin="dense"
              size="small"
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
            >
              {tiposPartida.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* Segunda fila: Descripción */}
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
              placeholder="Descripción del asiento contable..."
            />
          </Grid>
          
          {/* Tercera fila: Referencia, Periodo, Empresa */}
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Referencia externa"
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
            >
              {empresas.map((empresa) => (
                <MenuItem key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* Cuarta fila: Estado */}
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
            </TextField>
          </Grid>
        </Grid>

        <Divider style={{ margin: '20px 0' }} />
        
        <Typography variant="h6" gutterBottom>
          Líneas del asiento
        </Typography>
        
        {formData.lineas.map((linea, index) => (
          <Paper key={index} style={{ padding: '15px', marginBottom: '10px' }}>
            <Grid container spacing={2} alignItems="flex-start">
              {/* Cuenta */}
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  select
                  label="Cuenta *"
                  value={linea.idCuenta}
                  onChange={(e) => handleLineChange(index, 'idCuenta', parseInt(e.target.value))}
                  margin="dense"
                  size="small"
                >
                  <MenuItem value={0}>Seleccionar cuenta</MenuItem>
                  {cuentasContables.map((cuenta) => (
                    <MenuItem key={cuenta.id} value={cuenta.id}>
                      {cuenta.codigo} - {cuenta.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Débito y Crédito */}
              <Grid item xs={4}>
                <Grid container spacing={1} justifyContent="flex-end">
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
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
                </Grid>
              </Grid>

              {/* Botón eliminar línea */}
              <Grid item xs={3} style={{ textAlign: 'right' }}>
                {formData.lineas.length > 1 && (
                  <Button
                    color="error"
                    onClick={() => removeLine(index)}
                    size="small"
                    startIcon={<Delete />}
                  >
                    Eliminar
                  </Button>
                )}
              </Grid>
            </Grid>
            
            {/* Descripción de la línea */}
            <Grid item xs={12} style={{ marginTop: '10px' }}>
              <TextField
                fullWidth
                label="Descripción de la línea"
                value={linea.descripcion}
                onChange={(e) => handleLineChange(index, 'descripcion', e.target.value)}
                margin="dense"
                multiline
                rows={2}
                placeholder="Descripción de la línea..."
              />
            </Grid>
          </Paper>
        ))}
        
        <Button 
          startIcon={<Add />} 
          onClick={addNewLine}
          style={{ marginTop: '10px' }}
          variant="outlined"
        >
          Agregar línea
        </Button>

        <Divider style={{ margin: '20px 0' }} />
        
        {/* Totales */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={3}>
            <Typography variant="subtitle1" align="right">Total Débito</Typography>
            <Typography variant="h6" align="right">Q {totalDebito.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle1" align="right">Total Crédito</Typography>
            <Typography variant="h6" align="right">Q {totalCredito.toFixed(2)}</Typography>
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
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => onClose()} color="secondary" variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={diferencia !== 0 || loading}
        >
          {loading ? 'Creando...' : 'Crear Asiento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevoAsientoModal;