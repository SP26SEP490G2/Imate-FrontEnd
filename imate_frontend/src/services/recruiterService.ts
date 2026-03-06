import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { SubmitRecruiterProfileRequest } from "@/types/request/recruiter.request";

/**
 * Nộp / cập nhật hồ sơ Recruiter (bước 2 sau khi đăng ký role Recruiter).
 * Backend sẽ tạo hoặc cập nhật bản ghi Recruiter cho account hiện tại.
 */
export const submitRecruiterProfile = async (payload: SubmitRecruiterProfileRequest): Promise<void> => {
  await apiClient.post(APIConfig.Recruiter.SubmitRecruiterProfile, payload);
};
