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
  Switch,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import type { Empresa } from "../interfaces/Empresa";

interface AddEmpresaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (empresa: Empresa | Partial<Empresa>) => void;
  initialData?: Empresa | null;
}

const AddEmpresaModal: React.FC<AddEmpresaModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = React.useState({
    id: 0,
    nombre: "",
    rucNit: "",
    direccion: "",
    telefono: "",
    estado: "ACTIVO" as "ACTIVO" | "INACTIVO",
    estadoActivo: true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nombre: initialData.nombre,
        rucNit: initialData.rucNit,
        direccion: initialData.direccion ?? "",
        telefono: initialData.telefono ?? "",
        estado: initialData.estado,
        estadoActivo: initialData.estado === "ACTIVO",
      });
    } else {
      setFormData({
        id: 0,
        nombre: "",
        rucNit: "",
        direccion: "",
        telefono: "",
        estado: "ACTIVO",
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
    setFormData((prev) => ({
      ...prev,
      estado: e.target.value as "ACTIVO" | "INACTIVO",
      estadoActivo: (e.target.value as string) === "ACTIVO",
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      estadoActivo: checked,
      estado: checked ? "ACTIVO" : "INACTIVO",
    }));
  };

  const handleGuardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }
    if (!formData.rucNit.trim()) {
      alert("El RUC/NIT es requerido");
      return;
    }

    const empresaBase = {
      nombre: formData.nombre,
      rucNit: formData.rucNit,
      direccion: formData.direccion.trim() ? formData.direccion : null,
      telefono: formData.telefono.trim() ? formData.telefono : null,
      estado: formData.estadoActivo ? "ACTIVO" : "INACTIVO",
    } as Omit<Empresa, "id">;

    const payload =
      formData.id > 0 ? ({ id: formData.id, ...empresaBase } as Empresa) : empresaBase;

    onSave(payload);
    onClose();
  };

  // Evitar presionar "Enter" en Dirección
  const handlePreventEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {initialData ? "Editar Empresa" : "Crear Empresa"}
        <Tooltip title="Cerrar">
          <Button onClick={onClose} size="small" variant="contained" color="error">
            <CloseIcon />
          </Button>
        </Tooltip>
      </DialogTitle>

      <Box component="form" onSubmit={handleGuardar}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Nombre y RUC/NIT */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                required
                id="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                required
                id="rucNit"
                label="RUC/NIT"
                value={formData.rucNit}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            {/* Estado + Switch */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <FormControl
                    // ⬇️ ancho acorde al contenido
                    sx={{ minWidth: 140, width: "fit-content" }}
                    size="small"
                >
                    <InputLabel id="estado-empresa-label">Estado</InputLabel>
                    <Select
                    labelId="estado-empresa-label"
                    id="estado"
                    value={formData.estado}
                    label="Estado"
                    onChange={handleSelectChange}
                    >
                    <MenuItem value="ACTIVO">Activo</MenuItem>
                    <MenuItem value="INACTIVO">Inactivo</MenuItem>
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                    <Switch
                        name="estadoActivo"
                        checked={formData.estadoActivo}
                        onChange={handleSwitchChange}
                    />
                    }
                    label="Estado Activo"
                    sx={{ ml: 1 }}
                />
                </Box>

            {/* Dirección (sin Enter, tamaño tipo párrafo) */}
            <TextField
                required
                id="direccion"
                label="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                fullWidth
                inputProps={{ maxLength: 200 }}
            />

            {/* Teléfono (numérico, 8 dígitos, más corto) */}
            <TextField
                id="telefono"
                label="Teléfono"
                type="tel"
                inputMode="numeric"
                value={formData.telefono}
                onChange={handleChange}
                // ⬇️ más corto
                sx={{ maxWidth: 180 }}
                inputProps={{
                    maxLength: 8,
                    pattern: "[0-9]*",
                    title: "Ingrese solo números (8 dígitos)"
                }}
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

export default AddEmpresaModal;
