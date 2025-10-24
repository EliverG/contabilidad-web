import axios from "axios";

const API_BASE = "/contabilidad/libro-mayor";

export type LibroMayorParams = {
  empresa: number;
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
  cuenta?: number;
};

export const getLibroMayor = (params: LibroMayorParams) =>
  axios.get(`${API_BASE}`, { params });
// Respuesta: { params, resultados: [{ cuenta:{id,codigo,nombre}, totales:{debito,credito}, movimientos:[...] }] }
