import apiClient from "@/services/apiClient";
import type { User } from "@/types/common/auth";
import type { JobItem } from "@/types/common/recruiter";
import type { PaginatedApiResponse, CommonParams } from "@/types/common/pagination";
import type { GetJobApplicationsRequest } from "@/types/common/recruiter";
import APIConfig from "@/config/apiConfig";



export const updateRecruiterProfile = async (data: User) => {
  try {
    const res = await apiClient.put("/recruiter-profile", data);

    return res.data;
  } catch (error) {
    console.log("Error updating recruiter profile: ", error);
    throw error;
  }
};

export const getRecruiterJobApplications = async (
  params?: GetJobApplicationsRequest
): Promise<PaginatedApiResponse<JobItem>> => {

  const response = await apiClient.get<{ data: JobItem[] }>(
    APIConfig.Recruiter.GetJobApplicationList,
    { params }
  );

  // Extract pagination from header
  const paginationHeader = response.headers["x-pagination"];

  const pagination = paginationHeader
    ? JSON.parse(paginationHeader)
    : {
        totalCount: 0,
        pageSize: params?.pageSize || 10,
        pageNumber: params?.pageNumber || 1,
        totalPages: 0,
      };

  return {
    data: response.data.data || [],
    totalCount: pagination.totalCount || pagination.TotalCount,
    pageNumber: pagination.pageNumber || pagination.PageNumber,
    pageSize: pagination.pageSize || pagination.PageSize,
    totalPages: pagination.totalPages || pagination.TotalPages,
  };
}

export const CreateJobApplication = async (data: JobItem) => {
  try {
    const res = await apiClient.post("/create-job-applications", data);

    return res.data;
  } catch (error) {
    console.log("Error creating job application: ", error);
    throw error;
  }
};

export const UpdateJobApplication = async (data: JobItem) => {
  try {
    const res = await apiClient.put("/update-job-applications", data);

    return res.data;
  } catch (error) {
    console.log("Error updating job application: ", error);
    throw error;
  }
};

export const CloseJobApplication = async (data: JobItem) => {
  try {
    const res = await apiClient.put("/Close-job-applications", data);

    return res.data;
  } catch (error) {
    console.log("Error closing job application: ", error);
    throw error;
  }
};