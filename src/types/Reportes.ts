// types/Reportes.ts
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
  centroCosto: {
    codigo: string;
    nombre: string;
  } | null;
  proyecto: {
    codigo: string;
    nombre: string;
  } | null;
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