import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";
import type { CvAnalysisResult } from "@/types/common/cvAnalysis";

/**
 * Phân tích CV bằng AI (gọi qua backend)
 * Backend sẽ gọi Gemini API, frontend không cần API key
 */
export const analyseCv = async (cvText: string): Promise<CvAnalysisResult> => {
  const response = await apiClient.post(APIConfig.AI.AnalyseCv, {
    cvText: cvText,
  });

  // Backend trả về { success, data, message }
  const data = response.data?.data ?? response.data;
  return data as CvAnalysisResult;
};

