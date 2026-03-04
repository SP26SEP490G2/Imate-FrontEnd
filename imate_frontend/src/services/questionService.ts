import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { 
  ListHotQuestionResponse, 
  GetListHotQuestionsResponse,
  QuestionBankListResponse,
  GetQuestionBankListResponse,
  GetQuestionBankListRequest,
  CategoryItem,
  GetListQuestionCategoriesResponse
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
