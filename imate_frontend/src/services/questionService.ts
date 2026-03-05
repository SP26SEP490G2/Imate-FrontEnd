import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { 
  ListHotQuestionResponse, 
  GetListHotQuestionsResponse,
  QuestionBankListResponse,
  GetQuestionBankListResponse,
  GetQuestionBankListRequest,
  CategoryItem,
  GetListQuestionCategoriesResponse,
  StaffSystemQuestionItem,
  StaffContributedQuestionItem,
  StaffQuestionListResponse,
  GetSystemQuestionParams,
  GetContributedQuestionParams
} from "@/types/common/question";

/**
 * Get list of hot questions for home page
 * @returns Promise<ListHotQuestionResponse[]>
 */

export const getListHotQuestions = async (): Promise<ListHotQuestionResponse[]> => {
  const response = await apiClient.get<GetListHotQuestionsResponse>(APIConfig.Question.GetListHotQuestions);
  // API trả về { data: [...] }, extract array từ property data
  return response.data.data || [];
};

/**
 * Get question bank list with filters and pagination
 * @param request - Filter and pagination parameters
 * @returns Promise<QuestionBankListResponse>
 */
export const getQuestionBankList = async (request: GetQuestionBankListRequest): Promise<QuestionBankListResponse> => {
  const response = await apiClient.get<GetQuestionBankListResponse>(APIConfig.Question.GetQuestionBankList, {
    params: request
  });
  return response.data.data;
};

/**
 * Get list of question categories
 * @returns Promise<CategoryItem[]>
 */
export const getListQuestionCategories = async (): Promise<CategoryItem[]> => {
  const response = await apiClient.get<GetListQuestionCategoriesResponse>(APIConfig.Question.GetListQuestionCategories);
  return response.data.data || [];
};

/**
 * Get all system questions for staff with filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with question list and pagination info
 */
export const getAllSystemQuestionsForStaff = async (
  params: GetSystemQuestionParams
): Promise<StaffQuestionListResponse<StaffSystemQuestionItem>> => {
  const response = await apiClient.get<{ data: StaffSystemQuestionItem[] }>(
    APIConfig.Question.GetAllSystemQuestionsForStaff,
    { params }
  );
  
  // Extract pagination from headers
  const paginationHeader = response.headers['x-pagination'];
  const pagination = paginationHeader ? JSON.parse(paginationHeader) : {
    totalCount: 0,
    pageSize: params.pageSize || 10,
    pageNumber: params.pageNumber || 1,
    totalPages: 0
  };
  
  return {
    data: response.data.data || [],
    totalCount: pagination.totalCount || pagination.TotalCount,
    pageNumber: pagination.pageNumber || pagination.PageNumber,
    pageSize: pagination.pageSize || pagination.PageSize,
    totalPages: pagination.totalPages || pagination.TotalPages
  };
};

/**
 * Get all contributed questions for staff with filters and pagination
 * @param params - Filter and pagination parameters
 * @returns Promise with question list and pagination info
 */
export const getAllContributedQuestionsForStaff = async (
  params: GetContributedQuestionParams
): Promise<StaffQuestionListResponse<StaffContributedQuestionItem>> => {
  const response = await apiClient.get<{ data: StaffContributedQuestionItem[] }>(
    APIConfig.Question.GetAllContributedQuestionsForStaff,
    { params }
  );
  
  // Extract pagination from headers
  const paginationHeader = response.headers['x-pagination'];
  const pagination = paginationHeader ? JSON.parse(paginationHeader) : {
    totalCount: 0,
    pageSize: params.pageSize || 10,
    pageNumber: params.pageNumber || 1,
    totalPages: 0
  };
  
  return {
    data: response.data.data || [],
    totalCount: pagination.totalCount || pagination.TotalCount,
    pageNumber: pagination.pageNumber || pagination.PageNumber,
    pageSize: pagination.pageSize || pagination.PageSize,
    totalPages: pagination.totalPages || pagination.TotalPages
  };
};
