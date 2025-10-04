import { Clear, NoteAddOutlined, Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import { Card, CardContent, Button, InputBase, Paper, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import HeaderCard from "../components/HeaderCard";
import ModalNuevaCuenta from "../components/AddAccountModal";
import { getCuentas, createCuenta, deleteCuenta } from "../services/cuentasApi";
import type { CuentaContable } from "../interfaces/CuentaContable";

export default function Catalogos() {
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaContable | null>(null);

  useEffect(() => {
    fetchCuentas();
  }, []);

  const fetchCuentas = async () => {
    try {
      const res = await getCuentas();
      setCuentas(res.data);
    } catch (error) {
      console.error("Error al obtener cuentas", error);
    }
  };

  const handleSaveCuenta = async (cuenta: CuentaContable) => {
    try {
      await createCuenta(cuenta); // mismo endpoint para crear y actualizar
      fetchCuentas();
      setModalOpen(false);
      setSelectedCuenta(null);
    } catch (error) {
      console.error("Error al guardar cuenta", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar esta cuenta?")) {
      try {
        await deleteCuenta(id);
        fetchCuentas();
      } catch (error) {
        console.error("Error al eliminar cuenta", error);
      }
    }
  };

  const filteredData = cuentas.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <Card>
      <HeaderCard
        title="Catálogo de Cuentas Contables"
        subheader="En este módulo podrá encontrar todas las cuentas contables disponibles."
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
                  <th className="border p-2">Nombre</th>
                  <th className="border p-2">Tipo</th>
                  <th className="border p-2">Naturaleza</th>
                  <th className="border p-2">Centro Costo</th>
                  <th className="border p-2">Estado</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border p-2">{item.codigo}</td>
                      <td className="border p-2">{item.nombre}</td>
                      <td className="border p-2">{item.tipo}</td>
                      <td className="border p-2">{item.naturaleza}</td>
                      <td className="border p-2">{item.idCentroCosto}</td>
                      <td
                        className={`text-center border ${
                          item.estado === "ACTIVO" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {item.estado}
                      </td>
                      <td className="flex gap-3 border justify-center">
                        {/* <Tooltip title="Visualizar">
                          <Button variant="contained" size="small" color="inherit">
                            <RemoveRedEye />
                          </Button>
                        </Tooltip> */}
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
                    <td colSpan={7} className="text-center p-4">
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
      <ModalNuevaCuenta
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
