// src/views/LibroMayor.tsx
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
import { Search, Clear, PictureAsPdf, FileDownload } from "@mui/icons-material";

import HeaderCard from "../components/HeaderCard";
import { getEmpresas } from "../services/empresaApi";
import { getLibroMayor } from "../services/libroMayorApi";
import { getCuentas } from "../services/cuentasApi";
import type { Empresa } from "../interfaces/Empresa";
import type { CuentaContable } from "../interfaces/CuentaContable";

// Exportadores
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ========= Helpers de formato =========
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(n || 0)
  );
// ===== Resumen por cuenta (usa saldosSegunNaturaleza) =====
const buildAccountSummary = (data: any[]) =>
  data.map((g) => {
    const { nat, saldoInicialCont, netoPeriodoCont, saldoFinalCont, deb, cre } = saldosSegunNaturaleza(g);
    return {
      codigo: g.cuenta?.codigo ?? "",
      cuenta: g.cuenta?.nombre ?? "",
      naturaleza: nat,
      saldoInicial: Number(saldoInicialCont || 0),
      debito: Number(deb || 0),
      credito: Number(cre || 0),
      neto: Number(netoPeriodoCont || 0),     // contable
      saldoFinal: Number(saldoFinalCont || 0) // contable
    };
  });

// Aplana resultados para exportar
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

// ========= Naturaleza y saldos contables =========
type Naturaleza = "DEUDORA" | "ACREEDORA";

/**
 * Devuelve saldos "según naturaleza contable":
 *  - Deudora:  saldo = débitos − créditos
 *  - Acreedora: saldo = créditos − débitos
 * Además transforma saldoInicial (histórico) a la convención mostrada.
 */
function saldosSegunNaturaleza(g: any) {
  const nat: Naturaleza = g?.cuenta?.naturaleza || "DEUDORA";
  const siPlano = Number(g.saldoInicial || 0); // histórico aritmético (debe - haber acumulado)
  const deb = Number(g.totales?.debito || 0);
  const cre = Number(g.totales?.credito || 0);

  const saldoInicialCont = nat === "ACREEDORA" ? -siPlano : siPlano;
  const netoPeriodoCont = nat === "ACREEDORA" ? cre - deb : deb - cre;
  const saldoFinalCont = saldoInicialCont + netoPeriodoCont;

  return { nat, saldoInicialCont, netoPeriodoCont, saldoFinalCont, deb, cre };
}

