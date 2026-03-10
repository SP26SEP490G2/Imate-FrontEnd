import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { PositionItem, SkillItem, CompanyItem } from "@/types/common/question";
import type { CommonParams, PaginatedApiResponse } from "@/types/common/pagination";

/**
 * Get all positions with optional filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with position list and pagination info
 */
export const getAllPositions = async (
    params?: CommonParams
): Promise<PaginatedApiResponse<PositionItem>> => {
    const response = await apiClient.get<any>(
        APIConfig.Position.GetAllPositions,
        { params }
    );

    // Extract pagination from headers
    const paginationHeader = response.headers['x-pagination'];
    const pagination = paginationHeader ? JSON.parse(paginationHeader) : {
        totalCount: 0,
        pageSize: params?.pageSize || 10,
        pageNumber: params?.pageNumber || 1,
        totalPages: 0
    };

    const responseData = response.data;
    const items = responseData.data || responseData.items || (Array.isArray(responseData) ? responseData : []);

    return {
        data: items,
        totalCount: pagination.totalCount || pagination.TotalCount || items.length,
        pageNumber: pagination.pageNumber || pagination.PageNumber,
        pageSize: pagination.pageSize || pagination.PageSize,
        totalPages: pagination.totalPages || pagination.TotalPages
    };
};

/**
 * Get all skills with optional filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with skill list and pagination info
 */
export const getAllSkills = async (
    params?: CommonParams
): Promise<PaginatedApiResponse<SkillItem>> => {
    const response = await apiClient.get<any>(
        APIConfig.Skills.GetAllSkills,
        { params }
    );

    // Extract pagination from headers
    const paginationHeader = response.headers['x-pagination'];
    const pagination = paginationHeader ? JSON.parse(paginationHeader) : {
        totalCount: 0,
        pageSize: params?.pageSize || 10,
        pageNumber: params?.pageNumber || 1,
        totalPages: 0
    };

    const responseData = response.data;
    const items = responseData.data || responseData.items || (Array.isArray(responseData) ? responseData : []);

    return {
        data: items,
        totalCount: pagination.totalCount || pagination.TotalCount || items.length,
        pageNumber: pagination.pageNumber || pagination.PageNumber,
        pageSize: pagination.pageSize || pagination.PageSize,
        totalPages: pagination.totalPages || pagination.TotalPages
    };
};

/**
 * Get all companies with optional filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with company list and pagination info
 */
export const getAllCompanies = async (
    params?: CommonParams
): Promise<PaginatedApiResponse<CompanyItem>> => {
    const response = await apiClient.get<any>(
        APIConfig.Companies.GetAllCompanies,
        { params }
    );

    // Extract pagination from headers
    const paginationHeader = response.headers['x-pagination'];
    const pagination = paginationHeader ? JSON.parse(paginationHeader) : {
        totalCount: 0,
        pageSize: params?.pageSize || 10,
        pageNumber: params?.pageNumber || 1,
        totalPages: 0
    };

    const responseData = response.data;
    const items = responseData.data || responseData.items || (Array.isArray(responseData) ? responseData : []);

    return {
        data: items,
        totalCount: pagination.totalCount || pagination.TotalCount || items.length,
        pageNumber: pagination.pageNumber || pagination.PageNumber,
        pageSize: pagination.pageSize || pagination.PageSize,
        totalPages: pagination.totalPages || pagination.TotalPages
    };
};
