// src/components/Page2/SequentialButtons.tsx
import React from 'react';
import { Box, Button, Typography, Stepper, Step, StepLabel, Paper } from '@mui/material';

interface SequentialButtonsProps {
  currentStep: number;
  onStep1Click: () => void;
  onStep2Click: () => void;
  onStep3Click: () => void;
  onStep4Click: () => void;
  step1Loading?: boolean;
  step2Loading?: boolean;
  step4Loading?: boolean;
}

const steps = [
  'AI and Automation Processing',
  'Show New Review List',
  'Copy AI Content to Review Fields',
  'Complete Review & Save Data'
];

export const SequentialButtons: React.FC<SequentialButtonsProps> = ({
  currentStep,
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
        {/* Step 1 Button - ALWAYS CLICKABLE */}
        <Button
          variant={currentStep >= 0 ? "contained" : "outlined"}
          onClick={onStep1Click}
          disabled={step1Loading}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {step1Loading ? 'Processing...' : '1. AI & Automation'}
        </Button>

        {/* Step 2 Button */}
        <Button
          variant={currentStep >= 1 ? "contained" : "outlined"}
          onClick={onStep2Click}
          disabled={currentStep < 1 || step2Loading}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {step2Loading ? 'Loading...' : '2. Show Review List'}
        </Button>

        {/* Step 3 Button */}
        <Button
          variant={currentStep >= 2 ? "contained" : "outlined"}
          onClick={onStep3Click}
          disabled={currentStep < 2}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          3. Copy AI Content
        </Button>

        {/* Step 4 Button */}
        <Button
          variant={currentStep >= 3 ? "contained" : "outlined"}
          onClick={onStep4Click}
          disabled={currentStep < 3 || step4Loading}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {step4Loading ? 'Saving...' : '4. Complete Review'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Current Step: {currentStep + 1} of {steps.length} - {steps[currentStep]}
      </Typography>
    </Paper>
  );
};