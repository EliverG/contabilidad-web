import React from "react";
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
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import type { CuentaContable } from "../interfaces/CuentaContable";

interface ModalNuevaCuentaProps {
  open: boolean;
  onClose: () => void;
  onSave: (cuenta: CuentaContable) => void;
  initialData?: CuentaContable | null;
}

const ModalNuevaCuenta: React.FC<ModalNuevaCuentaProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = React.useState({
    id: 0,
    codigo: "",
    nombre: "",
    tipo: "",
    naturaleza: "DEUDORA",
    requiereCentroCosto: false,
    estadoActivo: true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        codigo: initialData.codigo,
        nombre: initialData.nombre,
        tipo: initialData.tipo,
        naturaleza: initialData.naturaleza,
        requiereCentroCosto: initialData.idCentroCosto !== null,
        estadoActivo: initialData.estado === "ACTIVO",
      });
    } else {
      setFormData({
        id: 0,
        codigo: "",
        nombre: "",
        tipo: "",
        naturaleza: "DEUDORA",
        requiereCentroCosto: false,
        estadoActivo: true,
      });
    }
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, tipo: e.target.value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, naturaleza: e.target.value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleGuardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cuentaBase = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      tipo: formData.tipo.toUpperCase() as
        | "ACTIVO"
        | "PASIVO"
        | "PATRIMONIO"
        | "INGRESO"
        | "GASTO",
      naturaleza: formData.naturaleza.toUpperCase() as "DEUDORA" | "ACREEDORA",
      estado: formData.estadoActivo ? "ACTIVO" : "INACTIVO",
      idCentroCosto: formData.requiereCentroCosto ? 1 : 2,
    };

    // Solo agregamos id si es edición
    const cuenta = formData.id > 0 ? { id: formData.id, ...cuentaBase } : cuentaBase;

    onSave(cuenta as CuentaContable);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {initialData ? "Editar Cuenta Contable" : "Crear Cuenta Contable"}
        <Tooltip title="Cerrar">
          <Button onClick={onClose} size="small" variant="contained" color="error">
            <CloseIcon />
          </Button>
        </Tooltip>
      </DialogTitle>

      <Box component="form" onSubmit={handleGuardar}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Código y Tipo */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                required
                id="codigo"
                label="Código"
                value={formData.codigo}
                onChange={handleChange}
                fullWidth
              />

              <FormControl required fullWidth>
                <InputLabel id="tipo-cuenta-label">Tipo</InputLabel>
                <Select
                  labelId="tipo-cuenta-label"
                  id="tipo"
                  value={formData.tipo}
                  label="Tipo"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="PASIVO">Pasivo</MenuItem>
                  <MenuItem value="PATRIMONIO">Patrimonio</MenuItem>
                  <MenuItem value="INGRESO">Ingreso</MenuItem>
                  <MenuItem value="GASTO">Gasto</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Nombre */}
            <TextField
              required
              id="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
            />

            {/* Naturaleza */}
            <FormControl>
              <RadioGroup row value={formData.naturaleza} onChange={handleRadioChange}>
                <FormControlLabel value="DEUDORA" control={<Radio />} label="Deudora" />
                <FormControlLabel value="ACREEDORA" control={<Radio />} label="Acreedora" />
              </RadioGroup>
            </FormControl>

            {/* Switches */}
            <FormControlLabel
              control={
                <Switch
                  name="requiereCentroCosto"
                  checked={formData.requiereCentroCosto}
                  onChange={handleSwitchChange}
                />
              }
              label="Requiere Centro de Costo"
            />

            <FormControlLabel
              control={
                <Switch
                  name="estadoActivo"
                  checked={formData.estadoActivo}
                  onChange={handleSwitchChange}
                />
              }
              label="Estado Activo"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
          >
            {initialData ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ModalNuevaCuenta;
