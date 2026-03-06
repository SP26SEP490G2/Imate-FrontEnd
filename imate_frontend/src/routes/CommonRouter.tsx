import StaffQuestionManagement from "@/pages/staff/StaffQuestionManagement";
import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import HomePage from "../pages/guest/HomePage";
import SystemQuestionBank from "../pages/guest/SystemQuestionBank";

import type { RouteObject } from "react-router-dom";

const CommonRouter: RouteObject[] = [
  { path: "/Trang-chu", element: <HomePage /> },
  { path: "/Ngan-hang-cau-hoi-he-thong", element: <SystemQuestionBank /> },
  { path: "/Staff/Quan-ly-cau-hoi", element: <StaffQuestionManagement /> },
  { path: "/Staff/Them-cau-hoi", element: <AddSystemQuestion /> },
];

export default CommonRouter;
