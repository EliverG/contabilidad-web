import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Autocomplete,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CleaningServices } from "@mui/icons-material";
import HeaderCard from "../components/HeaderCard";
import { getEmpresas } from "../services/empresaApi";
import { getLibroMayor } from "../services/libroMayorApi";
import { getCuentas } from "../services/cuentasApi";
import type { Empresa } from "../interfaces/Empresa";
import type { CuentaContable } from "../interfaces/CuentaContable";
// Íconos
import { Search, Clear, PictureAsPdf, FileDownload } from "@mui/icons-material";
// Exportadores
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LibroMayor() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresa, setEmpresa] = useState<number | "">("");

  // ✅ Fechas usando INPUT NATIVO (YYYY-MM-DD)
  const [desdeISO, setDesdeISO] = useState<string>("");
  const [hastaISO, setHastaISO] = useState<string>("");

  // 👉 cuentas para el Autocomplete
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [cuentaSel, setCuentaSel] = useState<CuentaContable | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar empresas y cuentas una vez
  useEffect(() => {
    (async () => {
      try {
        const [empRes, ctasRes] = await Promise.all([getEmpresas(), getCuentas()]);
        setEmpresas(empRes.data);
        setCuentas(ctasRes.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // ✅ RANGO: al cambiar "desde", corrige "hasta" si quedó menor y limita el min/max
  const onChangeDesde = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; // "YYYY-MM-DD" o ""
    setDesdeISO(v);
    if (v && hastaISO && hastaISO < v) setHastaISO(v);
  };

  // ✅ RANGO: al cambiar "hasta", si es menor a "desde" la clampa a "desde"
  const onChangeHasta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v && desdeISO && v < desdeISO) {
      setHastaISO(desdeISO);
      return;
    }
    setHastaISO(v);
  };

  const handleBuscar = async () => {
    if (!empresa || !desdeISO || !hastaISO) {
      alert("Empresa, fecha inicio y fecha fin son obligatorias");
      return;
    }
    const params: any = {
      empresa: Number(empresa),
      desde: desdeISO, // ya está en YYYY-MM-DD
      hasta: hastaISO, // ya está en YYYY-MM-DD
    };
    if (cuentaSel) {
      params.cuenta = cuentaSel.id; // 👈 enviamos el ID de la cuenta seleccionada
    }

    setLoading(true);
    try {
      const res = await getLibroMayor(params);
      setData(res.data?.resultados ?? []);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Error al consultar libro mayor");
    } finally {
      setLoading(false);
    }
  };
    //Exportar a Excel
  const handleExportExcel = async () => {
    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const rows = buildRows(data);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Libro Mayor");

    // Título
    const titulo = "Libro Mayor";
    ws.mergeCells("A1", "H1");
    ws.getCell("A1").value = titulo;
    ws.getCell("A1").font = { size: 16, bold: true };
    ws.getCell("A1").alignment = { horizontal: "center" };

    // Subtítulo con filtros
    const filtros = `Empresa: ${empresas.find((e) => e.id === empresa)?.nombre ?? ""} | Rango: ${
      desdeISO
    } a ${hastaISO}${cuentaSel ? ` | Cuenta: ${cuentaSel.codigo} ${cuentaSel.nombre}` : ""}`;
    ws.mergeCells("A2", "H2");
    ws.getCell("A2").value = filtros;
    ws.getCell("A2").font = { size: 11, color: { argb: "FF666666" } };
    ws.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
    ws.addRow([
      "Código",
      "Cuenta",
      "Fecha",
      "# Asiento",
      "Descripción asiento",
      "Descripción detalle",
      "Débito",
      "Crédito",
    ]);
    const header = ws.getRow(3);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.alignment = { horizontal: "center" };
    header.eachCell((c) => {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
      c.border = {
        top: { style: "thin", color: { argb: "FFBBBBBB" } },
        left: { style: "thin", color: { argb: "FFBBBBBB" } },
        bottom: { style: "thin", color: { argb: "FFBBBBBB" } },
        right: { style: "thin", color: { argb: "FFBBBBBB" } },
      };
    });

    // Datos
    rows.forEach((r) => {
      const row = ws.addRow([
        r.codigo,
        r.cuenta,
        r.fecha,
        r.asiento,
        r.descAsiento,
        r.descDetalle,
        r.debito,
        r.credito,
      ]);
      row.getCell(7).numFmt = "#,##0.00";
      row.getCell(8).numFmt = "#,##0.00";
    });

    // Totales
    const totalRow = ws.addRow([
      "",
      "",
      "",
      "",
      "",
      "Totales:",
      rows.reduce((a, r) => a + r.debito, 0),
      rows.reduce((a, r) => a + r.credito, 0),
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(7).numFmt = "#,##0.00";
    totalRow.getCell(8).numFmt = "#,##0.00";

    // "Total" neto (Crédito - Débito)
    const neto = rows.reduce((a, r) => a + r.credito - r.debito, 0);
    const netoRow = ws.addRow(["", "", "", "", "", "Total:", "", neto]);
    netoRow.font = { bold: true, color: { argb: neto >= 0 ? "FF2E7D32" : "FFC62828" } };
    netoRow.getCell(8).numFmt = "#,##0.00";

    // Ancho de columnas
    const widths = [12, 36, 12, 14, 40, 40, 14, 14];
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

    // Descargar
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `LibroMayor_${desdeISO}_a_${hastaISO}.xlsx`);
  };
    //Exportar a PDF
  const handleExportPDF = () => {
    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const rows = buildRows(data);

    // A4 horizontal con márgenes reducidos
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const MARGIN = { top: 56, right: 28, bottom: 40, left: 28 }; // 👈 ajusta aquí

    const title = "Libro Mayor";
    const filtros = `Empresa: ${empresas.find((e) => e.id === empresa)?.nombre ?? ""} | ` +
                    `Rango: ${desdeISO} a ${hastaISO}` +
                    (cuentaSel ? ` | Cuenta: ${cuentaSel.codigo} ${cuentaSel.nombre}` : "");

    // Header/ Footer por página
    const drawHeader = () => {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(title, MARGIN.left, 30);

      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(filtros, MARGIN.left, 44);

      // línea bajo el header
      doc.setDrawColor(220);
      doc.line(MARGIN.left, 50, pageWidth - MARGIN.right, 50);
    };

    const drawFooter = () => {
      const str = `Página ${doc.getNumberOfPages()}`;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(str, pageWidth - MARGIN.right, pageHeight - 16, { align: "right" });
    };

    drawHeader();

    //Tabla
    autoTable(doc, {
      margin: MARGIN,                    
      startY: 56,                        
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [25, 118, 210], halign: "center", fontStyle: "bold", textColor: 255 },
      columnStyles: {
        0: { cellWidth: 52 },            // Código
        1: { cellWidth: 140 },           // Cuenta
        2: { cellWidth: 70 },            // Fecha
        3: { cellWidth: 70, halign: "right" }, // # Asiento
        4: { cellWidth: 160 },           // Desc. asiento
        5: { cellWidth: 160 },           // Desc. detalle
        6: { cellWidth: 70, halign: "right" }, // Débito
        7: { cellWidth: 70, halign: "right" }, // Crédito
      },
      body: rows.map((r) => [
        r.codigo, r.cuenta, r.fecha, r.asiento, r.descAsiento, r.descDetalle, money(r.debito), money(r.credito),
      ]),
      didDrawPage: () => {
        drawHeader();
        drawFooter();
      },
      // si alguna fila es muy alta por el texto, permite salto limpio
      rowPageBreak: "auto",
      // tableWidth: 'auto',             // (opcional) puedes jugar con 'wrap'/'auto'
    });

    // 🔢 Totales (si no caben en la página actual, crea otra)
    const totalDeb = rows.reduce((a, r) => a + r.debito, 0);
    const totalCre = rows.reduce((a, r) => a + r.credito, 0);
    const neto = totalCre - totalDeb;

    let y = (doc as any).lastAutoTable.finalY + 18;
    if (y > pageHeight - MARGIN.bottom - 24) {
      doc.addPage();
      drawHeader();
      drawFooter();
      y = MARGIN.top; // nueva página
    }

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Débito: ${money(totalDeb)}`, MARGIN.left, y);
    doc.text(`Total Crédito: ${money(totalCre)}`, MARGIN.left + 180, y);

    doc.setTextColor(neto >= 0 ? 46 : 198, neto >= 0 ? 125 : 40, neto >= 0 ? 50 : 40);
    doc.text(`Total : ${money(neto)}`, MARGIN.left + 380, y);

    doc.save(`LibroMayor_${desdeISO}_a_${hastaISO}.pdf`);
  };



  const handleLimpiar = () => {
    setEmpresa("");
    setDesdeISO("");
    setHastaISO("");
    setCuentaSel(null);
    setData([]);
  };

  const totalDebe = useMemo(
    () => data.reduce((acc, x) => acc + Number(x.totales?.debito || 0), 0),
    [data]
  );
  const totalHaber = useMemo(
    () => data.reduce((acc, x) => acc + Number(x.totales?.credito || 0), 0),
    [data]
  );
  const totalNeto = useMemo(() => totalHaber - totalDebe, [totalHaber, totalDebe]);

  // formateo de números (miles y 2 decimales)
  const money = (n: number) =>
    new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

    // aplanar movimientos (cada fila del PDF/Excel)
  const buildRows = (data: any[]) =>
    data.flatMap((g) =>
      (g.movimientos ?? []).map((m: any) => ({
        codigo: g.cuenta?.codigo ?? "",
        cuenta: g.cuenta?.nombre ?? "",
        fecha: m.fecha,
        asiento: m.numeroAsiento,
        descAsiento: m.descripcionAsiento ?? "",
        descDetalle: m.descripcionDetalle ?? "",
        debito: Number(m.debito || 0),
        credito: Number(m.credito || 0),
      }))
    );

  return (
    <Card>
      <HeaderCard
        title="Libro Mayor"
        subheader="Consulta de movimientos por cuenta."
      />
      <CardContent>
        <div className="p-6 space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <TextField
              select
              label="Empresa - NIT"
              size="small"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value as any)}
              sx={{ minWidth: 240 }}
            >
              {empresas.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.nombre} ({e.rucNit})
                </MenuItem>
              ))}
            </TextField>

            {/* ✅ Inputs nativos de fecha con min/max */}
            <TextField
              type="date"
              label="Fecha inicio"
              size="small"
              value={desdeISO}
              onChange={onChangeDesde}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: hastaISO || undefined }}
            />
            <TextField
              type="date"
              label="Fecha fin"
              size="small"
              value={hastaISO}
              onChange={onChangeHasta}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: desdeISO || undefined }}
            />

            {/* Autocomplete de cuentas (opcional) */}
            <Autocomplete
              options={cuentas}
              value={cuentaSel}
              onChange={(_, v) => setCuentaSel(v)}
              sx={{ minWidth: 320 }}
              getOptionLabel={(o) => (o ? `${o.codigo} — ${o.nombre}` : "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Cuenta"
                  placeholder="Buscar por código o nombre..."
                />
              )}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
            />

            <Tooltip title="Buscar">
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleBuscar}
                disabled={loading}
              >
                Buscar
              </Button>
            </Tooltip>

            <Tooltip title="Limpiar">
              <Button
                variant="contained"
                startIcon={<CleaningServices/>}
                onClick={handleLimpiar}
                disabled={loading}
                sx={{ ml: 1 }}
              >
                Limpiar
              </Button>
            </Tooltip>

            <Tooltip title="Exportar PDF">
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                disabled={loading || data.length === 0}
                sx={{ ml: 1 }}
              >
                PDF
              </Button>
            </Tooltip>

            <Tooltip title="Exportar Excel">
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={handleExportExcel}
                disabled={loading || data.length === 0}
                sx={{ ml: 1 }}
              >
                Excel
              </Button>
            </Tooltip>
          </div>

          {/* Totales globales */}
          <div className="flex gap-4">
            <Chip
              label={`Total Débito: ${totalDebe.toFixed(2)}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Total Crédito: ${totalHaber.toFixed(2)}`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={`Total: ${totalNeto.toFixed(2)}`}
              color={totalNeto >= 0 ? "success" : "error"}
              variant="outlined"
            />
          </div>

          {/* Resultados por cuenta */}
          <div className="space-y-2">
            {data.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Sin resultados</div>
            ) : (
              data.map((g: any) => (
                <Accordion key={g.cuenta.id} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className="flex w-full justify-between pr-4">
                      <div>
                        <strong>{g.cuenta.codigo}</strong> — {g.cuenta.nombre}
                      </div>
                      <div className="flex gap-4">
                        <span>
                          Débito: <b>{Number(g.totales.debito).toFixed(2)}</b>
                        </span>
                        <span>
                          Crédito: <b>{Number(g.totales.credito).toFixed(2)}</b>
                        </span>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border p-2">Fecha</th>
                            <th className="border p-2"># Asiento</th>
                            <th className="border p-2">Descripción asiento</th>
                            <th className="border p-2">Descripción detalle</th>
                            <th className="border p-2">Débito</th>
                            <th className="border p-2">Crédito</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.movimientos.map((m: any) => (
                            <tr key={m.idDetalle}>
                              <td className="border p-2">{m.fecha}</td>
                              <td className="border p-2">{m.numeroAsiento}</td>
                              <td className="border p-2">{m.descripcionAsiento}</td>
                              <td className="border p-2">{m.descripcionDetalle ?? "-"}</td>
                              <td className="border p-2 text-right">
                                {Number(m.debito).toFixed(2)}
                              </td>
                              <td className="border p-2 text-right">
                                {Number(m.credito).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
