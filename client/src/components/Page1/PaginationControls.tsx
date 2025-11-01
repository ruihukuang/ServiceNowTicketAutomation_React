import React from 'react';
import {
  Box,
  TablePagination,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';

interface PaginationControlsProps {
  count: number;
  page: number;
  rowsPerPage: number; // Keep for consistency but won't be used for selection
  onPageChange: (newPage: number) => void;
  // REMOVED: onRowsPerPageChange callback
}

// Custom pagination actions component for better mobile responsiveness
const PaginationActions: React.FC<{
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
}> = ({ count, page, rowsPerPage, onPageChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      {/* Mobile-friendly compact pagination */}
      {isMobile ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="First Page">
            <span>
              <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
                size="small"
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Previous Page">
            <span>
              <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
                size="small"
              >
                <KeyboardArrowLeft />
              </IconButton>
            </span>
          </Tooltip>
          
          <Box sx={{ mx: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
            {page + 1} / {Math.ceil(count / rowsPerPage)}
          </Box>
          
          <Tooltip title="Next Page">
            <span>
              <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
                size="small"
              >
                <KeyboardArrowRight />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Last Page">
            <span>
              <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
                size="small"
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : (
        /* Desktop full pagination */
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="First Page">
            <span>
              <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
                size="small"
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Previous Page">
            <span>
              <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
                size="small"
              >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next Page">
            <span>
              <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
                size="small"
              >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Last Page">
            <span>
              <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
                size="small"
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  // REMOVED: onRowsPerPageChange
}) => {
  // Don't render if there are no rows or only one page
  if (count <= rowsPerPage) {
    return null;
  }

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(newPage);
  };

  // REMOVED: handleChangeRowsPerPage function

  return (
    <TablePagination
      rowsPerPageOptions={[]} // CHANGED: Empty array to remove rows per page selector
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      // REMOVED: onRowsPerPageChange prop
      ActionsComponent={PaginationActions}
      labelRowsPerPage="" // CHANGED: Empty string to remove label
      labelDisplayedRows={({ from, to, count }) => 
        `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
      }
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        '.MuiTablePagination-toolbar': {
          padding: 1,
          flexWrap: 'wrap',
          justifyContent: 'center'
        },
        '.MuiTablePagination-selectLabel': {
          display: 'none', // CHANGED: Hide the select label
        },
        '.MuiTablePagination-displayedRows': {
          margin: 0,
          fontSize: '0.875rem'
        },
        '.MuiTablePagination-select': {
          display: 'none', // CHANGED: Hide the select dropdown
        }
      }}
    />
  );
};

export default PaginationControls;