import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Toolbar,
  Tooltip,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import {
  Close,
  Search,
  CleaningServices,
  FileDownload,
  Visibility,
  Replay,
  History as HistoryIcon,
} from "@mui/icons-material";

type EstadoAsiento = "Aprobado" | "Borrador" | "Anulado" | "Todos";

export type HistorialBusqueda = {
  id: string;
  timestamp: string; // ISO: "2025-09-05T19:32:10-06:00"
  usuario: { id: string; nombre: string; email?: string };
  cuenta?: { cod: string; nombre?: string };
  fechaInicio?: string; // "YYYY-MM-DD"
  fechaFin?: string;    // "YYYY-MM-DD"
  centroCosto?: string;
  proyecto?: string;
  estado?: EstadoAsiento;
  texto?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Opcional: permite notificar a LibroMayor para reaplicar filtros con el registro elegido */
  onReaplicar?: (registro: HistorialBusqueda) => void;
};

const historialEjemplo: HistorialBusqueda[] = [
  {
    id: "1",
    timestamp: "2025-09-05T18:32:10-06:00",
    usuario: { id: "u1", nombre: "Juan Pérez", email: "juan@example.com" },
    cuenta: { cod: "C001", nombre: "Caja General" },
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
    centroCosto: "CC-100",
    proyecto: "P-001",
    estado: "Aprobado",
    texto: "factura proveedores",
  },
  {
    id: "2",
    timestamp: "2025-08-28T10:05:10-06:00",
    usuario: { id: "u2", nombre: "María López" },
    cuenta: { cod: "C002", nombre: "Bancos" },
    fechaInicio: "2024-06-01",
    fechaFin: "2024-06-30",
    centroCosto: "Todos",
    proyecto: "Todos",
    estado: "Borrador",
    texto: "cobros junio",
  },
  {
    id: "3",
    timestamp: "2025-08-10T08:12:00-06:00",
    usuario: { id: "u1", nombre: "Juan Pérez" },
    cuenta: { cod: "C003", nombre: "Cuentas por Cobrar" },
    fechaInicio: "2024-03-01",
    fechaFin: "2024-03-31",
    centroCosto: "CC-200",
    proyecto: "P-002",
    estado: "Anulado",
    texto: "nota de crédito",
  },
];

function estadoChipColor(estado?: EstadoAsiento) {
  switch (estado) {
    case "Aprobado":
      return "success";
    case "Borrador":
      return "warning";
    case "Anulado":
      return "default";
    default:
      return "default";
  }
}

