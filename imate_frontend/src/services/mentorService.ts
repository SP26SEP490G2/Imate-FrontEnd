import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { ListPreviewMentorResponse, GetListPreviewMentorsResponse } from "@/types/common/mentor";

/**
 * Get list of preview mentors for home page
 * @returns Promise<ListPreviewMentorResponse[]>
 */

export const getListPreviewMentors = async (): Promise<ListPreviewMentorResponse[]> => {
  const response = await apiClient.get<GetListPreviewMentorsResponse>(APIConfig.Mentor.GetListPreviewMentors);
  // API trả về { data: [...] }, extract array từ property data
  return response.data.data || [];
};

