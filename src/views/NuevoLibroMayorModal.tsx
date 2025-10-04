import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  Grid,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";

type EstadoAsiento = "Aprobado" | "Borrador" | "Anulado" | "Todos";

export type NuevoLibroMayorPayload = {
  cuenta: string;       // requerido
  fechaInicio: string;  // YYYY-MM-DD
  fechaFin: string;     // YYYY-MM-DD
  centroCosto: string;  // "Todos" | "CC-100" | ...
  proyecto: string;     // "Todos" | "P-001" | ...
  estado: EstadoAsiento;
  descripcion?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: NuevoLibroMayorPayload) => void;
};

const DEFAULTS: NuevoLibroMayorPayload = {
  cuenta: "",
  fechaInicio: "2024-01-01",
  fechaFin: "2024-12-31",
  centroCosto: "Todos",
  proyecto: "Todos",
  estado: "Todos",
  descripcion: "",
};

export default function NuevoLibroMayorModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<NuevoLibroMayorPayload>(DEFAULTS);

  const setField = <K extends keyof NuevoLibroMayorPayload>(
    key: K,
    value: NuevoLibroMayorPayload[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const finAntesDeInicio = useMemo(() => {
    const ini = new Date(form.fechaInicio).getTime();
    const fin = new Date(form.fechaFin).getTime();
    return fin < ini;
  }, [form.fechaInicio, form.fechaFin]);

  const isValid = useMemo(() => {
    if (!form.cuenta) return false;
    if (finAntesDeInicio) return false;
    return true;
  }, [form.cuenta, finAntesDeInicio]);

  const handleGuardar = () => {
    if (!isValid) return;
    onSubmit?.(form);
    onClose();
    // Si deseas limpiar al cerrar:
    // setForm(DEFAULTS);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight="bold">Nuevo Libro Mayor</Typography>
          <IconButton onClick={onClose} aria-label="Cerrar">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Cuenta contable (requerido) */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              Cuenta contable *
            </Typography>
            <Select
              value={form.cuenta}
              onChange={(e) => setField("cuenta", (e.target.value as string) ?? "")}
              displayEmpty
              size="small"
              sx={{ width: "auto", minWidth: 180 }}
              renderValue={(selected) => {
                if (!selected) return <em>Seleccionar cuenta</em>;
                const map: Record<string, string> = {
                  C001: "Caja General",
                  C002: "Bancos",
                  C003: "Cuentas por Cobrar",
                };
                return map[selected] ?? selected;
              }}
            >
              <MenuItem value="">
                <em>Seleccionar cuenta</em>
              </MenuItem>
              <MenuItem value="C001">Caja General</MenuItem>
              <MenuItem value="C002">Bancos</MenuItem>
              <MenuItem value="C003">Cuentas por Cobrar</MenuItem>
            </Select>
          </Grid>

          {/* Rango de fechas */}
<Grid item xs={12} md={6}>
  <Typography variant="body2" fontWeight={700} gutterBottom>
    Rango de fechas
  </Typography>
<Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
  <TextField
    label="Inicio"
    type="date"
    size="small"
    margin="dense"
    value={form.fechaInicio}
    onChange={(e) => setField("fechaInicio", e.target.value)}
    sx={{ width: "auto", minWidth: 150, mt: 0 }} // 👈 evita que se baje
    InputLabelProps={{
      shrink: true,
      style: { fontWeight: "bold" },
    }}
  />
  <TextField
    label="Fin"
    type="date"
    size="small"
    margin="dense"
    value={form.fechaFin}
    onChange={(e) => setField("fechaFin", e.target.value)}
    sx={{ width: "auto", minWidth: 150, mt: 0 }} // 👈 mismo nivel que Inicio
    InputLabelProps={{
      shrink: true,
      style: { fontWeight: "bold" },
    }}
    error={finAntesDeInicio}
    helperText={finAntesDeInicio ? "La fecha fin no puede ser menor a inicio" : " "}
  />
</Box>

</Grid>


          {/* Centro de costo */}
          <Grid item xs={12} md={4}>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              Centro de costo
            </Typography>
            <Select
              value={form.centroCosto}
              onChange={(e) => setField("centroCosto", e.target.value as string)}
              size="small"
              displayEmpty
              sx={{ width: "auto", minWidth: 150 }}
              renderValue={(selected) => selected || <em>Todos</em>}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="CC-100">CC-100</MenuItem>
              <MenuItem value="CC-200">CC-200</MenuItem>
            </Select>
          </Grid>

          {/* Proyecto */}
          <Grid item xs={12} md={4}>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              Proyecto
            </Typography>
            <Select
              value={form.proyecto}
              onChange={(e) => setField("proyecto", e.target.value as string)}
              size="small"
              displayEmpty
              sx={{ width: "auto", minWidth: 150 }}
              renderValue={(selected) => selected || <em>Todos</em>}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="P-001">P-001</MenuItem>
              <MenuItem value="P-002">P-002</MenuItem>
            </Select>
          </Grid>

          {/* Estado del asiento */}
          <Grid item xs={12} md={4}>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              Estado del asiento
            </Typography>
            <Select
              value={form.estado}
              onChange={(e) => setField("estado", e.target.value as EstadoAsiento)}
              size="small"
              displayEmpty
              sx={{ width: "auto", minWidth: 150 }}
              renderValue={(selected) => selected || <em>Todos</em>}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Aprobado">Aprobado</MenuItem>
              <MenuItem value="Borrador">Borrador</MenuItem>
              <MenuItem value="Anulado">Anulado</MenuItem>
            </Select>
          </Grid>

          {/* Descripción / Notas */}
          <Grid item xs={12}>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              Descripción / Notas
            </Typography>
            <TextField
              placeholder="Observaciones, referencia o una nota breve…"
              multiline
              minRows={2}
              fullWidth
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Resumen rápido */}
        <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>Cuenta:</strong>{" "}
            {form.cuenta
              ? ({ C001: "Caja General", C002: "Bancos", C003: "Cuentas por Cobrar" } as any)[form.cuenta] || form.cuenta
              : "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Rango:</strong> {form.fechaInicio} → {form.fechaFin}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>CC:</strong> {form.centroCosto}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Proyecto:</strong> {form.proyecto}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Estado:</strong> {form.estado}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color="primary"
          disabled={!isValid}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
