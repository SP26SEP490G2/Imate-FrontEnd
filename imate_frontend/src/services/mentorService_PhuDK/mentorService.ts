import type { BankInfo } from "@/types/common/data";
import type { MentorItem, CandidateRatingsResponseModel, ReportableRating, ReportableRatingResponse, MentorBookedSlotResponse, MentorBookingDetailResponse, MentorGuaranteeStatusResponse, MentorStatisticResponse, MentorPendingListResponse } from "@/types/response/PhuDK/mentor.response";
import apiClient from "@/services/apiClient";
import axios from "axios";
import type { User } from "@/types/common/auth";
import type { MentorIncomeResponse } from "@/types/response/PhuDK/mentor.response";
import type { MentorDashboardInformationCard, MentorPendingApplicationResponse, MentorPerformanceChartDataResponse } from "@/types/response/PhuDK/dashboard.response";

export const getPendingMentorList = async (PageNumber: number, PageSize: number, SearchTerm: string) => {
  const params = new URLSearchParams();
  if (PageNumber !== undefined) params.append("PageNumber", PageNumber.toString());
  if (PageSize !== undefined) params.append("PageSize", PageSize.toString());
  if (SearchTerm) params.append("SearchTerm", SearchTerm);

  try {
    const res = await apiClient.get(`/mentors/pending-verification?${params.toString()}`);

    return res.data as MentorPendingListResponse;
  } catch (error) {
    console.log("error fetch contributed question detail: ", error);
  }
};

export const getPendingMentorTotalCount = async (): Promise<number> => {
  try {
    const res = await apiClient.get(`/mentors/pending-verification`, {
      params: {
        PageNumber: 1,
        PageSize: 1,
      },
    });

    const paginationHeader = res.headers?.["x-pagination"];
    if (paginationHeader) {
      try {
        const parsed = JSON.parse(paginationHeader);
        if (typeof parsed.TotalCount === "number") {
          return parsed.TotalCount;
        }
        if (typeof parsed.totalCount === "number") {
          return parsed.totalCount;
        }
      } catch (error) {
        console.warn("Không thể parse header X-Pagination:", error);
      }
    }

    const data = res.data;
    if (typeof data?.totalItems === "number") return data.totalItems;
    if (typeof data?.TotalItems === "number") return data.TotalItems;
    if (typeof data?.totalCount === "number") return data.totalCount;
    if (typeof data?.TotalCount === "number") return data.TotalCount;
    if (Array.isArray(data?.items)) return data.items.length;
    return 0;
  } catch (error) {
    console.error("Error fetching pending mentor total count: ", error);
    return 0;
  }
};

