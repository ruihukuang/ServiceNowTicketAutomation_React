// src/pages/SecondPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  CircularProgress,
  Chip,
  Snackbar,
  // CHANGED: Added Stack for better button layout
  Stack
} from '@mui/material';

import { dataService } from '../services/dataService';
import type { ActivityResponse } from '../types';
import { ActivityTable, ActivitySummary } from '../components/Page2/TableComponents';
import { SequentialButtons } from '../components/Page2/SequentialButtons';

// Local storage keys
const STORAGE_KEYS = {
  ACTIVITIES: 'secondPage_activities',
  CURRENT_STEP: 'secondPage_currentStep',
  AI_RESULTS: 'secondPage_aiResults'
};

const SecondPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize state from localStorage or defaults
  const [activities, setActivities] = useState<ActivityResponse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  const [aiResults, setAiResults] = useState<any>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_RESULTS);
    return saved ? JSON.parse(saved) : null;
  });
  
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
    return saved ? parseInt(saved) : 0;
  });
  
  const [saving, setSaving] = useState(false);

  // Save to localStorage whenever activities, currentStep, or aiResults change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (aiResults) {
      localStorage.setItem(STORAGE_KEYS.AI_RESULTS, JSON.stringify(aiResults));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AI_RESULTS);
    }
  }, [aiResults]);

  const handleRowClick = (activity: ActivityResponse) => {
    console.log('Activity clicked:', activity);
  };

  // Handle row updates from the table
  const handleUpdateRow = (activityId: string, field: keyof ActivityResponse, value: string) => {
    console.log(`🔄 Updating activity ${activityId}, field ${field} to:`, value);
    
    const updatedActivities = activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, [field]: value }
        : activity
    );
    
    setActivities(updatedActivities);
    console.log('✅ Activity updated in state and localStorage');
  };

  // Handle Review data fetching - STEP 2
  const handleReviewData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching review data...');
      const reviewData = await dataService.getReviewData();
      setActivities(reviewData);
      setCurrentStep(2); // Move to step 3 after successful data load
      setSnackbar({ open: true, message: `Loaded ${reviewData.length} records for review`, severity: 'success' });
      console.log('✅ Review data loaded:', reviewData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch review data';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('❌ Error fetching review data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle AI and Automation processing - STEP 1
  const handleAIProcessing = async () => {
    setAiProcessing(true);
    setAiResults(null);
    setError(null);
    
    try {
      console.log('🚀 Starting AI and Automation processing...');
      const results = await dataService.processWithAI();
      setAiResults(results);
      setCurrentStep(1); // Move to step 2 after successful AI processing
      setSnackbar({ open: true, message: 'AI and Automation processing completed successfully!', severity: 'success' });
      console.log('✅ AI processing results:', results);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process data with AI';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('❌ Error during AI processing:', err);
    } finally {
      setAiProcessing(false);
    }
  };

  // Handle Step 3 - Copy AI Content and Start Review
  const handleCopyAIContent = async () => {
    try {
      console.log('📋 Copying AI content to editable fields...');
      // Logic to copy AI fields to editable fields including summary_Issue_AI
      const updatedActivities = activities.map(activity => ({
        ...activity,
        summary_Issue: activity.summary_Issue_AI || activity.summary_Issue,
        system: activity.system_AI || activity.system,
        issue: activity.issue_AI || activity.issue,
        root_Cause: activity.root_Cause_AI || activity.root_Cause,
        duplicate: activity.duplicate_AI || activity.duplicate,
      }));
      
      setActivities(updatedActivities);
      setCurrentStep(3); // Move to step 4
      setSnackbar({ 
        open: true, 
        message: 'AI content (including summary) copied to review fields successfully!', 
        severity: 'success' 
      });
      console.log('✅ AI content copied including summary_Issue_AI');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to copy AI content';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('❌ Error copying AI content:', err);
    }
  };

  // Handle Step 4 - Complete Review and Save Data
  const handleCompleteReview = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Completing review and saving data...');
      
      // Get the latest data from localStorage to ensure we have all updates
      const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const activitiesToSave = savedActivities ? JSON.parse(savedActivities) : activities;
      
      console.log(`📤 Preparing to save ${activitiesToSave.length} activities to backend`);
      console.log('🔍 First activity sample:', activitiesToSave[0] ? {
        id: activitiesToSave[0].id,
        incidentNumber: activitiesToSave[0].incidentNumber,
        summary_Issue: activitiesToSave[0].summary_Issue,
        system: activitiesToSave[0].system,
        issue: activitiesToSave[0].issue,
        root_Cause: activitiesToSave[0].root_Cause,
        duplicate: activitiesToSave[0].duplicate
      } : 'No activities');
      
      // Validate data before sending
      if (!activitiesToSave || activitiesToSave.length === 0) {
        throw new Error('No activities found to save');
      }

      // REMOVED: Redundant data transformation - dataService handles this now
      
      console.log('🔄 Sending activities directly to dataService for transformation');
      
      // Save all reviewed data using the dataService (which handles transformation)
      const saveResult = await dataService.saveReviewedData(activitiesToSave);
      
      setCurrentStep(0); // Reset to initial step
      
      // Clear localStorage after successful save
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
      localStorage.removeItem(STORAGE_KEYS.AI_RESULTS);
      
      setActivities([]);
      setAiResults(null);
      
      setSnackbar({ 
        open: true, 
        message: `Review completed! ${saveResult.message}`, 
        severity: 'success' 
      });
      console.log('✅ Review completed and data saved:', saveResult);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save reviewed data';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('❌ Error saving reviewed data:', err);
      
      // Provide more detailed error information
      if (err.response?.status === 400) {
        console.error('🔍 400 Bad Request Details:', {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data,
          response: err.response?.data
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Clear all data and reset state
  const handleClearData = () => {
    setActivities([]);
    setCurrentStep(0);
    setAiResults(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.AI_RESULTS);
    
    setSnackbar({ 
      open: true, 
      message: 'All data cleared successfully!', 
      severity: 'success' 
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" align="center">
          New Data Processing & Review
        </Typography>
        <Typography variant="h6" component="p" gutterBottom align="center" sx={{ mb: 4 }}>
          Process your data using AI and automation, then review the results.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/page1')}
            size="large"
            sx={{ mr: 2 }}
          >
            Back to Data Entry
          </Button>

          {/* Clear Data Button - Only show when there's data */}
          {activities.length > 0 && (
            <Button 
              variant="outlined" 
              color="warning"
              onClick={handleClearData}
              size="large"
            >
              Clear All Data
            </Button>
          )}
          
          <Chip 
            label={`${activities.length} records found`}
            color={activities.length > 0 ? "success" : "default"}
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Box>

        {/* Sequential Buttons Component */}
        <SequentialButtons
          currentStep={currentStep}
          onStep1Click={handleAIProcessing}
          onStep2Click={handleReviewData}
          onStep3Click={handleCopyAIContent}
          onStep4Click={handleCompleteReview}
          step1Loading={aiProcessing}
          step2Loading={loading}
          step4Loading={saving}
        />

        {/* Persistence Info Alert */}
        {activities.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Data Persistence:</strong> Your data is automatically saved and will persist even if you refresh or close this page.
              {currentStep > 0 && ` Current step: ${currentStep}`}
            </Typography>
          </Alert>
        )}

        {/* AI Processing Results */}
        {aiResults && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI and Automation Processing Completed
            </Typography>
            <Typography variant="body2">
              All AI services have been executed successfully. Check the console for detailed results.
            </Typography>
            {Object.entries(aiResults).map(([key, value]) => (
              <Typography key={key} variant="body2" fontSize="0.8rem">
                <strong>{key}:</strong> {value && typeof value === 'object' ? 'Completed' : String(value)}
              </Typography>
            ))}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading review data...</Typography>
          </Box>
        )}

        {saving && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Saving reviewed data...</Typography>
          </Box>
        )}

        {error && !aiProcessing && !loading && !saving && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !saving && !error && activities.length > 0 && (
          <>
            {/* Activity Summary Cards */}
            <ActivitySummary activities={activities} />
            
            {/* Enhanced Activity Table */}
            <ActivityTable 
              activities={activities}
              onRowClick={handleRowClick}
              onUpdateRow={handleUpdateRow}
              enableSearch={true}
              enableSorting={true}
              enablePagination={true}
              enableExport={true}
              loading={loading}
            />
          </>
        )}

        {!loading && !saving && activities.length === 0 && !error && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Click "Show New Review List" to load data for processing and analysis.
          </Alert>
        )}

        {!loading && !saving && activities.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Showing {activities.length} record(s) from the review database.
          </Alert>
        )}

        {/* CHANGED: Added navigation button to Page 3 at the bottom */}
        <Box sx={{ mt: 'auto', pt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              onClick={() => navigate('/page3')}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Go to Data Analysis
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SecondPage;