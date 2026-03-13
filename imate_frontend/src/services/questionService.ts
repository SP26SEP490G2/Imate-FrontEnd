import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type {
  ListHotQuestionResponse,
  GetListHotQuestionsResponse,
  QuestionBankListResponse,
  GetQuestionBankListResponse,
  GetQuestionBankListRequest,
  GetPublicContributedQuestionBankListRequest,
  GetPublicContributedQuestionBankListResponse,
  PublicContributedQuestionBankListResponse,
  CategoryItem,
  GetListQuestionCategoriesResponse,
  StaffSystemQuestionItem,
  StaffContributedQuestionItem,
  StaffQuestionListResponse,
  GetSystemQuestionParams,
  GetContributedQuestionParams,
  CreateSystemQuestionRequest,
  UpdateSystemQuestionRequest,
  CreateQuestionResponse,
  UpdateQuestionResponse,
  SystemQuestionDetail,
  ContributedQuestionDetail,
  ContributeQuestionRequest,
  SavedSystemQuestionItem,
  SavedContributedQuestionItem,
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
 * Get public contributed question bank list with filters and pagination
 * @param request - Filter and pagination parameters
 * @returns Promise<PublicContributedQuestionBankListResponse>
 */
export const getPublicContributedQuestionBankList = async (
  request: GetPublicContributedQuestionBankListRequest
): Promise<PublicContributedQuestionBankListResponse> => {
  const response = await apiClient.get<GetPublicContributedQuestionBankListResponse>(
    APIConfig.Question.GetPublicContributedQuestionBankList,
    {
      params: request,
    }
  );
  return response.data.data;
};

export const getSavedSystemQuestions = async (): Promise<SavedSystemQuestionItem[]> => {
  const response = await apiClient.get<SavedSystemQuestionItem[]>(APIConfig.Question.GetSavedSystemQuestions);
  return response.data || [];
};

export const getSavedContributedQuestions = async (): Promise<SavedContributedQuestionItem[]> => {
  const response = await apiClient.get<SavedContributedQuestionItem[]>(APIConfig.Question.GetSavedContributedQuestions);
  return response.data || [];
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
  const response = await apiClient.get<{ items: StaffSystemQuestionItem[] }>(
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
    items: response.data.items || [],
   totalCount: Number(pagination.totalCount || pagination.TotalCount || 0),
  pageNumber: Number(pagination.pageNumber || pagination.PageNumber || 1),
  pageSize: Number(pagination.pageSize || pagination.PageSize || 10),
  totalPages: Number(pagination.totalPages || pagination.TotalPages || 0),
    hasNextPage: pagination.hasNextPage || pagination.HasNextPage || false,
    hasPreviousPage: pagination.hasPreviousPage || pagination.HasPreviousPage || false
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
  const response = await apiClient.get<{ items: StaffContributedQuestionItem[] }>(
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
    items: response.data.items || [],
   totalCount: Number(pagination.totalCount || pagination.TotalCount || 0),
  pageNumber: Number(pagination.pageNumber || pagination.PageNumber || 1),
  pageSize: Number(pagination.pageSize || pagination.PageSize || 10),
  totalPages: Number(pagination.totalPages || pagination.TotalPages || 0),
    hasNextPage: pagination.hasNextPage || pagination.HasNextPage || false,
    hasPreviousPage: pagination.hasPreviousPage || pagination.HasPreviousPage || false
  };
  };

/**
 * Create a new system question for staff
 * @param request - Question data
 * @returns Promise with created question info
 */
export const createSystemQuestionForStaff = async (
  request: CreateSystemQuestionRequest
): Promise<CreateQuestionResponse> => {
  const response = await apiClient.post<CreateQuestionResponse>(
    APIConfig.Question.CreateSystemQuestionForStaff,
    request
  );
  return response.data;
};

/**
 * Update an existing system question for staff
 * @param questionId - ID of the question to update
 * @param request - Updated question data
 * @returns Promise with updated question info
 */
export const updateSystemQuestionForStaff = async (
  questionId: number,
  request: UpdateSystemQuestionRequest
): Promise<UpdateQuestionResponse> => {
  const response = await apiClient.put<UpdateQuestionResponse>(
    APIConfig.Question.UpdateSystemQuestionForStaff.replace('{questionId}', String(questionId)),
    request
  );
  return response.data;
};

/**
 * Get detailed information for a specific system question (for editing)
 * @param questionId - ID of the question
 * @returns Promise with question details
 */
export const getSystemQuestionDetail = async (
  questionId: number
): Promise<SystemQuestionDetail> => {
  const response = await apiClient.get<SystemQuestionDetail>(
    APIConfig.Question.GetSystemQuestionDetail.replace('{questionId}', String(questionId))
  );
  return response.data;
};

/**
 * Get detailed information for a specific contributed question (for viewing)
 * @param questionId - ID of the question
 * @returns Promise with contributed question details
 */
export const getContributedQuestionDetail = async (
  questionId: number
): Promise<ContributedQuestionDetail> => {
  const response = await apiClient.get<ContributedQuestionDetail>(
    APIConfig.Question.GetContributedQuestionDetail.replace('{questionId}', String(questionId))
  );
  return response.data;
};

/**
 * Toggle save/unsave a question (works for both system and contributed)
 * @param questionId - ID of the question to save/unsave
 */
export const saveQuestion = async (questionId: number): Promise<void> => {
  await apiClient.post(APIConfig.Question.SaveQuestion, { questionId });
};

/**
 * Contribute a question (for Candidate)
 * @param request - Contribute question request data
 * @returns Promise with create response
 */
export const contributeQuestion = async (
  request: ContributeQuestionRequest
): Promise<CreateQuestionResponse> => {
  const response = await apiClient.post<CreateQuestionResponse>(
    APIConfig.Question.ContributeQuestion,
    request
  );
  return response.data;
};
