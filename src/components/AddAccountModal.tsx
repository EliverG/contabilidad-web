// ModalNuevaCuenta.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  FormLabel,
  RadioGroup,
  Radio,
  Switch,
  IconButton,
  Tooltip
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface ModalNuevaCuentaProps {
  open: boolean;
  onClose: () => void;
}

const ModalNuevaCuenta: React.FC<ModalNuevaCuentaProps> = ({ open, onClose }) => {
  const [formData, setFormData] = React.useState({
    codigo: '',
    nombre: '',
    tipo: '',
    naturaleza: 'deudora',
    requiereCentroCosto: true,
    estadoActivo: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, tipo: e.target.value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, naturaleza: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleGuardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Guardando nueva cuenta...', formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Título con botón de cerrar */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Crear Cuenta Contable
        <Tooltip title="Cerrar dialogo">
        <Button onClick={onClose} size='large' variant='contained' color='error' aria-label="Cerrar">
          <CloseIcon />
        </Button>
        </Tooltip>
      </DialogTitle>

      {/* Formulario */}
      <Box component="form" onSubmit={handleGuardar}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Código y Tipo de Cuenta */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                id="codigo"
                label="Código"
                value={formData.codigo}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />

              <FormControl required fullWidth>
                <InputLabel id="tipo-cuenta-label">Tipo de Cuenta</InputLabel>
                <Select
                  labelId="tipo-cuenta-label"
                  id="tipo"
                  value={formData.tipo}
                  label="Tipo de Cuenta"
                  onChange={handleSelectChange}
                >
                  <MenuItem value=""><em>Selecciona tipo</em></MenuItem>
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Pasivo">Pasivo</MenuItem>
                  <MenuItem value="Patrimonio">Patrimonio</MenuItem>
                  <MenuItem value="Ingreso">Ingreso</MenuItem>
                  <MenuItem value="Costo">Costo</MenuItem>
                  <MenuItem value="Gasto">Gasto</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Nombre de la Cuenta */}
            <TextField
              required
              id="nombre"
              label="Nombre de la Cuenta"
              value={formData.nombre}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />

            {/* Naturaleza */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Naturaleza</FormLabel>
              <RadioGroup
                row
                value={formData.naturaleza}
                onChange={handleRadioChange}
              >
                <FormControlLabel value="deudora" control={<Radio />} label="Deudora" />
                <FormControlLabel value="acreedora" control={<Radio />} label="Acreedora" />
              </RadioGroup>
            </FormControl>

            {/* Opciones adicionales: Checkbox y Switch */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="requiereCentroCosto"
                    checked={formData.requiereCentroCosto}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Requiere Centro de Costo"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="estadoActivo"
                    checked={formData.estadoActivo}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Estado Activo"
              />
            </Box>

          </Box>
        </DialogContent>

        {/* Botón de guardar */}
        <DialogActions sx={{ p: '16px 24px' }}>
          <Tooltip title="Guardar Cuenta">
            <Button
              type="submit"
              size="large"
              color="success"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Guardar
            </Button>
          </Tooltip>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ModalNuevaCuenta;
