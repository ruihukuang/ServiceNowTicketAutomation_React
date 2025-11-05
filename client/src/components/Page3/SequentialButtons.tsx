// src/components/Page3/SequentialButtons.tsx - UPDATED
import React from 'react';
import { Box, Button, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';

interface SequentialButtonsProps {
  currentStep: number;
  selectedYear: string;
  selectedMonth: string;
  activitiesCount: number; // NEW: Add activities count
  onStep1Click: () => void;
  onStep2Click: () => void;
  onStep3Click: () => void;
  onStep4Click: () => void;
  step1Loading?: boolean;
  step2Loading?: boolean;
  step4Loading?: boolean;
}

const steps = [
  'Show Review List by Date',
  'AI and Automation Processing',
  'Copy AI Content to Review Fields',
  'Complete Review & Save Data'
];

export const SequentialButtons: React.FC<SequentialButtonsProps> = ({
  currentStep,
  selectedYear,
  selectedMonth,
  activitiesCount, // NEW: Receive activities count
  onStep1Click,
  onStep2Click,
  onStep3Click,
  onStep4Click,
  step1Loading = false,
  step2Loading = false,
  step4Loading = false,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Step 1 Button - Requires year selection */}
        <Button
          variant={currentStep >= 0 ? "contained" : "outlined"}
          onClick={onStep1Click}
          disabled={!selectedYear || step1Loading}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {step1Loading ? 'Loading...' : '1. Show Review List'}
        </Button>

        {/* Step 2 Button - UPDATED: Disabled if no activities */}
        <Button
          variant={currentStep >= 1 ? "contained" : "outlined"}
          onClick={onStep2Click}
          disabled={currentStep < 1 || step2Loading || activitiesCount === 0}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {step2Loading ? 'Processing...' : '2. AI & Automation'}
        </Button>

        {/* Step 3 Button - UPDATED: Disabled if no activities */}
        <Button
          variant={currentStep >= 2 ? "contained" : "outlined"}
          onClick={onStep3Click}
          disabled={currentStep < 2 || activitiesCount === 0}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          3. Copy AI Content
        </Button>

        {/* Step 4 Button - UPDATED: Disabled if no activities */}
        <Button
          variant={currentStep >= 3 ? "contained" : "outlined"}
          onClick={onStep4Click}
          disabled={currentStep < 3 || step4Loading || activitiesCount === 0}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {step4Loading ? 'Saving...' : '4. Complete Review'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Current Step: {currentStep + 1} of {steps.length} - {steps[currentStep]}
        {selectedYear && ` | Date: ${selectedYear}${selectedMonth ? '-' + selectedMonth : ''}`}
        {activitiesCount > 0 && ` | Records: ${activitiesCount}`}
      </Typography>

      {!selectedYear && (
        <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
          Please select a year to enable the first step.
        </Typography>
      )}

      {/* NEW: Warning when no activities found */}
      {selectedYear && activitiesCount === 0 && currentStep >= 1 && (
        <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
          No records found for selected date range. Please try a different year/month combination.
        </Typography>
      )}
    </Paper>
  );
};