import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { PositionItem, SkillItem, CompanyItem } from "@/types/common/question";
import type { CommonParams, PaginatedApiResponse } from "@/types/common/pagination";

/** Backend trả về PagedList<T> với Items (camelCase: items) */
type PagedBody<T> = {
  items?: T[];
  Items?: T[];
  totalCount?: number;
  TotalCount?: number;
  pageNumber?: number;
  PageNumber?: number;
  pageSize?: number;
  PageSize?: number;
  totalPages?: number;
  TotalPages?: number;
};

/** Backend Company trả về PaginatedCompanyResponseModel với Items */
type PaginatedCompanyBody<T> = PagedBody<T>;

function toItemList<T extends { id?: number; Id?: number; name?: string; Name?: string }>(
  raw: T[]
): { id: number; name: string }[] {
  return (raw || []).map((x) => ({
    id: x.id ?? x.Id ?? 0,
    name: (x.name ?? x.Name ?? "") as string,
  }));
}

/**
 * Lấy danh sách Position từ API (bảng Positions) - dùng cho filter trang view mentor
 */
export const getAllPositions = async (
  params?: CommonParams
): Promise<PaginatedApiResponse<PositionItem>> => {
  const response = await apiClient.get<PagedBody<{ id?: number; Id?: number; name?: string; Name?: string }>>(
    APIConfig.Position.GetAllPositions,
    { params }
  );
  const body = response.data ?? {};
  const rawList = Array.isArray(body)
    ? body
    : body.items ?? body.Items ?? body.data ?? body.Data ?? [];
  const list = Array.isArray(rawList) ? rawList : [];
  const paginationHeader = response.headers["x-pagination"];
  let fromHeader: Record<string, number> | null = null;
  try {
    fromHeader = paginationHeader ? JSON.parse(paginationHeader) : null;
  } catch {
    fromHeader = null;
  }

  return {
    data: toItemList(list) as PositionItem[],
    totalCount: fromHeader?.TotalCount ?? fromHeader?.totalCount ?? body.TotalCount ?? body.totalCount ?? 0,
    pageNumber: fromHeader?.PageNumber ?? fromHeader?.pageNumber ?? body.PageNumber ?? body.pageNumber ?? params?.pageNumber ?? 1,
    pageSize: fromHeader?.PageSize ?? fromHeader?.pageSize ?? body.PageSize ?? body.pageSize ?? params?.pageSize ?? 10,
    totalPages: fromHeader?.TotalPages ?? fromHeader?.totalPages ?? body.TotalPages ?? body.totalPages ?? 0,
  };
};

/**
 * Lấy danh sách Skill từ API (bảng Skills) - dùng cho filter trang view mentor
 */
export const getAllSkills = async (
  params?: CommonParams
): Promise<PaginatedApiResponse<SkillItem>> => {
  const response = await apiClient.get<PagedBody<{ id?: number; Id?: number; name?: string; Name?: string }>>(
    APIConfig.Skills.GetAllSkills,
    { params }
  );
  const body = response.data ?? {};
  const rawList = Array.isArray(body)
    ? body
    : body.items ?? body.Items ?? body.data ?? body.Data ?? [];
  const list = Array.isArray(rawList) ? rawList : [];
  let fromHeader: Record<string, number> | null = null;
  try {
    const paginationHeader = response.headers["x-pagination"];
    fromHeader = paginationHeader ? JSON.parse(paginationHeader) : null;
  } catch {
    fromHeader = null;
  }

  return {
    data: toItemList(list) as SkillItem[],
    totalCount: fromHeader?.TotalCount ?? fromHeader?.totalCount ?? body.TotalCount ?? body.totalCount ?? 0,
    pageNumber: fromHeader?.PageNumber ?? fromHeader?.pageNumber ?? body.PageNumber ?? body.pageNumber ?? params?.pageNumber ?? 1,
    pageSize: fromHeader?.PageSize ?? fromHeader?.pageSize ?? body.PageSize ?? body.pageSize ?? params?.pageSize ?? 10,
    totalPages: fromHeader?.TotalPages ?? fromHeader?.totalPages ?? body.TotalPages ?? body.totalPages ?? 0,
  };
};

/**
 * Lấy danh sách Company từ API (bảng Companies) - dùng cho filter trang view mentor
 */
export const getAllCompanies = async (
  params?: CommonParams
): Promise<PaginatedApiResponse<CompanyItem>> => {
  const response = await apiClient.get<PaginatedCompanyBody<{ id?: number; Id?: number; name?: string; Name?: string }>>(
    APIConfig.Companies.GetAllCompanies,
    { params: { ...params, pageSize: params?.pageSize ?? 100, pageNumber: params?.pageNumber ?? 1 } }
  );
  const body = response.data ?? {};
  const list = body.items ?? body.Items ?? body.data ?? body.Data ?? [];

  return {
    data: toItemList(Array.isArray(list) ? list : []) as CompanyItem[],
    totalCount: body.TotalCount ?? body.totalCount ?? 0,
    pageNumber: body.PageNumber ?? body.pageNumber ?? params?.pageNumber ?? 1,
    pageSize: body.PageSize ?? body.pageSize ?? params?.pageSize ?? 10,
    totalPages: body.TotalPages ?? body.totalPages ?? 0,
  };
};
