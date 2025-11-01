import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Today as TodayIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import type { TicketRow } from '../../types';
import {
  formatDateTimeForInput,
  formatDateTimeForDisplay,
  getCurrentDateTime,
  isValidDateTime
} from './DateUtils';

// Default row template
export const defaultRow: TicketRow = {
  id: 'temp-1',
  IncidentNumber: '',
  AssignedGroup: 'ML Operation',
  LongDescription: '',
  Team_Fixed_Issue: 'ML Operation',
  Team_Included_in_Ticket: 'ML Operation',
  ServiceOwner: '',
  Priority: '',
  OpenDate: '',
  UpdatedDate: ''
};

// Field options - UPDATED: Added more team options
export const fieldOptions = {
  assignedGroup: ['ML Operation', 'SageMaker', 'Data Engineering', 'Platform Team', 'Infrastructure'],
  teamFixedIssue: ['ML Operation', 'SageMaker', 'Data Engineering', 'Platform Team', 'Infrastructure', 'Network Team'],
  teamIncluded: ['ML Operation', 'SageMaker', 'Data Engineering', 'Platform Team', 'Infrastructure', 'Security Team'],
  serviceOwner: ['Mark', 'Steve', 'Sarah', 'Mike', 'Jennifer'],
  priority: ['P1', 'P2', 'P3', 'P4']
};

// Helper function to get selected values from text
export const getSelectedValuesFromText = (textValue: string, options: string[]) => {
  if (!textValue) return [];
  
  const values = textValue.split(',').map(v => v.trim()).filter(v => v);
  return values.filter(val => options.includes(val));
};

// Helper function to get all values (both selected from dropdown and custom)
export const getAllValuesFromText = (textValue: string): string[] => {
  if (!textValue) return [];
  return textValue.split(',').map(v => v.trim()).filter(v => v);
};

// Helper function to convert selected values to text
export const convertSelectedValuesToText = (selectedValues: string[]): string => {
  return selectedValues.join(', ');
};

// NEW: Enhanced date-time field renderer
export const renderDateTimeField = (
  rowId: string,
  field: keyof TicketRow,
  value: string,
  onEdit: (field: keyof TicketRow, value: string) => void,
  placeholder: string,
  sx: any = {}
) => {
  const formattedValue = formatDateTimeForInput(value);
  const displayValue = value ? formatDateTimeForDisplay(value) : '';
  
  const handleDateTimeChange = (newValue: string) => {
    onEdit(field, newValue);
  };

  const setToNow = () => {
    handleDateTimeChange(getCurrentDateTime());
  };

  return (
    <Box sx={sx}>
      <TextField
        type="datetime-local"
        value={formattedValue}
        onChange={(e) => handleDateTimeChange(e.target.value)}
        variant="outlined"
        size="small"
        fullWidth
        placeholder={placeholder}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Set to current date and time">
                <IconButton
                  onClick={setToNow}
                  size="small"
                  edge="end"
                >
                  <TimeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        error={!isValidDateTime(value) && value !== ''}
        helperText={!isValidDateTime(value) && value !== '' ? 'Invalid date/time format' : ''}
      />
      
      {/* Display formatted date-time for better UX */}
      {value && (
        <Box
          sx={{
            fontSize: '0.75rem',
            color: 'text.secondary',
            mt: 0.5,
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          {displayValue}
        </Box>
      )}
    </Box>
  );
};

// Render basic text field
export const renderTextField = (
  rowId: string,
  field: keyof TicketRow,
  value: string,
  onEdit: (field: keyof TicketRow, value: string) => void,
  placeholder: string,
  sx: any = {},
  multiline: boolean = false,
  rows: number = 1,
  type: string = 'text'
) => {
  // Handle datetime-local type specifically
  const inputType = type === 'datetime-local' ? 'datetime-local' : type;
  
  return (
    <TextField
      type={inputType}
      value={value}
      onChange={(e) => onEdit(field, e.target.value)}
      variant="outlined"
      size={inputType === 'date' || inputType === 'datetime-local' ? 'small' : 'medium'}
      fullWidth
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      sx={sx}
      InputLabelProps={inputType === 'date' || inputType === 'datetime-local' ? { shrink: true } : undefined}
    />
  );
};

// Render select field
export const renderSelectField = (
  rowId: string,
  field: keyof TicketRow,
  value: string,
  onSelectChange: (field: keyof TicketRow, value: string) => void,
  options: string[],
  placeholder: string
) => {
  return (
    <FormControl fullWidth size="small">
      <Select
        value={value || ''}
        onChange={(e) => onSelectChange(field, e.target.value)}
        displayEmpty
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// NEW: Render select field with text field for custom input
export const renderSelectWithCustomInput = (
  rowId: string,
  field: keyof TicketRow,
  value: string,
  onEdit: (field: keyof TicketRow, value: string) => void,
  onSelectChange: (field: keyof TicketRow, value: string) => void,
  options: string[],
  placeholder: string
) => {
  return (
    <Box>
      <FormControl fullWidth size="small">
        <Select
          value={value || ''}
          onChange={(e) => onSelectChange(field, e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        value={value || ''}
        onChange={(e) => onEdit(field, e.target.value)}
        placeholder="Select from dropdown or type custom value"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mt: 1 }}
        helperText="Choose from dropdown or enter any value"
      />
    </Box>
  );
};

// UPDATED: Enhanced multi-select field with better custom value handling
export const renderMultiSelectField = (
  rowId: string,
  field: keyof TicketRow,
  value: string,
  onEdit: (field: keyof TicketRow, value: string) => void,
  onMultiSelectChange: (field: keyof TicketRow, selectedValues: string[]) => void,
  options: string[],
  placeholder: string
) => {
  const allValues = getAllValuesFromText(value || '');
  const selectedOptions = getSelectedValuesFromText(value || '', options);
  const customValues = allValues.filter(val => !options.includes(val));

  const handleMultiSelectChange = (field: keyof TicketRow, newSelectedOptions: string[]) => {
    // Combine selected options with custom values
    const allSelectedValues = [...newSelectedOptions, ...customValues];
    const newValue = convertSelectedValuesToText(allSelectedValues);
    onEdit(field, newValue);
  };

  const handleTextChange = (newTextValue: string) => {
    onEdit(field, newTextValue);
  };

  return (
    <Box>
      <FormControl fullWidth size="small">
        <Select
          multiple
          value={selectedOptions}
          onChange={(e) => handleMultiSelectChange(field, e.target.value as string[])}
          input={<OutlinedInput />}
          renderValue={(selected) => {
            if (selected.length === 0 && customValues.length === 0) {
              return <em>{placeholder}</em>;
            }
            const allDisplayValues = [...selected, ...customValues];
            return allDisplayValues.join(', ');
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={selectedOptions.indexOf(option) > -1} />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        value={value || ''}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Select from dropdown above or type custom values. Use commas to separate multiple values."
        variant="outlined"
        size="small"
        fullWidth
        multiline
        rows={2}
        sx={{ mt: 1 }}
        helperText={`Selected: ${allValues.length} value(s) - ${selectedOptions.length} from dropdown, ${customValues.length} custom`}
      />
    </Box>
  );
};

// Render ID display field (non-editable)
export const renderIdField = (
  rowId: string,
  value: string
) => {
  const isBackendId = !value.startsWith('temp-');
  
  return (
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
        fontSize: '0.75rem',
        minWidth: '160px',
        maxWidth: '200px',
        width: '100%',
        wordBreak: 'break-all',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {isBackendId ? value : 'Temp'}
    </Box>
  );
};

// Export types for convenience
export type { TicketRow };