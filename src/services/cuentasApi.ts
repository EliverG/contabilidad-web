import axios from "axios";
import type { CuentaContable } from "../interfaces/CuentaContable";

const API_URL = "/contabilidad/cuentas-contables";

export const getCuentas = () =>
  axios.get<CuentaContable[]>(`${API_URL}/all`);

export const getCuentaById = (id: number) =>
  axios.get<CuentaContable>(`${API_URL}/${id}`);

export const createCuenta = (data: Omit<CuentaContable, "id">) =>
  axios.post(`${API_URL}/new`, data);

export const deleteCuenta = (id: number) =>
  axios.delete(`${API_URL}/${id}`);
