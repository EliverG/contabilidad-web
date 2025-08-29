import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface MyAlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  visible: boolean;             // Control externo para mostrar/ocultar
  onClose?: () => void;         // Callback cuando se cierra automáticamente
  duration?: number;            // Tiempo en ms para ocultar (default 3000)
}

const CustomAlert: React.FC<MyAlertProps> = ({
  severity,
  title,
  message,
  visible,
  onClose,
  duration = 3000,
}) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) {
          onClose();
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1300,
        minWidth: 300,
      }}
    >
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </div>
  );
};

export default CustomAlert