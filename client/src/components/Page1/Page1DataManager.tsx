import type { TicketRow } from '../../types'
import { dataService } from '../../services/dataService'

export interface SaveResult {
  success: boolean;
  updatedData?: TicketRow[];
  message?: string;
}

export class Page1DataManager {
  private defaultData: TicketRow[];
  private storageKey: string;

  constructor(defaultData: TicketRow[], storageKey: string) {
    this.defaultData = defaultData;
    this.storageKey = storageKey;
  }

  // Helper function to ensure data has valid IDs
  ensureValidData = (data: TicketRow[]): TicketRow[] => {
    return data.map((row, index) => ({
      ...this.defaultData[0],
      ...row,
      id: row.id && typeof row.id === 'string' ? row.id : `temp-${Date.now()}-${index}`
    }));
  };

  // Helper function to check if a row is empty (has only default values)
  isEmptyRow = (row: TicketRow): boolean => {
    return (
      !row.incidentNumber &&
      !row.longDescription &&
      !row.serviceOwner &&
      !row.priority &&
      (!row.openDate || row.openDate === '') &&
      (!row.updatedDate || row.updatedDate === '')
    );
  };

  // Check for duplicate incident numbers in the data
  hasDuplicateIncidentNumbers = (data: TicketRow[]): { hasDuplicates: boolean; duplicates: Map<string, number[]> } => {
    const incidentNumberMap = new Map<string, number[]>();
    const duplicates = new Map<string, number[]>();
    
    data.forEach((row, index) => {
      if (row.incidentNumber && row.incidentNumber.trim() !== '') {
        const incidentNumber = row.incidentNumber.trim();
        if (incidentNumberMap.has(incidentNumber)) {
          const existingIndexes = incidentNumberMap.get(incidentNumber) || [];
          const updatedIndexes = [...existingIndexes, index + 1]; // 1-based for user display
          incidentNumberMap.set(incidentNumber, updatedIndexes);
          duplicates.set(incidentNumber, updatedIndexes);
        } else {
          incidentNumberMap.set(incidentNumber, [index + 1]);
        }
      }
    });
    
    return {
      hasDuplicates: duplicates.size > 0,
      duplicates
    };
  };

  // Get duplicate incident numbers with details
  getDuplicateIncidentNumbers = (data: TicketRow[]): { incidentNumber: string; rowIndexes: number[] }[] => {
    const duplicateResult = this.hasDuplicateIncidentNumbers(data);
    const duplicates: { incidentNumber: string; rowIndexes: number[] }[] = [];
    
    duplicateResult.duplicates.forEach((rowIndexes, incidentNumber) => {
      if (rowIndexes.length > 1) {
        duplicates.push({
          incidentNumber,
          rowIndexes
        });
      }
    });
    
    return duplicates;
  };

