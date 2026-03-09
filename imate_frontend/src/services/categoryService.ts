import apiClient from "./apiClient";

import type { CategorySubmit, CategoryUpdate } from "@/types/request/category.request";
import type { ListCategoryResponse } from "@/types/response/category.response";
import type { AffectedQuestion } from "@/types/response/affected-question.response";
export const getListDetailCategory = async (PageNumber: number, PageSize: number, SearchTerm: string, IsActive: boolean | null, SortBy?: string, SortOrder?: string) => {
  try {
    const params = new URLSearchParams({
      PageNumber: PageNumber.toString(),
      PageSize: PageSize.toString(),
      SearchTerm: SearchTerm,
      ...(IsActive !== null && { IsActive: IsActive.toString() }),
      ...(SortBy && { SortBy }),
      ...(SortOrder && { SortOrder }),
    });

    const res = await apiClient.get(`${"/get-categories"}?${params.toString()}`);
    return res.data as ListCategoryResponse;
  } catch (error) {
    console.log("error fetch categories: ", error);
    throw error;
  }
};

export const AddCategory = async (category: CategorySubmit) => {
  console.log("category", category);
  try {
    const res = await apiClient.post(`/categories`, category);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const UpdateCategory = async (category: CategoryUpdate, id: number) => {
  try {
    const res = await apiClient.put(`/categories/${id}`, category);
    return res;
  } catch (error: any) {
    console.log("error update category api: ", error.message);
    throw error;
  }
};

export const getAffectedQuestions = async (categoryId: number, willBeActive: boolean) => {
  try {
    const res = await apiClient.get(`/categories/${categoryId}/affected-questions?willBeActive=${willBeActive}`);
    return res.data as AffectedQuestion[];
  } catch (error) {
    console.log("error fetch affected questions: ", error);
    return [];
  }
};
