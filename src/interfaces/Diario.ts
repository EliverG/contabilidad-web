export interface Diario {
  id?: number;
  fecha: Date;
  descripcion: string;
  debe: number;
  haber: number;
  cuentaContable: string;
}
