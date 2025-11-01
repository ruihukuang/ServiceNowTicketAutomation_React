import React, { useState, useEffect } from 'react'
import { Typography, Paper, Button, Box, Alert } from '@mui/material'
import EditableTable from '../components/Page1/EditableTable'
import IncidentQueryTable from '../components/Page1/IncidentQueryTable'
import { Page1DataManager } from '../components/Page1/Page1DataManager'
import type { TicketRow } from '../types'
import { CustomSnackbar, useSnackbar } from '../components/Page1/snackbar'
import type { IncidentDetails } from '../services/dataService'

// Default data
const defaultTableData: TicketRow[] = [
  {
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
  }
];

// localStorage key
const STORAGE_KEY = 'ticketData';

const FirstPage: React.FC = () => {
  const [tableData, setTableData] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use the snackbar hook
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Initialize data manager
  const dataManager = new Page1DataManager(defaultTableData, STORAGE_KEY);

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log('🔍 Loading data from localStorage...');
    
    const loadData = async () => {
      try {
        const loadedData = await dataManager.loadData();
        setTableData(loadedData);
        console.log('🚀 Set tableData to loaded data:', loadedData);
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setTableData(defaultTableData);
        showSnackbar('Error loading saved data. Using default template.', 'warning', 6000);
      } finally {
        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever tableData changes
  useEffect(() => {
    if (isInitialized && tableData.length > 0) {
      console.log('💾 Auto-saving data to localStorage:', tableData);
      try {
        dataManager.saveData(tableData);
      } catch (error) {
        console.error('❌ Error auto-saving to localStorage:', error);
        showSnackbar('Error auto-saving data to browser storage', 'error', 3000);
      }
    }
  }, [tableData, isInitialized]);

  // Handle incident selection from query table
  const handleIncidentSelect = (incident: IncidentDetails) => {
    console.log('🔄 Loading incident for editing:', incident);
    
    // Convert IncidentDetails to TicketRow format
    const ticketRow: TicketRow = {
      id: incident.id,
      IncidentNumber: incident.incidentNumber,
      AssignedGroup: incident.assignedGroup,
      LongDescription: incident.longDescription,
      Team_Fixed_Issue: incident.teamFixedIssue,
      Team_Included_in_Ticket: incident.teamIncludedInTicket,
      ServiceOwner: incident.serviceOwner,
      Priority: incident.priority,
      OpenDate: incident.openDate,
      UpdatedDate: incident.updatedDate
    };

    // Replace the current table data with the selected incident
    setTableData([ticketRow]);
    showSnackbar(`Incident ${incident.incidentNumber} loaded for editing!`, 'success', 5000);
  };

  // Handle data changes
  const handleDataChange = (newData: TicketRow[]) => {
    console.log('📝 Data changed - updating state only:', newData);
    setTableData(newData);
  };

  // Handle individual row updates
  const handleRowUpdate = (rowId: string, field: keyof TicketRow, value: string) => {
    console.log(`🔄 Row update: ${rowId}, ${field}, ${value}`);
    
    // Update the specific row immediately for responsive UI
    const updatedData = tableData.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    );
    
    setTableData(updatedData);
  };

  // Clear All Data - COMPLETELY RESET TO DEFAULT
  const handleClearData = () => {
    console.log('🗑️ Clearing all data...');
    
    // Use the data manager to clear data and get the default template
    const clearedData = dataManager.clearData();
    
    // Force update the state with the cleared data
    setTableData(clearedData);
    
    // Force localStorage update
    dataManager.saveData(clearedData);
    
    showSnackbar('All data cleared! Reset to default template.', 'info', 6000);
    console.log('✅ Data cleared and reset to defaults:', clearedData);
  };

  // Handle row deletion from table
  const handleDeleteRow = (rowId: string) => {
    console.log(`🗑️ Deleting row: ${rowId}`);
    
    // Prevent deleting the last row
    if (tableData.length <= 1) {
      showSnackbar('You must have at least one row', 'warning', 3000);
      return;
    }
    
    // Filter out the row to delete
    const newData = tableData.filter(row => row.id !== rowId);
    
    // Update state
    setTableData(newData);
    
    showSnackbar('Row deleted successfully', 'success', 3000);
    console.log('✅ Row deleted, new data:', newData);
  };

  // Save and Next with validation
  const handleSaveAndNext = async () => {
    setLoading(true);
    try {
      // Check for duplicate incident numbers before any other validation
      const duplicateResult = dataManager.hasDuplicateIncidentNumbers(tableData);
      if (duplicateResult.hasDuplicates) {
        const duplicateDetails = Array.from(duplicateResult.duplicates.entries())
          .map(([incidentNumber, rowIndexes]) => 
            `Incident "${incidentNumber}" appears in rows: ${rowIndexes.join(', ')}`
          )
          .join('\n');
        
        showSnackbar(
          `Cannot save: Duplicate Incident Numbers detected.\n\nPlease ensure each Incident Number is unique:\n${duplicateDetails}`,
          'error',
          null
        );
        setLoading(false);
        return;
      }

      // Check for incomplete rows before attempting save
      const incompleteRows = dataManager.getIncompleteRows(tableData);
      if (incompleteRows.length > 0) {
        const incompleteDetails = incompleteRows.map(row => 
          `Row ${row.rowIndex}: Missing ${row.missingFields.join(', ')}`
        ).join('\n');
        
        showSnackbar(
          `Cannot save: ${incompleteRows.length} incomplete row(s) detected.\n\nPlease fill in all required fields:\n${incompleteDetails}`,
          'error',
          null
        );
        setLoading(false);
        return;
      }

      const result = await dataManager.saveToBackend(tableData, showSnackbar);
      
      // Update table data with backend IDs if save was successful
      if (result.success && result.updatedData) {
        setTableData(result.updatedData);
        
        // Also update localStorage with the new data containing backend IDs
        try {
          dataManager.saveData(result.updatedData);
        } catch (saveError) {
          console.error('❌ Error updating localStorage after backend save:', saveError);
        }
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      showSnackbar('Failed to save data to backend', 'error', null);
    } finally {
      setLoading(false);
    }
  };

  // Check for duplicate incident numbers
  const hasDuplicateIncidentNumbers = dataManager.hasDuplicateIncidentNumbers(tableData).hasDuplicates;

  // Check if all rows are complete
  const allRowsComplete = tableData.length > 0 && tableData.every(row => 
    dataManager.isRowComplete(row)
  );

  // Safe check for backend IDs
  const hasBackendIds = tableData.some(row => 
    row && row.id && typeof row.id === 'string' && !row.id.startsWith('temp-')
  );

  // Count backend vs temporary IDs
  const backendIdCount = tableData.filter(row => 
    row && row.id && typeof row.id === 'string' && !row.id.startsWith('temp-')
  ).length;
  
  const tempIdCount = tableData.filter(row => 
    row && row.id && typeof row.id === 'string' && row.id.startsWith('temp-')
  ).length;

  // Determine if save button should be enabled
  const canSave = allRowsComplete && !hasDuplicateIncidentNumbers;

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <Box 
        sx={{ 
          width: '100vw', 
          minHeight: '100vh', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3 
        }}
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100vw', 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: 3 
      }}
    >
      <Paper sx={{ 
        p: 4, 
        width: '100%',
        maxWidth: '1400px',
        minHeight: '600px'
      }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" align="center">
          Data Entry & Management
        </Typography>
        <Typography variant="h6" component="p" gutterBottom align="center" sx={{ mb: 3 }}>
          Edit the table below to enter ticket information
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleClearData}
            size="small"
          >
            Clear All Data
          </Button>
          <Alert severity="info" sx={{ flex: 1 }}>
            Data is automatically saved in the browser. Your changes will persist even if you refresh the page or close and reopen it using the same browser.
          </Alert>
        </Box>
        
        {/* UPDATED: Remove ID sync props */}
        <EditableTable 
          data={tableData} 
          onDataChange={handleDataChange}
          onRowUpdate={handleRowUpdate}
          onDeleteRow={handleDeleteRow}
        />
        
        {/* Incident Query Table */}
        <IncidentQueryTable onIncidentSelect={handleIncidentSelect} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {tableData[0]?.IncidentNumber ? `Editing: ${tableData[0].IncidentNumber}` : 'New ticket'}
            {hasBackendIds && ` | Backend IDs: ${backendIdCount}, Temporary IDs: ${tempIdCount}`}
            {!allRowsComplete && ' | ⚠️ Incomplete rows'}
            {hasDuplicateIncidentNumbers && ' | ❌ Duplicate Incident Numbers'}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSaveAndNext}
            disabled={loading || !canSave}
            color={canSave ? 'primary' : 'warning'}
          >
            {loading ? 'Saving...' : 'Save & Next'}
          </Button>
        </Box>

        {/* Warning for duplicate incident numbers */}
        {hasDuplicateIncidentNumbers && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>Duplicate Incident Numbers Detected:</strong> Please ensure each Incident Number is unique across all rows.
            The Save & Next button will be enabled when all Incident Numbers are unique.
          </Alert>
        )}

        {/* Warning for incomplete data */}
        {!allRowsComplete && !hasDuplicateIncidentNumbers && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Incomplete Data:</strong> Please fill in all required fields in all rows before saving.
            The Save & Next button will be enabled when all fields are populated.
          </Alert>
        )}
      </Paper>

      {/* Custom Snackbar Component */}
      <CustomSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </Box>
  )
}

export default FirstPage