export const getMentorList = async () => {
  try {
    const res = await apiClient.get(`/mentor`);

    // Check if response has the expected structure
    if (res.data && res.data.success && res.data.data) {
      const mentorsData = res.data.data as any[];

      // Transform backend response to match frontend MentorItem type
      // Handle both PascalCase (backend) and camelCase (if transformed)
      const mentors: MentorItem[] = mentorsData.map((m: any) => {
        // Get accountId - handle both cases
        const accountId = m.accountId || m.AccountId;
        const accountIdNum = typeof accountId === "string" ? parseInt(accountId, 10) : accountId || 0;

        return {
          accountId: accountIdNum,
          email: m.email || m.Email || "", // Backend doesn't return email, set default
          fullName: m.fullName || m.FullName || "",
          avatarUrl: m.avatarUrl || m.AvatarUrl || "",
          bio: m.bio || m.Bio || "",
          pricePerSession: m.pricePerSession || m.PricePerSession || 0,
          totalSessions: m.totalSessions || m.TotalSessions || 0,
          averageRating: m.averageRating || m.AverageRating || 0,
          companies: Array.isArray(m.companies) ? m.companies : Array.isArray(m.Companies) ? m.Companies : [],
          positions: Array.isArray(m.positions) ? m.positions : Array.isArray(m.Positions) ? m.Positions : [],
          skills: Array.isArray(m.skills) ? m.skills : Array.isArray(m.Skills) ? m.Skills : [],
          reviews: m.reviews || m.Reviews || [],
          // Additional fields from Mentor interface
          phone: m.phone || m.Phone || "",
          birthDate: m.birthDate || m.BirthDate || "",
          yoe: m.yoe || m.Yoe || 0,
          cvUrl: m.cvUrl || m.CvUrl || "",
          certificateUrl: m.certificateUrl || m.CertificateUrl || "",
          bankAccountHolderName: m.bankAccountHolderName || m.BankAccountHolderName || "",
          bankAccountNumber: m.bankAccountNumber || m.BankAccountNumber || "",
          bankCode: m.bankCode || m.BankCode || "",
          guaranteeFundAmount: m.guaranteeFundAmount || m.GuaranteeFundAmount || 0,
          totalRatingCount: m.totalRatingCount || m.TotalRatingCount || 0,
        };
      });

      return mentors;
    } else {
      console.warn("Unexpected API response structure:", res.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching mentor list: ", error);
    return [];
  }
};

export const getMentorDetail = async (mentorId: string) => {
  try {
    const res = await apiClient.get(`/mentor/${mentorId}`);

    return res.data as MentorItem;
  } catch (error) {
    console.log("error fetch contributed question detail: ", error);
  }
};

export const approveMentor = async (mentorId: string) => {
  try {
    const res = await apiClient.put(`/mentor-approve/${mentorId}`);
    return res;
  } catch (error: any) {
    throw error;
  }
};
export const rejectMentor = async (mentorId: string) => {
  try {
    const res = await apiClient.put(`/mentor-reject/${mentorId}`);

    return res;
  } catch (error: any) {
    throw error;
  }
};

export const getBankList = async (): Promise<BankInfo[]> => {
  try {
    const res = await apiClient.get("https://api.vietqr.io/v2/banks");
    if (res.data?.data) {
      return res.data.data;
    } else {
      throw new Error("Invalid response format from VietQR API");
    }
  } catch (error) {
    console.log("Error fetch bank list: ", error);
    return [];
  }
};

export const getBankDetail = async (bankCode: string) => {
  try {
    const res = await axios.get("https://api.vietqr.io/v2/banks");

    const banks = res.data.data || res.data;

    const bank = banks.find((b: any) => b.code.toLowerCase() === bankCode.toLowerCase());

    if (!bank) throw new Error(`Bank with code: ${bankCode} not found`);

    return bank;
  } catch (error) {
    console.log("Error fetch bank detail: ", error);
    throw error;
  }
};

export const updateMentorProfile = async (data: User) => {
  try {
    const res = await apiClient.put("/mentor-profile", data);

    return res.data;
  } catch (error) {
    console.log("Error updating mentor profile: ", error);
    throw error;
  }
};
// get application list
export const getMentorApplicationList = async (params: { PageNumber?: number; PageSize?: number; CurrentPage?: number; SearchTerm?: string; Type?: string; Status?: string; SortBy?: string; SortOrder?: string }) => {
  const urlparams = new URLSearchParams();

  if (params.PageNumber) urlparams.append("PageNumber", params.PageNumber.toString());
  if (params.PageSize) urlparams.append("PageSize", params.PageSize.toString());
  if (params.CurrentPage) urlparams.append("CurrentPage", params.CurrentPage.toString());
  if (params.SearchTerm) urlparams.append("SearchTerm", params.SearchTerm);
  if (params.Type) urlparams.append("Type", params.Type);
  if (params.Status) urlparams.append("Status", params.Status);
  if (params.SortBy) urlparams.append("SortBy", params.SortBy);

  try {
    const res = await apiClient.get(`/mentor-applications?${urlparams.toString()}`);
    return res.data as any;
  } catch (error) {
    console.log("error fetch mentor application list: ", error);
    return null;
  }
};

export const getMentorCandidateRatings = async (): Promise<CandidateRatingsResponseModel> => {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: CandidateRatingsResponseModel;
      message: string;
    }>("/mentor/my-candidate-ratings");

    return res.data.data;
  } catch (error) {
    console.error("Error fetching mentor candidate ratings:", error);
    throw error;
  }
};

export const getReportableRatings = async (userId: number): Promise<ReportableRatingResponse> => {
  // Dùng userId động thay vì số 3 cứng
  const response = await apiClient.get<ReportableRatingResponse>(`/mentor/report-rating-list/${userId}`);
  return response.data;
};

