export interface TicketRow {
  id: string;
  IncidentNumber: string;
  AssignedGroup: string;
  LongDescription: string;
  Team_Fixed_Issue: string;
  Team_Included_in_Ticket: string;
  ServiceOwner: string;
  Priority: string;
  OpenDate: string;
  UpdatedDate: string;
}

// Optional: Add API response types if needed
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface TicketRow {
  id: string;
  IncidentNumber: string;
  AssignedGroup: string;
  LongDescription: string;
  Team_Fixed_Issue: string;
  Team_Included_in_Ticket: string;
  ServiceOwner: string;
  Priority: string;
  OpenDate: string;
  UpdatedDate: string;
}

// Add this interface for backend responses
export interface BackendResponse {
  id: string;
}