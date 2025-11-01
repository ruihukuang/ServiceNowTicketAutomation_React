import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { TicketRow } from '../../types';
import {
  renderTextField,
  renderSelectField,
  renderDateTimeField,
  renderSelectWithCustomInput, // NEW: Import custom input component
  renderMultiSelectField,     // UPDATED: Import enhanced multi-select
  fieldOptions
} from './FormFields';

interface TableRowComponentProps {
  row: TicketRow;
  onEdit: (rowId: string, field: keyof TicketRow, value: string) => void;
  onDelete: (rowId: string) => void;
  canDelete: boolean;
}

const TableRowComponent: React.FC<TableRowComponentProps> = ({
  row,
  onEdit,
  onDelete,
  canDelete
}) => {
  const handleFieldEdit = (field: keyof TicketRow, value: string) => {
    onEdit(row.id, field, value);
  };

  const handleSelectChange = (field: keyof TicketRow, value: string) => {
    onEdit(row.id, field, value);
  };

  // NEW: Handler for multi-select changes
  const handleMultiSelectChange = (field: keyof TicketRow, selectedValues: string[]) => {
    // This is handled within the multi-select component itself
  };

  // Check if this is a backend ID (not a temporary one)
  const isBackendId = !row.id.startsWith('temp-');

  return (
    <TableRow>
      {/* ID Column - Non-editable */}
      <TableCell>
        <Tooltip title={isBackendId ? "Backend ID" : "Temporary ID - will be assigned after save"}>
          <Box
            sx={{
              p: 1,
              backgroundColor: isBackendId ? '#e8f5e8' : '#fff3cd',
              borderRadius: 1,
              border: '1px solid',
              borderColor: isBackendId ? '#c8e6c9' : '#ffeaa7',
              textAlign: 'center',
              fontWeight: isBackendId ? 'bold' : 'normal',
              color: isBackendId ? '#2e7d32' : '#856404',
              fontSize: '0.75rem'
            }}
          >
            {isBackendId ? row.id : 'Temp'}
          </Box>
        </Tooltip>
      </TableCell>

      {/* Actions Column */}
      <TableCell>
        <Tooltip title={canDelete ? "Delete row" : "Cannot delete the only row"}>
          <span>
            <IconButton
              onClick={() => onDelete(row.id)}
              disabled={!canDelete}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>

      {/* Incident Number */}
      <TableCell>
        {renderTextField(
          row.id,
          'IncidentNumber',
          row.IncidentNumber || '',
          handleFieldEdit,
          'Enter incident number'
        )}
      </TableCell>

      {/* Assigned Group - UPDATED: Now with dropdown + custom text input */}
      <TableCell>
        {renderSelectWithCustomInput(
          row.id,
          'AssignedGroup',
          row.AssignedGroup || '',
          handleFieldEdit,
          handleSelectChange,
          fieldOptions.assignedGroup,
          'Select or type assigned group'
        )}
      </TableCell>

      {/* Long Description */}
      <TableCell>
        {renderTextField(
          row.id,
          'LongDescription',
          row.LongDescription || '',
          handleFieldEdit,
          'Enter long description',
          { minWidth: 400 },
          true,
          3
        )}
      </TableCell>

      {/* Team Fixed Issue - UPDATED: Now multi-select with custom values */}
      <TableCell>
        {renderMultiSelectField(
          row.id,
          'Team_Fixed_Issue',
          row.Team_Fixed_Issue || '',
          handleFieldEdit,
          handleMultiSelectChange,
          fieldOptions.teamFixedIssue,
          'Select teams that fixed issue'
        )}
      </TableCell>

      {/* Team Included in Ticket - UPDATED: Now multi-select with custom values */}
      <TableCell>
        {renderMultiSelectField(
          row.id,
          'Team_Included_in_Ticket',
          row.Team_Included_in_Ticket || '',
          handleFieldEdit,
          handleMultiSelectChange,
          fieldOptions.teamIncluded,
          'Select teams included in ticket'
        )}
      </TableCell>

      {/* Service Owner */}
      <TableCell>
        {renderSelectField(
          row.id,
          'ServiceOwner',
          row.ServiceOwner || '',
          handleSelectChange,
          fieldOptions.serviceOwner,
          'Select service owner'
        )}
      </TableCell>

      {/* Priority */}
      <TableCell>
        {renderSelectField(
          row.id,
          'Priority',
          row.Priority || '',
          handleSelectChange,
          fieldOptions.priority,
          'Select priority'
        )}
      </TableCell>

      {/* Open Date */}
      <TableCell>
        {renderDateTimeField(
          row.id,
          'OpenDate',
          row.OpenDate || '',
          handleFieldEdit,
          'Select open date and time',
          { width: 200 }
        )}
      </TableCell>

      {/* Updated Date */}
      <TableCell>
        {renderDateTimeField(
          row.id,
          'UpdatedDate',
          row.UpdatedDate || '',
          handleFieldEdit,
          'Select updated date and time',
          { width: 200 }
        )}
      </TableCell>
    </TableRow>
  );
};

export default TableRowComponent;