import {
  FileText,
  BarChart3,
  Users,
  CreditCard,
  Briefcase,
  PlusCircle,
  Layers,
  Logs,
  FileQuestion,
} from "lucide-react";

import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import UserManagement from "@/pages/admin/UserManagement";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";
import JobPostingList from "@/pages/recruiter/JobPostingList";
import CreateJobApplication from "@/pages/recruiter/CreateJobApplication";
import Classification from "@/pages/management/classification/Classification";
import ViewQuestions from "@/pages/management/question/ViewQuestions";
import AdminAuditLog from "@/pages/admin/AdminAuditLog";

export const managementRoutes = [
  {
    label: "Đơn ứng tuyển",
    icon: FileText,
    path: "applications",
    element: <ReviewMentorApplication />,
    allowedRoles: ["Staff", "Admin"],
  },
  {
    label: "Quản lý hạng mục",
    icon: Layers,
    path: "classification",
    element: <Classification />,
    allowedRoles: ["Staff", "Admin"],
  },
  {
    label: "Quản lý người dùng",
    icon: Users,
    path: "users",
    element: <UserManagement />,
    allowedRoles: ["Admin"],
  },
  {
    label: "Quản lý câu hỏi",
    icon: FileQuestion,
    path: "view-questions",
    element: <ViewQuestions />,
    allowedRoles: ["Admin", "Staff"],
  },
  {
    label: "Quản lý gói đăng ký",
    icon: CreditCard,
    path: "subscriptions",
    element: <SubscriptionManagement />,
    allowedRoles: ["Admin"],
  },
    {
    label: "Truy vết hệ thống",
    icon: Logs,
    path: "admin/audit-logs",
    element: <AdminAuditLog />,
    allowedRoles: ["Admin"],
  },
];

export const recruiterManagementRoutes = [
  {
    label: "Đơn đăng tuyển",
    icon: Briefcase,
    path: "job-applications",
    element: <JobPostingList />,
  },
  {
    label: "Tạo đơn đăng tuyển",
    icon: PlusCircle,
    path: "create-job-posting",
    element: <CreateJobApplication />,
  },
];
