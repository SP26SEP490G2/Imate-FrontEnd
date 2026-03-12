import type { CvAnalysisResult } from "@/types/common/cvAnalysis";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  import.meta.env.VITE_GEMINI_API_URL ||
  "https://api.key4u.shop/v1beta/models/gemini-2.5-pro:generateContent";

/**
 * System prompt hướng dẫn Gemini phân tích CV
 */
const SYSTEM_PROMPT = `Bạn là một chuyên gia tuyển dụng IT cấp cao với hơn 15 năm kinh nghiệm.
Nhiệm vụ: Phân tích CV ứng viên IT và đưa ra đánh giá chi tiết.

Yêu cầu:
1. Đánh giá tổng thể CV trên thang 100 điểm
2. Xác định vị trí công việc phù hợp nhất
3. Đánh giá mức độ phù hợp với thị trường ("Cao", "Trung bình", hoặc "Thấp")
4. Liệt kê 3 điểm mạnh nổi bật (với mô tả ngắn gọn)
5. Liệt kê 3 điểm cần cải thiện (với mô tả ngắn gọn)
6. Gợi ý 4 câu hỏi phỏng vấn dựa trên CV, mỗi câu thuộc một danh mục khác nhau

PHẢI trả về ĐÚNG JSON format sau (không markdown, không code block, không giải thích thêm, CHỈ JSON thuần):
{
  "score": <number 0-100>,
  "candidateName": "<tên ứng viên>",
  "jobTitle": "<vị trí phù hợp>",
  "marketFit": "<Cao|Trung bình|Thấp>",
  "strengths": [
    { "title": "<tiêu đề>", "description": "<mô tả>" }
  ],
  "improvements": [
    { "title": "<tiêu đề>", "description": "<mô tả>" }
  ],
  "interviewQuestions": [
    { "category": "<danh mục viết hoa>", "question": "<câu hỏi>" }
  ]
}`;

/**
 * Gọi Gemini API (key4u.shop proxy) để phân tích CV
 */
export const analyseCv = async (cvText: string): Promise<CvAnalysisResult> => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Thiếu VITE_GEMINI_API_KEY. Vui lòng thêm vào file .env"
    );
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Hãy phân tích CV sau đây và trả về kết quả dưới dạng JSON:\n\n${cvText}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 1,
        topP: 1,
        thinkingConfig: {
          includeThoughts: true,
          thinkingBudget: 26240,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || `Gemini API error: ${response.status}`
    );
  }

  const data = await response.json();

  // Gemini 2.5 Pro with thinking trả về nhiều parts:
  // parts[0] = thinking (thought=true), parts[1+] = actual response
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Không nhận được phản hồi từ Gemini AI");
  }

  // Tìm part chứa response text (không phải thought)
  const responsePart = parts.find((p: any) => !p.thought) || parts[parts.length - 1];
  const text: string = responsePart?.text;

  if (!text) {
    throw new Error("Không nhận được phản hồi từ Gemini AI");
  }

  // Loại bỏ markdown code block nếu có (```json ... ```)
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Parse JSON từ response
  const result: CvAnalysisResult = JSON.parse(cleaned);
  return result;
};
