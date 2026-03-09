import {
  FileText,
  BarChart3,
  Briefcase,
  PlusCircle,
  Layers,
} from "lucide-react";

import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import JobPostingList from "@/pages/recruiter/JobPostingList";
import CreateJobApplication from "@/pages/recruiter/CreateJobApplication";

import Classification from "@/pages/management/Classification";

export const managementRoutes = [
  {label: "Thêm câu hỏi",
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
    label: "Quản lý hạng mục",
    icon: Layers,
    path: "classification",
    element: <Classification />,
  }

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