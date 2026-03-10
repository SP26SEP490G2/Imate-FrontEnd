import {
  FileText,
  BarChart3,
  Users,
  CreditCard,
  Briefcase,
  PlusCircle,
  Layers,
} from "lucide-react";

import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import UserManagement from "@/pages/admin/UserManagement";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";
import JobPostingList from "@/pages/recruiter/JobPostingList";
import CreateJobApplication from "@/pages/recruiter/CreateJobApplication";
import Classification from "@/pages/management/Classification";

export const managementRoutes = [
  {label: "Thêm câu hỏi",
    icon: FileText,
    path: "add-question",
    element: <AddSystemQuestion />,
    allowedRoles: ["Staff", "Admin"],
  },
  {
    label: "Đơn ứng tuyển",
    icon: BarChart3,
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
    label: "Quản lý gói đăng ký",
    icon: CreditCard,
    path: "subscriptions",
    element: <SubscriptionManagement />,
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
