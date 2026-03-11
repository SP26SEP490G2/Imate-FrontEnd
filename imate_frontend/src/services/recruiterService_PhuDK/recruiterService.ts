import apiClient from "@/services/apiClient";
import type { User } from "@/types/common/auth";
import type { JobItem, JobResponse } from "@/types/common/recruiter";
import type { PaginatedApiResponse } from "@/types/common/pagination";
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
): Promise<JobResponse> => {
  const queryParams = {
    PageNumber: params?.pageNumber,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
    Location: params?.location,
    EmploymentType: params?.employmentType,
    Status: params?.status,
  };

  const response = await apiClient.get(
    APIConfig.Recruiter.GetRecruiterJobApplication,
    { params: queryParams }
  );
  return response.data.data as JobResponse;

  // Extract pagination from header
  // const paginationHeader =response.headers["X-Pagination"];

  // const pagination = paginationHeader
  //   ? JSON.parse(paginationHeader)
  //   : {
  //       totalCount: 0,
  //       pageSize: params?.pageSize || 10,
  //       pageNumber: params?.pageNumber || 1,
  //       totalPages: 0,
  //     };
  //   console.log("JOBDATA: ", response);
  //   console.log("Pagination info: ", pagination);

  // return {
  //   response.
  // };
}

export const CreateJobPost = async (data: any) => {
  try {
    return await apiClient.post("/create-job-posts", data);
  } catch (error) {
    console.log("Error creating job post: ", error);
    throw error;
  }
};

export const UpdateJobApplication = async (data: any) => {
  try {
    const res = await apiClient.put("/update-job-applications", data);

    return res.data;
  } catch (error) {
    console.log("Error updating job application: ", error);
    throw error;
  }
};

export const CloseJobApplication = async (data: any) => {
  try {
    const res = await apiClient.put("/Close-job-applications", data);

    return res.data;
  } catch (error) {
    console.log("Error closing job application: ", error);
    throw error;
  }
};