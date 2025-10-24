import axios from "axios";
import type { PeriodoContable } from "../interfaces/PeriodoContable";

const API_BASE = "/contabilidad/periodo-contable";

export const getPeriodosAll = () => axios.get<PeriodoContable[]>(`${API_BASE}/all`);
export const getPeriodoById = (id: number) => axios.get<PeriodoContable>(`${API_BASE}/${id}`);
export const createOrUpdatePeriodo = (payload: Partial<PeriodoContable>) =>
  axios.post<PeriodoContable>(`${API_BASE}/new`, payload);
export const deletePeriodo = (id: number) => axios.delete(`${API_BASE}/${id}`);
