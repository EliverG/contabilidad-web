import type { BalanceGeneral } from '../types/BalanceGeneral';

const API_BASE_URL = 'http://localhost:3000/contabilidad/balance-general';





export interface ReporteDetallado {
  empresaId: number;
  periodoId: number;
  fechaGeneracion: string;
  asientos: AsientoDetallado[];
}

export interface AsientoDetallado {
  numeroAsiento: string;
  fecha: string;
  descripcionAsiento: string;
  tipoAsiento: string;
  codigoCuenta: string;
  nombreCuenta: string;
  tipoCuenta: string;
  descripcionMovimiento: string;
  debito: number;
  credito: number;
  centroCosto: any;
  proyecto: any;
}

export interface ReporteSeccion {
  empresaId: number;
  periodoId: number;
  seccion: string;
  fechaGeneracion: string;
  movimientos: MovimientoSeccion[];
}

export interface MovimientoSeccion {
  numeroAsiento: string;
  fecha: string;
  descripcionAsiento: string;
  codigoCuenta: string;
  nombreCuenta: string;
  descripcionMovimiento: string;
  debito: number;
  credito: number;
  centroCosto: string;
  proyecto: string;
}






export const balanceGeneralService = {
  async generarBalance(empresaId: number, periodoId: number): Promise<BalanceGeneral> {
    console.log('🚀 Enviando solicitud de balance:', { empresaId, periodoId });
    
    const response = await fetch(`${API_BASE_URL}/generar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresaId, periodoId }),
    });
    
    console.log('📨 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Balance recibido:', data);
    return data;
  },






  async generarReporteDetallado(empresaId: number, periodoId: number): Promise<ReporteDetallado> {
    console.log('🚀 Enviando solicitud de reporte detallado:', { empresaId, periodoId });
    
    const response = await fetch(`${API_BASE_URL}/reporte-detallado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresaId, periodoId }),
    });
    
    console.log('📨 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Reporte detallado recibido:', data);
    return data;
  },

  async generarReporteSeccion(empresaId: number, periodoId: number, seccion: string): Promise<ReporteSeccion> {
    console.log('🚀 Enviando solicitud de reporte por sección:', { empresaId, periodoId, seccion });
    
    const response = await fetch(`${API_BASE_URL}/reporte-seccion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresaId, periodoId, seccion }),
    });
    
    console.log('📨 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Reporte por sección recibido:', data);
    return data;
  },












 async exportarPDF(empresaId: number, periodoId: number, tipoReporte: string, seccion?: string): Promise<void> {
    console.log('🚀 Enviando solicitud de exportación PDF:', { empresaId, periodoId, tipoReporte, seccion });
    
    const response = await fetch(`${API_BASE_URL}/exportar-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresaId, periodoId, tipoReporte, seccion }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    // Manejar la descarga del archivo PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener el nombre del archivo del header Content-Disposition o generar uno
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `reporte-${Date.now()}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async exportarExcel(empresaId: number, periodoId: number, tipoReporte: string, seccion?: string): Promise<void> {
    console.log('🚀 Enviando solicitud de exportación Excel:', { empresaId, periodoId, tipoReporte, seccion });
    
    const response = await fetch(`${API_BASE_URL}/exportar-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ empresaId, periodoId, tipoReporte, seccion }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    // Manejar la descarga del archivo Excel
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener el nombre del archivo del header Content-Disposition o generar uno
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `reporte-${Date.now()}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }









};