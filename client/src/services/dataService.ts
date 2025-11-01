import axios from 'axios';
import type { TicketRow } from '../types';

const API_BASE_URL = 'http://localhost:5226/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface IncidentDetails {
  id: string;
  incidentNumber: string;
  assignedGroup: string;
  longDescription: string;
  teamFixedIssue: string;
  teamIncludedInTicket: string;
  serviceOwner: string;
  priority: string;
  openDate: string;
  updatedDate: string;
}

export const dataService = {
  async savePage1Data(data: TicketRow[]): Promise<any[]> {
    console.log('=== SENDING DATA TO BACKEND ===');
    console.log('Raw data:', data);
    
    try {
      const savedResponses: any[] = [];
      
      for (const item of data) {
        const activityData = { ...item };
        
        console.log('=== PROCESSING ITEM ===');
        console.log('Item ID:', activityData.id);
        console.log('Is temp ID?', activityData.id.startsWith('temp-'));
        console.log('IncidentNumber:', activityData.IncidentNumber);

        // NEW: Simplified logic - only check during save
        let recordExists = false;
        let existingId: string | null = null;

        // Check if record exists by IncidentNumber (only for items with IncidentNumber)
        if (activityData.IncidentNumber && activityData.IncidentNumber.trim() !== '') {
          try {
            console.log(`🔍 Checking if record exists for IncidentNumber: ${activityData.IncidentNumber}`);
            const checkResponse = await apiClient.get(`/FrontEnd/incident/${activityData.IncidentNumber}`);
            
            if (checkResponse.status === 200) {
              existingId = checkResponse.data;
              recordExists = true;
              console.log(`✅ Record exists with ID: ${existingId}`);
            }
          } catch (error: any) {
            // Handle specific 500 error with "Activity with IncidentNumber not found" message
            const errorMessage = error.response?.data?.toString() || error.message || '';
            const isNotFoundError = 
              error.response?.status === 404 || 
              (error.response?.status === 500 && 
               errorMessage.includes('Activity with IncidentNumber') && 
               errorMessage.includes('not found'));
            
            if (isNotFoundError) {
              console.log(`❌ No existing record found for IncidentNumber: ${activityData.IncidentNumber}`);
              recordExists = false;
            } else {
              console.error(`❌ Error checking existing record:`, error);
              throw {
                type: 'CHECK_ERROR',
                incidentNumber: activityData.IncidentNumber,
                error: error
              };
            }
          }
        }

        // Determine whether to use PUT or POST
        if (recordExists && existingId) {
          // Record exists - use PUT with existing ID
          console.log('🔄 EXISTING RECORD FOUND - Using PUT');
          activityData.id = existingId; // Use the existing ID
          console.log('Sending data (PUT):', activityData);
          
          try {
            const response = await apiClient.put('/FrontEnd', activityData);
            console.log('✅ PUT Backend response:', response.data);
            
            if (response.status === 200) {
              const putResponse = {
                id: response.data, // Backend returns the ID
                status: 200,
                method: 'PUT',
                success: true
              };
              savedResponses.push(putResponse);
            } else {
              throw new Error(`PUT failed with status: ${response.status}`);
            }
          } catch (putError: any) {
            console.error('❌ PUT operation failed:', putError);
            const errorResponse = {
              id: activityData.id, // Keep original ID
              status: putError.response?.status || 500,
              method: 'PUT',
              success: false,
              error: putError.message
            };
            savedResponses.push(errorResponse);
            throw {
              type: 'PUT_ERROR',
              incidentNumber: activityData.IncidentNumber,
              error: putError
            };
          }
        } else {
          // New record or no IncidentNumber - use POST
          if (activityData.id.startsWith('temp-')) {
            delete activityData.id; // Remove temp ID for POST
          }
          
          console.log('🆕 NEW RECORD - Using POST');
          console.log('Sending data (POST):', activityData);
          
          try {
            const response = await apiClient.post('/FrontEnd', activityData);
            console.log('✅ POST Backend response:', response.data);
            console.log('✅ POST Response status:', response.status);
            
            if (response.status === 200 || response.status === 201) {
              let backendId: string;
              
              // Handle different response formats
              if (typeof response.data === 'string') {
                backendId = response.data;
                console.log(`🎯 Captured backend ID from string response: ${backendId}`);
              } else if (response.data && typeof response.data === 'object') {
                backendId = response.data.id || response.data.Id || response.data.ID;
                console.log(`🎯 Captured backend ID from object response: ${backendId}`);
              } else {
                throw new Error(`Invalid POST response format: ${typeof response.data}`);
              }
              
              if (!backendId || typeof backendId !== 'string') {
                throw new Error(`No valid ID received in POST response: ${JSON.stringify(response.data)}`);
              }
              
              console.log(`✅ POST successful, new record created with ID: ${backendId}`);
              const postResponse = {
                id: backendId,
                status: response.status,
                method: 'POST',
                success: true
              };
              savedResponses.push(postResponse);
            } else {
              throw new Error(`POST failed with status: ${response.status}`);
            }
          } catch (postError: any) {
            console.error('❌ POST operation failed:', postError);
            
            // Handle specific "not found" error that should use POST
            const errorMessage = postError.response?.data?.toString() || '';
            const isNotFoundError = 
              postError.response?.status === 404 || 
              (postError.response?.status === 500 && 
               errorMessage.includes('Activity with IncidentNumber') && 
               errorMessage.includes('not found'));
            
            if (isNotFoundError) {
              console.log('🔄 Not found error - retrying with POST');
              // This should not happen in this simplified flow, but keeping for safety
              try {
                const retryResponse = await apiClient.post('/FrontEnd', activityData);
                console.log('✅ POST retry successful:', retryResponse.data);
                savedResponses.push(retryResponse.data);
              } catch (retryError: any) {
                console.error('❌ POST retry failed:', retryError);
                throw {
                  type: 'POST_ERROR',
                  incidentNumber: activityData.IncidentNumber,
                  error: retryError
                };
              }
            } else {
              throw {
                type: 'POST_ERROR',
                incidentNumber: activityData.IncidentNumber,
                error: postError
              };
            }
          }
        }
      }
      
      return savedResponses;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Backend error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(`Failed to save data: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      console.error('❌ API Error:', error);
      throw error;
    }
  },

  // Get ALL incident details by incident number (returns array)
  async getIncidentByNumber(incidentNumber: string): Promise<IncidentDetails[]> {
    console.log('🔍 Fetching ALL incident details for:', incidentNumber);
    
    try {
      const response = await apiClient.get(`/FrontEnd/incident/details/${incidentNumber}`);
      console.log('✅ Incident details response:', response.data);
      
      // Transform the response array to match IncidentDetails interface
      const incidentDetails: IncidentDetails[] = response.data.map((item: any) => ({
        id: item.id,
        incidentNumber: item.incidentNumber,
        assignedGroup: item.assignedGroup,
        longDescription: item.longDescription,
        teamFixedIssue: item.teamFixedIssue,
        teamIncludedInTicket: item.teamIncludedInTicket,
        serviceOwner: item.serviceOwner,
        priority: item.priority,
        openDate: item.openDate,
        updatedDate: item.updatedDate
      }));
      
      return incidentDetails;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching incident details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Handle specific 500 error with "not found" message
        const errorMessage = error.response?.data?.toString() || '';
        const isNotFoundError = 
          error.response?.status === 404 || 
          error.response?.status === 500 && 
          errorMessage.includes('Activity with IncidentNumber') && 
          errorMessage.includes('not found');
        
        if (isNotFoundError) {
          throw new Error(`No incidents found with number "${incidentNumber}"`);
        } else if (error.response?.status === 500) {
          throw new Error(`Server error while fetching incidents "${incidentNumber}"`);
        }
      }
      console.error('❌ API Error fetching incidents:', error);
      throw new Error(`Failed to fetch incident details: ${error}`);
    }
  },

  // Delete incident by ID
  async deleteIncident(id: string): Promise<void> {
    console.log('🗑️ Deleting incident with ID:', id);
    
    try {
      const response = await apiClient.delete(`/FrontEnd/${id}`);
      console.log('✅ Delete incident response:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error deleting incident:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 404) {
          throw new Error(`Incident with ID "${id}" not found`);
        } else if (error.response?.status === 500) {
          throw new Error(`Server error while deleting incident`);
        }
      }
      console.error('❌ API Error deleting incident:', error);
      throw new Error(`Failed to delete incident: ${error}`);
    }
  }
};