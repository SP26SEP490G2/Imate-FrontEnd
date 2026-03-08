import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { ListPreviewMentorResponse, GetListPreviewMentorsResponse } from "@/types/common/mentor";
import type { SubmitMentorProfileRequest } from "@/types/request/mentor.request";

/** @deprecated Dùng SubmitMentorProfileRequest từ @/types/request/mentor.request */
export type SubmitMentorProfilePayload = SubmitMentorProfileRequest;

/** Normalize item from API (backend may return PascalCase or camelCase) */
function normalizeMentorItem(raw: Record<string, unknown>): ListPreviewMentorResponse {
  return {
    fullName: (raw.fullName ?? raw.FullName ?? "") as string,
    position: (raw.position ?? raw.Position ?? "") as string,
    yoe: Number(raw.yoe ?? raw.Yoe ?? 0),
    company: (raw.company ?? raw.Company ?? "") as string,
    avgRatings: (raw.avgRatings ?? raw.AvgRatings) as number | null ?? null,
    totalRatingCount: (raw.totalRatingCount ?? raw.TotalRatingCount) as number | null ?? null,
    avatarUrl: (raw.avatarUrl ?? raw.AvatarUrl) as string | undefined,
    bio: (raw.bio ?? raw.Bio) as string | undefined,
    accountId: (raw.accountId ?? raw.AccountId) as number | undefined,
  };
}

/**
 * Get list of preview mentors for home page
 * @returns Promise<ListPreviewMentorResponse[]>
 */
export const getListPreviewMentors = async (): Promise<ListPreviewMentorResponse[]> => {
  const response = await apiClient.get(APIConfig.Mentor.GetListPreviewMentors);
  const data = response.data?.data ?? response.data?.Data;
  if (!Array.isArray(data)) return [];
  return data.map((item: Record<string, unknown>) => normalizeMentorItem(item));
};

/**
 * Nộp / cập nhật hồ sơ Mentor (bước 2 sau khi đăng ký role Mentor).
 * Backend sẽ tạo hoặc cập nhật bản ghi Mentor cho account hiện tại.
 */
export const submitMentorProfile = async (payload: SubmitMentorProfileRequest): Promise<void> => {
  await apiClient.post(APIConfig.Mentor.SubmitMentorProfile, payload);
};