  // Check if a row has all required fields populated
  isRowComplete = (row: TicketRow): boolean => {
    // Define required fields - adjust based on your business rules
    const requiredFields: (keyof TicketRow)[] = [
      'incidentNumber',
      'assignedGroup', 
      'longDescription',
      'teamFixedIssue',
      'teamIncludedInTicket',
      'serviceOwner',
      'priority',
      'openDate',
      'updatedDate'
    ];

    return requiredFields.every(field => {
      const value = row[field];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // Get incomplete rows with details about missing fields
  getIncompleteRows = (data: TicketRow[]): { rowIndex: number; rowId: string; missingFields: string[] }[] => {
    const incompleteRows: { rowIndex: number; rowId: string; missingFields: string[] }[] = [];
    
    data.forEach((row, index) => {
      const missingFields: string[] = [];
      
      // Check each required field
      if (!row.incidentNumber || row.incidentNumber.trim() === '') {
        missingFields.push('Incident Number');
      }
      if (!row.assignedGroup || row.assignedGroup.trim() === '') {
        missingFields.push('Assigned Group');
      }
      if (!row.longDescription || row.longDescription.trim() === '') {
        missingFields.push('Long Description');
      }
      if (!row.teamFixedIssue || row.teamFixedIssue.trim() === '') {
        missingFields.push('Team Fixed Issue');
      }
      if (!row.teamIncludedInTicket || row.teamIncludedInTicket.trim() === '') {
        missingFields.push('Team Included in Ticket');
      }
      if (!row.serviceOwner || row.serviceOwner.trim() === '') {
        missingFields.push('Service Owner');
      }
      if (!row.priority || row.priority.trim() === '') {
        missingFields.push('Priority');
      }
      if (!row.openDate || row.openDate.trim() === '') {
        missingFields.push('Open Date');
      }
      if (!row.updatedDate || row.updatedDate.trim() === '') {
        missingFields.push('Updated Date');
      }
      
      if (missingFields.length > 0) {
        incompleteRows.push({
          rowIndex: index + 1, // 1-based for user display
          rowId: row.id,
          missingFields
        });
      }
    });
    
    return incompleteRows;
  };

  // Load data from localStorage
  loadData = (): TicketRow[] => {
    console.log('🔍 Loading data from localStorage...');
    const savedData = localStorage.getItem(this.storageKey);
    console.log('📦 Raw saved data:', savedData);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('✅ Parsed data successfully:', parsedData);
        
        // Validate that we have an array with at least one object
        if (Array.isArray(parsedData) && parsedData.length > 0 && typeof parsedData[0] === 'object') {
          const validatedData = this.ensureValidData(parsedData);
          return validatedData;
        } else {
          console.warn('⚠️ Invalid data structure, using defaults');
          return this.defaultData;
        }
      } catch (error) {
        console.error('❌ Error parsing data from localStorage:', error);
        return this.defaultData;
      }
    } else {
      console.log('📝 No saved data found, using defaults');
      return this.defaultData;
    }
  };

  // Save data to localStorage
  saveData = (data: TicketRow[]): void => {
    const validatedData = this.ensureValidData(data);
    localStorage.setItem(this.storageKey, JSON.stringify(validatedData));
    console.log('💾 Data saved to localStorage:', validatedData);
  };

  // Clear data (COMPLETELY reset to defaults)
  clearData = (): TicketRow[] => {
    console.log('🗑️ Clearing ALL data from localStorage and resetting to defaults...');
    
    // Remove from localStorage
    localStorage.removeItem(this.storageKey);
    
    // Return a fresh copy of default data
    const freshDefaultData = this.defaultData.map(row => ({
      ...row,
      id: `temp-${Date.now()}`
    }));
    
    console.log('✅ Data cleared, returning fresh defaults:', freshDefaultData);
    return freshDefaultData;
  };

  // NEW: Simplified save data to backend - NO ID SYNC
  saveToBackend = async (
    tableData: TicketRow[], 
    showSnackbar: (message: string, severity: 'success' | 'error' | 'warning' | 'info', duration: number | null) => void
  ): Promise<SaveResult> => {
    const validatedData = this.ensureValidData(tableData);
    
    if (validatedData.length === 0) {
      showSnackbar('No data to save', 'error', null);
      return { success: false, message: 'No data to save' };
    }

    // Check for duplicate incident numbers before any backend calls
    const duplicateResult = this.hasDuplicateIncidentNumbers(validatedData);
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
      return { success: false, message: 'Duplicate incident numbers detected' };
    }

    // Check for incomplete rows before sending to backend
    const incompleteRows = this.getIncompleteRows(validatedData);
    if (incompleteRows.length > 0) {
      const incompleteDetails = incompleteRows.map(row => 
        `Row ${row.rowIndex} (ID: ${row.rowId}): Missing ${row.missingFields.join(', ')}`
      ).join('\n');
      
      showSnackbar(
        `Cannot save: ${incompleteRows.length} incomplete row(s) detected. Please fill in all required fields.\n\nIncomplete rows:\n${incompleteDetails}`,
        'error',
        null
      );
      return { success: false, message: 'Incomplete rows detected' };
    }

    // Check for empty rows before sending to backend
    const emptyRows = validatedData.filter(row => this.isEmptyRow(row));
    if (emptyRows.length > 0) {
      const emptyRowDetails = emptyRows.map((row, index) => 
        `Row ${validatedData.indexOf(row) + 1} (ID: ${row.id})`
      ).join(', ');
      
      showSnackbar(
        `Cannot save: ${emptyRows.length} empty row(s) detected. Please fill in required fields.\nEmpty rows: ${emptyRowDetails}`,
        'error',
        null
      );
      return { success: false, message: 'Empty rows detected' };
    }

    try {
      // Send data to backend and get response
      const backendResponses = await dataService.savePage1Data(validatedData);
      
      console.log('🔄 BACKEND RESPONSES:', backendResponses);
      
      // Track problematic rows and successful updates
      const problematicRows: { index: number; id: string; incidentNumber: string; reason: string; method?: string }[] = [];
      const successfulUpdates: { index: number; id: string; incidentNumber: string; method: string }[] = [];
      
      // Create new table data using backend responses
      const updatedData = backendResponses.map((backendResponse, index) => {
        console.log(`Processing row ${index}:`, backendResponse);
        
        let backendId: string | undefined;
        let isSuccess = false;
        let errorReason = '';
        let method = 'UNKNOWN';
        const originalId = validatedData[index].id;
        const originalIncidentNumber = validatedData[index].incidentNumber || 'No Incident Number';
        
        // Process response
        if (backendResponse && typeof backendResponse === 'object') {
          backendId = backendResponse.id || backendResponse.Id || backendResponse.ID;
          method = backendResponse.method || 'UNKNOWN';
          
          if (backendResponse.success === true && backendId) {
            isSuccess = true;
            console.log(`✅ ${method} Success - Backend ID: ${backendId} (was: ${originalId})`);
          } else if (backendResponse.success === false) {
            errorReason = backendResponse.error || `${method} operation failed`;
            isSuccess = false;
            console.log(`❌ ${method} Failed - Keeping original ID: ${originalId}, Reason: ${errorReason}`);
          }
        } else {
          errorReason = `Invalid response format: ${typeof backendResponse}`;
          isSuccess = false;
          console.error(`❌ Invalid backend response format for row ${index}:`, backendResponse);
        }
        
        if (!isSuccess) {
          const reason = errorReason || 'No backend ID received in response';
          console.warn(`⚠️ ${reason} for row ${index}`);
          problematicRows.push({
            index: index + 1, // Show 1-based index to user
            id: backendId || originalId,
            incidentNumber: originalIncidentNumber,
            reason,
            method
          });
          // Return data with the original ID (keep temp ID if PUT failed)
          return {
            ...validatedData[index],
            id: backendId || originalId
          };
        }
        
        // Track successful update
        successfulUpdates.push({
          index: index + 1,
          id: backendId!,
          incidentNumber: originalIncidentNumber,
          method
        });
        
        console.log(`✅ Frontend ID update: ${originalId} → ${backendId} (Method: ${method})`);
        
        // Use the backend ID (GUID) and keep original data
        return {
          ...validatedData[index],
          id: backendId! // Use backend ID
        };
      });
      
      console.log('✅ Updated data with backend IDs:', updatedData);
      
      // Show collective success message for all rows
      if (problematicRows.length === 0) {
        const putItems = successfulUpdates.filter(item => item.method === 'PUT').length;
        const postItems = successfulUpdates.filter(item => item.method === 'POST').length;
        
        let message = `All ${validatedData.length} record(s) saved successfully!`;
        if (putItems > 0 && postItems > 0) {
          message = `All ${validatedData.length} record(s) saved successfully! ${postItems} new record(s) created, ${putItems} existing record(s) updated.`;
        } else if (postItems > 0) {
          message = `All ${validatedData.length} record(s) saved successfully! ${postItems} new record(s) created.`;
        } else if (putItems > 0) {
          message = `All ${validatedData.length} record(s) saved successfully! ${putItems} existing record(s) updated.`;
        }
        
        // Show individual success details for each row
        const successDetails = successfulUpdates.map(item => 
          `Row ${item.index}: ${item.incidentNumber} (ID: ${item.id}) - ✅ ${item.method}`
        ).join('\n');
        
        showSnackbar(`${message}\n\nSuccess details:\n${successDetails}`, 'success', null);
        
        return { success: true, updatedData };
      } else {
        // Some rows failed - show collective message with all details
        const successDetails = successfulUpdates.map(item => 
          `Row ${item.index}: ${item.incidentNumber} (ID: ${item.id}) - ✅ ${item.method}`
        ).join('\n');
        
        const errorDetails = problematicRows.map(row => 
          `Row ${row.index}: ${row.incidentNumber} (ID: ${row.id}) - ❌ ${row.method} failed: ${row.reason}`
        ).join('\n');
        
        const severity = problematicRows.length === validatedData.length ? 'error' : 'warning';
        const title = problematicRows.length === validatedData.length ? 'All operations failed' : 'Partial success';
        
        showSnackbar(
          `${title}:\n\n✅ Successful (${successfulUpdates.length}):\n${successDetails || 'None'}\n\n❌ Failed (${problematicRows.length}):\n${errorDetails}`,
          severity,
          null
        );

        // Only return updated data if there were successful updates
        const hasSuccessfulUpdates = successfulUpdates.length > 0;
        return { 
          success: hasSuccessfulUpdates, 
          updatedData: hasSuccessfulUpdates ? updatedData : undefined,
          message: `${successfulUpdates.length} successful, ${problematicRows.length} failed`
        };
      }
      
    } catch (error: any) {
      console.error('❌ Save error:', error);
      
      // Enhanced error message with backend validation details
      let errorMessage = 'Failed to save data to backend';
      
      if (error.type === 'CHECK_ERROR') {
        const incidentNumber = error.incidentNumber || 'Unknown';
        errorMessage = `Error checking existing record for incident ${incidentNumber}: ${error.error?.message || 'Unknown error'}`;
      } else if (error.type === 'PUT_ERROR') {
        const incidentNumber = error.incidentNumber || 'Unknown';
        errorMessage = `Error updating record for incident ${incidentNumber}: ${error.error?.message || 'Unknown error'}`;
      } else if (error.type === 'POST_ERROR') {
        const incidentNumber = error.incidentNumber || 'Unknown';
        errorMessage = `Error creating new record for incident ${incidentNumber}: ${error.error?.message || 'Unknown error'}`;
      } else if (error.response?.data) {
        const backendError = error.response.data;
        
        // Handle the specific 400 validation error from your backend
        if (backendError.status === 400 && backendError.errors) {
          const validationErrors = backendError.errors;
          let validationMessage = 'Backend validation failed:\n';
          
          // Format validation errors
          Object.keys(validationErrors).forEach(field => {
            validationErrors[field].forEach((msg: string) => {
              validationMessage += `• ${field}: ${msg}\n`;
            });
          });
          
          errorMessage = validationMessage;
        } else {
          // Better error message formatting for non-validation errors
          const errorString = typeof backendError === 'string' ? backendError : JSON.stringify(backendError);
          errorMessage += `: ${errorString}`;
        }
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error', null);
      return { success: false, message: errorMessage };
    }
  };
}

export default Page1DataManager;