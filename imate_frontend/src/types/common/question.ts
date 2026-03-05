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

// Types for Difficulty and Level
export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type Level = "Intern" | "Fresher" | "Junior" | "Middle" | "Senior";

// Staff Question Management Types
export interface StaffSystemQuestionItem {
  id: number;
  content: string;
  positionName?: string;
  skillName?: string;
  categoryName?: string;
  difficulty: DifficultyLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffContributedQuestionItem {
  id: number;
  content: string;
  positionName?: string;
  skillName?: string;
  categoryName?: string;
  companyName?: string;
  level: Level;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffQuestionListResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Request Parameters
export interface GetSystemQuestionParams {
  skillId?: number;
  positionId?: number;
  categoryId?: number;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

export interface GetContributedQuestionParams {
  skillId?: number;
  positionId?: number;
  categoryId?: number;
  companyId?: number;
  level?: Level;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
}

// Position and Skill Types
export interface PositionItem {
  id: number;
  name: string;
}

export interface SkillItem {
  id: number;
  name: string;
}

export interface CompanyItem {
  id: number;
  name: string;
}
