import axios from "axios";

const BASE = "/contabilidad/cierres-contables";

export const validateCierreContable = (idPeriodo: number | string) =>
  axios.post(`${BASE}/validar`, { idPeriodo });

export const previewCierreContable = (idPeriodo: number | string) =>
  axios.get(`${BASE}/previsualizar`, { params: { idPeriodo } });

export const closeCierreContable = (data: {
  idPeriodo: number | string;
  idUsuario: number | string;
  generarAsiento?: boolean;
  tipo?: "MENSUAL" | "ANUAL";
}) => axios.post(`${BASE}/cerrar`, data);

export const reopenCierreContable = (idPeriodo: number | string) =>
  axios.post(`${BASE}/reabrir`, { idPeriodo });

export const getCierresContables = () => axios.get(`${BASE}/all`);
export const createCierreContable = (data: any) => axios.post(`${BASE}/new`, data);
export const updateCierreContable = (id: number | string, data: any) =>
  axios.put(`${BASE}/${id}`, data);
export const deleteCierreContable = (id: number | string) =>
  axios.delete(`${BASE}/${id}`);

export const getCierreById = (id: number | string) => {
  if (id === undefined || id === null) throw new Error("id requerido");
  return axios.get(`${BASE}/${id}`);
};

// Descargar reporte PDF para un cierre
export const exportCierrePdf = (id: number | string) =>
  axios.get(`${BASE}/${id}/report`, { responseType: "blob" });