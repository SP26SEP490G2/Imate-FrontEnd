import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { CvItem, UploadCvResponse } from "@/types/common/cv";

/**
 * Upload CV file (FormData)
 * Backend sẽ gọi AI Engine để quét và validate CV.
 */
export const uploadCV = async (file: File): Promise<UploadCvResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadCvResponse>(
    APIConfig.CV.Upload,
    formData
  );

  return response.data;
};

/**
 * Lấy danh sách CV của user hiện tại
 */
export const getListCV = async (): Promise<CvItem[]> => {
  const response = await apiClient.get<CvItem[]>(APIConfig.CV.GetList);

  // Normalize: backend có thể trả về response.data hoặc response.data.data
  const data = (response.data as any)?.data ?? response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Xóa CV theo ID
 */
export const deleteCV = async (cvId: string): Promise<void> => {
  const url = APIConfig.CV.Delete.replace("{cvId}", cvId);
  await apiClient.delete(url);
};
