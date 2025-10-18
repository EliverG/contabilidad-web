export interface PeriodoContable {
  id: number;
  idEmpresa: number;
  nombrePeriodo: string;
  fechaInicio: string | Date; // aceptamos string dd/MM/yyyy o Date
  fechaFin: string | Date;
  estado: 'ABIERTO' | 'CERRADO';
}
