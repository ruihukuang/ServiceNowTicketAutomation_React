import axios from 'axios';

const API_BASE_URL = 'http://localhost:5226/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define a proper type for the results
interface AIProcessingResults {
  AutomationDataProcess: any;
  AiSummary: any;
  AiSystem: any;
  AiIssue: any;
  AiRootCause: any;
  AiDuplicate: any;
  AutomationDataProcessFurther: any;
}

export const aiProcessingService = {
  // Process activities through AI pipeline
  async processActivitiesWithAI(): Promise<AIProcessingResults> {
    console.log('🚀 Starting AI and Automation data processing...');
    
    // Initialize with proper structure
    const results: AIProcessingResults = {
      AutomationDataProcess: null,
      AiSummary: null,
      AiSystem: null,
      AiIssue: null,
      AiRootCause: null,
      AiDuplicate: null,
      AutomationDataProcessFurther: null
    };

    try {
      // 1. Process activities
      console.log('📊 Processing activities...');
      try {
        const processResponse = await apiClient.post('/Activities/process');
        results.AutomationDataProcess = processResponse.data;
        console.log('✅ Activities processed:', processResponse.data);
      } catch (error) {
        console.error('❌ Error processing activities:', error);
        results.AutomationDataProcess = { error: this.getErrorMessage(error) };
      }

      // 2. AI Summary
      console.log('🤖 Generating AI summary...');
      try {
        const aiSummaryResponse = await apiClient.post('/AISummary/AI_summary');
        results.AiSummary = aiSummaryResponse.data;
        console.log('✅ AI summary generated:', aiSummaryResponse.data);
      } catch (error) {
        console.error('❌ Error generating AI summary:', error);
        results.AiSummary = { error: this.getErrorMessage(error) };
      }

      // 3. AI System
      console.log('🔧 Analyzing systems with AI...');
      try {
        const aiSystemResponse = await apiClient.post('/System/AI_system');
        results.AiSystem = aiSystemResponse.data;
        console.log('✅ AI system analysis completed:', aiSystemResponse.data);
      } catch (error) {
        console.error('❌ Error in AI system analysis:', error);
        results.AiSystem = { error: this.getErrorMessage(error) };
      }

      // 4. AI Issue
      console.log('🐛 Analyzing issues with AI...');
      try {
        const aiIssueResponse = await apiClient.post('/Issue/AI_Issue');
        results.AiIssue = aiIssueResponse.data;
        console.log('✅ AI issue analysis completed:', aiIssueResponse.data);
      } catch (error) {
        console.error('❌ Error in AI issue analysis:', error);
        results.AiIssue = { error: this.getErrorMessage(error) };
      }

      // 5. AI Root Cause
      console.log('🔍 Analyzing root causes with AI...');
      try {
        const aiRootCauseResponse = await apiClient.post('/RootCause/AI_RootCause');
        results.AiRootCause = aiRootCauseResponse.data;
        console.log('✅ AI root cause analysis completed:', aiRootCauseResponse.data);
      } catch (error) {
        console.error('❌ Error in AI root cause analysis:', error);
        results.AiRootCause = { error: this.getErrorMessage(error) };
      }

      // 6. AI Duplicate
      console.log('🔄 Checking duplicates with AI...');
      try {
        const aiDuplicateResponse = await apiClient.post('/Duplicate/AI_Duplicate');
        results.AiDuplicate = aiDuplicateResponse.data;
        console.log('✅ AI duplicate check completed:', aiDuplicateResponse.data);
      } catch (error) {
        console.error('❌ Error in AI duplicate check:', error);
        results.AiDuplicate = { error: this.getErrorMessage(error) };
      }

      // 7. Process Further
      console.log('⚡ Running further automation...');
      try {
        const processFurtherResponse = await apiClient.post('/Automation/process_further');
        results.AutomationDataProcessFurther = processFurtherResponse.data;
        console.log('✅ Further automation completed:', processFurtherResponse.data);
      } catch (error) {
        console.error('❌ Error in further automation:', error);
        results.AutomationDataProcessFurther = { error: this.getErrorMessage(error) };
      }

      console.log('🎉 AI and Automation processing completed!', results);
      return results;

    } catch (error) {
      console.error('❌ Overall AI processing failed:', error);
      throw new Error(`AI processing failed: ${this.getErrorMessage(error)}`);
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