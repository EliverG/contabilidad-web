import { useState } from 'react';
import { Card, CardContent, Grid } from '@mui/material';
import { InsertChart, Article, TableChart } from '@mui/icons-material';

import HeaderCard from '../components/HeaderCard';
import ReporteItem from '../components/ReportItem';

const reportes = [
  {
    id: 'libro-mayor',
    title: 'Libro Mayor por Cuenta',
    description: 'Detalle de movimientos de una cuenta específica con saldo acumulado',
    icon: <TableChart />,
  },
  {
    id: 'balance',
    title: 'Balance de Comprobación',
    description: 'Resumen de saldos de todas las cuentas en un período determinado',
    icon: <Article />,
  },
  {
    id: 'estado-resultados',
    title: 'Estado de Resultados',
    description: 'Informe de ingresos y gastos para determinar utilidad o pérdida',
    icon: <InsertChart />,
  },
  {
    id: 'reporte-saldos',
    title: 'Reporte de Saldos',
    description: 'Saldos iniciales, movimientos y saldos finales por cuenta',
    icon: <InsertChart />,
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
        subheader={
          <>
            En este módulo podrá encontrar distintos tipos de reportes para su generación.
            <br />
            <br />
            Seleccione tipo de reporte.
          </>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          {reportes.map((reporte) => (
            <Grid key={reporte.id}>
              <ReporteItem
                title={reporte.title}
                description={reporte.description}
                icon={reporte.icon}
                selected={selected === reporte.id}
                onClick={() => handleSelect(reporte.id)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
