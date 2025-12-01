// src/services/dataService.ts
import axios from 'axios';
import type { TicketRow } from '../types';
import type { IncidentDetails } from '../types';
import type { ActivityResponse } from '../types';
import { aiProcessingService } from './aiProcessingService';
import { aiProcessingExistingService } from './aiProcessingExistingService';

const API_BASE_URL = 'http://localhost:5226/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dataService = {
  // Dashboard API Methods

  // CHANGED: Met SLA by date and service owner - returns percentage like "100.00%"
  // CHANGED: Make month parameter optional
  async getMetSLA(year: string, month?: string, serviceOwner?: string): Promise<number> {
    try {
      console.log(`🔍 Fetching Met SLA: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerMetSLA', { params });
      
      // API returns string like "100.00%"
      const metSlaValue = response.data;
      console.log('✅ Met SLA API response:', metSlaValue);
      
      // Convert percentage string to number (remove % and convert to float)
      if (typeof metSlaValue === 'string') {
        const numericValue = parseFloat(metSlaValue.replace('%', ''));
        return isNaN(numericValue) ? 0 : numericValue;
      } else if (typeof metSlaValue === 'number') {
        return metSlaValue;
      }
      return 0;
    } catch (error) {
      console.error('❌ Error fetching Met SLA:', error);
      return 0;
    }
  },

  // CHANGED: Average extra days after SLA - returns number like 8.50
  // CHANGED: Make month parameter optional
  async getExtraDaysAfterSLA(year: string, month?: string, serviceOwner?: string): Promise<number> {
    try {
      console.log(`🔍 Fetching Extra Days: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerExtraDaysAfterSLA', { params });
      
      // API returns number like 8.50
      console.log('✅ Extra Days API response:', response.data);
      const extraDays = parseFloat(response.data);
      return isNaN(extraDays) ? 0 : extraDays;
    } catch (error) {
      console.error('❌ Error fetching extra days:', error);
      return 0;
    }
  },

  // CHANGED: Priority distribution - returns array [P1, P2, P3, P4] like [0, 0, 0, 1]
  // CHANGED: Make month parameter optional
  async getPriorityDistribution(year: string, month?: string, serviceOwner?: string): Promise<Record<string, number>> {
    try {
      console.log(`🔍 Fetching Priority: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerPriority', { params });
      
      // API returns array [P1, P2, P3, P4]
      console.log('✅ Priority API response (array):', response.data);
      
      // Convert array to object format
      const priorityArray = response.data || [0, 0, 0, 0];
      return {
        P1: priorityArray[0] || 0,
        P2: priorityArray[1] || 0,
        P3: priorityArray[2] || 0,
        P4: priorityArray[3] || 0
      };
    } catch (error) {
      console.error('❌ Error fetching priority distribution:', error);
      return { P1: 0, P2: 0, P3: 0, P4: 0 };
    }
  },

  // CHANGED: Non-functional team inclusion - returns { "extra_teams": 1, "no_extra_teams": 1 }
  // CHANGED: Make month parameter optional
  async getNonFunctionalTeamInclusion(year: string, month?: string, serviceOwner?: string): Promise<{ included: number, notIncluded: number }> {
    try {
      console.log(`🔍 Fetching Non-Functional Team: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerExtraNonFuntionalTeam', { params });
      
      // API returns { "extra_teams": 1, "no_extra_teams": 1 }
      console.log('✅ Non-Functional Team API response:', response.data);
      
      // Map API response to our internal format
      const apiData = response.data || { extra_teams: 0, no_extra_teams: 0 };
      return {
        included: apiData.extra_teams || 0,
        notIncluded: apiData.no_extra_teams || 0
      };
    } catch (error) {
      console.error('❌ Error fetching non-functional team data:', error);
      return { included: 0, notIncluded: 0 };
    }
  },

  // CHANGED: Assigned team responsible - returns { "responsible_aissigned_team": 1, "non_responsible_aissigned_team": 1 }
  // CHANGED: Make month parameter optional
  async getAssignedTeamResponsible(year: string, month?: string, serviceOwner?: string): Promise<{ yes: number, no: number }> {
    try {
      console.log(`🔍 Fetching Assigned Team Responsible: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerAssignedTeamResponsible', { params });
      
      // API returns { "responsible_aissigned_team": 1, "non_responsible_aissigned_team": 1 }
      console.log('✅ Assigned Team Responsible API response:', response.data);
      
      // Map API response to our internal format
      const apiData = response.data || { responsible_aissigned_team: 0, non_responsible_aissigned_team: 0 };
      return {
        yes: apiData.responsible_aissigned_team || 0,
        no: apiData.non_responsible_aissigned_team || 0
      };
    } catch (error) {
      console.error('❌ Error fetching assigned team responsible:', error);
      return { yes: 0, no: 0 };
    }
  },

  // CHANGED: Assigned team fixing issues - returns { "fixing_issues_assigned_team": 1, "non_fixing_issues_assigned_team": 1 }
  // CHANGED: Make month parameter optional
  async getAssignedTeamFixingIssues(year: string, month?: string, serviceOwner?: string): Promise<{ yes: number, no: number }> {
    try {
      console.log(`🔍 Fetching Assigned Team Fixing Issues: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerAssignedTeamFixingIssues', { params });
      
      // API returns { "fixing_issues_assigned_team": 1, "non_fixing_issues_assigned_team": 1 }
      console.log('✅ Assigned Team Fixing Issues API response:', response.data);
      
      // Map API response to our internal format
      const apiData = response.data || { fixing_issues_assigned_team: 0, non_fixing_issues_assigned_team: 0 };
      return {
        yes: apiData.fixing_issues_assigned_team || 0,
        no: apiData.non_fixing_issues_assigned_team || 0
      };
    } catch (error) {
      console.error('❌ Error fetching assigned team fixing issues:', error);
      return { yes: 0, no: 0 };
    }
  },

  // CHANGED: System distribution - returns { "Jupyterhub": 2, "Zeppelin": 0 }
  // CHANGED: Make month parameter optional
  async getSystemDistribution(year: string, month?: string, serviceOwner?: string): Promise<{ jupyterhub: number, zeppelin: number }> {
    try {
      console.log(`🔍 Fetching System Distribution: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateServiceOwnerSystem', { params });
      
      // API returns { "Jupyterhub": 2, "Zeppelin": 0 }
      console.log('✅ System Distribution API response:', response.data);
      
      // Map API response to our internal format (camelCase)
      const apiData = response.data || { Jupyterhub: 0, Zeppelin: 0 };
      return {
        jupyterhub: apiData.Jupyterhub || 0,
        zeppelin: apiData.Zeppelin || 0
      };
    } catch (error) {
      console.error('❌ Error fetching system distribution:', error);
      return { jupyterhub: 0, zeppelin: 0 };
    }
  },

  // CHANGED: Issues breakdown by category - returns object with issue categories as keys
  // CHANGED: Make month parameter optional
  async getIssuesBreakdown(year: string, month?: string, serviceOwner?: string): Promise<Record<string, number>> {
    try {
      console.log(`🔍 Fetching Issues Breakdown: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateIssues', { params });
      
      // API returns object like: {"Authentication & Authorization":2,"Network":0,...}
      console.log('✅ Issues Breakdown API response:', response.data);
      
      // Return the object as-is
      return response.data || {};
    } catch (error) {
      console.error('❌ Error fetching issues breakdown:', error);
      return {};
    }
  },

  // CHANGED: Duplicate groups - returns { "duplicates": 1 }
  // CHANGED: Make month parameter optional
  async getDuplicateGroups(year: string, month?: string, serviceOwner?: string): Promise<number> {
    try {
      console.log(`🔍 Fetching Duplicate Groups: Year=${year}, Month=${month || 'N/A'}, Service Owner=${serviceOwner || 'N/A'}`);
      
      // CHANGED: Only include month in params if it's provided
      const params: any = { year: year };
      if (month) params.month = month;
      if (serviceOwner) params.ServiceOwner = serviceOwner;
      
      const response = await apiClient.get('/FrontEnd/byDateDuplicates', { params });
      
      // API returns { "duplicates": 1 }
      console.log('✅ Duplicate Groups API response:', response.data);
      
      // Extract duplicates count from response
      const apiData = response.data || { duplicates: 0 };
      return apiData.duplicates || 0;
    } catch (error) {
      console.error('❌ Error fetching duplicate groups:', error);
      return 0;
    }
  },

  // Existing methods continue below (unchanged)...

  // NEW: Get duplicate records from backend
  async getDuplicateRecords(): Promise<ActivityResponse[]> {
    console.log('🔍 Fetching duplicate records from backend...');
    
    try {
      const response = await apiClient.get<ActivityResponse[]>('/FrontEnd/duplicatelistAI');
      console.log('✅ Duplicate records response:', response.data);
      
      if (response.data && response.data.length > 0) {
        console.log('🔍 First duplicate item fields:', Object.keys(response.data[0]));
        console.log(`📊 Found ${response.data.length} duplicate records`);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching duplicate records:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 404) {
          throw new Error('DuplicateListAI endpoint not found');
        } else if (error.response?.status === 500) {
          throw new Error('Server error while fetching duplicate records');
        }
      }
      console.error('❌ API Error fetching duplicate records:', error);
      throw new Error(`Failed to fetch duplicate records: ${error}`);
    }
  },

  // NEW: Get review data by date
  async getReviewDataByDate(year: string, month?: string): Promise<ActivityResponse[]> {
    try {
      const params = new URLSearchParams();
      params.append('year', year);
      if (month) {
        params.append('month', month);
      }
      
      console.log(`🔍 Fetching review data by date: ${year}${month ? '-' + month : ''}`);
      const response = await apiClient.get<ActivityResponse[]>(`/FrontEnd/byDate?${params}`);
      
      console.log(`✅ Review data by date loaded: ${response.data.length} records`);
      if (response.data && response.data.length > 0) {
        console.log('🔍 First review item fields:', Object.keys(response.data[0]));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching review data by date:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 404) {
          throw new Error(`No review data found for ${year}${month ? '-' + month : ''}`);
        } else if (error.response?.status === 500) {
          throw new Error('Server error while fetching review data by date');
        }
      }
      throw new Error('Failed to fetch review data by date');
    }
  },

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

  // NEW: Save duplicate records method
  async saveDuplicateRecords(activities: ActivityResponse[]): Promise<any> {
    console.log('💾 Saving duplicate records to backend...');
    console.log(`📤 Sending ${activities.length} duplicate activities to backend`);
    
    // Validate data before sending
    if (!activities || activities.length === 0) {
      throw new Error('No duplicate activities provided for saving');
    }

    try {
      const savedResults: any[] = [];
      
      // Send each duplicate activity individually
      for (const activity of activities) {
        console.log(`🔄 Processing duplicate activity ${activity.id} with incident ${activity.incidentNumber}`);
        
        // Create the backend activity structure
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
          duplicate: activity.duplicate, // This is the key field for duplicates
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

        // Remove undefined or null values
        Object.keys(backendActivity).forEach(key => {
          if (backendActivity[key as keyof typeof backendActivity] === undefined || 
              backendActivity[key as keyof typeof backendActivity] === null) {
            delete backendActivity[key as keyof typeof backendActivity];
          }
        });

        console.log('🔍 Duplicate activity data being sent:', {
          id: backendActivity.id,
          incidentNumber: backendActivity.incidentNumber,
          duplicate: backendActivity.duplicate,
          duplicate_AI: backendActivity.duplicate_AI
        });

        let response;
        
        // Try sending as direct activity object
        try {
          response = await apiClient.put('/FrontEnd', backendActivity, {
            timeout: 30000,
            validateStatus: function (status) {
              return status < 500;
            }
          });
        } catch (error: any) {
          // If direct object fails, try wrapping in activity property
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

        console.log(`✅ Duplicate activity ${activity.incidentNumber} saved successfully:`, response.data);
        
        if (response.status === 400) {
          console.error('❌ Backend validation failed for duplicate activity:', backendActivity);
          throw new Error(`Backend validation error for duplicate activity ${activity.incidentNumber}: ${JSON.stringify(response.data)}`);
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
        message: `Successfully saved ${activities.length} duplicate records`,
        data: savedResults,
        status: 200
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error saving duplicate records:', {
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
          throw new Error(`Backend validation error: ${errorData.title}. Check console for details.`);
        } else if (error.response?.status === 404) {
          throw new Error('FrontEnd endpoint not found');
        } else if (error.response?.status === 500) {
          throw new Error('Server error while saving duplicate records');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - server took too long to respond');
        }
      }
      console.error('❌ API Error saving duplicate records:', error);
      throw new Error(`Failed to save duplicate records: ${error}`);
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

  // UPDATED: AI Processing method for existing data with date parameters
  async processWithAIExisting(year?: string, month?: string): Promise<any> {
    console.log('🚀 Starting AI existing data processing through dataService...');
    console.log(`📅 Processing with date filters - Year: ${year || 'Not specified'}, Month: ${month || 'Not specified'}`);
    
    try {
      const results = await aiProcessingExistingService.processExistingActivitiesWithAI(year, month);
      return results;
    } catch (error) {
      console.error('❌ AI existing data processing failed in dataService:', error);
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