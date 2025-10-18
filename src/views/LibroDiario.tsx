import { Clear, NoteAddOutlined, Delete, Edit } from "@mui/icons-material";
import { Card, CardContent, Button, InputBase, Paper, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import HeaderCard from "../components/HeaderCard";
import { getDiario, createDiario, deleteDiario } from "../services/libroDiarioSvc";
import Swal from "sweetalert2";
import type { Diario } from "../interfaces/Diario";
import ModalLibroDiario from "../components/ModalLibroDiario";

export default function Catalogos() {
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cuentas, setCuentas] = useState<Diario[]>([]);
  const [selectedCuenta, setSelectedCuenta] = useState<Diario | null>(null);

  useEffect(() => {
    fetchLibroDiario();
  }, []);

  const fetchLibroDiario = async () => {
    try {
      const res = await getDiario();
      setCuentas(res.data);
    } catch (error) {
      console.error("Error al obtener libro diario", error);
    }
  };

  const handleSaveCuenta = async (cuenta: Diario) => {
    try {
      await createDiario(cuenta); // mismo endpoint para crear y actualizar
      fetchLibroDiario();
      setModalOpen(false);
      setSelectedCuenta(null);
    } catch (error) {
      console.error("Error al guardar cuenta", error);
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Eliminar registro?",
      text: "Esta acción no podrá ser reversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Eliminado!",
          text: "Cuenta contable ha sido eliminada.",
          icon: "success",
        });
        deleteDiario(id);
        fetchLibroDiario();
      }
    });
  };

  const filteredData = cuentas.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <Card>
      <HeaderCard
        title="Libro Diario"
        subheader="En este módulo se encuentran los diarios de las cuenas contables."
      />
      <CardContent>
        <div className="p-6">
          <div className="flex justify-between mb-3">
            <Paper
              component="form"
              sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 400 }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <Button onClick={() => setBusqueda("")} sx={{ p: "10px" }}>
                <Clear />
              </Button>
            </Paper>

            <Tooltip title="Crear cuenta nueva">
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setSelectedCuenta(null);
                  setModalOpen(true);
                }}
              >
                <NoteAddOutlined />
              </Button>
            </Tooltip>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Código</th>
                  <th className="border p-2">Cuenta</th>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Fecha</th>
                  <th className="border p-2">Debe</th>
                  <th className="border p-2">Haber</th>
                  <th className="border p-2">Total</th> {/* Nueva columna */}
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const debe = Number(item.debe) || 0;
                    const haber = Number(item.haber) || 0;
                    const total = haber - debe;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border p-2">{item.id}</td>
                        <td className="border p-2">{item.cuentaContable}</td>
                        <td className="border p-2">{item.descripcion}</td>
                        <td className="border p-2">{item.fecha.toString()}</td>
                        <td className="border p-2">{debe.toFixed(2)}</td>
                        <td className="border p-2">{haber.toFixed(2)}</td>
                        <td className="border p-2 font-semibold">
                          {total.toFixed(2)}
                        </td>
                        <td className="flex gap-3 border justify-center">
                          <Tooltip title="Editar">
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              onClick={() => {
                                setSelectedCuenta(item);
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
                              onClick={() => handleDelete(item.id!)}
                            >
                              <Delete />
                            </Button>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {/* Modal para crear / editar */}
      <ModalLibroDiario
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCuenta(null);
        }}
        onSave={handleSaveCuenta}
        initialData={selectedCuenta}
      />
    </Card>
  );
}
