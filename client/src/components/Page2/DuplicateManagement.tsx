// src/components/Page2/DuplicateManagement.tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TablePagination,
  TableSortLabel,
  TextField,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Edit, Save, Cancel, CheckCircle, ContentCopy } from '@mui/icons-material';
import type { ActivityResponse } from '../../types';

interface DuplicateManagementProps {
  activities: ActivityResponse[];
  onUpdateRow: (activityId: string, field: keyof ActivityResponse, value: string) => void;
  onSaveDuplicateRecords: (activities: ActivityResponse[]) => Promise<any>;
}

interface SortConfig {
  key: keyof ActivityResponse;
  direction: 'asc' | 'desc';
}

interface EditState {
  activityId: string;
  field: keyof ActivityResponse;
  value: string;
}

export const DuplicateManagement: React.FC<DuplicateManagementProps> = ({
  activities,
  onUpdateRow,
  onSaveDuplicateRecords
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'incidentNumber',
    direction: 'asc'
  });
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Filter activities that have duplicate values
  const duplicateActivities = activities.filter(activity => 
    activity.duplicate_AI && 
    activity.duplicate_AI !== 'NO_DUPLICATE' && 
    activity.duplicate_AI !== ''
  );

  // Sort activities
  const sortedActivities = React.useMemo(() => {
    return [...duplicateActivities].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [duplicateActivities, sortConfig]);

  // Paginated activities
  const paginatedActivities = sortedActivities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (key: keyof ActivityResponse) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (activityId: string, field: keyof ActivityResponse, currentValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditState({
      activityId,
      field,
      value: currentValue || ''
    });
  };

  const handleSave = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (editState && onUpdateRow) {
      onUpdateRow(editState.activityId, editState.field, editState.value);
    }
    setEditState(null);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditState(null);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditState(prev => prev ? { ...prev, value: event.target.value } : null);
  };

  const isEditing = (activityId: string, field: keyof ActivityResponse) => {
    return editState?.activityId === activityId && editState?.field === field;
  };

  const handleCopyAIToManual = () => {
    duplicateActivities.forEach(activity => {
      if (activity.duplicate_AI && activity.duplicate_AI !== 'NO_DUPLICATE') {
        onUpdateRow(activity.id, 'duplicate', activity.duplicate_AI);
      }
    });
    setSnackbar({ 
      open: true, 
      message: `Copied AI duplicate values to manual fields for ${duplicateActivities.length} records`, 
      severity: 'success' 
    });
  };

  const handleSaveDuplicateRecords = async () => {
    setSaving(true);
    try {
      const result = await onSaveDuplicateRecords(duplicateActivities);
      setSnackbar({ 
        open: true, 
        message: `Successfully saved ${duplicateActivities.length} duplicate records`, 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: `Failed to save duplicate records: ${error.message}`, 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const parseDuplicateGroup = (duplicateValue: string): string[] => {
    if (!duplicateValue || duplicateValue === 'NO_DUPLICATE') return [];
    try {
      const cleanString = duplicateValue.replace(/[\[\]]/g, '');
      return cleanString.split(',').map(item => item.trim()).filter(item => item !== '');
    } catch {
      return [];
    }
  };

  const getDisplayValue = (value: any): string => {
    return value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
  };

  // Format date for display
  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const SortableHeader: React.FC<{ 
    columnKey: keyof ActivityResponse; 
    children: React.ReactNode;
    width?: string | number;
  }> = ({ columnKey, children, width }) => (
    <TableCell sx={{ fontWeight: 'bold', width, padding: '12px 6px', fontSize: '0.9rem' }}>
      <TableSortLabel
        active={sortConfig.key === columnKey}
        direction={sortConfig.key === columnKey ? sortConfig.direction : 'asc'}
        onClick={() => handleSort(columnKey)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );

  // Function to render scrollable text cells
  const renderScrollableCell = (text: string, options?: { fontSize?: string, height?: string }) => {
    const displayValue = getDisplayValue(text);
    const cellHeight = options?.height || '100px';
    
    return (
      <Box
        sx={{
          maxHeight: cellHeight,
          height: cellHeight,
          overflow: 'auto',
          padding: '4px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: '#fafafa',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          }
        }}
      >
        <Typography 
          variant="body2" 
          fontSize={options?.fontSize || "0.85rem"}
          sx={{
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.3'
          }}
        >
          {displayValue}
        </Typography>
      </Box>
    );
  };

  const renderEditableCell = (activity: ActivityResponse, field: keyof ActivityResponse, value: any) => {
    if (isEditing(activity.id, field)) {
      // Enhanced edit mode for text fields with larger text area
      if (field === 'duplicate') {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <TextField
              value={editState?.value || ''}
              onChange={handleInputChange}
              size="small"
              variant="outlined"
              fullWidth
              autoFocus
              multiline
              rows={3}
              onClick={(e) => e.stopPropagation()}
              sx={{ minWidth: '200px' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              <IconButton size="small" color="primary" onClick={handleSave}>
                <Save fontSize="small" />
              </IconButton>
              <IconButton size="small" color="secondary" onClick={handleCancel}>
                <Cancel fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      }
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            value={editState?.value || ''}
            onChange={handleInputChange}
            size="small"
            variant="outlined"
            fullWidth
            autoFocus
            onClick={(e) => e.stopPropagation()}
            sx={{ minWidth: '100px' }}
          />
          <IconButton size="small" color="primary" onClick={handleSave}>
            <Save fontSize="small" />
          </IconButton>
          <IconButton size="small" color="secondary" onClick={handleCancel}>
            <Cancel fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    const displayValue = getDisplayValue(value);
    
    if (field === 'duplicate' || field === 'duplicate_AI') {
      const duplicateGroups = parseDuplicateGroup(displayValue);
      const isInGroup = duplicateGroups.length > 1;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip 
            label={displayValue}
            size="small"
            color={isInGroup ? "warning" : "default"}
            variant={isInGroup ? "filled" : "outlined"}
            sx={{ 
              height: '28px', 
              fontSize: '0.8rem',
              maxWidth: '200px',
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }}
            title={displayValue}
          />
          {field === 'duplicate' && (
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => handleEdit(activity.id, field, value, e)}
              title="Edit duplicate"
            >
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
          {displayValue}
        </Typography>
        <IconButton 
          size="small" 
          color="primary"
          onClick={(e) => handleEdit(activity.id, field, value, e)}
          title={`Edit ${field}`}
        >
          <Edit fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleCopyAIToManual}
          startIcon={<ContentCopy />}
          disabled={duplicateActivities.length === 0}
        >
          Copy AI to Manual Fields
        </Button>
        
        <Button
          variant="contained"
          color="success"
          onClick={handleSaveDuplicateRecords}
          startIcon={<CheckCircle />}
          disabled={duplicateActivities.length === 0 || saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Duplicate Records'}
        </Button>

        <Chip 
          label={`${duplicateActivities.length} duplicate records found`}
          color={duplicateActivities.length > 0 ? "warning" : "default"}
          variant="outlined"
        />
      </Box>

      {duplicateActivities.length === 0 ? (
        <Alert severity="info">
          No duplicate records found. Records with AI-generated duplicate groups will appear here.
        </Alert>
      ) : (
        <>
          {/* Table */}
          <TableContainer component={Paper} sx={{ maxHeight: '600px', overflow: 'auto',width: '100%',minWidth: '1200px'}}>
            <Table stickyHeader size="medium" sx={{minWidth: '2400px',width: 'auto'}} >
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <SortableHeader columnKey="incidentNumber" width={140}>
                    Incident Number
                  </SortableHeader>
                  <SortableHeader columnKey="assignedGroup" width={140}>
                    Assigned Group
                  </SortableHeader>
                  <SortableHeader columnKey="longDescription" width={600}>
                    Long Description
                  </SortableHeader>
                  <SortableHeader columnKey="summary_Issue" width={600}>
                    Summary Issue
                  </SortableHeader>
                  <SortableHeader columnKey="system" width={120}>
                    System
                  </SortableHeader>
                  <SortableHeader columnKey="issue" width={200}>
                    Issue
                  </SortableHeader>
                  <SortableHeader columnKey="root_Cause" width={600}>
                    Root Cause
                  </SortableHeader>
                  <SortableHeader columnKey="openDate" width={140}>
                    Open Date
                  </SortableHeader>
                  <SortableHeader columnKey="updatedDate" width={140}>
                    Updated Date
                  </SortableHeader>
                  <SortableHeader columnKey="duplicate_AI" width={200}>
                    Duplicate AI
                  </SortableHeader>
                  <SortableHeader columnKey="duplicate" width={200}>
                    Duplicate (Manual)
                  </SortableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedActivities.map((activity) => (
                  <TableRow 
                    key={activity.id}
                    sx={{ 
                      height: '120px',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <TableCell sx={{ padding: '6px 4px' }}>
                      <Typography variant="body2" fontSize="0.9rem" fontWeight="medium">
                        {getDisplayValue(activity.incidentNumber)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      <Typography variant="body2" fontSize="0.9rem">
                        {getDisplayValue(activity.assignedGroup)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      {renderScrollableCell(activity.longDescription, { fontSize: '0.85rem', height: '100px' })}
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      {renderScrollableCell(activity.summary_Issue, { fontSize: '0.85rem', height: '100px' })}
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
                        {getDisplayValue(activity.system)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
                        {getDisplayValue(activity.issue)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      {renderScrollableCell(activity.root_Cause, { fontSize: '0.85rem', height: '100px' })}
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
                        {formatDateTime(activity.openDate)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
                        {formatDateTime(activity.updatedDate)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      {renderEditableCell(activity, 'duplicate_AI', activity.duplicate_AI)}
                    </TableCell>
                    
                    <TableCell sx={{ padding: '6px 4px' }}>
                      {renderEditableCell(activity, 'duplicate', activity.duplicate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={sortedActivities.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DuplicateManagement;