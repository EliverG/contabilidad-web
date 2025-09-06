import { CardHeader } from '@mui/material';
import type { ReactNode } from 'react';

interface HeaderCardProps {
  title: string;
  subheader?: ReactNode;
}

export default function HeaderCard({ title, subheader }: HeaderCardProps) {
  return (
    <CardHeader
      title={title}
      subheader={subheader}
      sx={{
        backgroundColor: 'info.main',
        color: 'primary.contrastText',
        '& .MuiCardHeader-subheader': {
          color: 'primary.contrastText',
          opacity: 0.8,
        },
      }}
    />
  );
}
