import { useState } from 'react';
import { Card, CardContent, Grid, IconButton, Tooltip } from '@mui/material';
import HeaderCard from '../components/HeaderCard';

// Importa las imágenes
import imgLibroMayor from '../assets/img/libroMauyor.jpg';
import imgBalance from '../assets/img/balanceSaldos.jpg';
import imgEstadoResultados from '../assets/img/balanceComprobacion.jpg';
import imgReporteSaldos from '../assets/img/estadoResultados.jpg';

const reportes = [
  {
    id: 'libro-mayor',
    title: 'Libro Mayor por Cuenta',
    description: 'Detalle de movimientos de una cuenta específica con saldo acumulado',
    image: imgLibroMayor,
  },
  {
    id: 'balance',
    title: 'Balance de Comprobación',
    description: 'Resumen de saldos de todas las cuentas en un período determinado',
    image: imgBalance,
  },
  {
    id: 'estado-resultados',
    title: 'Estado de Resultados',
    description: 'Informe de ingresos y gastos para determinar utilidad o pérdida',
    image: imgEstadoResultados,
  },
  {
    id: 'reporte-saldos',
    title: 'Reporte de Saldos',
    description: 'Saldos iniciales, movimientos y saldos finales por cuenta',
    image: imgReporteSaldos,
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
        subheader="Seleccione el tipo de reporte haciendo clic en una imagen."
      />
      <CardContent>
        <Grid container spacing={3} justifyContent="center">
          {reportes.map((reporte) => (
            <Grid
              key={reporte.id}
              sx={{
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 2,
                boxShadow: 1,
                textAlign: 'center',
              }}
            >
              <Tooltip title={`${reporte.title} - ${reporte.description}`} arrow>
                <IconButton
                  size="large"
                  color={selected === reporte.id ? 'primary' : 'default'}
                  onClick={() => handleSelect(reporte.id)}
                  sx={{
                    border: selected === reporte.id ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: 2,
                    padding: 0,
                    transition: 'border 0.2s ease-in-out',
                  }}
                >
                  <img
                    src={reporte.image}
                    alt={reporte.title}
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: 'contain',
                      borderRadius: 8,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
