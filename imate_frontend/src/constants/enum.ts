// Enum for System Question Difficulty Levels
export const DifficultyLevel = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard'
} as const;

// Array for dropdown options
export const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.Easy, label: 'Easy' },
  { value: DifficultyLevel.Medium, label: 'Medium' },
  { value: DifficultyLevel.Hard, label: 'Hard' }
];


export const ApplicationStatus = {
  Pending: "Pending",
  InReview: "InReview",
  Approved: "Approved",
  Rejected: "Rejected",
} as const;

export type ApplicationStatusType = keyof typeof ApplicationStatus;

export const APPLICATION_STATUS_OPTIONS = [
  { value: ApplicationStatus.Pending, label: "Chờ xử lý" },
  { value: ApplicationStatus.InReview, label: "Đang xử lý" },
  { value: ApplicationStatus.Approved, label: "Đã duyệt" },
  { value: ApplicationStatus.Rejected, label: "Bị từ chối" },
] as const;

export const ApplicationType = {
  TechnicalError: "TechnicalError",
  ReportMentor: "ReportMentor",
  ReportRating: "ReportRating",
  ReportComment: "ReportComment",
  ReportContent: "ReportContent",
} as const;

export type ApplicationTypeEnum = keyof typeof ApplicationType;

export const APPLICATION_TYPE_LABELS: Record<ApplicationTypeEnum, string> = {
  [ApplicationType.TechnicalError]: "Đơn Lỗi Kỹ Thuật",
  [ApplicationType.ReportMentor]: "Đơn Tố Cáo Mentor",
  [ApplicationType.ReportRating]: "Đơn Tố Cáo Rating",
  [ApplicationType.ReportComment]: "Đơn Tố Cáo Comment",
  [ApplicationType.ReportContent]: "Đơn Tố Cáo Nội Dung",
} as const;

export const APPLICATION_TYPE_OPTIONS = [
  { value: ApplicationType.TechnicalError, label: "Đơn Lỗi Kỹ Thuật" },
  { value: ApplicationType.ReportMentor, label: "Đơn Tố Cáo Mentor" },
  { value: ApplicationType.ReportRating, label: "Đơn Tố Cáo Rating" },
  { value: ApplicationType.ReportContent, label: "Đơn Tố Cáo Nội Dung" },
  { value: ApplicationType.ReportComment, label: "Đơn Tố Cáo Comment" },
] as const;

export const getApplicationTypeLabel = (type: string): string => {
  return APPLICATION_TYPE_LABELS[type as ApplicationTypeEnum] || "Không xác định";
};

export const TransactionStatus = {
  Pending: "Pending",
  Completed: "Completed",
  Failed: "Failed",
  Cancelled: "Cancelled",
  Escrow: "Escrow",
} as const;

export type TransactionStatusType = keyof typeof TransactionStatus;

export const TRANSACTION_STATUS_OPTIONS = [
  { value: TransactionStatus.Pending, label: "Chờ xử lý" },
  { value: TransactionStatus.Completed, label: "Hoàn thành" },
  { value: TransactionStatus.Failed, label: "Thất bại" },
  { value: TransactionStatus.Cancelled, label: "Đã hủy" },
  { value: TransactionStatus.Escrow, label: "Đang giữ hộ" },
] as const;

export const TransactionType = {
  Deposit: "Deposit",
  Withdrawal: "Withdrawal",
  Subscription: "Subscription",
  Refund: "Refund",
  Penalty: "Penalty",
  BookingFee: "BookingFee",
  BookingPayout: "BookingPayout",
  InterviewFee: "InterviewFee",
} as const;

export type TransactionTypeEnum = keyof typeof TransactionType;

export const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionType.Deposit, label: "Nạp tiền" },
  { value: TransactionType.Withdrawal, label: "Rút tiền" },
  { value: TransactionType.Subscription, label: "Gói dịch vụ" },
  { value: TransactionType.Refund, label: "Hoàn tiền" },
  { value: TransactionType.Penalty, label: "Phí phạt" },
  { value: TransactionType.BookingFee, label: "Phí đặt lịch" },
  { value: TransactionType.BookingPayout, label: "Phí Mentor" },
  { value: TransactionType.InterviewFee, label: "Phí phỏng vấn" },
];