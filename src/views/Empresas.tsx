import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Button, InputBase, Paper, Tooltip, MenuItem, TextField } from "@mui/material";
import { Clear, NoteAddOutlined, Delete, Edit } from "@mui/icons-material";
import HeaderCard from "../components/HeaderCard";
import AddEmpresaModal from "../components/AddEmpresaModal";
import { getEmpresas, createOrUpdateEmpresa, deleteEmpresa } from "../services/empresaApi";
import type { Empresa } from "../interfaces/Empresa";
import AddPeriodoContable from "../components/AddPeriodoContable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Add, History } from "@mui/icons-material";

export default function Empresas() {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<"" | Empresa["estado"]>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [modalPeriodosOpen, setModalPeriodosOpen] = useState(false);

  const fetchEmpresas = async () => {
    try {
      const res = await getEmpresas();
      setEmpresas(res.data);
    } catch (err) {
      console.error("Error al obtener empresas", err);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // === Mismo patrón que Catalogos.tsx: onSave viene del modal ===
  const handleSaveEmpresa = async (empresa: Empresa | Partial<Empresa>) => {
    try {
      await createOrUpdateEmpresa(empresa);
      await fetchEmpresas();
      setModalOpen(false);
      setSelectedEmpresa(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Error al guardar empresa";
      alert(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta empresa?")) return;
    try {
      await deleteEmpresa(id);
      await fetchEmpresas();
    } catch (err) {
      console.error("Error al eliminar empresa", err);
    }
  };

  // Filtros: texto (nombre, rucNit, teléfono, dirección) + estado
  const filteredData = useMemo(() => {
    const text = busqueda.trim().toLowerCase();
    return empresas.filter((e) => {
      const matchText =
        !text ||
        [e.nombre, e.rucNit, e.telefono ?? "", e.direccion ?? ""]
          .some(v => v.toString().toLowerCase().includes(text));
      const matchEstado = !estado || e.estado === estado;
      return matchText && matchEstado;
    });
  }, [empresas, busqueda, estado]);

  return (
    <Card>
      <HeaderCard
        title="Empresas"
        subheader="Administre las empresas registradas en el sistema."
      />
      <CardContent>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            {/* Búsqueda texto */}
            <div className="flex gap-2">
              <Paper
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 360 }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Buscar por nombre, NIT, teléfono o dirección..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <Button onClick={() => setBusqueda("")} sx={{ p: "10px" }}>
                  <Clear />
                </Button>
              </Paper>

              {/* Filtro por estado */}
              <TextField
                select
                size="small"
                label="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                sx={{ width: 180 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                <MenuItem value="INACTIVO">INACTIVO</MenuItem>
              </TextField>
            </div>
            <div className="flex gap-2">
            {/* Botón reloj a la IZQUIERDA */}
            <Tooltip title="Períodos contables">
            <Button
                variant="contained"
                color="primary"
                startIcon={<History />}
                className="font-bold rounded-2xl"
                onClick={() => setModalPeriodosOpen(true)}
                
            >
                Períodos
            </Button>
            </Tooltip>
            <Tooltip title="Crear empresa">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                className="font-bold rounded-2xl"
                onClick={() => {
                  setSelectedEmpresa(null);
                  setModalOpen(true);
                }}
              >
                Nueva Empresa
                <NoteAddOutlined />
              </Button>
            </Tooltip>
          </div>
          </div>

          

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Nombre</th>
                  <th className="border p-2">RUC/NIT</th>
                  <th className="border p-2">Teléfono</th>
                  <th className="border p-2">Dirección</th>
                  <th className="border p-2">Estado</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border p-2">{item.nombre}</td>
                      <td className="border p-2">{item.rucNit}</td>
                      <td className="border p-2">{item.telefono ?? "-"}</td>
                      <td className="border p-2">{item.direccion ?? "-"}</td>
                      <td
                        className={`text-center border ${
                          item.estado === "ACTIVO" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {item.estado}
                      </td>
                      <td className="flex gap-3 border justify-center">
                        <Tooltip title="Editar">
                          <Button
                            variant="contained"
                            size="small"
                            color="warning"
                            onClick={() => {
                              setSelectedEmpresa(item);
                              setModalOpen(true);
                            }}
                          >
                            <Edit />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Delete />
                          </Button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-4">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {/* Modal para crear / editar — MISMA ESTRUCTURA QUE AddAccountModal */}
      <AddEmpresaModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEmpresa(null); }}
        onSave={handleSaveEmpresa}
        initialData={selectedEmpresa}
      />
      {/* Modal de períodos contables */}
      <AddPeriodoContable
        open={modalPeriodosOpen}
        onClose={() => setModalPeriodosOpen(false)}
      />
    </Card>
  );
}
