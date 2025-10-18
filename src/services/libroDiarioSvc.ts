import axios from "axios";
import type { Diario } from "../interfaces/Diario";

const API_URL = "/contabilidad/libro-diario";

export const getDiario = () =>
  axios.get<Diario[]>(`${API_URL}/all`);

export const getDiarioById = (id: number) =>
  axios.get<Diario>(`${API_URL}/${id}`);

export const createDiario = (data: Omit<Diario, "id">) =>
  axios.post(`${API_URL}/new`, data);

export const deleteDiario = (id: number) =>
  axios.delete(`${API_URL}/${id}`);
