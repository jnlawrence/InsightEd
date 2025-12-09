export enum ProjectStatus {
  UnderProcurement = "Under Procurement",
  NotYetStarted = "Not Yet Started",
  Ongoing = "Ongoing",
  ForFinalInspection = "For Final Inspection and Punchlisting",
  Completed = "Completed"
}

export interface Project {
  id: string; // Internal ID for React keys
  region: string;
  division: string;
  barangay: string;
  schoolId: string;
  schoolName: string;
  projectName: string;
  year: number;
  batchOfFunds: string;
  projectAllocation: number;
  targetCompletionDate: string; // ISO Date string YYYY-MM-DD
  actualCompletionDate?: string; // ISO Date string YYYY-MM-DD
  projectId: string; // Official Project ID
  contractId: string;
  invitationToBid?: string;
  preSubmissionConference?: string;
  bidOpening?: string;
  resolutionToAward?: string;
  noticeToProceed?: string;
  contractorName: string;
  otherRemarks?: string;
  statusAsOfDate: string; // ISO Date
  accomplishmentPercentage: number;
  status: ProjectStatus;
}

export interface DashboardStats {
  total: number;
  completed: number;
  ongoing: number;
  delayed: number;
  totalAllocation: number;
}
