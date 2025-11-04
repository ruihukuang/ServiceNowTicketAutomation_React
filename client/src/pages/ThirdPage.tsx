// src/pages/ThirdPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Stack,
  Card,
  CardContent,
  Grid
} from '@mui/material';

const ThirdPage: React.FC = () => {
  const navigate = useNavigate();

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
        maxWidth: '1200px',
        minHeight: '600px'
      }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" align="center">
          Data Analysis & Insights
        </Typography>
        <Typography variant="h6" component="p" gutterBottom align="center" sx={{ mb: 4 }}>
          Analyze your processed data and gain valuable insights.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  📊 Analytics
                </Typography>
                <Typography variant="body2">
                  View detailed analytics and trends from your processed data.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  📈 Reports
                </Typography>
                <Typography variant="body2">
                  Generate comprehensive reports based on your data analysis.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🔍 Insights
                </Typography>
                <Typography variant="body2">
                  Discover patterns and insights from your processed incidents.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          This page is for data analysis and visualization. You can add charts, graphs, 
          and detailed reports based on the processed data from Page 2.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            onClick={() => navigate('/page2')}
            size="large"
          >
            Back to Data Processing
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/page1')}
            size="large"
          >
            Back to Data Entry
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ThirdPage;