export default function LibroMayor() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresa, setEmpresa] = useState<number | "">("");

  // Fechas usando input nativo (YYYY-MM-DD)
  const [desdeISO, setDesdeISO] = useState<string>("");
  const [hastaISO, setHastaISO] = useState<string>("");

  // Cuentas para Autocomplete
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

  // Rango: clamp simple
  const onChangeDesde = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDesdeISO(v);
    if (v && hastaISO && hastaISO < v) setHastaISO(v);
  };
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
      desde: desdeISO,
      hasta: hastaISO,
    };
    if (cuentaSel) {
      params.cuenta = cuentaSel.id; // Filtrar por ID de cuenta (opcional)
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

  const handleLimpiar = () => {
    setEmpresa("");
    setDesdeISO("");
    setHastaISO("");
    setCuentaSel(null);
    setData([]);
  };

  // Totales tradicionales (para referencia)
  const totalDebe = useMemo(
    () => data.reduce((acc, x) => acc + Number(x.totales?.debito || 0), 0),
    [data]
  );
  const totalHaber = useMemo(
    () => data.reduce((acc, x) => acc + Number(x.totales?.credito || 0), 0),
    [data]
  );
  const totalNeto = useMemo(() => totalHaber - totalDebe, [totalHaber, totalDebe]);

  // Totales contables (según naturaleza)
  const totalesContables = useMemo(() => {
    return (data || []).reduce(
      (acc: { inicial: number; neto: number; final: number }, g: any) => {
        const { saldoInicialCont, netoPeriodoCont, saldoFinalCont } = saldosSegunNaturaleza(g);
        acc.inicial += saldoInicialCont;
        acc.neto += netoPeriodoCont;
        acc.final += saldoFinalCont;
        return acc;
      },
      { inicial: 0, neto: 0, final: 0 }
    );
  }, [data]);

  // ====== Exportar Excel ======
  const handleExportExcel = async () => {
    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const rows = buildRows(data);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Libro Mayor");

    ws.mergeCells("A1", "H1");
    ws.getCell("A1").value = "Libro Mayor";
    ws.getCell("A1").font = { size: 16, bold: true };
    ws.getCell("A1").alignment = { horizontal: "center" };

    const filtros = `Empresa: ${empresas.find((e) => e.id === empresa)?.nombre ?? ""} | Rango: ${
      desdeISO
    } a ${hastaISO}${cuentaSel ? ` | Cuenta: ${cuentaSel.codigo} ${cuentaSel.nombre}` : ""}`;
    ws.mergeCells("A2", "H2");
    ws.getCell("A2").value = filtros;
    ws.getCell("A2").font = { size: 11, color: { argb: "FF666666" } };
    ws.getCell("A2").alignment = { horizontal: "center" };

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

    const neto = rows.reduce((a, r) => a + r.credito - r.debito, 0);
    const netoRow = ws.addRow(["", "", "", "", "", "Total (Crédito - Débito):", "", neto]);
    netoRow.font = { bold: true, color: { argb: neto >= 0 ? "FF2E7D32" : "FFC62828" } };
    netoRow.getCell(8).numFmt = "#,##0.00";

    const widths = [12, 36, 12, 14, 40, 40, 14, 14];
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
// ===== Hoja 2: Resumen por cuenta (contable) =====
const resumen = buildAccountSummary(data);
const ws2 = wb.addWorksheet("Resumen por cuenta");

// Título
ws2.mergeCells("A1", "H1");
ws2.getCell("A1").value = "Resumen por cuenta (saldos contables)";
ws2.getCell("A1").font = { size: 16, bold: true };
ws2.getCell("A1").alignment = { horizontal: "center" };

// Subtítulo con filtros
const filtros2 = `Empresa: ${empresas.find((e) => e.id === empresa)?.nombre ?? ""} | Rango: ${desdeISO} a ${hastaISO}` +
  (cuentaSel ? ` | Cuenta: ${cuentaSel.codigo} ${cuentaSel.nombre}` : "");
ws2.mergeCells("A2", "H2");
ws2.getCell("A2").value = filtros2;
ws2.getCell("A2").font = { size: 11, color: { argb: "FF666666" } };
ws2.getCell("A2").alignment = { horizontal: "center" };

// Encabezados
ws2.addRow(["Código", "Cuenta", "Naturaleza", "Saldo inicial", "Débito", "Crédito", "Neto (contable)", "Saldo final"]);
const h2 = ws2.getRow(3);
h2.font = { bold: true, color: { argb: "FFFFFFFF" } };
h2.alignment = { horizontal: "center" };
h2.eachCell((c) => {
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
  c.border = {
    top: { style: "thin", color: { argb: "FFBBBBBB" } },
    left: { style: "thin", color: { argb: "FFBBBBBB" } },
    bottom: { style: "thin", color: { argb: "FFBBBBBB" } },
    right: { style: "thin", color: { argb: "FFBBBBBB" } },
  };
});

// Datos
resumen.forEach((r) => {
  const row = ws2.addRow([
    r.codigo,
    r.cuenta,
    r.naturaleza,
    r.saldoInicial,
    r.debito,
    r.credito,
    r.neto,
    r.saldoFinal,
  ]);
  // formato número
  [4,5,6,7,8].forEach((idx) => (row.getCell(idx).numFmt = "#,##0.00"));
});

// Totales
const totIni = resumen.reduce((a, x) => a + x.saldoInicial, 0);
const totDeb = resumen.reduce((a, x) => a + x.debito, 0);
const totCre = resumen.reduce((a, x) => a + x.credito, 0);
const totNet = resumen.reduce((a, x) => a + x.neto, 0);
const totFin = resumen.reduce((a, x) => a + x.saldoFinal, 0);

const rTot = ws2.addRow(["", "", "Totales:", totIni, totDeb, totCre, totNet, totFin]);
rTot.font = { bold: true };
[4,5,6,7,8].forEach((idx) => (rTot.getCell(idx).numFmt = "#,##0.00"));

// Anchos
[12, 42, 16, 14, 14, 14, 18, 16].forEach((w, i) => (ws2.getColumn(i + 1).width = w));

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `LibroMayor_${desdeISO}_a_${hastaISO}.xlsx`);
  };

  // ====== Exportar PDF ======
  const handleExportPDF = () => {
    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const rows = buildRows(data);
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = { top: 56, right: 28, bottom: 40, left: 28 };

    const title = "Libro Mayor";
    const filtros = `Empresa: ${empresas.find((e) => e.id === empresa)?.nombre ?? ""} | Rango: ${
      desdeISO
    } a ${hastaISO}${cuentaSel ? ` | Cuenta: ${cuentaSel.codigo} ${cuentaSel.nombre}` : ""}`;

    const drawHeader = () => {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(title, MARGIN.left, 30);

      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(filtros, MARGIN.left, 44);

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

    autoTable(doc, {
      margin: MARGIN,
      startY: 56,
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [25, 118, 210], halign: "center", fontStyle: "bold", textColor: 255 },
      head: [["Código", "Cuenta", "Fecha", "# Asiento", "Desc. asiento", "Desc. detalle", "Débito", "Crédito"]],
      body: rows.map((r) => [
        r.codigo,
        r.cuenta,
        r.fecha,
        r.asiento,
        r.descAsiento,
        r.descDetalle,
        money(r.debito),
        money(r.credito),
      ]),
      columnStyles: {
        0: { cellWidth: 52 },
        1: { cellWidth: 140 },
        2: { cellWidth: 70 },
        3: { cellWidth: 70, halign: "right" },
        4: { cellWidth: 160 },
        5: { cellWidth: 160 },
        6: { cellWidth: 70, halign: "right" },
        7: { cellWidth: 70, halign: "right" },
      },
      didDrawPage: () => {
        drawHeader();
        drawFooter();
      },
      rowPageBreak: "auto",
    });

    const totalDeb = rows.reduce((a, r) => a + r.debito, 0);
    const totalCre = rows.reduce((a, r) => a + r.credito, 0);
    const neto = totalCre - totalDeb;

    let y = (doc as any).lastAutoTable.finalY + 18;
    if (y > pageHeight - MARGIN.bottom - 24) {
      doc.addPage();
      drawHeader();
      drawFooter();
      y = MARGIN.top;
    }

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Débito: ${money(totalDeb)}`, MARGIN.left, y);
    doc.text(`Total Crédito: ${money(totalCre)}`, MARGIN.left + 180, y);
    doc.setTextColor(neto >= 0 ? 46 : 198, neto >= 0 ? 125 : 40, neto >= 0 ? 50 : 40);
    doc.text(`Total (Crédito - Débito): ${money(neto)}`, MARGIN.left + 380, y);
// ===== Sección: Resumen por cuenta (saldos contables) =====
const resumenPDF = buildAccountSummary(data);

// salto de página si no cabe el título
let y2 = y + 28;
if (y2 > pageHeight - MARGIN.bottom - 40) {
  doc.addPage();
  drawHeader();
  drawFooter();
  y2 = MARGIN.top;
}

// Título de la sección
doc.setFontSize(13);
doc.setTextColor(0, 0, 0);
doc.text("Resumen por cuenta (saldos contables)", MARGIN.left, y2);
y2 += 10;

// Tabla
autoTable(doc, {
  startY: y2 + 8,
  margin: MARGIN,
  styles: { fontSize: 9, cellPadding: 3 },
  headStyles: { fillColor: [25, 118, 210], textColor: 255, halign: "center", fontStyle: "bold" },
  head: [["Código", "Cuenta", "Naturaleza", "Saldo inicial", "Débito", "Crédito", "Neto (cont.)", "Saldo final"]],
  body: resumenPDF.map((r) => [
    r.codigo,
    r.cuenta,
    r.naturaleza,
    money(r.saldoInicial),
    money(r.debito),
    money(r.credito),
    money(r.neto),
    money(r.saldoFinal),
  ]),
  columnStyles: {
    0: { cellWidth: 52 },
    1: { cellWidth: 180 },
    2: { cellWidth: 80, halign: "center" },
    3: { cellWidth: 86, halign: "right" },
    4: { cellWidth: 70, halign: "right" },
    5: { cellWidth: 70, halign: "right" },
    6: { cellWidth: 86, halign: "right" },
    7: { cellWidth: 86, halign: "right" },
  },
  didDrawPage: () => {
    drawHeader();
    drawFooter();
  },
  rowPageBreak: "auto",
});

// Totales de la sección (al pie del resumen)
const y3 = (doc as any).lastAutoTable.finalY + 14;
const tIni = resumenPDF.reduce((a, x) => a + x.saldoInicial, 0);
const tDeb = resumenPDF.reduce((a, x) => a + x.debito, 0);
const tCre = resumenPDF.reduce((a, x) => a + x.credito, 0);
const tNet = resumenPDF.reduce((a, x) => a + x.neto, 0);
const tFin = resumenPDF.reduce((a, x) => a + x.saldoFinal, 0);

let y4 = y3;
if (y4 > pageHeight - MARGIN.bottom - 24) {
  doc.addPage();
  drawHeader();
  drawFooter();
  y4 = MARGIN.top;
}
doc.setFontSize(11);
doc.setTextColor(0, 0, 0);
doc.text(`Totales resumen —  Inicial: ${money(tIni)}  |  Débito: ${money(tDeb)}  |  Crédito: ${money(tCre)}  |  Neto: ${money(tNet)}  |  Final: ${money(tFin)}`, MARGIN.left, y4);

    doc.save(`LibroMayor_${desdeISO}_a_${hastaISO}.pdf`);
  };

  return (
    <Card>
      <HeaderCard
        title="Libro Mayor"
        subheader="Consulta de movimientos por cuenta (solo asientos CONTABILIZADOS)."
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

            {/* Fechas nativas */}
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
              <Button variant="contained" startIcon={<Search />} onClick={handleBuscar} disabled={loading}>
                Buscar
              </Button>
            </Tooltip>
            <Tooltip title="Limpiar">
              <Button variant="contained" startIcon={<Clear />} onClick={handleLimpiar} disabled={loading} sx={{ ml: 1 }}>
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

          {/* Totales globales (tradicionales + contables) */}
          <div className="flex flex-wrap gap-3">
            <Chip label={`Total Débito: ${totalDebe.toFixed(2)}`} color="primary" variant="outlined" />
            <Chip label={`Total Crédito: ${totalHaber.toFixed(2)}`} color="secondary" variant="outlined" />
            <Chip
              label={`Total (Crédito - Débito): ${totalNeto.toFixed(2)}`}
              color={totalNeto >= 0 ? "success" : "error"}
              variant="outlined"
            />
            <Chip label={`Saldo Inicial (contable): ${totalesContables.inicial.toFixed(2)}`} variant="outlined" />
            <Chip label={`Neto (contable): ${totalesContables.neto.toFixed(2)}`} variant="outlined" />
            <Chip
              label={`Saldo Final (contable): ${totalesContables.final.toFixed(2)}`}
              color={totalesContables.final >= 0 ? "success" : "error"}
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
                      {/* Encabezado con saldos según naturaleza */}
                      {(() => {
                        const { nat, saldoInicialCont, netoPeriodoCont, saldoFinalCont, deb, cre } =
                          saldosSegunNaturaleza(g);
                        return (
                          <div className="flex gap-4 items-center">
                            <Chip size="small" label={`Naturaleza: ${nat}`} variant="outlined" />
                            <span>Saldo inicial: <b>{saldoInicialCont.toFixed(2)}</b></span>
                            <span>Débito: <b>{deb.toFixed(2)}</b></span>
                            <span>Crédito: <b>{cre.toFixed(2)}</b></span>
                            <span>
                              Neto período:{" "}
                              <b className={netoPeriodoCont >= 0 ? "text-green-600" : "text-red-600"}>
                                {netoPeriodoCont.toFixed(2)}
                              </b>
                            </span>
                            <span>
                              Saldo final:{" "}
                              <b className={saldoFinalCont >= 0 ? "text-green-700" : "text-red-700"}>
                                {saldoFinalCont.toFixed(2)}
                              </b>
                            </span>
                          </div>
                        );
                      })()}
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
                              <td className="border p-2 text-right">{Number(m.debito).toFixed(2)}</td>
                              <td className="border p-2 text-right">{Number(m.credito).toFixed(2)}</td>
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
