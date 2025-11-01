import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  loading = false
}) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
      <Button
        variant="outlined"
        startIcon={<NavigateBefore />}
        onClick={onPrevious}
        disabled={currentPage <= 1 || loading}
      >
        Previous
      </Button>
      
      <Typography variant="body1">
        Page {currentPage} of {totalPages}
      </Typography>
      
      <Button
        variant="outlined"
        endIcon={<NavigateNext />}
        onClick={onNext}
        disabled={currentPage >= totalPages || loading}
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination;