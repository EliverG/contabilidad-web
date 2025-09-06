import { Clear, CreateNewFolder, Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import { Card, CardContent, Chip, IconButton, InputBase, Paper } from "@mui/material";
import { useState } from 'react';
import HeaderCard from "../components/HeaderCard";

import NuevoAsientoModal from './NuevoAsientoModal';

const dataEjemploAsientos = [
  {
    numero: "AST-991",
    fecha: "14/1/2024",
    descripcion: "Pago de factura de proveedores",
    referencia: "RIC-001",
    debito: "Q 3,490",
    credito: "Q 3,690",
    estado: "Contabilizado",
    usuario: "Juan Pérez",
  },
  {
    numero: "AST-992",
    fecha: "15/1/2024",
    descripcion: "Venta de mercadería",
    referencia: "VEN-001",
    debito: "Q 580",
    credito: "Q 0",
    estado: "Pendiente",
    usuario: "Juan Pérez",
  },
];

export default function AsientosContables() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const filteredData = dataEjemploAsientos.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

  return (
    <>
    <Card>
      <HeaderCard
        title="Partidas Contables"
        subheader="En este módulo podrá gestionar todas las partidas contables."
      />
      <CardContent>
        <div className="p-6">
          <div className="flex justify-between mb-3">
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Buscar por número, descripción, referencia o usuario..."
                inputProps={{ 'aria-label': 'search' }} 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <IconButton 
                type="button" 
                sx={{ p: '10px' }} 
                aria-label="search"
                onClick={() => setBusqueda("")}
              >
                <Clear />
              </IconButton>
            </Paper>

            <IconButton color="primary" title="Nueva partida" onClick={abrirModal}>
              <CreateNewFolder/>
            </IconButton>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Número</th>
                  <th className="border p-2">Fecha</th>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Referencia</th>
                  <th className="border p-2">Débito</th>
                  <th className="border p-2">Crédito</th>
                  <th className="border p-2">Estado</th>
                  <th className="border p-2">Usuario</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-2">{item.numero}</td>
                      <td className="border p-2">{item.fecha}</td>
                      <td className="border p-2">{item.descripcion}</td>
                      <td className="border p-2">{item.referencia}</td>
                      <td className="border p-2">{item.debito}</td>
                      <td className="border p-2">{item.credito}</td>
                      <td className="text-center border p-2">
                        <Chip 
                          label={item.estado} 
                          color={item.estado === "Contabilizado" ? "success" : "warning"}
                          size="small"
                        />
                      </td>
                      <td className="border p-2">{item.usuario}</td>
                      <td className="border text-center">
                        <IconButton aria-label="remoeRedEye" color="inherit" title="ver">
                            <RemoveRedEye />
                        </IconButton>
                        <IconButton aria-label="edit" title="Editar" color="warning">
                            <Edit />
                        </IconButton>
                        <IconButton aria-label="delete" title="Eliminar" color="error">
                            <Delete />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center p-4">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
    <NuevoAsientoModal open={modalAbierto} onClose={cerrarModal} />
    </>
  );
}