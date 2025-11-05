import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Paper, Button, Box, Alert } from '@mui/material'
import EditableTable from '../components/Page1/EditableTable'
import IncidentQueryTable from '../components/Page1/IncidentQueryTable'
import { Page1DataManager } from '../components/Page1/Page1DataManager'
import type { TicketRow } from '../types'
import { CustomSnackbar, useSnackbar } from '../components/Page1/snackbar'

// Default data - Start with empty array
const defaultTableData: TicketRow[] = [];

// localStorage key
const STORAGE_KEY = 'ticketData';

const FirstPage: React.FC = () => {
  const [tableData, setTableData] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use the snackbar hook
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Initialize navigation hook
  const navigate = useNavigate();

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
        showSnackbar('Error loading saved data. Using empty template.', 'warning', 6000);
      } finally {
        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever tableData changes
  useEffect(() => {
    if (isInitialized) {
      console.log('💾 Auto-saving data to localStorage:', tableData);
      try {
        dataManager.saveData(tableData);
      } catch (error) {
        console.error('❌ Error auto-saving to localStorage:', error);
        showSnackbar('Error auto-saving data to browser storage', 'error', 3000);
      }
    }
  }, [tableData, isInitialized]);

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

  // Clear All Data - COMPLETELY RESET TO EMPTY
  const handleClearData = () => {
    console.log('🗑️ Clearing all data...');
    
    // Use the data manager to clear data and get the empty template
    const clearedData = dataManager.clearData();
    
    // Force update the state with the cleared data
    setTableData(clearedData);
    
    // Force localStorage update
    dataManager.saveData(clearedData);
    
    showSnackbar('All data cleared! Reset to empty template.', 'info', 6000);
    console.log('✅ Data cleared and reset to empty:', clearedData);
  };

  // UPDATED: Handle row deletion from table - ALLOWS DELETING LAST ROW
  const handleDeleteRow = (rowId: string) => {
    console.log(`🗑️ Deleting row: ${rowId}`);
    
    // CHANGED: Removed restriction - now allows deleting the last row
    const newData = tableData.filter(row => row.id !== rowId);
    
    // Update state
    setTableData(newData);
    
    showSnackbar('Row deleted successfully', 'success', 3000);
    console.log('✅ Row deleted, new data:', newData);
  };

  // Save and Next with validation AND navigation - ALLOWS EMPTY TABLE
  const handleSaveAndNext = async () => {
    setLoading(true);
    try {
      // Check if table is empty - allow navigation for empty table
      if (tableData.length === 0) {
        console.log('📭 Table is empty - allowing navigation to Page 2');
        showSnackbar('Navigating to Page 2 with empty data...', 'info', 2000);
        
        // Navigate to Page 2 after a short delay
        setTimeout(() => {
          navigate('/page2');
        }, 2000);
        return;
      }

      // Only validate duplicate incident numbers if table has data
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

      // Only validate incomplete rows if table has data
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

      // Only save to backend if table has data
      const result = await dataManager.saveToBackend(tableData, showSnackbar);
      
      // Added navigation logic after successful save
      if (result.success) {
        // Update table data with backend IDs if save was successful
        if (result.updatedData) {
          setTableData(result.updatedData);
          
          // Also update localStorage with the new data containing backend IDs
          try {
            dataManager.saveData(result.updatedData);
          } catch (saveError) {
            console.error('❌ Error updating localStorage after backend save:', saveError);
          }
        }
        
        // Show success message and navigate to Page 2
        showSnackbar('Data saved successfully! Navigating to Page 2...', 'success', 2000);
        
        // Navigate to Page 2 after a short delay to show the success message
        setTimeout(() => {
          navigate('/page2');
        }, 2000);
        
      } else {
        // Handle save failure
        showSnackbar('Failed to save data to backend', 'error', null);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      showSnackbar('Failed to save data to backend', 'error', null);
    } finally {
      setLoading(false);
    }
  };

  // Check for duplicate incident numbers (only if table has data)
  const hasDuplicateIncidentNumbers = tableData.length > 0 
    ? dataManager.hasDuplicateIncidentNumbers(tableData).hasDuplicates
    : false;

  // Check if all rows are complete (empty table is considered "complete" for navigation)
  const allRowsComplete = tableData.length === 0 || tableData.every(row => 
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

  // Determine if save button should be enabled - ALLOWS EMPTY TABLE
  const canSave = (tableData.length === 0) || (allRowsComplete && !hasDuplicateIncidentNumbers);

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
          Edit the table below to enter ticket information (or leave empty to proceed)
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
        
        <EditableTable 
          data={tableData} 
          onDataChange={handleDataChange}
          onRowUpdate={handleRowUpdate}
          onDeleteRow={handleDeleteRow}
        />
        
        {/* Incident Query Table - No onIncidentSelect prop */}
        <IncidentQueryTable />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {tableData.length === 0 ? 'Empty table - ready to proceed' : 
             tableData[0]?.incidentNumber ? `Editing: ${tableData[0].incidentNumber}` : 'New ticket'}
            {hasBackendIds && ` | Backend IDs: ${backendIdCount}, Temporary IDs: ${tempIdCount}`}
            {tableData.length > 0 && !allRowsComplete && ' | ⚠️ Incomplete rows'}
            {hasDuplicateIncidentNumbers && ' | ❌ Duplicate Incident Numbers'}
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSaveAndNext}
            disabled={loading || !canSave}
            color={canSave ? 'primary' : 'warning'}
          >
            {loading ? 'Processing...' : 'Save & Next'}
          </Button>
        </Box>

        {/* Warning for duplicate incident numbers */}
        {hasDuplicateIncidentNumbers && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>Duplicate Incident Numbers Detected:</strong> Please ensure each Incident Number is unique across all rows.
            The Save & Next button will be enabled when all Incident Numbers are unique.
          </Alert>
        )}

        {/* Warning for incomplete data - only show when table has data */}
        {tableData.length > 0 && !allRowsComplete && !hasDuplicateIncidentNumbers && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Incomplete Data:</strong> Please fill in all required fields in all rows before saving.
            The Save & Next button will be enabled when all fields are populated.
          </Alert>
        )}

        {/* Info message for empty table */}
        {tableData.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Empty Table:</strong> You can proceed to Page 2 without entering any data. 
            Click "Save & Next" to continue with an empty dataset.
          </Alert>
        )}
      </Paper>

      {/* Custom Snackbar Component */}
      <CustomSnackbar snackbar={snackbar} onClose={hideSnackbar} />
    </Box>
  )
}

export default FirstPage