import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { ListPreviewMentor } from "@/types/common/mentor";

/**
 * Get list of preview mentors for home page
 * @returns Promise<ListPreviewMentor[]>
 */

export const getListPreviewMentors = async (): Promise<ListPreviewMentor[]> => {
  return apiClient.get<ListPreviewMentor[]>(APIConfig.Mentor.GetListPreviewMentors).then((res) => res.data);
};

