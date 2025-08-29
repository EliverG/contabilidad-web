import { Paper, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface ReporteItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export default function ReporteItem({
  title,
  description,
  icon,
  selected = false,
  onClick,
}: ReporteItemProps) {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}
