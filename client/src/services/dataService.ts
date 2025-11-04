// src/services/dataService.ts
import axios from 'axios';
import type { TicketRow } from '../types';
import type { IncidentDetails } from '../types';
import type { ActivityResponse } from '../types';
import { aiProcessingService } from './aiProcessingService';

const API_BASE_URL = 'http://localhost:5226/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dataService = {
  // FIXED: Updated saveReviewedData method to send individual activities
  async saveReviewedData(activities: ActivityResponse[]): Promise<any> {
    console.log('💾 Saving reviewed data to backend...');
    console.log(`📤 Sending ${activities.length} activities to backend`);
    
    // Validate data before sending
    if (!activities || activities.length === 0) {
      throw new Error('No activities provided for saving');
    }

    try {
      const savedResults: any[] = [];
      
      // FIXED: Send each activity individually as the backend expects single Activity objects
      for (const activity of activities) {
        console.log(`🔄 Processing activity ${activity.id} with incident ${activity.incidentNumber}`);
        
        // FIXED: Create the exact structure backend expects
        const backendActivity = {
          id: activity.id,
          incidentNumber: activity.incidentNumber,
          assignedGroup: activity.assignedGroup,
          longDescription: activity.longDescription,
          team_Fixed_Issue: activity.team_Fixed_Issue,
          team_Included_in_Ticket: activity.team_Included_in_Ticket,
          serviceOwner: activity.serviceOwner,
          priority: activity.priority,
          guided_SLAdays: activity.guided_SLAdays,
          met_SLA: activity.met_SLA,
          extraDays_AfterSLAdays: activity.extraDays_AfterSLAdays,
          numberTeam_Included_in_Ticket: activity.numberTeam_Included_in_Ticket,
          numberTeam_Fixed_Issue: activity.numberTeam_Fixed_Issue,
          is_AissignedGroup_ResponsibleTeam: activity.is_AissignedGroup_ResponsibleTeam,
          did_AssignedGroup_Fix_Issue: activity.did_AssignedGroup_Fix_Issue,
          summary_Issue: activity.summary_Issue,
          summary_Issue_AI: activity.summary_Issue_AI,
          system: activity.system,
          system_AI: activity.system_AI,
          issue: activity.issue,
          issue_AI: activity.issue_AI,
          root_Cause: activity.root_Cause,
          root_Cause_AI: activity.root_Cause_AI,
          duplicate: activity.duplicate,
          duplicate_AI: activity.duplicate_AI,
          openDate: activity.openDate,
          updatedDate: activity.updatedDate,
          openDate_Year: activity.openDate_Year,
          openDate_Month: activity.openDate_Month,
          openDate_Day: activity.openDate_Day,
          updatedDate_Year: activity.updatedDate_Year,
          updatedDate_Month: activity.updatedDate_Month,
          updatedDate_Day: activity.updatedDate_Day
        };

        // FIXED: Remove undefined or null values to avoid validation issues
        Object.keys(backendActivity).forEach(key => {
          if (backendActivity[key as keyof typeof backendActivity] === undefined || 
              backendActivity[key as keyof typeof backendActivity] === null) {
            delete backendActivity[key as keyof typeof backendActivity];
          }
        });

        // FIXED: Log the exact data being sent for debugging
        console.log('🔍 Backend activity data being sent:', {
          id: backendActivity.id,
          incidentNumber: backendActivity.incidentNumber,
          assignedGroup: backendActivity.assignedGroup,
          longDescription: backendActivity.longDescription ? `${backendActivity.longDescription.substring(0, 100)}...` : 'empty',
          summary_Issue: backendActivity.summary_Issue,
          system: backendActivity.system,
          issue: backendActivity.issue
        });

        // FIXED: Try different request structures to match backend expectations
        let response;
        
        // Option 1: Try sending as direct activity object
        console.log('🔄 Attempting to send as direct activity object...');
        try {
          response = await apiClient.put('/FrontEnd', backendActivity, {
            timeout: 30000,
            validateStatus: function (status) {
              return status < 500;
            }
          });
        } catch (error: any) {
          // Option 2: If direct object fails, try wrapping in activity property
          if (error.response?.status === 400) {
            console.log('🔄 Direct object failed, trying with activity wrapper...');
            const wrappedData = {
              activity: backendActivity
            };
            
            response = await apiClient.put('/FrontEnd', wrappedData, {
              timeout: 30000,
              validateStatus: function (status) {
                return status < 500;
              }
            });
          } else {
            throw error;
          }
        }

        console.log(`✅ Activity ${activity.incidentNumber} saved successfully:`, response.data);
        console.log('✅ Response status:', response.status);
        
        if (response.status === 400) {
          console.error('❌ Backend validation failed for activity:', backendActivity);
          throw new Error(`Backend validation error for activity ${activity.incidentNumber}: ${JSON.stringify(response.data)}`);
        }
        
        savedResults.push({
          id: activity.id,
          incidentNumber: activity.incidentNumber,
          status: response.status,
          data: response.data
        });
      }
      
      return {
        success: true,
        message: `Successfully saved ${activities.length} reviewed records`,
        data: savedResults,
        status: 200
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error saving reviewed data:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data ? JSON.parse(error.config.data) : 'No data'
          }
        });
        
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          console.error('🔍 Detailed 400 error analysis:', {
            errorType: errorData.type,
            title: errorData.title,
            errors: errorData.errors,
            traceId: errorData.traceId
          });
          
          throw new Error(`Backend validation error: ${errorData.title}. Check console for details.`);
        } else if (error.response?.status === 404) {
          throw new Error('FrontEnd endpoint not found');
        } else if (error.response?.status === 500) {
          throw new Error('Server error while saving reviewed data');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - server took too long to respond');
        }
      }
      console.error('❌ API Error saving reviewed data:', error);
      throw new Error(`Failed to save reviewed data: ${error}`);
    }
  },

  // Get review data from ReviewList endpoint
  async getReviewData(): Promise<ActivityResponse[]> {
    console.log('🔍 Fetching review data from backend...');
    
    try {
      const response = await apiClient.get('/FrontEnd/ReviewList');
      console.log('✅ Review data response:', response.data);
      
      if (response.data && response.data.length > 0) {
        console.log('🔍 First review item fields:', Object.keys(response.data[0]));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching review data:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 404) {
          throw new Error('ReviewList endpoint not found');
        } else if (error.response?.status === 500) {
          throw new Error('Server error while fetching review data');
        }
      }
      console.error('❌ API Error fetching review data:', error);
      throw new Error(`Failed to fetch review data: ${error}`);
    }
  },

  // AI Processing method
  async processWithAI(): Promise<any> {
    console.log('🚀 Starting AI data processing through dataService...');
    try {
      const results = await aiProcessingService.processActivitiesWithAI();
      return results;
    } catch (error) {
      console.error('❌ AI processing failed in dataService:', error);
      throw error;
    }
  },

  // Save Page 1 data (existing functionality - unchanged)
  async savePage1Data(data: TicketRow[]): Promise<any[]> {
    console.log('=== SENDING DATA TO BACKEND ===');
    console.log('Raw data:', data);
    
    try {
      const savedResponses: any[] = [];
      
      for (const item of data) {
        // TRANSFORM: Frontend (camelCase) → Backend (PascalCase/snake_case)
        const activityData: IncidentDetails = {
          id: item.id,
          incidentNumber: item.incidentNumber,
          assignedGroup: item.assignedGroup,
          longDescription: item.longDescription,
          team_Fixed_Issue: item.teamFixedIssue,
          team_Included_in_Ticket: item.teamIncludedInTicket,
          serviceOwner: item.serviceOwner,
          priority: item.priority,
          openDate: item.openDate,
          updatedDate: item.updatedDate
        };

        console.log('=== PROCESSING ITEM ===');
        console.log('Item ID:', activityData.id);
        console.log('Is temp ID?', activityData.id.startsWith('temp-'));
        console.log('IncidentNumber:', activityData.incidentNumber);

        let recordExists = false;
        let existingId: string | null = null;

        if (activityData.incidentNumber && activityData.incidentNumber.trim() !== '') {
          try {
            console.log(`🔍 Checking if record exists for IncidentNumber: ${activityData.incidentNumber}`);
            const checkResponse = await apiClient.get(`/FrontEnd/incident/${activityData.incidentNumber}`);
            
            if (checkResponse.status === 200) {
              existingId = checkResponse.data;
              recordExists = true;
              console.log(`✅ Record exists with ID: ${existingId}`);
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.toString() || error.message || '';
            const isNotFoundError = 
              error.response?.status === 404 || 
              (error.response?.status === 500 && 
               errorMessage.includes('Activity with IncidentNumber') && 
               errorMessage.includes('not found'));
            
            if (isNotFoundError) {
              console.log(`❌ No existing record found for IncidentNumber: ${activityData.incidentNumber}`);
              recordExists = false;
            } else {
              console.error(`❌ Error checking existing record:`, error);
              throw {
                type: 'CHECK_ERROR',
                incidentNumber: activityData.incidentNumber,
                error: error
              };
            }
          }
        }

        if (recordExists && existingId) {
          console.log('🔄 EXISTING RECORD FOUND - Using PUT');
          activityData.id = existingId;
          console.log('Sending data (PUT):', activityData);
          
          try {
            const response = await apiClient.put('/FrontEnd', activityData);
            console.log('✅ PUT Backend response:', response.data);
            
            if (response.status === 200) {
              const putResponse = {
                id: response.data,
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
              id: activityData.id,
              status: putError.response?.status || 500,
              method: 'PUT',
              success: false,
              error: putError.message
            };
            savedResponses.push(errorResponse);
            throw {
              type: 'PUT_ERROR',
              incidentNumber: activityData.incidentNumber,
              error: putError
            };
          }
        } else {
          if (activityData.id.startsWith('temp-')) {
            delete activityData.id;
          }
          
          console.log('🆕 NEW RECORD - Using POST');
          console.log('Sending data (POST):', activityData);
          
          try {
            const response = await apiClient.post('/FrontEnd', activityData);
            console.log('✅ POST Backend response:', response.data);
            console.log('✅ POST Response status:', response.status);
            
            if (response.status === 200 || response.status === 201) {
              let backendId: string;
              
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
            
            const errorMessage = postError.response?.data?.toString() || '';
            const isNotFoundError = 
              postError.response?.status === 404 || 
              (postError.response?.status === 500 && 
               errorMessage.includes('Activity with IncidentNumber') && 
               errorMessage.includes('not found'));
            
            if (isNotFoundError) {
              console.log('🔄 Not found error - retrying with POST');
              try {
                const retryResponse = await apiClient.post('/FrontEnd', activityData);
                console.log('✅ POST retry successful:', retryResponse.data);
                savedResponses.push(retryResponse.data);
              } catch (retryError: any) {
                console.error('❌ POST retry failed:', retryError);
                throw {
                  type: 'POST_ERROR',
                  incidentNumber: activityData.incidentNumber,
                  error: retryError
                };
              }
            } else {
              throw {
                type: 'POST_ERROR',
                incidentNumber: activityData.incidentNumber,
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

  async getIncidentByNumber(incidentNumber: string): Promise<TicketRow[]> {
    console.log('🔍 Fetching ALL incident details for:', incidentNumber);
    
    try {
      const response = await apiClient.get(`/FrontEnd/incident/details/${incidentNumber}`);
      console.log('✅ Incident details response:', response.data);
      
      if (response.data && response.data.length > 0) {
        console.log('🔍 Backend field names in first item:', Object.keys(response.data[0]));
      }
      
      const incidentDetails: TicketRow[] = response.data.map((item: any) => {
        console.log('🔍 Processing item:', item);
        
        const openDate = item.openDate ? new Date(item.openDate).toISOString() : '';
        const updatedDate = item.updatedDate ? new Date(item.updatedDate).toISOString() : '';
        
        return {
          id: item.id || '',
          incidentNumber: item.incidentNumber || '',
          assignedGroup: item.assignedGroup || '',
          longDescription: item.longDescription || '',
          teamFixedIssue: item.team_Fixed_Issue || '',
          teamIncludedInTicket: item.team_Included_in_Ticket || '',
          serviceOwner: item.serviceOwner || '',
          priority: item.priority || '',
          openDate: openDate,
          updatedDate: updatedDate
        };
      });
      
      console.log('✅ Transformed incident details:', incidentDetails);
      return incidentDetails;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching incident details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        const errorMessage = error.response?.data?.toString() || '';
        const isNotFoundError = 
          error.response?.status === 404 || 
          (error.response?.status === 500 && 
           errorMessage.includes('Activity with IncidentNumber') && 
           errorMessage.includes('not found'));
        
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