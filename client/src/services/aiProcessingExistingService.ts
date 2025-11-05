// src/services/aiProcessingExistingService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5226/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define proper interface for the results
interface AIExistingProcessingResults {
  AiExistingSummary: any;
  AiExistingSystem: any;
  AiExistingIssue: any;
  AiExistingRootCause: any;
  AiExistingDuplicate: any;
}

export const aiProcessingExistingService = {
  // Process activities through AI pipeline with date parameters
  async processExistingActivitiesWithAI(year?: string, month?: string): Promise<AIExistingProcessingResults> {
    console.log('🚀 Starting AI and Automation data processing for existing activities...');
    console.log(`📅 Date filters - Year: ${year || 'Not specified'}, Month: ${month || 'Not specified'}`);
    
    // Initialize results with proper typing
    const results: AIExistingProcessingResults = {
      AiExistingSummary: null,
      AiExistingSystem: null,
      AiExistingIssue: null,
      AiExistingRootCause: null,
      AiExistingDuplicate: null
    };

    try {
      // Build query parameters for date filtering
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year);
      if (month) queryParams.append('month', month);
      const queryString = queryParams.toString();
      const urlSuffix = queryString ? `?${queryString}` : '';

      // 1. AI Summary with date filtering - CORRECTED URL
      console.log('🤖 Generating AI summary...');
      try {
        const aiSummaryResponse = await apiClient.post(`/AISummaryDate/AI_summary_date${urlSuffix}`);
        results.AiExistingSummary = aiSummaryResponse.data;
        console.log('✅ AI summary generated:', aiSummaryResponse.data);
      } catch (error) {
        console.error('❌ Error generating AI summary:', error);
        results.AiExistingSummary = { error: this.getErrorMessage(error) };
      }

      // 2. AI System with date filtering - CORRECTED URL
      console.log('🔧 Analyzing systems with AI...');
      try {
        const aiSystemResponse = await apiClient.post(`/SystemDate/AI_system_date${urlSuffix}`);
        results.AiExistingSystem = aiSystemResponse.data;
        console.log('✅ AI system analysis completed:', aiSystemResponse.data);
      } catch (error) {
        console.error('❌ Error in AI system analysis:', error);
        results.AiExistingSystem = { error: this.getErrorMessage(error) };
      }

      // 3. AI Issue with date filtering - CORRECTED URL
      console.log('🐛 Analyzing issues with AI...');
      try {
        const aiIssueResponse = await apiClient.post(`/IssueDate/AI_Issue_date${urlSuffix}`);
        results.AiExistingIssue = aiIssueResponse.data;
        console.log('✅ AI issue analysis completed:', aiIssueResponse.data);
      } catch (error) {
        console.error('❌ Error in AI issue analysis:', error);
        results.AiExistingIssue = { error: this.getErrorMessage(error) };
      }

      // 4. AI Root Cause with date filtering - CORRECTED URL
      console.log('🔍 Analyzing root causes with AI...');
      try {
        const aiRootCauseResponse = await apiClient.post(`/RootCauseDate/AI_RootCause_date${urlSuffix}`);
        results.AiExistingRootCause = aiRootCauseResponse.data;
        console.log('✅ AI root cause analysis completed:', aiRootCauseResponse.data);
      } catch (error) {
        console.error('❌ Error in AI root cause analysis:', error);
        results.AiExistingRootCause = { error: this.getErrorMessage(error) };
      }

      // 5. AI Duplicate with date filtering - CORRECTED URL
      console.log('🔄 Checking duplicates with AI...');
      try {
        const aiDuplicateResponse = await apiClient.post(`/DuplicateDate/AI_Duplicate_date${urlSuffix}`);
        results.AiExistingDuplicate = aiDuplicateResponse.data;
        console.log('✅ AI duplicate check completed:', aiDuplicateResponse.data);
      } catch (error) {
        console.error('❌ Error in AI duplicate check:', error);
        results.AiExistingDuplicate = { error: this.getErrorMessage(error) };
      }

      console.log('🎉 AI and Automation processing for existing activities completed!', results);
      return results;

    } catch (error) {
      console.error('❌ Overall AI processing for existing activities failed:', error);
      throw new Error(`AI processing for existing activities failed: ${this.getErrorMessage(error)}`);
    }
  },

  // Helper method to extract error messages
  getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.response?.data || error.message;
    }
    return error.message || 'Unknown error occurred';
  }
};