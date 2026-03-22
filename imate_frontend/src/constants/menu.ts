import { FolderOpen, LibraryBig, CircleUser, CreditCard, FileUser, Sparkles, LogOut, Wallet, Package, FileQuestion, History, Calendar, Briefcase } from "lucide-react";
import type { MenuItem } from "@/types/common/menu";

export const MENTOR_MENU_ITEMS: MenuItem[] = [
  { label: "Lịch làm việc", href: "/interview-schedule" },
  { label: "Thu nhập", href: "/mentor/income" },
  { label: "Lịch sử phỏng vấn", href: "/mentor/interview-history" },
  { label: "Câu hỏi từ cộng đồng", href: "/contributed-question-bank" },
  { label: "Gửi đơn", href: "/view-application" }
];

export const CANDIDATE_MENU_ITEMS: MenuItem[] = [
  {
    label: "Ngân hàng câu hỏi",
    href: "/system-question-bank",
    hasDropdown: true,
    subItems: [
      { label: "Câu hỏi của Imate", href: "/system-question-bank", icon: FolderOpen },
      { label: "Câu hỏi từ cộng đồng", href: "/contributed-question-bank", icon: LibraryBig },
    ],
  },
  { label: "Luyện tập với AI", href: "/practice-with-AI" },
  { label: "Mentor", href: "/view-mentor" },
  { label: "Gói dịch vụ", href: "/view-subscription" },
  { label: "Gửi đơn", href: "/view-application" },
  { label: "Cơ hội việc làm", href: "/view-job-applications" }
];

export const USER_PROFILE_MENU: MenuItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/profile",
    icon: CircleUser,
  },
  {
    label: "Quản lý giao dịch",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    label: "Lịch phỏng vấn",
    href: "/interview-schedule",
    icon: Calendar,
  },
  {
    label: "Lịch sử Mentor",
    href: "/test-history?tab=mentor",
    icon: History,
  },
  {
    label: "Ví Imate",
    href: "/wallet",
    icon: Wallet,
  },
  {
    label: "Quản lý CV",
    href: "/cv-management",
    icon: FileUser,
  },
  {
    label: "Gửi đơn",
    href: "/view-application",
    icon: FolderOpen,
  },
  {
    label: "Nâng cấp gói dịch vụ",
    href: "/view-subscription",
    icon: Sparkles,
  },
  {
    label: "Quản lý gói đăng ký",
    href: "/manage-subscription",
    icon: Package,
  },
  {
    label: "Danh sách ứng tuyển",
    href: "/view-applied-job",
    icon: Briefcase,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
  },
];

export const MENTOR_PROFILE_MENU: MenuItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/profile",
    icon: CircleUser,
  },
  {
    label: "Quản lý giao dịch",
    href: "/transactions",
    icon: History,
  },
  {
    label: "Lịch phỏng vấn",
    href: "/interview-schedule",
    icon: Calendar,
  },
  {
    label: "Câu hỏi đã đăng",
    href: "/mentor/my-contributed-questions",
    icon: FileQuestion,
  },
  {
    label: "Gửi đơn",
    href: "/mentor/view-application",
    icon: FolderOpen,
  },
  {
    label: "Nạp tiền",
    href: "/wallet",
    icon: CreditCard,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
  },
];


export const RECRUITER_PROFILE_MENU: MenuItem[] = [
  {
    label: "Hồ sơ cá nhân",
    href: "/profile",
    icon: CircleUser,
  },
  {
    label: "Nạp tiền",
    href: "/wallet",
    icon: CreditCard,
  },
  {
    label: "Đăng xuất",
    icon: LogOut,
  },
];
