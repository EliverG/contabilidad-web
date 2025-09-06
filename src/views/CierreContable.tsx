import {
  Button,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  InputBase,
  Paper,
} from "@mui/material";
import {
  Lock,
  LockOpen,
  ErrorOutline,
  CheckCircle,
  Clear,
  MoreVert,
  Edit,
} from "@mui/icons-material";
import { useState } from "react";
import HeaderCard from "../components/HeaderCard";
import { FileDownload } from "@mui/icons-material";
<FileDownload fontSize="large" />


export default function CierreContable() {
  const [vista, setVista] = useState<"periodos" | "asientos">("periodos");
  const [busqueda, setBusqueda] = useState("");

  const dataPeriodos = [
    {
      periodo: "Enero 2024",
      estado: "cerrado",
      fechaCierre: "05/03/2024",
      usuario: "Juan Pérez",
      errores: 0,
    },
    {
      periodo: "Febrero 2024",
      estado: "cerrado",
      fechaCierre: "05/04/2024",
      usuario: "Juan Pérez",
      errores: 2,
    },
    {
      periodo: "Marzo 2024",
      estado: "abierto",
      fechaCierre: "",
      usuario: "",
      errores: 0,
    },
  ];

  const dataAsientosCierre = [
    {
      numero: "CIE-2024-01",
      periodo: "Enero 2024",
      tipo: "mensual",
      fecha: "31/01/2024",
      descripcion: "Cierre mensual - Enero 2024",
      total: "$ 500",
      estado: "confirmado",
    },
  ];

  const filteredPeriodos = dataPeriodos.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const filteredAsientos = dataAsientosCierre.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <Card>
      <HeaderCard
        title="Cierre Contable Mensual y Anual"
        subheader="Gestione los períodos contables y visualice los asientos automáticos generados."
      />
      <CardContent>
        <div className="p-6 space-y-6">
          {/* Selector de vista */}
          <div className="flex justify-between items-center">
            <ToggleButtonGroup
              value={vista}
              exclusive
              onChange={(_, val) => val && setVista(val)}
              size="small"
            >
              <ToggleButton value="periodos">Períodos Contables</ToggleButton>
              <ToggleButton value="asientos">Asientos de Cierre</ToggleButton>
            </ToggleButtonGroup>

            {vista === "asientos" && (
              <Button
  variant="outlined"
  color="primary"
  startIcon={<FileDownload sx={{ fontSize: 40 }} />}
>
  Exportar Todo
</Button>

            )}
          </div>

          {/* Buscador */}
          <div className="flex justify-start">
            <Paper
              component="form"
              sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 400 }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={
                  vista === "periodos"
                    ? "Buscar por período, usuario o estado..."
                    : "Buscar por número, período o descripción..."
                }
                inputProps={{ "aria-label": "search" }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <IconButton
                type="button"
                sx={{ p: "10px" }}
                aria-label="clear"
                onClick={() => setBusqueda("")}
              >
                <Clear />
              </IconButton>
            </Paper>
          </div>

          {/* Tabla dinámica */}
          {vista === "periodos" ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Período</th>
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Fecha de Cierre</th>
                    <th className="border p-2">Usuario</th>
                    <th className="border p-2">Validaciones</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeriodos.length > 0 ? (
                    filteredPeriodos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 text-sm">
                        <td className="border p-2">{item.periodo}</td>
                        <td className="text-center border p-2">
                          <Chip
                            label={item.estado}
                            color={item.estado === "cerrado" ? "success" : "primary"}
                            size="small"
                            icon={item.estado === "cerrado" ? <Lock /> : <LockOpen />}
                          />
                        </td>
                        <td className="border p-2">{item.fechaCierre || "—"}</td>
                        <td className="border p-2">{item.usuario || "—"}</td>
                        <td className="text-center border p-2">
                          {item.errores > 0 ? (
                            <Chip
                              label={`${item.errores} error(es)`}
                              color="error"
                              size="small"
                              icon={<ErrorOutline />}
                            />
                          ) : (
                            <Chip
                              label="Válido"
                              color="success"
                              size="small"
                              icon={<CheckCircle />}
                            />
                          )}
                        </td>
                        <td className="border text-center space-x-1">
                          {item.estado === "cerrado" ? (
                            <IconButton title="Reabrir período" color="primary" sx={{ backgroundColor: "#2dde59ff", color: "#333",p: "10px" }}>
                              <LockOpen />
                            </IconButton>
                          ) : (
                            <>
                              {item.errores > 0 && (
                                <IconButton title="Ver errores" color="error" sx={{ backgroundColor: "#f44336", color: "#fff" }}>
                                  <ErrorOutline />
                                </IconButton>
                              )}
                              <IconButton title="Cerrar período" color="success" sx={{ backgroundColor: "#8e8e8eff", color: "#333" }}
>
                                <Lock />
                              </IconButton>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-gray-500">
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Número</th>
                    <th className="border p-2">Período</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Fecha</th>
                    <th className="border p-2">Descripción</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Estado</th>
                    <th className="border p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAsientos.length > 0 ? (
                    filteredAsientos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 text-sm">
                        <td className="border p-2">{item.numero}</td>
                        <td className="border p-2">{item.periodo}</td>
                        <td className="border p-2 capitalize">{item.tipo}</td>
                        <td className="border p-2">{item.fecha}</td>
                        <td className="border p-2">{item.descripcion}</td>
                        <td className="border p-2">{item.total}</td>
                        <td className="text-center border p-2">
                          <Chip
                            label={item.estado}
                            color="success"
                            size="small"
                            icon={<CheckCircle />}
                          />
                        </td>
                        <td className="border text-center">
                          <IconButton title="Opciones" color="inherit">
                            <Edit />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center p-4 text-gray-500">
                        No se encontraron resultados
                      </td>
                    </tr>
                  )}
 </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
