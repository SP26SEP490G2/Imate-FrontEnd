import { Navigate } from "react-router-dom";

import StaffQuestionManagement from "@/pages/staff/StaffQuestionManagement";
import AddSystemQuestion from "@/pages/staff/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";
import MentorDetailForStaff from "@/pages/staff/MentorDetailForStaff";
import HomePage from "../pages/guest/HomePage";
import SystemQuestionBank from "../pages/guest/SystemQuestionBank";
import { managementRoutes } from "@/config/managementRoutes";
import ManagementLayout from "@/layout/ManagementLayout";
import ViewSubscriptionPage from "../pages/guest/ViewSubscriptionPage";

import type { RouteObject } from "react-router-dom";

const CommonRouter: RouteObject[] = [
  { path: "/Trang-chu", element: <HomePage /> },
  { path: "/Ngan-hang-cau-hoi-he-thong", element: <SystemQuestionBank /> },
  { path: "/Staff/Quan-ly-cau-hoi", element: <StaffQuestionManagement /> },
  { path: "/Staff/Them-cau-hoi", element: <AddSystemQuestion /> },
  { path: "/staff/manage-application", element: <ReviewMentorApplication /> },
  {
  path: "/management-dashboard",
  element: <ManagementLayout />,
  children: [
    {
      index: true,
      element: <Navigate to={managementRoutes[0].path} replace />,
    },

    ...managementRoutes.map((route) => ({
      path: route.path,
      element: route.element,
    })),
  ],
},
  { path: "/view-subscription", element: <ViewSubscriptionPage /> },
  { path: "/bang-gia", element: <ViewSubscriptionPage /> },
  { path: "/pricing", element: <ViewSubscriptionPage /> },
];

export default CommonRouter;
