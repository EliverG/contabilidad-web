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
  IconButton
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';

const NuevoAsientoModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    numero: 'AST-288',
    fecha: '30/08/2025',
    descripcion: 'Descripción del asiento contable...',
    referencia: '',
    estado: 'Borrador',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Nueva Partida</span>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Número de asiento *"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Fecha *"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText="Formato: Día/Mes/Año"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción *"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Divider style={{ margin: '20px 0' }} />
        
        <Typography variant="h6" gutterBottom>
          Referencia externa
        </Typography>
        <TextField
          fullWidth
          placeholder="FAC-001, DOC-123, etc."
          name="referencia"
          value={formData.referencia}
          onChange={handleInputChange}
          margin="normal"
        />
        
        <TextField
          fullWidth
          select
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleInputChange}
          margin="normal"
        >
          <MenuItem value="Borrador">Borrador</MenuItem>
          <MenuItem value="Contabilizado">Contabilizado</MenuItem>
        </TextField>

        <Divider style={{ margin: '20px 0' }} />
        
        <Typography variant="h6" gutterBottom>
          Líneas del asiento
        </Typography>




        
        {formData.lineas.map((linea, index) => (
          <Paper key={index} style={{ padding: '15px', marginBottom: '10px' }}>

            {/* Primera fila: Cuenta + Montos + Botones */}
            <Grid container spacing={10} alignItems="center">

              {/* Cuenta - Ocupa más espacio */}
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  select
                  label="Cuenta"
                  value={linea.cuenta}
                  onChange={(e) => handleLineChange(index, 'cuenta', e.target.value)}
                  margin="dense"
                  inputProps={{ style: { textAlign: 'left' } }}
                  InputLabelProps={{ style: { textAlign: 'left' } }}
                >
                  <MenuItem value="">Seleccionar cuenta</MenuItem>
                  <MenuItem value="1">1 - ACTIVO</MenuItem>
                  <MenuItem value="11">11 - ACTIVO CORRIENTE</MenuItem>
                  <MenuItem value="130181">130181 - Caja General</MenuItem>
                  <MenuItem value="119192">119192 - Bancos</MenuItem>
                </TextField>
              </Grid>

              {/* Débito y Crédito juntos - Alineados a la derecha */}
              <Grid item xs={4}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Débito"
                      type="number"
                      value={linea.debito}
                      onChange={(e) => handleLineChange(index, 'debito', e.target.value)}
                      margin="dense"
                      inputProps={{ style: { textAlign: 'right' } }}
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
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Segunda fila: Descripción */}
            <Grid container style={{ marginTop: '10px' }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={linea.descripcion}
                  onChange={(e) => handleLineChange(index, 'descripcion', e.target.value)}
                  margin="dense"
                  inputProps={{ style: { textAlign: 'left' } }}
                />
              </Grid>

             {/* Botón eliminar */}
              <Grid item xs={3} style={{ textAlign: 'right' }}>
                {formData.lineas.length > 1 && (
                  <Button
                    color="error"
                    onClick={() => removeLine(index)}
                    //size="small"
                  >
                    Eliminar Línea
                  </Button>
                )}
              </Grid> 
            </Grid>

          </Paper>
        ))}





        
        {/*{formData.lineas.map((linea, index) => (
          <Paper key={index} style={{ padding: '15px', marginBottom: '10px' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  select
                  label="Cuenta"
                  value={linea.cuenta}
                  onChange={(e) => handleLineChange(index, 'cuenta', e.target.value)}
                  margin="dense"
                >
                  <MenuItem value="">Seleccionar cuenta</MenuItem>
                  <MenuItem value="1">1 - ACTIVO</MenuItem>
                  <MenuItem value="11">11 - ACTIVO CORRIENTE</MenuItem>
                  <MenuItem value="130181">130181 - Caja General</MenuItem>
                  <MenuItem value="119192">119192 - Bancos</MenuItem>
                </TextField>
              </Grid>

              <Grid item sm={2} style={{ textAlign: 'right' }}>
                <TextField
                  fullWidth
                  label="Débito"
                  type="number"
                  value={linea.debito}
                  onChange={(e) => handleLineChange(index, 'debito', e.target.value)}
                  margin="dense"
                  InputLabelProps={{ style: { textAlign: 'right' } }}
                />
              </Grid>
              
              <Grid item xs={2} style={{ textAlign: 'right' }}>
                <TextField
                  fullWidth
                  label="Crédito"
                  type="number"
                  value={linea.credito}
                  onChange={(e) => handleLineChange(index, 'credito', e.target.value)}
                  margin="dense"
                  InputLabelProps={{ style: { textAlign: 'right' } }}
                />
              </Grid>
            </Grid>


            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={linea.descripcion}
                  onChange={(e) => handleLineChange(index, 'descripcion', e.target.value)}
                  margin="dense"
                />
              </Grid>

              {formData.lineas.length > 1 && (
                <Grid item xs={12} style={{ textAlign: 'right' }}>
                  <Button 
                    color="error" 
                    onClick={() => removeLine(index)}
                  >
                    Eliminar línea
                  </Button>
                </Grid>
              )}
            </Grid>


          </Paper>
        ))}*/}
        
        <Button 
          startIcon={<Add />} 
          onClick={addNewLine}
          style={{ marginTop: '10px' }}
        >
          Agregar línea
        </Button>

        <Divider style={{ margin: '20px 0' }} />
        
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="h6">Total Débito</Typography>
            <Typography variant="h5">Q {totalDebito.toFixed(2)}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="h6">Total Crédito</Typography>
            <Typography variant="h5">Q {totalCredito.toFixed(2)}</Typography>
          </Grid>
          
          <Grid item xs={4}>
            <Typography variant="h6">Diferencia</Typography>
            <Typography 
              variant="h5" 
              color={diferencia === 0 ? 'success.main' : 'error.main'}
            >
              Q {diferencia.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">
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