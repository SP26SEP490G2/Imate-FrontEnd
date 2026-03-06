/**
 * Request types cho các API liên quan Recruiter.
 */

/** Payload nộp / cập nhật hồ sơ Recruiter (bước 2 sau khi đăng ký role Recruiter). */
export interface SubmitRecruiterProfileRequest {
  companyName: string;
  companyAddress: string;
  companyWebsite?: string;
  phone: string;
}
