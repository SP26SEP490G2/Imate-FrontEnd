import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { ListPreviewMentorResponse } from "@/types/common/mentor";
import type { CommonParams, PaginatedApiResponse } from "@/types/common/pagination";
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
 * Get list of preview mentors with pagination (PagedList)
 */
export const getListPreviewMentors = async (
  params: CommonParams
): Promise<PaginatedApiResponse<ListPreviewMentorResponse>> => {
  const response = await apiClient.get<{
    items?: Record<string, unknown>[];
    Items?: Record<string, unknown>[];
    totalCount?: number;
    TotalCount?: number;
    pageNumber?: number;
    PageNumber?: number;
    pageSize?: number;
    PageSize?: number;
    totalPages?: number;
    TotalPages?: number;
  }>(APIConfig.Mentor.GetListPreviewMentors, {
    params,
  });

  const body = response.data ?? {};
  const raw = Array.isArray(body.items ?? body.Items) ? (body.items ?? body.Items)! : [];
  const data = raw.map((item) => normalizeMentorItem(item));

  const header = response.headers["x-pagination"];
  let meta: any = {};
  try {
    meta = header ? JSON.parse(header) : {};
  } catch {
    meta = {};
  }

  return {
    data,
    totalCount: meta.TotalCount ?? meta.totalCount ?? body.TotalCount ?? body.totalCount ?? 0,
    pageNumber: meta.PageNumber ?? meta.pageNumber ?? body.PageNumber ?? body.pageNumber ?? params.pageNumber ?? 1,
    pageSize: meta.PageSize ?? meta.pageSize ?? body.PageSize ?? body.pageSize ?? params.pageSize ?? 10,
    totalPages: meta.TotalPages ?? meta.totalPages ?? body.TotalPages ?? body.totalPages ?? 0,
  };
};

/**
 * Nộp / cập nhật hồ sơ Mentor (bước 2 sau khi đăng ký role Mentor).
 * Backend sẽ tạo hoặc cập nhật bản ghi Mentor cho account hiện tại.
 */
export const submitMentorProfile = async (payload: SubmitMentorProfileRequest): Promise<void> => {
  await apiClient.post(APIConfig.Mentor.SubmitMentorProfile, payload);
};

