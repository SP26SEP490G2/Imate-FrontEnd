/** Thông tin một CV đã upload */
export interface CvItem {
  cvId: string;
  fileName: string;
  uploadDate: string; // ISO string
  fileUrl?: string;
  status: "Valid" | "Invalid" | "Processing";
}

/** Response khi upload CV thành công */
export interface UploadCvResponse {
  cvId: string;
  fileName: string;
  uploadDate: string;
  status: string;
}
