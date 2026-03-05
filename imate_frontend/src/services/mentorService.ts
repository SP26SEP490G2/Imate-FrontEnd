import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { ListPreviewMentorResponse, GetListPreviewMentorsResponse } from "@/types/common/mentor";

export interface SubmitMentorProfilePayload {
  bio: string;
  phone: string;
  birthDate?: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  pricePerSession?: number;
}

/**
 * Get list of preview mentors for home page
 * @returns Promise<ListPreviewMentorResponse[]>
 */
export const getListPreviewMentors = async (): Promise<ListPreviewMentorResponse[]> => {
  const response = await apiClient.get<GetListPreviewMentorsResponse>(APIConfig.Mentor.GetListPreviewMentors);
  return response.data.data || [];
};

/**
 * Nộp / cập nhật hồ sơ Mentor (bước 2 sau khi đăng ký role Mentor).
 * Backend sẽ tạo hoặc cập nhật bản ghi Mentor cho account hiện tại.
 */
export const submitMentorProfile = async (payload: SubmitMentorProfilePayload): Promise<void> => {
  await apiClient.post(APIConfig.Mentor.SubmitMentorProfile, payload);
};

