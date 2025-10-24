import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generador de PDF cliente para un cierre usando la previsualización
export async function generateCierrePdf(
  preview: any,
  meta: {
    idPeriodo?: string | number;
    titulo?: string;
    periodoNombre?: string;
    usuarioNombre?: string;
    empresa?: string;
    fechaInicio?: string;
    fechaFin?: string;
    notas?: string;
  } = {}
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const left = 14;

  // Header / Cabecera con empresa y título
  doc.setFontSize(16);
  if (meta.empresa) {
    doc.setFontSize(12);
    doc.text(meta.empresa, left, 18);
  }
  doc.setFontSize(16);
  doc.text(meta.titulo || `Cierre contable ${meta.idPeriodo ?? ''}`, w / 2, 28, { align: 'center' });

  // Subtitulo con periodo y fechas
  doc.setFontSize(10);
  const periodoLabel = meta.periodoNombre ?? preview?.periodo?.nombre ?? preview?.periodoNombre ?? meta.idPeriodo ?? '';
  // Evitar mezclar '??' y '||' sin paréntesis: preferimos nullish coalescing para nombres de usuario
  const usuarioLabel = (meta.usuarioNombre ?? preview?.usuario?.nombre ?? preview?.usuarioNombre ?? preview?.usuario) ?? '';
  const fechaRange = meta.fechaInicio && meta.fechaFin ? `${meta.fechaInicio} - ${meta.fechaFin}` : preview?.periodo?.rango || '';

  let y = 36;
  doc.text(`Período: ${periodoLabel}`, left, y);
  if (fechaRange) doc.text(`Fechas: ${fechaRange}`, left + 90, y);
  y += 6;
  if (usuarioLabel) doc.text(`Usuario: ${usuarioLabel}`, left, y);
  if (meta.notas) doc.text(`Notas: ${meta.notas}`, left + 90, y);

  // Totales destacados en caja
  const tot = preview?.totales || {};
  const totalDebito = Number(tot.debito || 0);
  const totalCredito = Number(tot.credito || 0);
  y += 8;
  // cuadro de totales a la derecha
  const boxX = w - 14 - 68;
  doc.setDrawColor(200);
  doc.setFillColor(249, 249, 249);
  doc.rect(boxX, y - 6, 68, 20, 'F');
  doc.setFontSize(10);
  doc.text('Total Débito:', boxX + 4, y + 4);
  doc.text(`Q ${totalDebito.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, boxX + 4, y + 11);
  doc.text('Total Crédito:', boxX + 34, y + 4);
  doc.text(`Q ${totalCredito.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, boxX + 34, y + 11);

  y += 26;

  // Ajustes (tabla) - si existen
  const ajustes = preview?.ajustes || [];
  if (ajustes.length > 0) {
    const body = ajustes.map((r: any) => [
      r.cuenta || '',
      r.nombre || '',
      Number(r.saldoDebe || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }),
      Number(r.saldoHaber || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }),
      Number(r.ajusteDebe || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }),
      Number(r.ajusteHaber || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }),
    ]);

    // @ts-expect-error autoTable types
    (doc as any).autoTable({
      head: [['Cuenta', 'Nombre', 'Saldo Débito', 'Saldo Crédito', 'Ajuste Débito', 'Ajuste Crédito']],
      body,
      startY: y,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left, right: 14 },
    });

    y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : y + 60;
  }

  // Saldos (tabla)
  const saldos = preview?.saldos || [];
  if (saldos.length > 0) {
    const bodyS = saldos.map((r: any) => [
      r.cuenta || '',
      r.nombre || '',
      Number(r.debe || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }),
      Number(r.haber || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }),
    ]);

    // @ts-expect-error autoTable types
    (doc as any).autoTable({
      head: [['Cuenta', 'Nombre', 'Debe', 'Haber']],
      body: bodyS,
      startY: y,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 188, 156], textColor: 255 },
      margin: { left, right: 14 },
    });
    y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : y + 60;
  }

  // Pie de página con fecha y numeración
  const now = new Date();
  const fecha = now.toLocaleString();
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.text(`Generado: ${fecha}`, left, h - 10);
    doc.text(`Página ${i} / ${pageCount}`, w - 34, h - 10);
  }

  return doc.output('blob');
}

// Generar PDF con el listado completo de cierres
export async function exportListCierresPdf(periodos: any[], meta: { titulo?: string } = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();

  // Portada
  doc.setFontSize(18);
  doc.text(meta.titulo || 'Listado de Cierres Contables', width / 2, 36, { align: 'center' });
  doc.setFontSize(11);
  doc.text(`Total registros: ${periodos.length}`, width / 2, 46, { align: 'center' });
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(14, 52, width - 14, 52);

  // Espacio y posición inicial para la tabla
  let startY = 60;

  // Construir body
  const body = periodos.map((p: any) => [
    p.id ?? p.ID_CIERRE ?? '',
    p.idPeriodo ?? p.periodo ?? '',
    p.tipo ?? '',
    p.fechaCierre ?? p.fecha_cierre ?? '',
    p.idUsuario ?? p.usuario ?? '',
    p.estado ?? '',
    `Q ${Number(p.totalDebito || p.total_debito || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
    `Q ${Number(p.totalCredito || p.total_credito || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
  ]);

  // @ts-expect-error
  (doc as any).autoTable({
    head: [['ID', 'Período', 'Tipo', 'Fecha cierre', 'Usuario', 'Estado', 'Total Débito', 'Total Crédito']],
    body,
    startY,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 47, 62], textColor: 255 },
    theme: 'striped',
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { cellWidth: 16 }, 1: { cellWidth: 36 } },
  });

  // Footer
  const now = new Date();
  const fecha = now.toLocaleString();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.text(`Generado: ${fecha}`, 14, h - 12);

  return doc.output('blob');
}
