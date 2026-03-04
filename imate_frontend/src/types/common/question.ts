/**
 * Question related types and interfaces
 */

export interface ListHotQuestionResponse {
  id: number;
  content: string;
  categories: string[];
  commentCount: number;
}

// API Response wrapper
export interface GetListHotQuestionsResponse {
  data: ListHotQuestionResponse[];
}

// Question Bank Types
export interface QuestionBankItem {
  id: number;
  title: string;
  content: string;
  categories: string[];
  skills: string[];
  difficulty: string | null;
  commentCount: number;
  createdBy: string;
  createdAt: string;
}

export interface QuestionBankListResponse {
  questions: QuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GetQuestionBankListResponse {
  data: QuestionBankListResponse;
}

// Request Types
export interface GetQuestionBankListRequest {
  searchTerm?: string;
  categoryId?: number;
  difficulty?: string;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Category Types
export interface CategoryItem {
  id: number;
  name: string;
}

export interface GetListQuestionCategoriesResponse {
  data: CategoryItem[];
}
