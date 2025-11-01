import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Alert
} from '@mui/material';
import { Page2Row } from '../../types';
import { dataService } from '../../services/dataService';
import { useApi } from '../../hooks/useApi';
import ActionButtons from './ActionButtons';
import LoadingSpinner from '../common/LoadingSpinner';

const ProcessTable: React.FC = () => {
  const [rows, setRows] = useState<Page2Row[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const { data, loading, error, execute } = useApi<{ data: Page2Row[] }>();

  const loadData = async () => {
    await execute(dataService.getPage2Data());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data) {
      setRows(data.data);
    }
  }, [data]);

  const handleProcess = async () => {
    const response = await execute(dataService.processData(rows));
    if (response) {
      setRows(response.data);
    }
  };

  const handleDeleteAndReprocess = async () => {
    if (selectedRows.length === 0) return;
    
    const response = await execute(
      dataService.deleteAndReprocess(selectedRows)
    );
    
    if (response) {
      setRows(response.data);
      setSelectedRows([]);
    }
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === rows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map(row => row.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading && rows.length === 0) return <LoadingSpinner message="Loading process data..." />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <ActionButtons
        onProcess={handleProcess}
        onDeleteReprocess={handleDeleteAndReprocess}
        processing={loading}
        hasSelectedRows={selectedRows.length > 0}
      />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                  checked={rows.length > 0 && selectedRows.length === rows.length}
                  onChange={toggleAllSelection}
                />
              </TableCell>
              <TableCell>Common Field 1</TableCell>
              <TableCell>Common Field 2</TableCell>
              <TableCell>Specific Field</TableCell>
              <TableCell>Processed Field</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                  />
                </TableCell>
                <TableCell>{row.commonField1}</TableCell>
                <TableCell>{row.commonField2}</TableCell>
                <TableCell>{row.specificField}</TableCell>
                <TableCell>
                  {row.processedField || (
                    <Typography variant="body2" color="textSecondary">
                      Not processed
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.status || 'pending'}
                    color={getStatusColor(row.status || 'pending')}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProcessTable;