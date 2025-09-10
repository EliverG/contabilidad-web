import { useState } from 'react';
import { Card, CardContent, Grid, IconButton, Tooltip } from '@mui/material';
import { InsertChart, Article, TableChart } from '@mui/icons-material';

import HeaderCard from '../components/HeaderCard';

const reportes = [
  {
    id: 'libro-mayor',
    title: 'Libro Mayor por Cuenta',
    description: 'Detalle de movimientos de una cuenta específica con saldo acumulado',
    icon: <TableChart fontSize="large" />,
  },
  {
    id: 'balance',
    title: 'Balance de Comprobación',
    description: 'Resumen de saldos de todas las cuentas en un período determinado',
    icon: <Article fontSize="large" />,
  },
  {
    id: 'estado-resultados',
    title: 'Estado de Resultados',
    description: 'Informe de ingresos y gastos para determinar utilidad o pérdida',
    icon: <InsertChart fontSize="large" />,
  },
  {
    id: 'reporte-saldos',
    title: 'Reporte de Saldos',
    description: 'Saldos iniciales, movimientos y saldos finales por cuenta',
    icon: <InsertChart fontSize="large" />,
  },
];

export default function Reportes() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    console.log('Reporte seleccionado:', id);
  };

  return (
    <Card>
      <HeaderCard
        title="Generador de reportes contables"
        subheader="Seleccione el tipo de reporte haciendo clic en un icono."
      />
      <CardContent>
        <Grid container spacing={3} justifyContent="center">
          {reportes.map((reporte) => (
            <Grid key={reporte.id}>
              <Tooltip title={`${reporte.title} - ${reporte.description}`} arrow>
                <IconButton
                  size="large"
                  color={selected === reporte.id ? "primary" : "default"}
                  onClick={() => handleSelect(reporte.id)}
                >
                  {reporte.icon}
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
