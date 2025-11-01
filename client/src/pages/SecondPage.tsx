import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import ProcessTable from '../components/Page2/ProcessTable';

const SecondPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Processing Table
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Process your data and manage results. Select rows to delete and reprocess specific entries.
        </Typography>
        <ProcessTable />
      </Paper>
    </Container>
  );
};

export default SecondPage;