function formatDateTime(ts: string) {
  // Render amigable: dd/mm/yyyy hh:mm
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function HistorialdeBusquedaModal({
  open,
  onClose,
  onReaplicar,
}: Props) {
  // Datos locales (UI-only). Reemplaza por tus datos reales cuando los tengas.
  const [rows, setRows] = useState<HistorialBusqueda[]>(historialEjemplo);

  // Filtros en modal
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) {
      return [...rows].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    return [...rows]
      .filter((r) => {
        const bag = [
          r.usuario?.nombre ?? "",
          r.usuario?.email ?? "",
          r.cuenta?.cod ?? "",
          r.cuenta?.nombre ?? "",
          r.fechaInicio ?? "",
          r.fechaFin ?? "",
          r.centroCosto ?? "",
          r.proyecto ?? "",
          r.estado ?? "",
          r.texto ?? "",
          formatDateTime(r.timestamp),
        ]
          .join(" ")
          .toLowerCase();
        return bag.includes(term);
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [rows, q]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleLimpiar = () => {
    // UI-only: limpia todo (en real, confirma y persiste)
    setRows([]);
    setPage(0);
  };

  const handleExportar = () => {
    // Placeholder UX: aquí iría tu lógica de exportación (CSV/Excel)
    // Por ahora solo mostramos en consola.
    // eslint-disable-next-line no-console
    console.log("Exportar historial:", filtered);
  };

  const [detalle, setDetalle] = useState<HistorialBusqueda | null>(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            <Typography fontWeight="bold">Historial de Búsqueda</Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Cerrar">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Toolbar interna del modal */}
        <Toolbar
          disableGutters
          sx={{
            mb: 1.5,
            display: "flex",
            gap: 1,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Search />
            <TextField
              size="small"
              placeholder="Buscar en historial…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Limpiar historial">
              <span>
                <Button
                  variant="contained"
                  startIcon={<CleaningServices />}
                  onClick={handleLimpiar}
                  disabled={rows.length === 0}
                  className="font-bold"
                >
                  Limpiar
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Exportar historial">
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={handleExportar}
                disabled={filtered.length === 0}
                className="font-bold"
              >
                Exportar
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>

        <Paper variant="contained">
          <TableContainer sx={{ maxHeight: 460 }}>
            <Table stickyHeader size="small" aria-label="tabla-historial">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Fecha/Hora</strong></TableCell>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>Cuenta</strong></TableCell>
                  <TableCell><strong>Rango</strong></TableCell>
                  <TableCell><strong>Centro costo</strong></TableCell>
                  <TableCell><strong>Proyecto</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Texto buscado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map((r) => (
                    <TableRow hover key={r.id}>
                      <TableCell>{formatDateTime(r.timestamp)}</TableCell>
                      <TableCell>{r.usuario?.nombre ?? "—"}</TableCell>
                      <TableCell>
                        {r.cuenta
                          ? `${r.cuenta.cod} — ${r.cuenta.nombre ?? ""}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {(r.fechaInicio || r.fechaFin)
                          ? `${r.fechaInicio ?? "?"} → ${r.fechaFin ?? "?"}`
                          : "—"}
                      </TableCell>
                      <TableCell>{r.centroCosto ?? "—"}</TableCell>
                      <TableCell>{r.proyecto ?? "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={r.estado ?? "—"}
                          size="small"
                          color={estadoChipColor(r.estado) as any}
                        />
                      </TableCell>
                      <TableCell title={r.texto}>{r.texto ?? "—"}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Reaplicar filtros">
                          <IconButton
                            size="small"
                            onClick={() => onReaplicar?.(r)}
                            aria-label="Reaplicar filtros"
                          >
                            <Replay />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => setDetalle(r)}
                            aria-label="Ver detalle"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        py={6}
                        color="text.secondary"
                      >
                        <HistoryIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography>No hay búsquedas registradas.</Typography>
                        <Typography variant="body2">
                          Ejecuta una búsqueda en Libro Mayor para verla aquí.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Filas por página"
          />
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cerrar
        </Button>
      </DialogActions>

      {/* Mini detalle (vista rápida) */}
      <Dialog
        open={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography fontWeight="bold">Detalle de búsqueda</Typography>
            <IconButton onClick={() => setDetalle(null)} aria-label="Cerrar detalle">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detalle ? (
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Fecha/Hora</Typography>
                <Typography>{formatDateTime(detalle.timestamp)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Usuario</Typography>
                <Typography>{detalle.usuario?.nombre ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Cuenta</Typography>
                <Typography>
                  {detalle.cuenta
                    ? `${detalle.cuenta.cod} — ${detalle.cuenta.nombre ?? ""}`
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Rango</Typography>
                <Typography>
                  {(detalle.fechaInicio || detalle.fechaFin)
                    ? `${detalle.fechaInicio ?? "?"} → ${detalle.fechaFin ?? "?"}`
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Centro costo</Typography>
                <Typography>{detalle.centroCosto ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Proyecto</Typography>
                <Typography>{detalle.proyecto ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Estado</Typography>
                <Chip
                  label={detalle.estado ?? "—"}
                  size="small"
                  color={estadoChipColor(detalle.estado) as any}
                />
              </Box>
              <Box gridColumn="1 / -1">
                <Typography variant="body2" color="text.secondary">Texto buscado</Typography>
                <Typography>{detalle.texto ?? "—"}</Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetalle(null)} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
