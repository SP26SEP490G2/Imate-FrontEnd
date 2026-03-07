import {
  FileText,
  BarChart3,
} from "lucide-react";

import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";

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
  }
];