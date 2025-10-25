import { Clear, NoteAddOutlined, Delete, Edit, PictureAsPdf, FileDownload } from "@mui/icons-material";
import { Card, CardContent, Button, InputBase, Paper, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import HeaderCard from "../components/HeaderCard";
import { getDiario, createDiario, deleteDiario } from "../services/libroDiarioSvc";
import Swal from "sweetalert2";
import type { Diario } from "../interfaces/Diario";
import ModalLibroDiario from "../components/ModalLibroDiario";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Catalogos() {
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cuentas, setCuentas] = useState<Diario[]>([]);
  const [selectedCuenta, setSelectedCuenta] = useState<Diario | null>(null);

  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

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
      await createDiario(cuenta);
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
        Swal.fire("Eliminado!", "Cuenta contable ha sido eliminada.", "success");
        deleteDiario(id);
        fetchLibroDiario();
      }
    });
  };

  const filteredData = cuentas.filter((item) => {
    const fechaItem = item.fecha
      ? new Date(item.fecha).toISOString().slice(0, 10)
      : "";

    const cumpleBusqueda = Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(busqueda.toLowerCase())
    );

    const cumpleFechaInicio = fechaInicio ? fechaItem >= fechaInicio : true;
    const cumpleFechaFin = fechaFin ? fechaItem <= fechaFin : true;

    return cumpleBusqueda && cumpleFechaInicio && cumpleFechaFin;
  });

  const exportToExcel = () => {
    if (!filteredData.length) return Swal.fire("Sin datos", "No hay registros para exportar.", "warning");

    const data = filteredData.map((item) => ({
      Código: item.id,
      Cuenta: item.cuentaContable,
      Descripción: item.descripcion,
      Fecha: item.fecha,
      Debe: Number(item.debe).toFixed(2),
      Haber: Number(item.haber).toFixed(2),
      Total: (Number(item.haber) - Number(item.debe)).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Libro Diario");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Libro_Diario_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportToPDF = () => {
    if (!filteredData.length) return Swal.fire("Sin datos", "No hay registros para exportar.", "warning");

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte: Libro Diario", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = filteredData.map((item) => [
      String(item.id ?? ""),
      String(item.cuentaContable ?? ""),
      String(item.descripcion ?? ""),
      String(item.fecha ?? ""),
      (Number(item.debe) || 0).toFixed(2),
      (Number(item.haber) || 0).toFixed(2),
      ((Number(item.haber) || 0) - (Number(item.debe) || 0)).toFixed(2),
    ]);

    autoTable(doc, {
      head: [["Código", "Cuenta", "Descripción", "Fecha", "Debe", "Haber", "Total"]],
      body: tableData,
      startY: 28,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Libro_Diario_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <Card>
      <HeaderCard
        title="Libro Diario"
        subheader="En este módulo se encuentran los diarios de las cuentas contables."
      />
      <CardContent>
        <div className="p-6">
          <div className="flex justify-between mb-3 gap-4 flex-wrap">

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

            <div className="flex gap-3 items-center bg-gray-50 border px-3 py-2 rounded-md">
              <label>Desde:</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border p-1 rounded"
              />
              <label>Hasta:</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border p-1 rounded"
              />
              <Button
                onClick={() => {
                  setFechaInicio("");
                  setFechaFin("");
                }}
                sx={{ p: "8px" }}
              >
                <Clear />
              </Button>
            </div>

            <div className="flex gap-2">
              <Tooltip title="Exportar a Excel">
                <Button variant="contained" startIcon={<FileDownload />} className="font-bold" onClick={exportToExcel}>
                  Excel
                </Button>
              </Tooltip>
              <Tooltip title="Exportar a PDF">
                <Button variant="contained" startIcon={<PictureAsPdf />} className="font-bold" onClick={exportToPDF}>
                  PDF
                </Button>
              </Tooltip>
              <Tooltip title="Crear cuenta nueva">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSelectedCuenta(null);
                    setModalOpen(true);
                  }}
                >
                  <NoteAddOutlined />
                  Cuenta nueva
                </Button>
              </Tooltip>
            </div>
          </div>

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
                  <th className="border p-2">Total</th>
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
                        <td className="border p-2 font-semibold">{total.toFixed(2)}</td>
                        <td className="flex gap-3 border justify-center">
                          <Tooltip title="Editar">
                            <Button variant="contained" size="small" color="warning" onClick={() => {
                              setSelectedCuenta(item);
                              setModalOpen(true);
                            }}>
                              <Edit />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <Button variant="contained" size="small" color="error" onClick={() => handleDelete(item.id!)}>
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
