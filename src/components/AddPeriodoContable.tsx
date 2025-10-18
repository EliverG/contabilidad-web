import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, Chip, Tooltip, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody,
  Autocomplete, MenuItem, Select, InputLabel, FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";

import type { Empresa } from "../interfaces/Empresa";
import type { PeriodoContable } from "../interfaces/PeriodoContable";
import { getEmpresas } from "../services/empresaApi";
import { getPeriodosAll, createOrUpdatePeriodo, deletePeriodo } from "../services/periodosApi";

// ==== utilidades fecha dd/MM/yyyy <-> ISO ====
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function parseDDMMYYYY(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  const [ , dd, mm, yyyy ] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  // validar que coincida (p.ej. 31/02 invalida)
  if (d.getFullYear() !== Number(yyyy) || d.getMonth() + 1 !== Number(mm) || d.getDate() !== Number(dd)) return null;
  return d;
}
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function formatDDMMYYYY(input: string | Date): string {
  const d = typeof input === "string" ? parseDDMMYYYY(input) : input;
  const dt = d instanceof Date ? d : null;
  if (!dt) return "";
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddPeriodoContable: React.FC<Props> = ({ open, onClose }) => {
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [periodos, setPeriodos] = React.useState<PeriodoContable[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = React.useState<Empresa | null>(null);

  const [editRow, setEditRow] = React.useState<Partial<PeriodoContable> | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // filtros locales
  const filteredPeriodos = React.useMemo(() => {
    if (!selectedEmpresa) return [];
    return periodos.filter(p => p.idEmpresa === selectedEmpresa.id);
  }, [periodos, selectedEmpresa]);

  React.useEffect(() => {
    (async () => {
      try {
        const [empRes, perRes] = await Promise.all([getEmpresas(), getPeriodosAll()]);
        setEmpresas(empRes.data);
        setPeriodos(perRes.data);
      } catch (e) {
        console.error("Error cargando empresas/periodos", e);
      }
    })();
  }, [open]);

  // ---- handlers formulario embebido ----
  const resetForm = () => {
    setEditRow({
      id: 0,
      idEmpresa: selectedEmpresa?.id ?? 0,
      nombrePeriodo: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "ABIERTO",
    });
    setIsEditing(false);
  };

  const handleNuevo = () => {
    if (!selectedEmpresa) {
      alert("Seleccione una empresa primero.");
      return;
    }
    resetForm();
  };

  const handleEditar = (row: PeriodoContable) => {
    setIsEditing(true);
    setEditRow({
      ...row,
      // mostramos siempre dd/MM/yyyy en inputs
      fechaInicio: typeof row.fechaInicio === "string" ? row.fechaInicio : formatDDMMYYYY(row.fechaInicio),
      fechaFin: typeof row.fechaFin === "string" ? row.fechaFin : formatDDMMYYYY(row.fechaFin),
    });
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este período contable?")) return;
    try {
      await deletePeriodo(id);
      // refresco local
      setPeriodos(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error al eliminar período", e);
    }
  };

  const handleChange = (field: keyof PeriodoContable) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditRow(prev => ({ ...(prev ?? {}), [field]: e.target.value }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<{ value: unknown }> | any) => {
    setEditRow(prev => ({ ...(prev ?? {}), estado: e.target.value as 'ABIERTO' | 'CERRADO' }));
  };

  const saveForm = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editRow || !selectedEmpresa) return;

    // validaciones mínimas
    const nombreOk = !!editRow.nombrePeriodo && editRow.nombrePeriodo.trim().length > 0;
    const fIni = typeof editRow.fechaInicio === "string" ? parseDDMMYYYY(editRow.fechaInicio) : null;
    const fFin = typeof editRow.fechaFin === "string" ? parseDDMMYYYY(editRow.fechaFin) : null;
    if (!nombreOk) {
      alert("El nombre del período es requerido");
      return;
    }
    if (!fIni || !fFin) {
      alert("Las fechas deben tener formato dd/MM/yyyy");
      return;
    }
    if (fFin < fIni) {
      alert("La fecha fin no puede ser menor que la fecha inicio");
      return;
    }

    const payload: Partial<PeriodoContable> = {
      id: editRow.id && editRow.id > 0 ? editRow.id : undefined,
      idEmpresa: selectedEmpresa.id,
      nombrePeriodo: editRow.nombrePeriodo!.trim(),
      fechaInicio: toISODate(fIni), // backend espera ISO YYYY-MM-DD
      fechaFin: toISODate(fFin),
      estado: (editRow.estado ?? "ABIERTO"),
    };

    try {
      const res = await createOrUpdatePeriodo(payload);
      const saved = res.data;

      setPeriodos(prev => {
        const exists = prev.some(p => p.id === saved.id);
        return exists ? prev.map(p => (p.id === saved.id ? saved : p)) : [...prev, saved];
      });

      setEditRow(null);
      setIsEditing(false);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Error al guardar período";
      alert(msg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon />
          Períodos Contables
        </Box>
        <Tooltip title="Cerrar">
          <IconButton color="error" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent dividers>
        {/* Selector de empresa */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, mb: 2 }}>
          <Autocomplete
            options={empresas}
            getOptionLabel={(o) => o?.nombre ?? ""}
            value={selectedEmpresa}
            onChange={(_, val) => {
              setSelectedEmpresa(val);
              setEditRow(null);
              setIsEditing(false);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar Empresa" placeholder="Escribe para buscar..." />
            )}
          />
        </Box>

        {/* Acciones + tabla */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box sx={{ fontSize: 14, opacity: 0.9 }}>
            {selectedEmpresa ? `Empresa: ${selectedEmpresa.nombre}` : "Seleccione una empresa"}
          </Box>
          <Tooltip title="Nuevo período">
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleNuevo}
                disabled={!selectedEmpresa}
              >
                Nuevo
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre del período</TableCell>
              <TableCell>Fecha inicio</TableCell>
              <TableCell>Fecha fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPeriodos.length ? (
              filteredPeriodos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nombrePeriodo}</TableCell>
                  <TableCell>{typeof p.fechaInicio === "string" ? p.fechaInicio : formatDDMMYYYY(p.fechaInicio)}</TableCell>
                  <TableCell>{typeof p.fechaFin === "string" ? p.fechaFin : formatDDMMYYYY(p.fechaFin)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.estado}
                      color={p.estado === "ABIERTO" ? "success" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <Button size="small" variant="contained" color="warning" onClick={() => handleEditar(p)}>
                        <EditIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <Button size="small" variant="contained" color="error" onClick={() => handleEliminar(p.id)}>
                        <DeleteIcon />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay períodos para esta empresa</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Formulario embebido: crear/editar */}
        {selectedEmpresa && (
          <Box component="form" onSubmit={saveForm} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                required
                label="Nombre del período"
                value={editRow?.nombrePeriodo ?? ""}
                onChange={handleChange("nombrePeriodo")}
              />

              <FormControl size="small" sx={{ minWidth: 160, width: "fit-content" }}>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  value={(editRow?.estado ?? "ABIERTO") as any}
                  label="Estado"
                  onChange={handleEstadoChange}
                >
                  <MenuItem value="ABIERTO">ABIERTO</MenuItem>
                  <MenuItem value="CERRADO">CERRADO</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                required
                label="Fecha inicio (dd/mm/aaaa)"
                placeholder="dd/mm/aaaa"
                value={editRow?.fechaInicio ?? ""}
                onChange={handleChange("fechaInicio")}
                inputProps={{ inputMode: "numeric", pattern: "\\d{2}/\\d{2}/\\d{4}", maxLength: 10 }}
              />
              <TextField
                required
                label="Fecha fin (dd/mm/aaaa)"
                placeholder="dd/mm/aaaa"
                value={editRow?.fechaFin ?? ""}
                onChange={handleChange("fechaFin")}
                inputProps={{ inputMode: "numeric", pattern: "\\d{2}/\\d{2}/\\d{4}", maxLength: 10 }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!editRow || !selectedEmpresa}
              >
                {isEditing ? "Actualizar período" : "Guardar período"}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPeriodoContable;
