import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Alert,
  Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { TicketRow } from '../../types';
import TableRowComponent from './TableRow';
import { defaultRow } from './FormFields';
import { getCurrentDateTime } from './DateUtils';
import PaginationControls from './PaginationControls';

interface EditableTableProps {
  data: TicketRow[];
  onDataChange: (data: TicketRow[]) => void;
  onRowUpdate: (rowId: string, field: keyof TicketRow, value: string) => void;
  onDeleteRow: (rowId: string) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({ 
  data, 
  onDataChange, 
  onRowUpdate,
  onDeleteRow
}) => {
  console.log('📊 EditableTable received data:', data);

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  // Ensure we always have valid data
  const rows = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('🔄 Using default row data');
      return [defaultRow];
    }
    
    // Validate each row has required fields
    const validRows = data.map(row => ({
      ...defaultRow,
      ...row, // Override with actual data
      id: row.id || `temp-${Date.now()}` // Ensure ID exists
    }));
    
    console.log('✅ Validated rows:', validRows);
    return validRows;
  }, [data]);

  // Calculate paginated rows
  const paginatedRows = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return rows.slice(startIndex, endIndex);
  }, [rows, page, rowsPerPage]);

  // Check if pagination is needed (more than 5 rows)
  const needsPagination = rows.length > rowsPerPage;

  // Add new row
  const handleAddRow = () => {
    const currentDateTime = getCurrentDateTime();
    const newRow: TicketRow = {
      ...defaultRow,
      id: `temp-${Date.now()}`,
      OpenDate: currentDateTime,
      UpdatedDate: currentDateTime
    };
    const newRows = [...rows, newRow];
    console.log('➕ Added new row. Total rows:', newRows.length);
    
    // If adding a row pushes us to a new page, stay on current page
    const newTotalPages = Math.ceil(newRows.length / rowsPerPage);
    if (page >= newTotalPages) {
      setPage(newTotalPages - 1);
    }
    
    onDataChange(newRows);
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    console.log(`🗑️ Table requesting delete for row: ${rowId}`);
    onDeleteRow(rowId);
  };

  // Handle field edits
  const handleEdit = (rowId: string, field: keyof TicketRow, value: string) => {
    console.log(`✏️ Editing row ${rowId}, field ${field}, value: ${value}`);
    onRowUpdate(rowId, field, value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          {/* Show current page info only when pagination is needed */}
          {needsPagination && (
            <Alert severity="info" sx={{ py: 0.5, fontSize: '0.875rem' }}>
              Page {page + 1} of {Math.ceil(rows.length / rowsPerPage)} • 
              Showing {paginatedRows.length} of {rows.length} rows
            </Alert>
          )}
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
        >
          Add Row ({rows.length})
        </Button>
      </Box>

      <TableContainer 
        component={Paper}
        sx={{ 
          maxHeight: needsPagination ? 'calc(100vh - 300px)' : 'none',
          overflow: 'auto'
        }}
      >
        <Table 
          sx={{ minWidth: 650 }} 
          aria-label="ticket data table"
          stickyHeader={needsPagination}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: 200, minWidth: 180 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 50 }}>Actions</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Incident Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned Group</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 400 }}>Long Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Team Fixed Issue</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Team Included in Ticket</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 200 }}>Open Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: 200 }}>Updated Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRowComponent
                key={row.id}
                row={row}
                onEdit={handleEdit}
                onDelete={handleDeleteRow}
                canDelete={rows.length > 1}
              />
            ))}
            
            {/* Show empty rows for consistent table height only when pagination is needed */}
            {needsPagination && paginatedRows.length < rowsPerPage && (
              Array.from({ length: rowsPerPage - paginatedRows.length }).map((_, index) => (
                <TableRow key={`empty-${index}`} style={{ height: 53 * 3 }}>
                  <TableCell colSpan={11} />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination controls - only show when needed */}
      {needsPagination && (
        <PaginationControls
          count={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
        />
      )}
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>Debug Info:</strong> Showing {paginatedRows.length} of {rows.length} row(s) | 
        {needsPagination ? ` Page ${page + 1} of ${Math.ceil(rows.length / rowsPerPage)} | ` : ' '}
        Backend IDs: {rows.filter(row => !row.id.startsWith('temp-')).length} | 
        Temporary IDs: {rows.filter(row => row.id.startsWith('temp-')).length}
      </Alert>
    </Box>
  );
};

export default EditableTable;