import React from 'react';
import { Box, Button, Alert } from '@mui/material';
import { PlayArrow, Delete, Refresh } from '@mui/icons-material';

interface ActionButtonsProps {
  onProcess: () => void;
  onDeleteReprocess: () => void;
  processing: boolean;
  hasSelectedRows: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onProcess,
  onDeleteReprocess,
  processing,
  hasSelectedRows
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button
        variant="contained"
        startIcon={<PlayArrow />}
        onClick={onProcess}
        disabled={processing}
      >
        {processing ? 'Processing...' : 'Process Data'}
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<Delete />}
        onClick={onDeleteReprocess}
        disabled={!hasSelectedRows || processing}
        color="error"
      >
        Delete & Reprocess Selected
      </Button>

      {processing && (
        <Alert severity="info" sx={{ flex: 1 }}>
          Backend is processing your request...
        </Alert>
      )}
    </Box>
  );
};

export default ActionButtons;