// 1. API GỬI BÁO CÁO LỖI KĨ THUẬT (Technical Report - Type 2)
export const submitTechnicalApplication = async (userId: number, title: string, content: string, files: File[]) => {
  const formData = new FormData();
  formData.append("Title", title);
  formData.append("Content", content);

  // Thêm nhiều file với cùng một key "EvidenceFiles"
  files.forEach((file) => {
    formData.append("EvidenceFiles", file);
  });

  // Gọi API
  return apiClient.post(`/application/technical-application/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }, // Đảm bảo header đúng
  });
};

// 2. API GỬI BÁO CÁO RATING (Rating Report - Type 1)
// (API này tôi đang PHỎNG ĐOÁN, bạn cần thay thế bằng API thật)
export const submitRatingApplication = async (userId: number, bookingId: number, title: string, content: string, files: File[]) => {
  const formData = new FormData();
  formData.append("BookingId", bookingId.toString());
  formData.append("Title", title);
  formData.append("Content", content);
  files.forEach((file) => {
    formData.append("EvidenceFiles", file);
  });

  // !!! THAY THẾ URL NÀY BẰNG API ĐÚNG CỦA BẠN
  return apiClient.post(`/application/report-application/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getMentorInterviewHistory = async (): Promise<MentorBookedSlotResponse[]> => {
  try {
    const res = await apiClient.get<{
      data: MentorBookedSlotResponse[];
      success: boolean;
      message: string;
    }>("/bookings/mentor/history-session");
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching mentor interview sessions:", error);
    throw error;
  }
};

export const getMentorInterviewDetail = async (sessionId: number): Promise<MentorBookingDetailResponse> => {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: MentorBookingDetailResponse;
      message: string;
    }>(`/bookings/mentor/history-session/${sessionId}`);
    console.log("Mentor interview detail response:", res.data);
    console.log("AudioRecordKey:", res.data?.data?.audioRecordKey);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching mentor interview detail:", error);
    throw error;
  }
};

export const getMentorIncome = async (year?: number, month?: number): Promise<MentorIncomeResponse> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const res = await apiClient.get<{ success: boolean; data: MentorIncomeResponse }>(`/mentor/income?${params.toString()}`);
  return res.data.data;
};

export const getMentorGuaranteeStatus = async (): Promise<MentorGuaranteeStatusResponse> => {
  const res = await apiClient.get<{ success: boolean; data: MentorGuaranteeStatusResponse }>("/mentor/guarantee-status");
  return res.data.data;
};

export const getMentorDashboardInformationCard = async (): Promise<MentorDashboardInformationCard> => {
  try {
    const res = await apiClient.get<{ success: boolean; data: MentorDashboardInformationCard; message: string }>("/mentordashboard/infomation-cards");

    if (res.data && res.data.data) {
      return res.data.data;
    }

    throw new Error("Invalid response structure from mentor dashboard API");
  } catch (error) {
    console.error("Error fetching mentor dashboard information card: ", error);
    throw error;
  }
};

export const getMentorPerformanceChartData = async (): Promise<MentorPerformanceChartDataResponse[]> => {
  try {
    const res = await apiClient.get<{ success: boolean; data: MentorPerformanceChartDataResponse[]; message: string }>("/mentordashboard/performance?months=6");

    if (res.data && res.data.data) {
      return res.data.data;
    }
    throw new Error("Invalid response structure from mentor dashboard API");
  } catch (error) {
    console.error("Error fetching mentor performance chart data: ", error);
    throw error;
  }
};

export const getMentorPendingApplication = async (): Promise<MentorPendingApplicationResponse[]> => {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: MentorPendingApplicationResponse[];
      message: string;
    }>("/mentordashboard/pending-applications?size=6");

    if (res.data && res.data.data) {
      return res.data.data;
    }

    throw new Error("Invalid response structure from mentor dashboard API");
  } catch (error) {
    console.error("Error fetching mentor pending applications: ", error);
    throw error;
  }
};

export const getMentorStatistic = async (): Promise<MentorStatisticResponse> => {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: MentorStatisticResponse;
      message: string;
    }>(`/bookings/mentor/statistics`);

    if (res.data && res.data.data) {
      return res.data.data;
    }

    throw new Error("Invalid response structure from mentor statistic API");
  } catch (error) {
    console.error("Error fetching mentor statistic data: ", error);
    throw error;
  }
};
