// src/pages/ThirdPage.tsx
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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';

import { dataService } from '../services/dataService';
import type { ActivityResponse } from '../types';
import { ActivityTable, ActivitySummary } from '../components/Page3/TableComponents';
import { SequentialButtons } from '../components/Page3/SequentialButtons';
import { DuplicateManagement } from '../components/Page3/DuplicateManagement'; // NEW: Import DuplicateManagement

// Local storage keys for Page 3
const STORAGE_KEYS = {
  ACTIVITIES: 'thirdPage_activities',
  CURRENT_STEP: 'thirdPage_currentStep',
  AI_RESULTS: 'thirdPage_aiResults',
  SELECTED_YEAR: 'thirdPage_selectedYear',
  SELECTED_MONTH: 'thirdPage_selectedMonth',
  DUPLICATE_ACTIVITIES: 'thirdPage_duplicateActivities' // NEW: Storage for duplicate records
};

const ThirdPage: React.FC = () => {
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
  
  // Date filter states
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_YEAR);
    return saved || '';
  });
  
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH);
    return saved || '';
  });

  // NEW STATES FOR DUPLICATE MANAGEMENT
  const [showDuplicateManagement, setShowDuplicateManagement] = useState(false);
  const [duplicateStep, setDuplicateStep] = useState(0); // 0: not started, 1: check/edit, 2: copy AI, 3: save
  const [duplicateSaving, setDuplicateSaving] = useState(false);
  const [duplicateActivities, setDuplicateActivities] = useState<ActivityResponse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DUPLICATE_ACTIVITIES);
    return saved ? JSON.parse(saved) : [];
  }); // NEW: Separate state for duplicate records

  // Save to localStorage whenever state changes
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, selectedMonth);
  }, [selectedMonth]);

  // NEW: Save duplicate activities to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUPLICATE_ACTIVITIES, JSON.stringify(duplicateActivities));
  }, [duplicateActivities]);

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

  // NEW: Handle updates for duplicate activities
  const handleUpdateDuplicateRow = (activityId: string, field: keyof ActivityResponse, value: string) => {
    console.log(`🔄 Updating duplicate activity ${activityId}, field ${field} to:`, value);
    
    const updatedDuplicateActivities = duplicateActivities.map(activity => 
      activity.id === activityId 
        ? { ...activity, [field]: value }
        : activity
    );
    
    setDuplicateActivities(updatedDuplicateActivities);
    console.log('✅ Duplicate activity updated in state and localStorage');
  };

  // NEW: UPDATED HANDLER FOR DUPLICATE MANAGEMENT
  const handleCheckEditDuplicates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching duplicate records from backend...');
      const duplicateData = await dataService.getDuplicateRecords();
      setDuplicateActivities(duplicateData);
      setShowDuplicateManagement(true);
      setDuplicateStep(1);
      setSnackbar({ 
        open: true, 
        message: `Loaded ${duplicateData.length} duplicate records for management`, 
        severity: 'success' 
      });
      console.log('✅ Duplicate records loaded:', duplicateData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch duplicate records';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('❌ Error fetching duplicate records:', err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle save duplicate records
  const handleSaveDuplicateRecords = async (activitiesToSave: ActivityResponse[]) => {
    try {
      setDuplicateSaving(true);
      // Use the same save method as complete review
      const result = await dataService.saveReviewedData(activitiesToSave);
      setDuplicateStep(3);
      setSnackbar({ 
        open: true, 
        message: `Successfully saved ${activitiesToSave.length} duplicate records`, 
        severity: 'success' 
      });
      return result;
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: `Failed to save duplicate records: ${error.message}`, 
        severity: 'error' 
      });
      throw error;
    } finally {
      setDuplicateSaving(false);
    }
  };

  // Handle Review data fetching by date - STEP 1
  const handleReviewDataByDate = async () => {
    if (!selectedYear) {
      setSnackbar({ open: true, message: 'Please select a year first', severity: 'error' });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching review data by date...', { year: selectedYear, month: selectedMonth });
      const reviewData = await dataService.getReviewDataByDate(selectedYear, selectedMonth);
      
      if (reviewData.length === 0) {
        setSnackbar({ 
          open: true, 
          message: `No records found for ${selectedYear}${selectedMonth ? '-' + selectedMonth : ''}. Please select a different date range.`, 
          severity: 'warning' 
        });
        setActivities([]);
        // Don't advance to next step if no data found
        return;
      }
      
      setActivities(reviewData);
      setCurrentStep(1); // Move to step 2 after successful data load
      setSnackbar({ 
        open: true, 
        message: `Loaded ${reviewData.length} records for ${selectedYear}${selectedMonth ? '-' + selectedMonth : ''}`, 
        severity: 'success' 
      });
      console.log('✅ Review data loaded by date:', reviewData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch review data by date';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error('❌ Error fetching review data by date:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle AI and Automation processing - STEP 2
  const handleAIProcessing = async () => {
    if (activities.length === 0) {
      setSnackbar({ open: true, message: 'No activities available for AI processing', severity: 'error' });
      return;
    }

    setAiProcessing(true);
    setAiResults(null);
    setError(null);
    
    try {
      console.log('🚀 Starting AI and Automation processing...');
      // UPDATED: Pass year and month parameters to AI processing
      const results = await dataService.processWithAIExisting(selectedYear, selectedMonth);
      setAiResults(results);
      setCurrentStep(2); // Move to step 3 after successful AI processing
      setSnackbar({ 
        open: true, 
        message: `AI and Automation processing completed for ${selectedYear}${selectedMonth ? '-' + selectedMonth : ''}!`, 
        severity: 'success' 
      });
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
    if (activities.length === 0) {
      setSnackbar({ open: true, message: 'No activities available to copy AI content', severity: 'error' });
      return;
    }

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

  // UPDATED: Handle Step 4 - Complete Review and Save Data
  const handleCompleteReview = async () => {
    if (activities.length === 0) {
      setSnackbar({ open: true, message: 'No activities available to save', severity: 'error' });
      return;
    }

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

      console.log('🔄 Sending activities directly to dataService for transformation');
      
      // Save all reviewed data using the dataService (which handles transformation)
      const saveResult = await dataService.saveReviewedData(activitiesToSave);
      
      setCurrentStep(4); // UPDATED: Move to step 5 (duplicate management) instead of resetting to 0
      
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

  // UPDATED: Clear all data and reset state including duplicates
  const handleClearData = () => {
    setActivities([]);
    setCurrentStep(0);
    setAiResults(null);
    setError(null);
    setSelectedYear('');
    setSelectedMonth('');
    setShowDuplicateManagement(false); // NEW: Clear duplicate management
    setDuplicateStep(0); // NEW: Clear duplicate step
    setDuplicateActivities([]); // NEW: Clear duplicate activities
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
    localStorage.removeItem(STORAGE_KEYS.AI_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_YEAR);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_MONTH);
    localStorage.removeItem(STORAGE_KEYS.DUPLICATE_ACTIVITIES); // NEW: Clear duplicate storage
    
    setSnackbar({ 
      open: true, 
      message: 'All data cleared successfully!', 
      severity: 'success' 
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Generate year options (2024 until current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2023 }, (_, i) => {
    const year = currentYear - i;
    return year.toString();
  });

  // Month options
  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

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
          Date-Based Existing Data Processing & Review
        </Typography>
        <Typography variant="h6" component="p" gutterBottom align="center" sx={{ mb: 4 }}>
          Process your data by date range using AI and automation, then review the results.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Button to navigate to Page 1 (Data Entry) */}
          <Button 
            variant="contained" 
            onClick={() => navigate('/page1')}
            size="large"
            sx={{ mr: 2 }}
          >
            Back to Data Entry
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/page2')}
            size="large"
          >
            Back to New Data Processing
          </Button>

          {/* Clear Data Button - Only show when there's data */}
          {(activities.length > 0 || selectedYear || selectedMonth || duplicateActivities.length > 0) && ( // UPDATED: Check duplicateActivities too
            <Button 
              variant="outlined" 
              color="warning"
              onClick={handleClearData}
              size="large"
              sx={{ ml: 'auto' }}
            >
              Clear All Data
            </Button>
          )}
          
          <Chip 
            label={`${activities.length} records found`}
            color={activities.length > 0 ? "success" : "default"}
            variant="outlined"
            sx={{ ml: activities.length > 0 || selectedYear || selectedMonth ? 0 : 'auto' }}
          />
          
          {/* NEW: Duplicate records chip */}
          {showDuplicateManagement && (
            <Chip 
              label={`${duplicateActivities.length} duplicate records`}
              color={duplicateActivities.length > 0 ? "warning" : "default"}
              variant="outlined"
            />
          )}
        </Box>

        {/* Date Selection Filters */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Select Date Range for Processing
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Year *</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year *"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <MenuItem value="">Select Year</MenuItem>
                  {yearOptions.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthOptions.map(month => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                {selectedYear ? `Selected: ${selectedYear}${selectedMonth ? `-${selectedMonth}` : ' (All Months)'}` : 'Please select a year to begin'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* UPDATED: Sequential Buttons Component with Step 5 */}
        <SequentialButtons
          currentStep={currentStep}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          activitiesCount={activities.length}
          onStep1Click={handleReviewDataByDate}
          onStep2Click={handleAIProcessing}
          onStep3Click={handleCopyAIContent}
          onStep4Click={handleCompleteReview}
          onStep5Click={handleCheckEditDuplicates} // NEW: Add duplicate management step
          step1Loading={loading}
          step2Loading={aiProcessing}
          step4Loading={saving}
          step5Loading={loading} // Use loading state for duplicate fetch
        />

        {/* NEW: DUPLICATE MANAGEMENT COMPONENT */}
        {showDuplicateManagement && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" color="primary">
                Duplicate Record Management
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setShowDuplicateManagement(false)}
              >
                Back to Review List
              </Button>
            </Box>
            <DuplicateManagement
              activities={duplicateActivities}
              onUpdateRow={handleUpdateDuplicateRow}
              onSaveDuplicateRecords={handleSaveDuplicateRecords}
            />
          </Box>
        )}

        {/* ONLY SHOW ORIGINAL CONTENT WHEN NOT IN DUPLICATE MANAGEMENT MODE */}
        {!showDuplicateManagement && (
          <>
            {/* Persistence Info Alert */}
            {activities.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Data Persistence:</strong> Your data is automatically saved and will persist even if you refresh or close this page.
                  {currentStep > 0 && ` Current step: ${currentStep}`}
                  {selectedYear && ` | Date filter: ${selectedYear}${selectedMonth ? '-' + selectedMonth : ''}`}
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
                <Typography sx={{ ml: 2 }}>Loading review data by date...</Typography>
              </Box>
            )}

            {saving && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Saving reviewed data...</Typography>
              </Box>
            )}

            {duplicateSaving && ( // NEW: Duplicate saving indicator
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Saving duplicate records...</Typography>
              </Box>
            )}

            {error && !aiProcessing && !loading && !saving && !duplicateSaving && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {!loading && !saving && !duplicateSaving && !error && activities.length > 0 && (
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

            {!loading && !saving && !duplicateSaving && activities.length === 0 && !error && currentStep === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Select a year and click "Show Review List by Date" to load data for processing and analysis.
              </Alert>
            )}

            {!loading && !saving && !duplicateSaving && activities.length === 0 && !error && currentStep > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No records found for the selected date range: {selectedYear}{selectedMonth ? '-' + selectedMonth : ''}. 
                Please select a different date range or check if data exists for this period.
              </Alert>
            )}

            {!loading && !saving && !duplicateSaving && activities.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Showing {activities.length} record(s) from {selectedYear}{selectedMonth ? '-' + selectedMonth : ''}.
              </Alert>
            )}
          </>
        )}

        {/* Navigation button to Dashboard */}
        <Box sx={{ mt: 'auto', pt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Go to Dashboard
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

export default ThirdPage;