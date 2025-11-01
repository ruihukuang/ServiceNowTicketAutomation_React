import React from 'react';
import { Alert, Snackbar } from '@mui/material';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
}

interface CustomSnackbarProps {
  snackbar: SnackbarState;
  onClose: () => void;
}

export const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ snackbar, onClose }) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={snackbar.autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={snackbar.severity}
        sx={{ 
          whiteSpace: 'pre-line',
          maxWidth: '600px',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

// Hook for managing snackbar state
export const useSnackbar = () => {
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
    autoHideDuration: 6000
  });

  const showSnackbar = (
    message: string, 
    severity: 'success' | 'error' | 'warning' | 'info' = 'success', 
    autoHideDuration: number | null = 6000
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration: autoHideDuration === null ? undefined : autoHideDuration
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    snackbar,
    showSnackbar,
    hideSnackbar
  };
};

export default CustomSnackbar;