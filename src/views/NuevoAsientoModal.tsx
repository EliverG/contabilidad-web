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

const periodosContables = [
  "Enero 2024",
  "Febrero 2024",
  "Marzo 2024",
  "Abril 2024",
  "Mayo 2024",
  "Junio 2024"
];

const empresas = [
  "Empresa A",
  "Empresa B", 
  "Empresa C",
  "Empresa D"
];

const tiposPartida = [
  "Apertura",
  "Cierre",
  "Operativa",
  "Ajuste",
  "Regularización",
  "Simple",
  "Compuesta"
];

const cuentasContables = [
  { codigo: "1", nombre: "ACTIVO" },
  { codigo: "11", nombre: "ACTIVO CORRIENTE" },
  { codigo: "130181", nombre: "Caja General" },
  { codigo: "119192", nombre: "Bancos" },
  { codigo: "1202", nombre: "Cuentas por Cobrar" },
  { codigo: "2", nombre: "PASIVO" },
  { codigo: "21", nombre: "PASIVO CORRIENTE" },
  { codigo: "2181", nombre: "Cuentas por Pagar" },
  { codigo: "3", nombre: "PATRIMONIO" },
  { codigo: "4", nombre: "INGRESOS" },
  { codigo: "5", nombre: "GASTOS" }
];

const NuevoAsientoModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    numero: 'AST-288',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    referencia: '',
    estado: 'Borrador',
    periodo: periodosContables[0],
    empresa: empresas[0],
    tipo: tiposPartida[2],
    lineas: [
      { cuenta: '', descripcion: '', debito: 0, credito: 0 }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineChange = (index, field, value) => {
    const nuevasLineas = [...formData.lineas];
    
    // Validar que no se ingresen valores negativos
    if ((field === 'debito' || field === 'credito') && parseFloat(value) < 0) {
      return; // No permitir valores negativos
    }
    
    nuevasLineas[index][field] = value;
    
    // Si es débito o crédito, convertir a número
    if (field === 'debito' || field === 'credito') {
      nuevasLineas[index][field] = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      lineas: nuevasLineas
    }));
  };

  const addNewLine = () => {
    setFormData(prev => ({
      ...prev,
      lineas: [...prev.lineas, { cuenta: '', descripcion: '', debito: 0, credito: 0 }]
    }));
  };

  const removeLine = (index) => {
    if (formData.lineas.length > 1) {
      const nuevasLineas = formData.lineas.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        lineas: nuevasLineas
      }));
    }
  };

  // Calcular totales
  const totalDebito = formData.lineas.reduce((sum, linea) => sum + (parseFloat(linea.debito) || 0), 0);
  const totalCredito = formData.lineas.reduce((sum, linea) => sum + (parseFloat(linea.credito) || 0), 0);
  const diferencia = totalDebito - totalCredito;

  const handleSubmit = () => {
    // Aquí iría la lógica para guardar el asiento
    console.log('Asiento guardado:', formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Nueva Partida</Typography>
          <IconButton onClick={onClose} size="small">
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
              name="numero"
              value={formData.numero}
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
              onChange={handleInputChange}
              margin="dense"
              size="small"
            >
              {tiposPartida.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
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
          
          {/* Tercera fila: Referencia, Periodo, Empresa, Estado */}
          <Grid item xs={6}>
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
          <Grid item xs={3}>
            <TextField
              fullWidth
              select
              label="Periodo *"
              name="periodo"
              value={formData.periodo}
              onChange={handleInputChange}
              margin="dense"
              size="small"
            >
              {periodosContables.map((periodo) => (
                <MenuItem key={periodo} value={periodo}>
                  {periodo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              select
              label="Empresa *"
              name="empresa"
              value={formData.empresa}
              onChange={handleInputChange}
              margin="dense"
              size="small"
            >
              {empresas.map((empresa) => (
                <MenuItem key={empresa} value={empresa}>
                  {empresa}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* Cuarta fila: Estado */}
          <Grid item xs={3}>
            <TextField
              fullWidth
              select
              label="Estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              margin="dense"
              size="small"
            >
              <MenuItem value="Borrador">Borrador</MenuItem>
              <MenuItem value="Contabilizado">Contabilizado</MenuItem>
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
                  label="Cuenta"
                  value={linea.cuenta}
                  onChange={(e) => handleLineChange(index, 'cuenta', e.target.value)}
                  margin="dense"
                  size="small"
                >
                  <MenuItem value="">Seleccionar cuenta</MenuItem>
                  {cuentasContables.map((cuenta) => (
                    <MenuItem key={cuenta.codigo} value={cuenta.codigo}>
                      {cuenta.codigo} - {cuenta.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Débito y Crédito alineados a la derecha */}
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
                        style: { textAlign: 'right' } 
                      }}
                      InputLabelProps={{ style: { textAlign: 'right' } }}
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
                        style: { textAlign: 'right' } 
                      }}
                      InputLabelProps={{ style: { textAlign: 'right' } }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} alignItems="flex-start">         
              {/* Descripción - Ocupa toda la fila debajo */}
              <Grid item xs={12}>
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
              {/* Botón eliminar */}
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
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={diferencia !== 0}
        >
          Crear Asiento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NuevoAsientoModal;