import {
  FileText,
  BarChart3,
  Users
} from "lucide-react";

import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import UserManagement from "@/pages/admin/UserManagement";

export const managementRoutes = [
  {
    label: "Thêm câu hỏi",
    icon: FileText,
    path: "add-question",
    element: <AddSystemQuestion />,
  },
  {
    label: "Đơn ứng tuyển",
    icon: BarChart3,
    path: "applications",
    element: <ReviewMentorApplication />,
  },
  {
    label: "Quản lý người dùng",
    icon: Users,
    path: "users",
    element: <UserManagement />,
  }
];