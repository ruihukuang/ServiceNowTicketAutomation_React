// src/components/Page3/TableComponents.tsx
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
  Chip,
  IconButton,
  TablePagination,
  TableSortLabel,
  TextField
} from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';

import type { ActivityResponse } from '../../types';

interface TableComponentsProps {
  activities: ActivityResponse[];
  loading?: boolean;
  onRowClick?: (activity: ActivityResponse) => void;
  onDeleteRow?: (activityId: string) => void;
  onUpdateRow?: (activityId: string, field: keyof ActivityResponse, value: string) => void;
  enablePagination?: boolean;
  enableSorting?: boolean;
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

export const ActivityTable: React.FC<TableComponentsProps> = ({
  activities,
  loading = false,
  onRowClick,
  onDeleteRow,
  onUpdateRow,
  enablePagination = true,
  enableSorting = true
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: 'openDate',
    direction: 'desc'
  });
  const [editState, setEditState] = useState<EditState | null>(null);

  // Sort activities
  const sortedActivities = React.useMemo(() => {
    if (!enableSorting) return activities;

    return [...activities].sort((a, b) => {
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
  }, [activities, sortConfig, enableSorting]);

  // Paginated activities
  const paginatedActivities = enablePagination
    ? sortedActivities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedActivities;

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

  const handleDelete = (activityId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click when deleting
    if (onDeleteRow) {
      onDeleteRow(activityId);
    }
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

  const isEditableField = (field: keyof ActivityResponse): boolean => {
    const editableFields: (keyof ActivityResponse)[] = ['summary_Issue', 'system', 'issue', 'root_Cause', 'duplicate'];
    return editableFields.includes(field);
  };

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

  const getDisplayValue = (value: any): string => {
    return value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'error.light';
      case 'P2': return 'warning.light';
      case 'P3': return 'info.light';
      default: return 'success.light';
    }
  };

  const SortableHeader: React.FC<{ 
    columnKey: keyof ActivityResponse; 
    children: React.ReactNode;
    width?: string | number;
  }> = ({ columnKey, children, width }) => (
    <TableCell sx={{ fontWeight: 'bold', width, padding: '12px 6px', fontSize: '0.9rem' }}>
      {enableSorting ? (
        <TableSortLabel
          active={sortConfig.key === columnKey}
          direction={sortConfig.key === columnKey ? sortConfig.direction : 'asc'}
          onClick={() => handleSort(columnKey)}
        >
          {children}
        </TableSortLabel>
      ) : (
        children
      )}
    </TableCell>
  );

  // Generic function to render scrollable text cells for specific fields
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
      // Enhanced edit mode for summary_Issue with larger text area
      if (field === 'summary_Issue') {
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
              rows={4}
              onClick={(e) => e.stopPropagation()}
              sx={{ minWidth: '100px' }}
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
    
    if (field === 'duplicate') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip 
            label={displayValue}
            size="small"
            color={value === 'Yes' ? "warning" : "default"}
            variant={value === 'Yes' ? "filled" : "outlined"}
            sx={{ height: '28px', fontSize: '0.8rem' }}
          />
          <IconButton 
            size="small" 
            color="primary"
            onClick={(e) => handleEdit(activity.id, field, value, e)}
            title="Edit duplicate"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    // Added summary_Issue to use scrollable container with edit functionality
    if (field === 'summary_Issue' || field === 'root_Cause') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box
            sx={{
              maxHeight: '200px',
              height: '200px',
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
              }
            }}
          >
            <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
              {displayValue}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => handleEdit(activity.id, field, value, e)}
              title={`Edit ${field}`}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      );
    }

    // For system and issue fields - regular display without scrollable container
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

  const renderReadOnlyCell = (value: any, options?: { fontSize?: string, align?: 'left' | 'center' | 'right', useChip?: boolean, chipColor?: any, useScrollable?: boolean }) => {
    const displayValue = getDisplayValue(value);
    
    if (options?.useChip) {
      return (
        <Chip 
          label={displayValue}
          size="small"
          color={options.chipColor || "default"}
          variant={value === 'Yes' ? "filled" : "outlined"}
          sx={{ height: '28px', fontSize: '0.8rem' }}
        />
      );
    }

    // Use scrollable container only if useScrollable is true (for non-editable scrollable fields)
    if (options?.useScrollable) {
      return (
        <Box
          sx={{
            maxHeight: '200px',
            height: '200px',
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
            }
          }}
        >
          <Typography 
            variant="body2" 
            fontSize={options?.fontSize || "0.85rem"}
            align={options?.align || "left"}
            sx={{ lineHeight: '1.3' }}
          >
            {displayValue}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography 
        variant="body2" 
        fontSize={options?.fontSize || "0.85rem"}
        align={options?.align || "left"}
        sx={{ lineHeight: '1.3' }}
      >
        {displayValue}
      </Typography>
    );
  };

  return (
    <Box>
      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: '600px', overflow: 'auto' }}>
        <Table 
          sx={{ minWidth: 5000 }}
          aria-label="activities table" 
          stickyHeader
          size="medium"
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <SortableHeader columnKey="id" width={100}>
                ID
              </SortableHeader>
              <SortableHeader columnKey="incidentNumber" width={140}>
                Incident Number
              </SortableHeader>
              <SortableHeader columnKey="assignedGroup" width={140}>
                Assigned Group
              </SortableHeader>
              <SortableHeader columnKey="longDescription" width={900}>
                Long Description
              </SortableHeader>
              <SortableHeader columnKey="team_Fixed_Issue" width={180}>
                Teams Fixed Issue
              </SortableHeader>
              <SortableHeader columnKey="team_Included_in_Ticket" width={180}>
                Teams Included
              </SortableHeader>
              <SortableHeader columnKey="serviceOwner" width={120}>
                Service Owner
              </SortableHeader>
              <SortableHeader columnKey="priority" width={80}>
                Priority
              </SortableHeader>
              <SortableHeader columnKey="guided_SLAdays" width={100}>
                SLA Days
              </SortableHeader>
              <SortableHeader columnKey="met_SLA" width={100}>
                Met SLA
              </SortableHeader>
              <SortableHeader columnKey="extraDays_AfterSLAdays" width={120}>
                Extra Days After SLA
              </SortableHeader>
              <SortableHeader columnKey="numberTeam_Included_in_Ticket" width={120}>
                Teams Included Count
              </SortableHeader>
              <SortableHeader columnKey="numberTeam_Fixed_Issue" width={120}>
                Teams Fixed Count
              </SortableHeader>
              <SortableHeader columnKey="is_AissignedGroup_ResponsibleTeam" width={140}>
                Is Assigned Group Responsible
              </SortableHeader>
              <SortableHeader columnKey="did_AssignedGroup_Fix_Issue" width={140}>
                Did Assigned Group Fix Issue
              </SortableHeader>
              
              {/* Summary Issue column - Now editable with scrollable container */}
              <SortableHeader columnKey="summary_Issue" width={900}>
                Summary Issue
              </SortableHeader>
              <SortableHeader columnKey="summary_Issue_AI" width={900}>
                Summary Issue AI
              </SortableHeader>
              
              {/* System columns - Editable fields without scrollable containers */}
              <SortableHeader columnKey="system" width={120}>
                System
              </SortableHeader>
              <SortableHeader columnKey="system_AI" width={120}>
                System AI
              </SortableHeader>
              
              {/* Issue columns - Editable fields without scrollable containers */}
              <SortableHeader columnKey="issue" width={120}>
                Issue
              </SortableHeader>
              <SortableHeader columnKey="issue_AI" width={120}>
                Issue AI
              </SortableHeader>
              
              {/* Root Cause columns with scrollable containers */}
              <SortableHeader columnKey="root_Cause" width={900}>
                Root Cause
              </SortableHeader>
              <SortableHeader columnKey="root_Cause_AI" width={900}>
                Root Cause AI
              </SortableHeader>
              
              {/* Duplicate columns - Editable fields using chips */}
              <SortableHeader columnKey="duplicate" width={100}>
                Duplicate
              </SortableHeader>
              <SortableHeader columnKey="duplicate_AI" width={100}>
                Duplicate AI
              </SortableHeader>
              
              <SortableHeader columnKey="openDate" width={140}>
                Open Date
              </SortableHeader>
              <SortableHeader columnKey="updatedDate" width={140}>
                Updated Date
              </SortableHeader>
              <SortableHeader columnKey="openDate_Year" width={80}>
                Open Year
              </SortableHeader>
              <SortableHeader columnKey="openDate_Month" width={80}>
                Open Month
              </SortableHeader>
              <SortableHeader columnKey="openDate_Day" width={80}>
                Open Day
              </SortableHeader>
              <SortableHeader columnKey="updatedDate_Year" width={80}>
                Updated Year
              </SortableHeader>
              <SortableHeader columnKey="updatedDate_Month" width={80}>
                Updated Month
              </SortableHeader>
              <SortableHeader columnKey="updatedDate_Day" width={80}>
                Updated Day
              </SortableHeader>
              <TableCell sx={{ fontWeight: 'bold', width: 100, padding: '12px 6px', fontSize: '0.9rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={34} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" fontSize="0.9rem">
                    Loading activities...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedActivities.length > 0 ? (
              paginatedActivities.map((activity) => (
                <TableRow 
                  key={activity.id}
                  onClick={() => onRowClick?.(activity)}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': onRowClick ? { backgroundColor: '#f5f5f5' } : {},
                    height: '120px'
                  }}
                >
                  {/* ID Column */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Typography variant="body2" fontSize="0.85rem" sx={{ lineHeight: '1.3' }}>
                      {activity.id}
                    </Typography>
                  </TableCell>

                  {/* Read-only Columns */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Typography variant="body2" fontSize="0.9rem" fontWeight="medium" sx={{ lineHeight: '1.3' }}>
                      {getDisplayValue(activity.incidentNumber)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Typography variant="body2" fontSize="0.9rem" sx={{ lineHeight: '1.3' }}>
                      {getDisplayValue(activity.assignedGroup)}
                    </Typography>
                  </TableCell>
                  
                  {/* Long Description Column with scrollable box */}
                  <TableCell sx={{ padding: '6px 8px' }}>
                    {renderScrollableCell(activity.longDescription, { fontSize: '0.95rem', height: '200px' })}
                  </TableCell>
                  
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Typography variant="body2" fontSize="0.9rem" sx={{ lineHeight: '1.3' }}>
                      {getDisplayValue(activity.team_Fixed_Issue)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Typography variant="body2" fontSize="0.9rem" sx={{ lineHeight: '1.3' }}>
                      {getDisplayValue(activity.team_Included_in_Ticket)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Typography variant="body2" fontSize="0.9rem" sx={{ lineHeight: '1.3' }}>
                      {getDisplayValue(activity.serviceOwner)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 0.75,
                        py: 0.5,
                        borderRadius: 0.75,
                        backgroundColor: getPriorityColor(activity.priority),
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        lineHeight: '1.3'
                      }}
                    >
                      {getDisplayValue(activity.priority)}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.guided_SLAdays, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.met_SLA, { useChip: true, chipColor: activity.met_SLA === 'Yes' ? "success" : "default" })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.extraDays_AfterSLAdays, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    <Chip 
                      label={activity.numberTeam_Included_in_Ticket}
                      size="small"
                      color={activity.numberTeam_Included_in_Ticket > 0 ? "primary" : "default"}
                      sx={{ height: '28px', fontSize: '0.8rem' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    <Chip 
                      label={activity.numberTeam_Fixed_Issue}
                      size="small"
                      color={activity.numberTeam_Fixed_Issue > 0 ? "primary" : "default"}
                      sx={{ height: '28px', fontSize: '0.8rem' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.is_AissignedGroup_ResponsibleTeam, { useChip: true, chipColor: activity.is_AissignedGroup_ResponsibleTeam === 'Yes' ? "success" : "default" })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.did_AssignedGroup_Fix_Issue, { useChip: true, chipColor: activity.did_AssignedGroup_Fix_Issue === 'Yes' ? "success" : "default" })}
                  </TableCell>
                  
                  {/* Summary Issue - Now editable with scrollable container */}
                  <TableCell sx={{ padding: '6px 8px' }}>
                    {renderEditableCell(activity, 'summary_Issue', activity.summary_Issue)}
                  </TableCell>
                  
                  {/* Summary Issue AI with scrollable container */}
                  <TableCell sx={{ padding: '6px 8px' }}>
                    {renderScrollableCell(activity.summary_Issue_AI, { fontSize: '0.95rem', height: '200px' })}
                  </TableCell>

                  {/* System - Editable field without scrollable container */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    {renderEditableCell(activity, 'system', activity.system)}
                  </TableCell>
                  
                  {/* System AI - Read-only field without scrollable container */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.system_AI, { fontSize: '0.9rem' })}
                  </TableCell>
                  
                  {/* Issue - Editable field without scrollable container */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    {renderEditableCell(activity, 'issue', activity.issue)}
                  </TableCell>
                  
                  {/* Issue AI - Read-only field without scrollable container */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.issue_AI, { fontSize: '0.9rem' })}
                  </TableCell>
                  
                  {/* Root Cause with scrollable container (editable) */}
                  <TableCell sx={{ padding: '6px 8px' }}>
                    {renderEditableCell(activity, 'root_Cause', activity.root_Cause)}
                  </TableCell>
                  
                  {/* Root Cause AI with scrollable container */}
                  <TableCell sx={{ padding: '6px 8px' }}>
                    {renderScrollableCell(activity.root_Cause_AI, { fontSize: '0.95rem', height: '200px' })}
                  </TableCell>
                  
                  {/* Duplicate - Editable field using chips */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    {renderEditableCell(activity, 'duplicate', activity.duplicate)}
                  </TableCell>
                  
                  {/* Duplicate AI - Read-only field using chips */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.duplicate_AI, { useChip: true, chipColor: activity.duplicate_AI === 'Yes' ? "warning" : "default" })}
                  </TableCell>

                  {/* Read-only Date Columns */}
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
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.openDate_Year, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.openDate_Month, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.openDate_Day, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.updatedDate_Year, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.updatedDate_Month, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '6px 4px' }}>
                    {renderReadOnlyCell(activity.updatedDate_Day, { align: 'center', fontSize: '0.9rem' })}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell sx={{ padding: '6px 4px' }}>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => handleDelete(activity.id, e)}
                      title="Delete activity"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={34} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem">
                    No activities found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {enablePagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedActivities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

// Simplified ActivitySummary without total activities, unique groups, met SLA, and P4
export const ActivitySummary: React.FC<{ activities: ActivityResponse[] }> = ({ activities }) => {
  const summary = React.useMemo(() => {
    const byPriority = activities.reduce((acc, activity) => {
      // Only show P1, P2, P3 - exclude P4 and others
      if (['P1', 'P2', 'P3'].includes(activity.priority)) {
        acc[activity.priority] = (acc[activity.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { byPriority };
  }, [activities]);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {Object.entries(summary.byPriority).map(([priority, count]) => (
        <Paper key={priority} sx={{ p: 2, minWidth: 100 }}>
          <Typography variant="h6" align="center">{count}</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {priority}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ActivityTable;