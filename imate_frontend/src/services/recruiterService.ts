import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { SubmitRecruiterProfileRequest } from "@/types/request/recruiter.request";
import type { User } from "@/types/common/auth";
import type { JobResponse } from "@/types/common/recruiter";
import type { GetJobApplicationsRequest } from "@/types/common/recruiter";
/**
 * Nộp / cập nhật hồ sơ Recruiter (bước 2 sau khi đăng ký role Recruiter).
 * Backend sẽ tạo hoặc cập nhật bản ghi Recruiter cho account hiện tại.
 */
export const submitRecruiterProfile = async (payload: SubmitRecruiterProfileRequest): Promise<void> => {
  await apiClient.post(APIConfig.Recruiter.SubmitRecruiterProfile, payload);
};


export const updateRecruiterProfile = async (data: User) => {
  try {
    const res = await apiClient.put(APIConfig.Recruiter.UpdateRecruiterProfile, data);

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
}

export const CreateJobPost = async (data: any) => {
  try {
    return await apiClient.post(APIConfig.Recruiter.CreateJobPost, data);
  } catch (error) {
    console.log("Error creating job post: ", error);
    throw error;
  }
};

export const UpdateJobApplication = async (data: any) => {
  try {
    const res = await apiClient.put(APIConfig.Recruiter.UpdateJobApplication, data);

    return res.data;
  } catch (error) {
    console.log("Error updating job application: ", error);
    throw error;
  }
};

export const CloseJobApplication = async (data: any) => {
  try {
    const res = await apiClient.put(APIConfig.Recruiter.CloseJobApplication, data);

    return res.data;
  } catch (error) {
    console.log("Error closing job application: ", error);
    throw error;
  }
};