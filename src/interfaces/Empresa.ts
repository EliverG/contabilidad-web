export interface Empresa {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  rucNit: string;
  estado: 'ACTIVO' | 'INACTIVO';
}
