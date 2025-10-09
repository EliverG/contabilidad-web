export interface AsientoContable {
  id: number;
  numeroAsiento: string;
  idEmpresa: number;
  idPeriodo: number;
  idUsuario: number;
  fecha: string;
  descripcion: string;
  referencia: string | null;
  tipo: 'APERTURA' | 'CIERRE' | 'OPERATIVA' | 'AJUSTE' | 'REGULARIZACION' | 'SIMPLE' | 'COMPUESTA';
  estado: 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO';
  totalDebito: number;
  totalCredito: number;
  //empresaNombre?: string;
  //periodoNombre?: string;
  //usuarioNombre?: string;
}

export interface LineaAsiento {
  id?: number;
  idAsiento: number;
  idCuenta: number;
  descripcion: string;
  debito: number;
  credito: number;
  idCentroCosto?: number;
  idProyecto?: number;
  cuentaCodigo?: string;
  cuentaNombre?: string;
}

export interface AsientoContableCompleto extends AsientoContable {
  lineas: LineaAsiento[];
}