import axios from "axios";
import type { Empresa } from "../interfaces/Empresa";

// Ajusta si usas envs (ej. VITE_API_URL)
const API_BASE = "http://localhost:3000/contabilidad/empresa";

export const getEmpresas = () => axios.get<Empresa[]>(`${API_BASE}/all`);
export const getEmpresaById = (id: number) => axios.get<Empresa>(`${API_BASE}/${id}`);

// En tu backend, POST /new guarda y también actualiza si envías "id".
export const createOrUpdateEmpresa = (empresa: Partial<Empresa>) =>
  axios.post<Empresa>(`${API_BASE}/new`, empresa);

export const deleteEmpresa = (id: number) =>
  axios.delete(`${API_BASE}/${id}`);
