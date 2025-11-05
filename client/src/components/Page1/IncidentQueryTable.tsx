import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Typography,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import type { TicketRow } from '../../types';
import { dataService } from '../../services/dataService';
import { useSnackbar } from './snackbar';

const IncidentQueryTable: React.FC = () => {
  const [incidentNumber, setIncidentNumber] = useState('');
  const [searchResults, setSearchResults] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const { showSnackbar } = useSnackbar();

  const handleSearch = async () => {
    if (!incidentNumber.trim()) {
      showSnackbar('Please enter an incident number', 'warning', 3000);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching for ALL incidents with number:', incidentNumber);
      const incidents = await dataService.getIncidentByNumber(incidentNumber.trim());
      console.log('✅ Found incidents:', incidents);
      setSearchResults(incidents);
      setSearchPerformed(true);
      showSnackbar(`Found ${incidents.length} incident(s) successfully!`, 'success', 3000);
    } catch (error: any) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
      setSearchPerformed(true);
      
      if (error.message?.includes('not found')) {
        showSnackbar(`No incidents found with number "${incidentNumber}"`, 'error', 5000);
      } else {
        showSnackbar(`Error searching for incidents: ${error.message}`, 'error', 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, incidentNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete incident ${incidentNumber}?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting incident:', id);
      await dataService.deleteIncident(id);
      setSearchResults(prev => prev.filter(item => item.id !== id));
      showSnackbar(`Incident ${incidentNumber} deleted successfully!`, 'success', 5000);
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      showSnackbar(`Error deleting incident: ${error.message}`, 'error', 5000);
    }
  };

  const handleClearSearch = () => {
    setIncidentNumber('');
    setSearchResults([]);
    setSearchPerformed(false);
    console.log('🧹 Search cleared');
  };

  const handleRefresh = () => {
    if (incidentNumber.trim()) {
      console.log('🔄 Refreshing search');
      handleSearch();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // UPDATED: Better value checking function
  const hasValue = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '' && String(value).trim() !== '';
  };

  // UPDATED: Get display value with proper fallback
  const getDisplayValue = (value: any): string => {
    return hasValue(value) ? String(value).trim() : 'N/A';
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };

  console.log('📊 IncidentQueryTable rendering:', {
    incidentNumber,
    searchResultsCount: searchResults.length,
    loading,
    searchPerformed
  });

  return (
    <Box sx={{ mt: 4, border: '1px solid #e0e0e0', borderRadius: 1, p: 2, backgroundColor: '#fafafa' }}>
      <Typography variant="h5" component="h2" gutterBottom color="primary">
        🔍 Incident Query & Management
      </Typography>
      
      <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Incident Number"
            value={incidentNumber}
            onChange={(e) => setIncidentNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter incident number to search..."
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
            disabled={loading}
          />
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={loading || !incidentNumber.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || !incidentNumber.trim()}
          >
            Refresh
          </Button>
          <Button
            variant="text"
            onClick={handleClearSearch}
            disabled={loading}
          >
            Clear
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Search for incidents by incident number. Returns ALL matching records.
        </Alert>
      </Paper>

      {searchPerformed && (
        <Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={`${searchResults.length} record(s) found`}
              color={searchResults.length > 0 ? "success" : "default"}
              variant="outlined"
            />
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: '600px', overflow: 'auto' }}>
            <Table sx={{ minWidth: 1200 }} aria-label="incident query results table" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: 200 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Incident Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Assigned Group</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Service Owner</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Team Fixed Issue</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Team Included in Ticket</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 180 }}>Open Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 180 }}>Updated Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 300 }}>Long Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.length > 0 ? (
                  searchResults.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                          {incident.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {getDisplayValue(incident.incidentNumber)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getDisplayValue(incident.assignedGroup)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getDisplayValue(incident.serviceOwner)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: 
                              incident.priority === 'P1' ? 'error.light' :
                              incident.priority === 'P2' ? 'warning.light' :
                              incident.priority === 'P3' ? 'info.light' : // FIXED: Added space
                              'success.light',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {getDisplayValue(incident.priority)}
                        </Box>
                      </TableCell>
                      {/* UPDATED: Team Fixed Issue - Fixed field name */}
                      <TableCell>
                        <Typography variant="body2">
                          {getDisplayValue(incident.teamFixedIssue)}
                        </Typography>
                      </TableCell>
                      {/* UPDATED: Team Included - Fixed field name */}
                      <TableCell>
                        <Typography variant="body2">
                          {getDisplayValue(incident.teamIncludedInTicket)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.75rem">
                          {formatDateTime(incident.openDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.75rem">
                          {formatDateTime(incident.updatedDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: '400px'
                          }}
                        >
                          {getDisplayValue(incident.longDescription)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete incident">
                          <IconButton
                            onClick={() => handleDelete(incident.id, incident.incidentNumber)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No incidents found. Try searching with a different incident number.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {searchResults.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Found {searchResults.length} incident(s) with number "{incidentNumber}".
            </Alert>
          )}
        </Box>
      )}

    </Box>
  );
};

export default IncidentQueryTable;