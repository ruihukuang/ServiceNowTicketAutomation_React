import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import './Dashboard.css';

// Import Recharts components for data visualization
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList
} from 'recharts';

// Define interface for dashboard data structure
interface DashboardData {
  metSla: number;                    // Percentage value like 100.00
  averageExtraDays: number;          // Number like 8.50
  priority: {                        // Object with priority counts
    P1: number; 
    P2: number; 
    P3: number; 
    P4: number;
  };
  nonFunctionalTeam: {               // Non-functional team inclusion counts
    included: number; 
    notIncluded: number;
  };
  assignedTeamResponsible: {         // Team responsibility counts
    yes: number; 
    no: number;
  };
  assignedTeamFixing: {              // Team fixing issues counts
    yes: number; 
    no: number;
  };
  systemDistribution: {              // System type counts
    jupyterhub: number; 
    zeppelin: number;
  };
  issuesBreakdown: Record<string, number>;  // Issue category counts
  duplicateGroups: number;           // Duplicate groups count
}

// Local storage key for saving filters
const DASHBOARD_FILTERS_KEY = 'dashboardFilters';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  
  // CHANGED: Load filters from localStorage on component mount
  const loadFiltersFromStorage = () => {
    try {
      const savedFilters = localStorage.getItem(DASHBOARD_FILTERS_KEY);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        return {
          ...parsedFilters,
          // Ensure month is cleared if filterMode is yearOnly
          month: parsedFilters.filterMode === 'yearOnly' ? '' : parsedFilters.month
        };
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return null;
  };

  // CHANGED: Initialize filter state with saved values or defaults
  const initialFilters = loadFiltersFromStorage() || {
    year: currentYear.toString(),
    month: (new Date().getMonth() + 1).toString(),
    serviceOwner: 'Mark',
    filterMode: 'yearMonth'
  };
  
  const [filters, setFilters] = useState(initialFilters);
  
  // CHANGED: Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_FILTERS_KEY, JSON.stringify(filters));
      console.log('💾 Filters saved to localStorage:', filters);
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters]);

  // Initialize dashboard data state with default values
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metSla: 0,
    averageExtraDays: 0,
    priority: { P1: 0, P2: 0, P3: 0, P4: 0 },
    nonFunctionalTeam: { included: 0, notIncluded: 0 },
    assignedTeamResponsible: { yes: 0, no: 0 },
    assignedTeamFixing: { yes: 0, no: 0 },
    systemDistribution: { jupyterhub: 0, zeppelin: 0 },
    issuesBreakdown: {},
    duplicateGroups: 0
  });

  // Generate year options from 2024 to current year
  const years = Array.from(
    { length: currentYear - 2024 + 1 },
    (_, i) => (2024 + i).toString()
  );
  
  // Month options with labels
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  // Service owner options
  const serviceOwners = ['Mark', 'Mike', 'Sarah', 'Jennifer'];

  // Filter mode options
  const filterModes = [
    { value: 'yearOnly', label: 'Year Only' },
    { value: 'yearMonth', label: 'Year & Month' }
  ];

  // CHANGED: Handle filter change events
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // CHANGED: Handle filter mode change
  const handleFilterModeChange = (mode: string) => {
    setFilters(prev => ({
      ...prev,
      filterMode: mode,
      // Clear month when switching to year-only mode
      month: mode === 'yearOnly' ? '' : prev.month || (new Date().getMonth() + 1).toString()
    }));
  };

  // CHANGED: Clear all saved filters
  const handleClearFilters = () => {
    const defaultFilters = {
      year: currentYear.toString(),
      month: (new Date().getMonth() + 1).toString(),
      serviceOwner: 'Mark',
      filterMode: 'yearMonth'
    };
    setFilters(defaultFilters);
    alert('Filters cleared to defaults');
  };

  // CHANGED: Fetch all dashboard data from API with flexible filtering
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { year, month, serviceOwner, filterMode } = filters;
      
      // CHANGED: Validate filters based on mode
      if (!year || !serviceOwner) {
        alert('Please select Year and Service Owner');
        setLoading(false);
        return;
      }
      
      if (filterMode === 'yearMonth' && !month) {
        alert('Please select Month when using Year & Month filter mode');
        setLoading(false);
        return;
      }
      
      console.log(`🔍 Fetching dashboard data with mode: ${filterMode}`);
      console.log(`📅 Filters: Year=${year}, Month=${month || 'N/A'}, ServiceOwner=${serviceOwner}`);

      // CHANGED: Fetch all dashboard data in parallel with flexible month parameter
      const [
        metSla,
        averageExtraDays,
        priority,
        nonFunctionalTeam,
        assignedTeamResponsible,
        assignedTeamFixing,
        systemDistribution,
        issuesBreakdown,
        duplicateGroups
      ] = await Promise.all([
        dataService.getMetSLA(year, month, serviceOwner),
        dataService.getExtraDaysAfterSLA(year, month, serviceOwner),
        dataService.getPriorityDistribution(year, month, serviceOwner),
        dataService.getNonFunctionalTeamInclusion(year, month, serviceOwner),
        dataService.getAssignedTeamResponsible(year, month, serviceOwner),
        dataService.getAssignedTeamFixingIssues(year, month, serviceOwner),
        dataService.getSystemDistribution(year, month, serviceOwner),
        dataService.getIssuesBreakdown(year, month, serviceOwner),
        dataService.getDuplicateGroups(year, month, serviceOwner)
      ]);

      // Update dashboard data state with fetched values
      setDashboardData({
        metSla,
        averageExtraDays,
        priority,
        nonFunctionalTeam,
        assignedTeamResponsible,
        assignedTeamFixing,
        systemDistribution,
        issuesBreakdown,
        duplicateGroups
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // CHANGED: Handle apply filters button click with validation
  const handleApplyFilters = () => {
    const { year, month, serviceOwner, filterMode } = filters;
    
    if (!year || !serviceOwner) {
      alert('Please select Year and Service Owner');
      return;
    }
    
    if (filterMode === 'yearMonth' && !month) {
      alert('Please select Month when using Year & Month filter mode');
      return;
    }
    
    fetchDashboardData();
  };

  // Navigate back to page 3
  const handleBackToPageThree = () => {
    navigate('/page3');
  };

  // Prepare chart data from dashboard data

  // Priority chart data for Pie chart
  const priorityChartData = [
    { name: 'P1', value: dashboardData.priority.P1, color: '#ff4d4d' },
    { name: 'P2', value: dashboardData.priority.P2, color: '#ff944d' },
    { name: 'P3', value: dashboardData.priority.P3, color: '#4d79ff' },
    { name: 'P4', value: dashboardData.priority.P4, color: '#4dff88' }
  ];

  // Non-functional team data for Pie chart
  const nonFunctionalTeamData = [
    { name: 'Included', value: dashboardData.nonFunctionalTeam.included, color: '#4CAF50' },
    { name: 'Not Included', value: dashboardData.nonFunctionalTeam.notIncluded, color: '#F44336' }
  ];

  // Assigned team responsible data for Bar chart
  const assignedTeamResponsibleData = [
    { name: 'Yes', value: dashboardData.assignedTeamResponsible.yes, color: '#4CAF50' },
    { name: 'No', value: dashboardData.assignedTeamResponsible.no, color: '#F44336' }
  ];

  // Assigned team fixing data for Bar chart
  const assignedTeamFixingData = [
    { name: 'Yes', value: dashboardData.assignedTeamFixing.yes, color: '#4CAF50' },
    { name: 'No', value: dashboardData.assignedTeamFixing.no, color: '#F44336' }
  ];

  // System distribution data for Bar chart
  const systemData = [
    { name: 'Jupyterhub', value: dashboardData.systemDistribution.jupyterhub, color: '#667eea' },
    { name: 'Zeppelin', value: dashboardData.systemDistribution.zeppelin, color: '#764ba2' }
  ];

  // Issues breakdown data for Bar chart - sort by value descending
  const issuesData = Object.entries(dashboardData.issuesBreakdown)
    .map(([key, value]) => ({
      name: key,
      value
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate total records for summary
  const totalPriorityRecords = dashboardData.priority.P1 + dashboardData.priority.P2 + 
                              dashboardData.priority.P3 + dashboardData.priority.P4;
  
  const totalNonFunctionalRecords = dashboardData.nonFunctionalTeam.included + 
                                   dashboardData.nonFunctionalTeam.notIncluded;
  
  const totalResponsibleRecords = dashboardData.assignedTeamResponsible.yes + 
                                 dashboardData.assignedTeamResponsible.no;
  
  const totalFixingRecords = dashboardData.assignedTeamFixing.yes + 
                            dashboardData.assignedTeamFixing.no;
  
  const totalSystemRecords = dashboardData.systemDistribution.jupyterhub + 
                            dashboardData.systemDistribution.zeppelin;
  
  const totalIssuesRecords = Object.values(dashboardData.issuesBreakdown)
    .reduce((sum, value) => sum + value, 0);

  // CHANGED: Helper function to format filter display
  const getFilterDisplayText = () => {
    const { year, month, serviceOwner, filterMode } = filters;
    if (filterMode === 'yearOnly') {
      return `Filter: Year ${year}, ${serviceOwner}`;
    } else {
      const monthName = months.find(m => m.value === month)?.label || month;
      return `Filter: ${year}-${monthName}, ${serviceOwner}`;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header with Navigation and Filters */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToPageThree}>
            ← Back to Date-Based Existing Data Processing & Review
          </button>
          <h1>ServiceNow Ticket Dashboard</h1>
        </div>
        
        {/* CHANGED: Filter controls section with mode selector */}
        <div className="filter-section">
          {/* Filter Mode Selector */}
          <div className="filter-group">
            <label>Filter Mode</label>
            <select 
              value={filters.filterMode} 
              onChange={(e) => handleFilterModeChange(e.target.value)}
              className="filter-mode-selector"
            >
              {filterModes.map(mode => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Year</label>
            <select 
              value={filters.year} 
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* CHANGED: Conditionally render Month selector */}
          {filters.filterMode === 'yearMonth' && (
            <div className="filter-group">
              <label>Month</label>
              <select 
                value={filters.month} 
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="filter-group">
            <label>Service Owner</label>
            <select 
              value={filters.serviceOwner} 
              onChange={(e) => handleFilterChange('serviceOwner', e.target.value)}
            >
              {serviceOwners.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="apply-button" 
            onClick={handleApplyFilters}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          
          {/* CHANGED: Add Clear Filters button */}
          <button 
            className="clear-button" 
            onClick={handleClearFilters}
            title="Clear saved filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="loading-spinner">Loading dashboard data...</div>
      ) : (
        <>
          {/* Top Section - Met SLA (Single Large Card) */}
          <div className="dashboard-row top-row">
            <div className="dashboard-card met-sla-card center-content">
              <div className="card-icon">
                <span className="icon">📊</span>
              </div>
              <div className="card-content">
                <div className="card-title">Met SLA</div>
                <div className="card-value-large">{dashboardData.metSla.toFixed(2)}%</div>
                <div className="card-description">Service Level Agreement Compliance</div>
                <div className="card-details">
                  <div className="detail-item">
                    {/* CHANGED: Use dynamic filter display */}
                    <span className="detail-label">{getFilterDisplayText()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section - 5 Cards */}
          <div className="dashboard-row middle-row">
            {/* Average Extra Days After SLA */}
            <div className="dashboard-card center-content">
              <div className="card-icon">
                <span className="icon">📅</span>
              </div>
              <div className="card-content">
                <div className="card-title">Average Extra Days After SLA</div>
                <div className="card-value">{dashboardData.averageExtraDays.toFixed(2)}</div>
                <div className="card-unit">days</div>
                <div className="card-description">Average delay beyond SLA</div>
              </div>
            </div>

            {/* CHANGED: Priority Distribution - REMOVED Bar Chart, simple display */}
            <div className="dashboard-card center-content">
              <div className="card-icon">
                <span className="icon">⚡</span>
              </div>
              <div className="card-content">
                <div className="card-title">Priority Distribution</div>
                <div className="priority-stats">
                  <div className="priority-item">
                    <span className="priority-label p1">P1:</span>
                    <span className="priority-value">{dashboardData.priority.P1}</span>
                  </div>
                  <div className="priority-item">
                    <span className="priority-label p2">P2:</span>
                    <span className="priority-value">{dashboardData.priority.P2}</span>
                  </div>
                  <div className="priority-item">
                    <span className="priority-label p3">P3:</span>
                    <span className="priority-value">{dashboardData.priority.P3}</span>
                  </div>
                  <div className="priority-item">
                    <span className="priority-label p4">P4:</span>
                    <span className="priority-value">{dashboardData.priority.P4}</span>
                  </div>
                </div>
                <div className="card-unit">tickets</div>
                <div className="total-records">Total: {totalPriorityRecords} records</div>
              </div>
            </div>

            {/* CHANGED: Non-Functional Team Included - REMOVED Bar Chart, simple display */}
            <div className="dashboard-card center-content">
              <div className="card-icon">
                <span className="icon">👥</span>
              </div>
              <div className="card-content">
                <div className="card-title">Non-Functional Team Included</div>
                <div className="team-stats">
                  <div className="team-item included">
                    <span className="team-label">Included:</span>
                    <span className="team-value">{dashboardData.nonFunctionalTeam.included}</span>
                  </div>
                  <div className="team-item not-included">
                    <span className="team-label">Not Included:</span>
                    <span className="team-value">{dashboardData.nonFunctionalTeam.notIncluded}</span>
                  </div>
                </div>
                <div className="card-unit">tickets</div>
                <div className="total-records">Total: {totalNonFunctionalRecords} records</div>
              </div>
            </div>

            {/* Is Assigned Team Responsible with Bar Chart */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">
                  <span className="icon">✅</span>
                </div>
                <div className="card-title">Is Assigned Team Responsible?</div>
              </div>
              
              {/* Bar Chart Visualization */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={assignedTeamResponsibleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {assignedTeamResponsibleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#333" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Responsibility counts */}
              <div className="card-stats">
                <div className="stat-item yes">
                  <span className="stat-label">Yes:</span>
                  <span className="stat-value">{dashboardData.assignedTeamResponsible.yes}</span>
                </div>
                <div className="stat-item no">
                  <span className="stat-label">No:</span>
                  <span className="stat-value">{dashboardData.assignedTeamResponsible.no}</span>
                </div>
              </div>
              
              <div className="total-records">
                Total: {totalResponsibleRecords} records
              </div>
            </div>

            {/* Did Assigned Team Fix Issues with Bar Chart */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">
                  <span className="icon">🔧</span>
                </div>
                <div className="card-title">Did Assigned Team Fix Issues?</div>
              </div>
              
              {/* Bar Chart Visualization */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={assignedTeamFixingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {assignedTeamFixingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#333" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Fixing issues counts */}
              <div className="card-stats">
                <div className="stat-item yes">
                  <span className="stat-label">Yes:</span>
                  <span className="stat-value">{dashboardData.assignedTeamFixing.yes}</span>
                </div>
                <div className="stat-item no">
                  <span className="stat-label">No:</span>
                  <span className="stat-value">{dashboardData.assignedTeamFixing.no}</span>
                </div>
              </div>
              
              <div className="total-records">
                Total: {totalFixingRecords} records
              </div>
            </div>
          </div>

          {/* Bottom Section - Remaining 3 Cards */}
          <div className="dashboard-row bottom-row">
            {/* System Distribution with Bar Chart */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">
                  <span className="icon">💻</span>
                </div>
                <div className="card-title">System Distribution</div>
              </div>
              
              {/* Bar Chart Visualization */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={systemData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {systemData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#333" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* System counts */}
              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-label">Jupyterhub:</span>
                  <span className="stat-value">{dashboardData.systemDistribution.jupyterhub}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Zeppelin:</span>
                  <span className="stat-value">{dashboardData.systemDistribution.zeppelin}</span>
                </div>
              </div>
              
              <div className="total-records">
                Total: {totalSystemRecords} records
              </div>
            </div>

            {/* Issues Breakdown with Bar Chart */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon">
                  <span className="icon">🚨</span>
                </div>
                <div className="card-title">Issues Breakdown</div>
              </div>
              
              {/* Horizontal Bar Chart for Issues */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={issuesData} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={90}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        fill="#333" 
                        fontSize={11}
                        offset={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Duplicate Groups - ALL CONTENT CENTERED */}
            <div className="dashboard-card duplicate-groups-card center-all-content">
              <div className="card-content-center">
                <div className="card-icon-center">
                  <span className="icon-center">📋</span>
                </div>
                <div className="card-title-center">Duplicate Groups</div>
                <div className="card-value-center">{dashboardData.duplicateGroups}</div>
                <div className="card-description-center">Duplicate ticket groups identified</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;