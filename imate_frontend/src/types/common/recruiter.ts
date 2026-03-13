
export interface JobItem {
  id: number;
  title: string;
  employmentType: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  applicationDeadline: string;
  status: string;
  jobDescription: string;
  jobSkills: { id: number; skillName: string }[];
  jobPositions: { id: number; positionName: string }[];
}

export interface GetJobApplicationsRequest {
  searchTerm?: string;
  location?: string;
  employmentType?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface JobResponse {
  items: JobItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}

export interface GetAppliedCandidateRequest {
  jobId: number;
  searchTerm?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AppliedCandidateItem {
  applicationId: number;
  appliedDate: string;
  status: string;
  recruiterFeedback?: string;

  candidateId: number;
  candidateFullName: string;
  candidateEmail: string;

  candidateFileUrl: string;
  candidateFileName: string;
  candidateScannedData: string;
}

export interface AppliedCandidateResponse {
  items: AppliedCandidateItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}