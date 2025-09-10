import { Clear, NoteAddOutlined, Delete, Edit, RemoveRedEye } from "@mui/icons-material";
import { Card, CardContent, Button, InputBase, Paper } from "@mui/material";
import { useState } from 'react';
import HeaderCard from "../components/HeaderCard";

const dataEjemplo = [
    {
        codigo: "A001",
        nombre: "Producto A",
        tipo: "Insumo",
        naturaleza: "Material",
        centroCosto: "CC-100",
        estado: "Activo",
    },
    {
        codigo: "A002",
        nombre: "Producto B",
        tipo: "Servicio",
        naturaleza: "Mano de obra",
        centroCosto: "CC-200",
        estado: "Inactivo",
    },
    {
        codigo: "A003",
        nombre: "Producto C",
        tipo: "Insumo",
        naturaleza: "Herramienta",
        centroCosto: "CC-300",
        estado: "Activo",
    },
    {
        codigo: "A004",
        nombre: "Producto D",
        tipo: "Servicio",
        naturaleza: "Consultoría",
        centroCosto: "CC-400",
        estado: "Activo",
    },
    {
        codigo: "A005",
        nombre: "Producto E",
        tipo: "Insumo",
        naturaleza: "Material",
        centroCosto: "CC-500",
        estado: "Inactivo",
    },
];

export default function Catalogos() {

    const [busqueda, setBusqueda] = useState("");

    const filteredData = dataEjemplo.filter((item) =>
        Object.values(item).some((val) =>
            val.toLowerCase().includes(busqueda.toLowerCase())
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
                            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Buscar..."
                                inputProps={{ 'aria-label': 'search google maps' }}
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <Button type="button" sx={{ p: '10px' }} aria-label="search">
                                <Clear />
                            </Button>
                        </Paper>

                        <Button variant="contained" color="success" title="Cuenta Nueva">
                            <NoteAddOutlined />
                        </Button>
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
                                    filteredData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border p-2">{item.codigo}</td>
                                            <td className="border p-2">{item.nombre}</td>
                                            <td className="border p-2">{item.tipo}</td>
                                            <td className="border p-2">{item.naturaleza}</td>
                                            <td className="border p-2">{item.centroCosto}</td>

                                            <td
                                                className={`text-center border gap-2 ${item.estado === "Activo" ? "text-blue-500" : "text-red-500"
                                                    }`}
                                            >
                                                {item.estado}
                                            </td>


                                            <td className="flex  gap-3 border justify-center">
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    color="inherit"
                                                    title="Visualizar"
                                                ><RemoveRedEye /></Button>

                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    color="warning"
                                                    title="Editar"
                                                ><Edit/></Button>

                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    color="error"
                                                    title="Eliminar"
                                                ><Delete/></Button>

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
        </Card>
    )
}