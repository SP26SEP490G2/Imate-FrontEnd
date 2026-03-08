export interface JobItem {
  id: number;
  title: string;
  employmentType: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  applicationDeadline: string;
  status: string;
}

export interface JobResponse {
  jobs: JobItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}