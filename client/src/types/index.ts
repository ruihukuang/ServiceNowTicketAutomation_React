
//Frontend Field Names


export interface TicketRow{
  id: string;
  incidentNumber: string;
  assignedGroup: string;
  longDescription: string;
  teamFixedIssue: string;
  teamIncludedInTicket: string;
  serviceOwner: string;
  priority: string;
  openDate: string;
  updatedDate: string;
}


//Backend Field Names


export interface IncidentDetails{
  id: string;
  incidentNumber: string;
  assignedGroup: string;
  longDescription: string;
  team_Fixed_Issue: string;
  team_Included_in_Ticket: string;
  serviceOwner: string;
  priority: string;
  openDate: string;
  updatedDate: string;
}


// Optional: Add API response types if needed
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}



// Add this interface for backend responses
export interface BackendResponse {
  id: string;
}


export interface ActivityResponse {
  id: string;
  incidentNumber: string;
  assignedGroup: string;
  longDescription: string;
  team_Fixed_Issue: string;
  team_Included_in_Ticket: string;
  serviceOwner: string;
  priority: string;
  guided_SLAdays: number | null;
  met_SLA: string | null;
  extraDays_AfterSLAdays: number | null;
  numberTeam_Included_in_Ticket: number;
  numberTeam_Fixed_Issue: number;
  is_AissignedGroup_ResponsibleTeam: string | null;
  did_AssignedGroup_Fix_Issue: string | null;
  summary_Issue: string | null;
  summary_Issue_AI: string | null;
  system: string | null;
  system_AI: string | null;
  issue: string | null;
  issue_AI: string | null;
  root_Cause: string | null;
  root_Cause_AI: string | null;
  duplicate: string | null;
  duplicate_AI: string | null;
  openDate: string;
  updatedDate: string;
  openDate_Year: string | null;
  openDate_Month: string | null;
  openDate_Day: string | null;
  updatedDate_Year: string | null;
  updatedDate_Month: string | null;
  updatedDate_Day: string | null;
}