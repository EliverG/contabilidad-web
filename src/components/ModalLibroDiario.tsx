import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import type { Diario } from "../interfaces/Diario";

interface ModalLibroDiarioProps {
  open: boolean;
  onClose: () => void;
  onSave: (registro: Diario) => void;
  initialData?: Diario | null;
}

const ModalLibroDiario: React.FC<ModalLibroDiarioProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = React.useState<Diario>({
    id: 0,
    fecha: new Date(),
    descripcion: "",
    debe: 0,
    haber: 0,
    cuentaContable: "",
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id ?? 0,
        fecha: initialData.fecha,
        descripcion: initialData.descripcion,
        debe: initialData.debe,
        haber: initialData.haber,
        cuentaContable: initialData.cuentaContable,
      });
    } else {
      setFormData({
        id: 0,
        fecha: new Date(),
        descripcion: "",
        debe: 0,
        haber: 0,
        cuentaContable: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "debe" || id === "haber"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, cuentaContable: e.target.value }));
  };

  const handleGuardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validación básica
    if (!formData.descripcion.trim()) {
      alert("Debe ingresar una descripción.");
      return;
    }
    if (!formData.cuentaContable) {
      alert("Debe seleccionar una cuenta contable.");
      return;
    }

    const registro = {
      ...formData,
      fecha: formData.fecha || new Date().toISOString().split("T")[0],
    };

    onSave(registro);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {initialData ? "Editar Registro del Libro Diario" : "Nuevo Registro del Libro Diario"}
        <Tooltip title="Cerrar">
          <Button onClick={onClose} size="small" variant="contained" color="error">
            <CloseIcon />
          </Button>
        </Tooltip>
      </DialogTitle>

      <Box component="form" onSubmit={handleGuardar}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Fecha */}
            <TextField
              id="fecha"
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            {/* Descripción */}
            <TextField
              id="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Cuenta contable */}
            <FormControl fullWidth required>
              <InputLabel id="cuenta-contable-label">Cuenta Contable</InputLabel>
              <Select
                labelId="cuenta-contable-label"
                id="cuentaContable"
                value={formData.cuentaContable}
                label="Cuenta Contable"
                onChange={handleSelectChange}
              >
                {/* TODO: puedes mapear tus cuentas desde props o API */}
                <MenuItem value="1101">1101 - Caja General</MenuItem>
                <MenuItem value="2101">2101 - Cuentas por Pagar</MenuItem>
                <MenuItem value="4101">4101 - Ingresos por Servicios</MenuItem>
                <MenuItem value="5101">5101 - Gastos Administrativos</MenuItem>
              </Select>
            </FormControl>

            {/* Debe y Haber */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                id="debe"
                label="Debe"
                type="number"
                value={formData.debe}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, step: "0.01" }}
              />
              <TextField
                id="haber"
                label="Haber"
                type="number"
                value={formData.haber}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
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

export default ModalLibroDiario;
