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

export interface SystemQuestionBankItem {
  skillId: number;
  positionId: number;
  categoryId: number;
  difficulty: DifficultyLevel;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface ContributeQuestionBankItem {
  skillId: number;
  positionId: number;
  categoryId: number;
  companyId: number;
  level: Level;
  difficulty: DifficultyLevel;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface QuestionBankListResponse {
  questions: QuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface SystemQuestionBankListResponse {
  questions: SystemQuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ContributeQuestionBankListResponse {
  questions: ContributeQuestionBankItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface GetSystemQuestionBankListResponse {
  data: SystemQuestionBankListResponse;
}

export interface GetContributeQuestionBankListResponse {
  data: ContributeQuestionBankListResponse;
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

export type Level = 0 | 1 | 2 | 3 | 4 | 5; // 0 = Intern, 1 = Junior, 2 = Middle, 3 = Senior, 4 = Lead, 5 = Manager

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
  difficulty: DifficultyLevel | null;
  isFromSystem: boolean;
  isActive: boolean;
  creatorId: number;
  creatorName: string;
  sampleAnswer?: string;
  contributedDetailId?: number;
  contributedDetail?: any;
  categoriesName: string[];
  skillsName: string[];
  positionsName: string[];
  createdAt?: string;
  updatedAt?: string;
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
  difficulty?: DifficultyLevel;
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

// Contribute Question Request (Candidate)
export interface ContributeQuestionRequest {
  content: string;
  companyId: number;
  positionIds: number[];
  level: Level;
  difficulty: DifficultyLevel;
  skillIds: number[];
  interviewDate: string; // DateOnly serialized as string "YYYY-MM-DD"
  categoryIds: number[];
  userAnswer: string;
}

// Detailed Question for Edit
export interface SystemQuestionDetail {
  id: number;
  content: string;
  difficulty: DifficultyLevel;
  sampleAnswer: string;
  isActive: boolean;
  isFromSystem: boolean;
  creatorId: number;
  creatorName: string;
  categories?: CategoryItem[];
  skills?: SkillItem[];
  positions?: PositionItem[];
  categoriesName: string[];
  skillsName: string[];
  positionsName: string[];
  createdAt?: string;
  updatedAt?: string;
}
