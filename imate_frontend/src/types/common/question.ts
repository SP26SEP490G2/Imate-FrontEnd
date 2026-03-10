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
export type DifficultyLevel = 0 | 1 | 2; // 0 = Easy, 1 = Medium, 2 = Hard

export type Level = "Intern" | "Fresher" | "Junior" | "Middle" | "Senior";

// Staff Question Management Types
export interface StaffSystemQuestionItem {
  id: number;
  content: string;
  positionsName?: string;
  skillsName?: string;
  categoriesName?: string;
  difficulty: DifficultyLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffContributedQuestionItem {
  id: number;
  content: string;
  positionsName?: string;
  skillsName?: string;
  categoriesName?: string;
  companyName?: string;
  level: Level;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffQuestionListResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

export interface CategoryItem {
  id: number;
  name: string;
}


export interface CompanyItem {
  id: number;
  name: string;
}

// Create and Update System Question Types
export interface CreateSystemQuestionRequest {
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  categoryIds: number[];
  skillIds: number[];
  positionIds: number[];
  creatorId: number;
}

export interface UpdateSystemQuestionRequest {
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  isActive: boolean;
  categoryIds: number[];
  skillIds: number[];
  positionIds: number[];
}

export interface CreateQuestionResponse {
  message: string;
  questionId: number;
}

export interface UpdateQuestionResponse {
  message: string;
  questionId: number;
}

// Detailed Question for Edit
export interface SystemQuestionDetail {
  id: number;
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  isActive: boolean;
  categories: CategoryItem[];
  skills: SkillItem[];
  positions: PositionItem[];
  createdAt: string;
  updatedAt: string;
}
