import {
  FileText,
  BarChart3,
  Users,
  CreditCard
} from "lucide-react";

import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import UserManagement from "@/pages/admin/UserManagement";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";

export const managementRoutes = [
  {
    label: "Thêm câu hỏi",
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