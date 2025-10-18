export interface Diario {
  id?: number | null;
  fecha: Date;
  descripcion: string;
  debe: number;
  haber: number;
  cuentaContable: string;
}
