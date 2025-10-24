import {
  Button,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  InputBase,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import {
  LockOpen,
  ErrorOutline,
  CheckCircle,
  Edit,
} from "@mui/icons-material";
import { useState } from "react";
import HeaderCard from "../components/HeaderCard";
import {
  getCierresContables,
  createCierreContable,
  updateCierreContable,
  deleteCierreContable,
  getCierreById,
  validateCierreContable,
  previewCierreContable,
  closeCierreContable,
  reopenCierreContable,
} from "../services/cierreApi";
import { generateCierrePdf, exportListCierresPdf } from "../services/pdfClient";

export default function CierreContable() {
  type AjusteRow = {
    cuenta?: string;
    nombre?: string;
    saldoDebe?: number;
    saldoHaber?: number;
    ajusteDebe?: number;
    ajusteHaber?: number;
  };
  const getErrorMessage = (e: unknown) => {
    return (e as any)?.response?.data?.message || (e as any)?.message || String(e ?? "Error desconocido");
  };
  const [vista, setVista] = useState<"periodos" | "asientos">("periodos");
  const [busqueda, setBusqueda] = useState("");
  const [dataPeriodos, setDataPeriodos] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | number }>({ open: false, id: "" });
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  // Formulario para crear cierre
  const [form, setForm] = useState({
    idPeriodo: "",
    idUsuario: "",
    fechaCierre: "",
    tipo: "MENSUAL",
    totalDebito: "",
    totalCredito: "",
    estado: "", // <-- Agregado campo estado
  });

  const [editForm, setEditForm] = useState({
    id: "",
    idPeriodo: "",
    idUsuario: "",
    fechaCierre: "",
    tipo: "MENSUAL",
    totalDebito: "",
    totalCredito: "",
    estado: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    getCierresContables().then((res) => setDataPeriodos(res.data));
  }, []);

  const handleCloseModal = () => setOpenModal(false);
  const handleOpenResolveDialog = () => setResolveDialogOpen(true);
  const handleCloseResolveDialog = () => setResolveDialogOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateCierre = async () => {
    try {
      await createCierreContable(form); // form incluye estado
      setSnackbar({
        open: true,
        message: "¡Cierre creado exitosamente!",
        severity: "success",
      });
      handleCloseModal();
      getCierresContables().then((res) => setDataPeriodos(res.data));
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error) || "Error al crear el cierre. Intenta nuevamente.",
        severity: "error",
      });
    }
  };

  const safeNumber = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Abrir modal de edición y cargar datos del cierre seleccionado
  const handleOpenEditModal = async (item: any) => {
    const id = safeNumber(item.id ?? item.ID_CIERRE ?? item.idCierre);
    if (id == null) {
      console.error("ID inválido para editar:", item);
      setSnackbar({ open: true, message: "ID inválido para editar el cierre", severity: "error" });
      return;
    }
    // si necesitas obtener detalle desde el backend:
    try {
      const res = await getCierreById(id);
      setEditForm(res.data);
      setOpenEditModal(true);
    } catch (e) { console.error(e); }
  };

  const handleCloseEditModal = () => setOpenEditModal(false);

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name as string]: value });
  };

  const handleUpdateCierre = async () => {
    try {
      await updateCierreContable(editForm.id, {
        idPeriodo: editForm.idPeriodo,
        idUsuario: editForm.idUsuario,
        fechaCierre: editForm.fechaCierre,
        tipo: editForm.tipo,
        totalDebito: editForm.totalDebito,
        totalCredito: editForm.totalCredito,
        estado: editForm.estado,
      });
      setSnackbar({
        open: true,
        message: "¡Cierre actualizado exitosamente!",
        severity: "success",
      });
      handleCloseEditModal();
      getCierresContables().then((res) => setDataPeriodos(res.data));
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error) || "Error al actualizar el cierre. Intenta nuevamente.",
        severity: "error",
      });
    }
  };

  // Wizard de cierre contable (validar -> previsualizar -> confirmar)
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizPeriodo, setWizPeriodo] = useState<string | number>("");
  const [wizGenerarAsiento, setWizGenerarAsiento] = useState(true);
  const [wizLoading, setWizLoading] = useState(false);
  const [wizValidation, setWizValidation] = useState<any>(null);
  const [wizPreview, setWizPreview] = useState<any>(null);
  const [wizUsuario, setWizUsuario] = useState<string | number>("");          // <-- nuevo
  const [wizTipo, setWizTipo] = useState<"MENSUAL" | "ANUAL">("MENSUAL");     // <-- nuevo

  const openWizard = () => {
    setWizardOpen(true);
    setWizardStep(0);
    setWizPeriodo("");
    setWizGenerarAsiento(true);
    setWizValidation(null);
    setWizPreview(null);
  };
  const closeWizard = () => setWizardOpen(false);

  const runValidation = async () => {
    if (!wizPeriodo) return;
    setWizLoading(true);
    try {
      const { data } = await validateCierreContable(wizPeriodo);
      setWizValidation(data); // Espera: { ok: boolean, errores?: string[] }
      setWizardStep(1);
    } catch (e: unknown) {
      setWizValidation({ ok: false, errores: [getErrorMessage(e) || "Error validando"] });
    } finally {
      setWizLoading(false);
    }
  };

  const runPreview = async () => {
    if (!wizPeriodo) return;
    setWizLoading(true);
    try {
      const { data } = await previewCierreContable(wizPeriodo);
      setWizPreview(data); // Espera: { saldos: [...], ajustes: [...], totales: {...} }
      setWizardStep(2);
    } catch (e: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(e) || "Error al previsualizar el cierre.",
        severity: "error",
      });
    } finally {
      setWizLoading(false);
    }
  };

  const confirmClose = async () => {
    if (!wizPeriodo) return;
    setWizLoading(true);
    try {
      await closeCierreContable({
        idPeriodo: wizPeriodo,
        idUsuario: wizUsuario,               // <-- requerido por tu API
        generarAsiento: wizGenerarAsiento,
        tipo: wizTipo,                       // <-- MENSUAL o ANUAL
      });
      setSnackbar({ open: true, message: "Período cerrado exitosamente.", severity: "success" });
      setWizardOpen(false);
      getCierresContables().then((res) => setDataPeriodos(res.data));
    } catch (e: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(e) || "Error al cerrar el período.",
        severity: "error",
      });
    } finally {
      setWizLoading(false);
    }
  };

  const dataAsientosCierre = [
    {
      numero: "CIE-2024-01",
      periodo: "Enero 2024",
      tipo: "mensual",
      fecha: "31/01/2024",
      descripcion: "Cierre mensual - Enero 2024",
      total: "$ 500",
      estado: "confirmado",
    },
  ];

  const filteredPeriodos = dataPeriodos.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Abrir modal de confirmación de eliminación
  const handleOpenDelete = (id: string | number) => {
    setConfirmDelete({ open: true, id });
  };

  const handleCloseDelete = () => {
    setConfirmDelete({ open: false, id: "" });
  };

  // Eliminar cierre contable
  const handleDeleteCierre = async () => {
    try {
      await deleteCierreContable(confirmDelete.id);
      setSnackbar({
        open: true,
        message: "¡Cierre eliminado exitosamente!",
        severity: "success",
      });
      handleCloseDelete();
      getCierresContables().then((res) => setDataPeriodos(res.data));
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error) || "Error al eliminar el cierre. Intenta nuevamente.",
        severity: "error",
      });
      handleCloseDelete();
    }
  };

  // Nuevo: Reabrir período contable
  const handleReopenPeriodo = async (idPeriodo: number | string) => {  // <-- nuevo
    try {
      await reopenCierreContable(idPeriodo);
      setSnackbar({ open: true, message: "Período reabierto.", severity: "success" });
      getCierresContables().then((res) => setDataPeriodos(res.data));
    } catch (e: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(e) || "Error al reabrir el período.",
        severity: "error",
      });
    }
  };

  return (
    <Card>
      <HeaderCard
        title="Cierre Contable Mensual y Anual"
        subheader="Gestione los períodos contables y visualice los asientos automáticos generados."
      />
      <CardContent>
        <div className="p-6 space-y-6">
          {/* Selector de vista */}
          <div className="flex justify-between items-center">
            <ToggleButtonGroup
              value={vista}
              exclusive
              onChange={(_, val) => val && setVista(val)}
              size="small"
            >
              <ToggleButton value="periodos">Períodos Contables</ToggleButton>
              <ToggleButton value="asientos">Asientos de Cierre</ToggleButton>
            </ToggleButtonGroup>

            <div className="flex gap-2">
              {vista === "periodos" && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FileDownload sx={{ fontSize: 20 }} />}
                    onClick={async () => {
                      try {
                        const blob = await exportListCierresPdf(dataPeriodos, { titulo: 'Listado de Cierres Contables' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `listado_cierres.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (e: unknown) {
                        setSnackbar({ open: true, message: getErrorMessage(e) || 'Error exportando listado', severity: 'error' });
                      }
                    }}
                  >
                    Exportar Todo
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={openWizard}
                    startIcon={<Add />}
                  >
                    Crear Cierre
                  </Button>
                </>
              )}
              {vista === "asientos" && (
                <></>
              )}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <Paper component="form" className="flex items-center p-2 rounded-lg shadow-md" onSubmit={(e) => e.preventDefault()}>
            <InputBase
              className="flex-grow ml-2"
              placeholder="Buscar cierre contable..."
              inputProps={{ "aria-label": "Buscar cierre contable" }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <IconButton type="submit" className="p-1" aria-label="search">
              <Search />
            </IconButton>
          </Paper>

          {/* Tabla dinámica */}
          {vista === "periodos" ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Período</th>
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Fecha de Cierre</th>
                    <th className="border p-2">Usuario</th>
                    <th className="border p-2">Validaciones</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeriodos.length > 0 ? (
                    filteredPeriodos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 text-sm">
                        <td className="border p-2">{item.periodo}</td>
                        <td className="text-center border p-2">
                          <Chip
                            label={item.estado}
                            color={item.estado === "cerrado" ? "success" : "primary"}
                            size="small"
                            icon={item.estado === "cerrado" ? <Lock /> : <LockOpen />}
                          />
                        </td>
                        <td className="border p-2">{item.fechaCierre || "—"}</td>
                        <td className="border p-2">{item.usuario || "—"}</td>
                        <td className="text-center border p-2">
                          {item.errores > 0 ? (
                            <Chip
                              label={`${item.errores} error(es)`}
                              color="error"
                              size="small"
                              icon={<ErrorOutline />}
                            />
                          ) : (
                            <Chip
                              label="Válido"
                              color="success"
                              size="small"
                              icon={<CheckCircle />}
                            />
                          )}
                        </td>
                        <td className="border text-center space-x-1">
                          <Button
                            variant="contained"
                            title="Editar cierre"
                            color="warning"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit />
                          </Button>
                          {item.estado === "CERRADO" ? (
                            <IconButton
                              title="Reabrir período"
                              color="primary"
                              sx={{ backgroundColor: "#2dde59ff", color: "#333", p: "10px" }}
                              onClick={() => handleReopenPeriodo(item.idPeriodo)}   // <-- conectar acción
                            >
                              <LockOpen />
                            </IconButton>
                          ) : (
                            <>
                              {item.errores > 0 && (
                                <IconButton title="Ver errores" color="error" sx={{ backgroundColor: "#f44336", color: "#fff" }}>
                                  <ErrorOutline />
                                </IconButton>
                              )}
                              {/* Exportar PDF por período */}
                              <Button
                                variant="outlined"
                                color="primary"
                                title="Exportar PDF"
                                onClick={async () => {
                                  try {
                                    const id = item.id ?? item.idPeriodo ?? item.ID_CIERRE;
                                    // Intentar obtener detalle enriquecido del cierre (periodo, usuario, empresa)
                                    let detalle: any = null;
                                    try {
                                      const resp = await getCierreById(id);
                                      detalle = resp.data;
                                    } catch (err) {
                                      // no crítico, seguimos con lo mínimo
                                    }

                                    // intentar obtener previsualización desde el backend
                                    let preview: any = null;
                                    try {
                                      const { data } = await previewCierreContable(id);
                                      preview = data;
                                    } catch (_err) {
                                      preview = {
                                        totales: {
                                          debito: item.totalDebito ?? item.total_debito ?? detalle?.totales?.debito ?? 0,
                                          credito: item.totalCredito ?? item.total_credito ?? detalle?.totales?.credito ?? 0,
                                        },
                                        ajustes: detalle?.ajustes || [],
                                        saldos: detalle?.saldos || [],
                                      };
                                    }

                                    const meta = {
                                      idPeriodo: id,
                                      titulo: `Cierre ${detalle?.periodo?.nombre ?? item.idPeriodo ?? id}`,
                                      periodoNombre: detalle?.periodo?.nombre ?? item.idPeriodo ?? undefined,
                                      usuarioNombre: detalle?.usuario?.nombre ?? item.idUsuario ?? undefined,
                                      empresa: detalle?.empresa?.nombre ?? undefined,
                                      fechaInicio: detalle?.periodo?.fechaInicio ?? undefined,
                                      fechaFin: detalle?.periodo?.fechaFin ?? undefined,
                                      notas: detalle?.notas ?? undefined,
                                    };

                                    const blob = await generateCierrePdf(preview, meta);
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `cierre_${id}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.parentNode?.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (e: unknown) {
                                    setSnackbar({ open: true, message: getErrorMessage(e) || 'Error generando PDF', severity: 'error' });
                                  }
                                }}
                              >
                                <FileDownload />
                              </Button>
                              <Button
                                variant="contained"
                                title="Eliminar período"
                                color="error"
                                onClick={() => handleOpenDelete(item.id)}
                              >
                                <Delete />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-gray-500">
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Número</th>
                    <th className="border p-2">Período</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Fecha</th>
                    <th className="border p-2">Descripción</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAsientos && filteredAsientos.length > 0 ? (
                    filteredAsientos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 text-sm">
                        <td className="border p-2">{item.numero}</td>
                        <td className="border p-2">{item.periodo}</td>
                        <td className="border p-2 capitalize">{item.tipo}</td>
                        <td className="border p-2">{item.fecha}</td>
                        <td className="border p-2">{item.descripcion}</td>
                        <td className="border p-2">{item.total}</td>
                        <td className="text-center border p-2">
                          <Chip
                            label={item.estado}
                            color={
                              item.estado === "VALIDO"
                                ? "primary"
                                : item.estado === "CON_ERRORES"
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </td>
                        <td className="border text-center">
                          <IconButton title="Opciones" color="inherit">
                            <Edit />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center p-4 text-gray-500">
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
 </tbody>
              </table>
            </div>
          )}

          {/* Modal para crear cierre */}
          <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogContent dividers>
              <form>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <TextField
                    margin="normal"
                    label="ID Período"
                    name="idPeriodo"
                    value={form.idPeriodo}
                    onChange={(e) => setForm({ ...form, idPeriodo: e.target.value })}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <TextField
                    margin="normal"
                    label="ID Usuario"
                    name="idUsuario"
                    value={form.idUsuario}
                    onChange={handleFormChange}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <TextField
                    margin="normal"
                    label="Fecha de cierre"
                    name="fechaCierre"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.fechaCierre}
                    onChange={handleFormChange}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <FormControl margin="normal" sx={{ flex: "1 1 180px" }}>
                    <InputLabel id="tipo-label">Tipo</InputLabel>
                    <Select
                      labelId="tipo-label"
                      label="Tipo"
                      name="tipo"
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value as "MENSUAL" | "ANUAL" })}
                    >
                      <MenuItem value="MENSUAL">MENSUAL</MenuItem>
                      <MenuItem value="ANUAL">ANUAL</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    margin="normal"
                    label="Total Débito"
                    name="totalDebito"
                    value={form.totalDebito}
                    onChange={handleFormChange}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>Q</span>,
                    }}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <TextField
                    margin="normal"
                    label="Total Crédito"
                    name="totalCredito"
                    value={form.totalCredito}
                    onChange={handleFormChange}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>Q</span>,
                    }}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <FormControl margin="normal" sx={{ flex: "1 1 180px" }}>
                    <InputLabel id="estado-label">Estado</InputLabel>
                    <Select
                      labelId="estado-label"
                      label="Estado"
                      name="estado"
                      value={form.estado}
                      onChange={handleFormChange}
                    >
                      <MenuItem value="VALIDO">VALIDO</MenuItem>
                      <MenuItem value="CON_ERRORES">CON_ERRORES</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </form>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="primary" onClick={handleCreateCierre}>
                Crear
              </Button>
              <Button onClick={handleCloseModal}>Cerrar</Button>
            </DialogActions>
          </Dialog>

          {/* Modal para editar cierre */}
          <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
            <DialogTitle>Editar cierre contable</DialogTitle>
            <DialogContent dividers>
              <form>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <TextField
                    margin="normal"
                    label="ID Período"
                    name="idPeriodo"
                    value={editForm.idPeriodo}
                    onChange={handleEditFormChange}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <TextField
                    margin="normal"
                    label="ID Usuario"
                    name="idUsuario"
                    value={editForm.idUsuario}
                    onChange={handleEditFormChange}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <TextField
                    margin="normal"
                    label="Fecha de cierre"
                    name="fechaCierre"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={editForm.fechaCierre}
                    onChange={handleEditFormChange}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <FormControl margin="normal" sx={{ flex: "1 1 180px" }}>
                    <InputLabel id="edit-tipo-label">Tipo</InputLabel>
                    <Select
                      labelId="edit-tipo-label"
                      label="Tipo"
                      name="tipo"
                      value={editForm.tipo}
                      onChange={handleEditFormChange}
                    >
                      <MenuItem value="MENSUAL">MENSUAL</MenuItem>
                      <MenuItem value="ANUAL">ANUAL</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    margin="normal"
                    label="Total Débito"
                    name="totalDebito"
                    value={editForm.totalDebito}
                    onChange={handleEditFormChange}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>Q</span>,
                    }}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <TextField
                    margin="normal"
                    label="Total Crédito"
                    name="totalCredito"
                    value={editForm.totalCredito}
                    onChange={handleEditFormChange}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>Q</span>,
                    }}
                    sx={{ flex: "1 1 180px" }}
                  />
                  <FormControl margin="normal" sx={{ flex: "1 1 180px" }}>
                    <InputLabel id="edit-estado-label">Estado</InputLabel>
                    <Select
                      labelId="edit-estado-label"
                      label="Estado"
                      name="estado"
                      value={editForm.estado}
                      onChange={handleEditFormChange}
                    >
                      <MenuItem value="VALIDO">VALIDO</MenuItem>
                      <MenuItem value="CON_ERRORES">CON_ERRORES</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditModal}>Cancelar</Button>
              <Button variant="contained" color="primary" onClick={handleUpdateCierre}>
                Guardar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal de confirmación para eliminar cierre */}
          <Dialog open={confirmDelete.open} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
            <DialogTitle>¿Eliminar cierre contable?</DialogTitle>
            <DialogContent dividers>
              ¿Está seguro que desea eliminar este cierre contable? Esta acción no se puede deshacer.
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDelete}>Cancelar</Button>
              <Button variant="contained" color="error" onClick={handleDeleteCierre}>
                Eliminar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Asistente (wizard) de cierre contable */}
          <Dialog open={wizardOpen} onClose={closeWizard} maxWidth="md" fullWidth>
            <DialogTitle>Asistente de Cierre Contable</DialogTitle>
            <DialogContent dividers>
              <Stepper activeStep={wizardStep} alternativeLabel>
                <Step><StepLabel>Seleccionar período</StepLabel></Step>
                <Step><StepLabel>Validación</StepLabel></Step>
                <Step><StepLabel>Previsualización</StepLabel></Step>
              </Stepper>

              {wizLoading && <LinearProgress sx={{ my: 2 }} />}

              {wizardStep === 0 && (
                <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                  <TextField
                    label="ID Período"
                    value={wizPeriodo}
                    onChange={(e) => setWizPeriodo(e.target.value)}
                    sx={{ flex: "1 1 220px" }}
                  />
                  <TextField
                    label="ID Usuario"
                    value={wizUsuario}
                    onChange={(e) => setWizUsuario(e.target.value)}
                    sx={{ flex: "1 1 220px" }}
                  />
                  <FormControl sx={{ flex: "1 1 220px" }}>
                    <InputLabel id="wiz-tipo-label">Tipo</InputLabel>
                    <Select
                      labelId="wiz-tipo-label"
                      label="Tipo"
                      value={wizTipo}
                      onChange={(e) => setWizTipo(e.target.value as "MENSUAL" | "ANUAL")}
                    >
                      <MenuItem value="MENSUAL">MENSUAL</MenuItem>
                      <MenuItem value="ANUAL">ANUAL</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={wizGenerarAsiento}
                        onChange={(e) => setWizGenerarAsiento(e.target.checked)}
                      />
                    }
                    label="Generar asiento de cierre"
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Selecciona el período, usuario y el tipo de cierre. Puedes generar el asiento automáticamente.
                  </Typography>
                </div>
              )}

              {wizardStep === 1 && (
                <div style={{ marginTop: 16 }}>
                  <Typography variant="subtitle1" gutterBottom>Resultado de validación</Typography>
                  {wizValidation?.ok ? (
                    <Alert severity="success">Validación OK. No se encontraron inconsistencias.</Alert>
                  ) : (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Se encontraron inconsistencias. Revisa la lista y corrige antes de continuar.
                    </Alert>
                  )}
                  <ul style={{ paddingLeft: 18, marginTop: 12 }}>
                    {(wizValidation?.errores || []).map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {wizardStep === 2 && (
                <div style={{ marginTop: 16 }}>
                  <Typography variant="subtitle1" gutterBottom>Previsualización de cierre</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                    Revisa saldos y ajustes propuestos antes de confirmar el cierre.
                  </Typography>

                  {/* Tabla simple de ejemplo. Ajusta a tu payload real: saldos y ajustes */}
                  <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #eee" }}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-2">Cuenta</th>
                          <th className="border p-2">Nombre</th>
                          <th className="border p-2">Saldo Débito</th>
                          <th className="border p-2">Saldo Crédito</th>
                          <th className="border p-2">Ajuste Débito</th>
                          <th className="border p-2">Ajuste Crédito</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((wizPreview?.ajustes as AjusteRow[]) || []).map((row, idx: number) => (
                          <tr key={idx} className="text-sm">
                            <td className="border p-2">{row.cuenta}</td>
                            <td className="border p-2">{row.nombre}</td>
                            <td className="border p-2">
                              Q {Number(row.saldoDebe || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border p-2">
                              Q {Number(row.saldoHaber || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border p-2">
                              Q {Number(row.ajusteDebe || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border p-2">
                              Q {Number(row.ajusteHaber || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Typography variant="body2">
                      Total Débito: <b>Q {Number(wizPreview?.totales?.debito || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> — Total Crédito: <b>Q {Number(wizPreview?.totales?.credito || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                    </Typography>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {wizardStep > 0 && (
                <Button onClick={() => setWizardStep((s) => s - 1)} disabled={wizLoading}>
                  Atrás
                </Button>
              )}
              {wizardStep === 0 && (
                <Button variant="contained" onClick={runValidation} disabled={!wizPeriodo || wizLoading}>
                  Validar
                </Button>
              )}
              {wizardStep === 1 && (
                <Button
                  variant="contained"
                  onClick={wizValidation?.ok ? runPreview : handleOpenResolveDialog}
                  disabled={wizLoading}
                  color={wizValidation?.ok ? "primary" : "warning"}
                >
                  {wizValidation?.ok ? "Previsualizar" : "Resolver errores"}
                </Button>
              )}
              {wizardStep === 2 && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={confirmClose}
                  disabled={wizLoading || !wizPeriodo || !wizUsuario}
                >
                  Confirmar y Cerrar
                </Button>
              )}
              <Button onClick={closeWizard} disabled={wizLoading}>Cerrar</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog: Resolver errores */}
          <Dialog open={resolveDialogOpen} onClose={handleCloseResolveDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Errores de validación</DialogTitle>
            <DialogContent dividers>
              {Array.isArray(wizValidation?.errores) && wizValidation.errores.length > 0 ? (
                <ul style={{ paddingLeft: 18 }}>
                  {wizValidation.errores.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="textSecondary">No se encontraron detalles de errores.</Typography>
              )}
              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
                Corrige los asientos/registro indicados y luego presiona "Revalidar".
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseResolveDialog}>Cerrar</Button>
              <Button
                variant="contained"
                onClick={async () => { handleCloseResolveDialog(); await runValidation(); }}
              >
                Revalidar
              </Button>
              <Button
                color="inherit"
                onClick={() => { handleCloseResolveDialog(); setVista("asientos"); /* opcional: set filtro */ }}
              >
                Ir a Asientos
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </CardContent>
    </Card>
  );
}
