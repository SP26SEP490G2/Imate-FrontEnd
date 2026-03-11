import React from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

// Layouts
import MainLayout from "@/layout/MainLayout";
import ManagementLayout from "@/layout/ManagementLayout";

// Guards
import { AuthGuard } from "@/helpers/auth.guard";
import { RoleGuard } from "@/helpers/role.guard";

// Pages - Auth
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Pages - Guest
import HomePage from "@/pages/main/public/HomePage";
import ViewSubscriptionPage from "@/pages/main/public/ViewSubscriptionPage";

// Pages - Candidate
import ViewProfile from "@/pages/candidate/ViewProfile";

// Pages - Mentor
import SubmitMentorApplication from "@/pages/mentor/SubmitMentorApplication";
import PendingApplication from "@/pages/mentor/PendingApplication";

// Pages - Recruiter
import SubmitRecruiterApplication from "@/pages/recruiter/SubmitRecruiterApplication";
import RecruiterPendingApplication from "@/pages/recruiter/PendingApplication";

// Pages - Staff
import AddSystemQuestion from "@/pages/management/question/AddSystemQuestion";
import ReviewMentorApplication from "@/pages/staff/ReviewMentorApplication";

// Config
import { ROLES } from "@/constants/role";
import { LAYOUT } from "@/constants/common";
import ViewQuestions from "@/pages/management/question/ViewQuestions";
import ViewQuestionBank from "@/pages/main/public/ViewQuestionBank";
import JobPostingList from "@/pages/recruiter/JobPostingList";
import CreateJobApplication from "@/pages/recruiter/CreateJobApplication";
import AdminAuditLog from "@/pages/admin/AdminAuditLog";
import Classification from "@/pages/management/classification/Classification";
import UserManagement from "@/pages/admin/UserManagement";
import SubscriptionManagement from "@/pages/admin/SubscriptionManagement";

/**
 * Route Configuration Type
 */
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  layout?: "main" | "management" | "none";
  requireAuth?: boolean;
  roles?: string[];
}

/**
 * ============================================
 * CENTRALIZED ROUTES - MỖI DÒNG MỘT ROUTE
 * ============================================
 * Format: { path, element, layout, requireAuth, roles }
 * - path: Đường dẫn
 * - element: Component
 * - layout: "main" | "management" | "none"
 * - requireAuth: true/false (yêu cầu đăng nhập)
 * - roles: ["Admin", "Staff"] (roles được phép)
 */
const routeConfigs: RouteConfig[] = [
  // ===== AUTH ROUTES =====
  { path: "/sign-in",          element: <SignIn />,           layout: LAYOUT.NONE },
  { path: "/sign-up",          element: <SignUp />,           layout: LAYOUT.NONE },
  { path: "/verify-email",     element: <VerifyEmail />,      layout: LAYOUT.NONE },
  { path: "/forgot-password",  element: <ForgotPassword />,   layout: LAYOUT.NONE },
  { path: "/reset-password",   element: <ResetPassword />,    layout: LAYOUT.NONE },

  // ===== MAIN LAYOUT ROUTES =====
  { path: "/home",                  element: <HomePage />,               layout: LAYOUT.MAIN },
  { path: "/view-question-bank",  element: <ViewQuestionBank />,     layout: LAYOUT.MAIN },
  { path: "/view-subscription",     element: <ViewSubscriptionPage />,   layout: LAYOUT.MAIN },
  { path: "/pricing",               element: <ViewSubscriptionPage />,   layout: LAYOUT.MAIN },

  // ===== MAIN LAYOUT ROUTES =====
  { path: "/profile",                        element: <ViewProfile />,                layout: LAYOUT.MAIN, requireAuth: true },
  { path: "/submit-mentor-application",      element: <SubmitMentorApplication />,    layout: LAYOUT.MAIN, requireAuth: true },
  { path: "/pending-application",            element: <PendingApplication />,         layout: LAYOUT.MAIN, requireAuth: true },
  { path: "/submit-recruiter-application",   element: <SubmitRecruiterApplication />, layout: LAYOUT.MAIN, requireAuth: true },
  { path: "/recruiter-pending-application",  element: <RecruiterPendingApplication />,layout: LAYOUT.MAIN, requireAuth: true },

  // ===== MANAGEMENT LAYOUT ROUTES =====
  { path: "/management/view-questions",      element: <ViewQuestions />,   layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { path: "/management/add-question",        element: <AddSystemQuestion />,         layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { path: "/management/manage-application",  element: <ReviewMentorApplication />,   layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { path: "/management/recruiter-dashboard/job-applications",  element: <JobPostingList />,   layout: LAYOUT.MANAGEMENT, roles: [ROLES.RECRUITER] },
  { path: "/management/recruiter-dashboard/create-job-posting",  element: <CreateJobApplication />,   layout: LAYOUT.MANAGEMENT, roles: [ROLES.RECRUITER] },
  { path: "/management/admin/audit-logs",  element: <AdminAuditLog />,   layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN] },

  { path: "/management/applications",  element: <ReviewMentorApplication />,   layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN, ROLES.STAFF] },
  { path: "/management/classification",        element: <Classification />,         layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN, ROLES.STAFF] },

  { path: "/management/users", element: <UserManagement />, layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN] },
  { path: "/management/subscriptions", element: <SubscriptionManagement />, layout: LAYOUT.MANAGEMENT, roles: [ROLES.ADMIN] },
];

/**
 * Helper: Wrap element với guards (Auth/Role)
 */
const wrapWithGuards = (element: React.ReactNode, requireAuth?: boolean, roles?: string[]): React.ReactNode => {
  let wrapped = element;

  if (roles && roles.length > 0) {
    wrapped = <RoleGuard requiredRoles={roles}>{wrapped}</RoleGuard>;
  } else if (requireAuth) {
    wrapped = <AuthGuard>{wrapped}</AuthGuard>;
  }

  return wrapped;
};

/**
 * Helper: Convert RouteConfig thành RouteObject với layout
 */
const buildRoutes = (configs: RouteConfig[]): RouteObject[] => {
  // Group by layout
  const noLayoutRoutes = configs.filter(c => c.layout === LAYOUT.NONE);
  const mainRoutes = configs.filter(c => c.layout === LAYOUT.MAIN);
  const managementRoutes = configs.filter(c => c.layout === LAYOUT.MANAGEMENT);

  const result: RouteObject[] = [];

  // No layout routes
  noLayoutRoutes.forEach(config => {
    result.push({
      path: config.path,
      element: wrapWithGuards(config.element, config.requireAuth, config.roles),
    });
  });

  // Main layout routes
  if (mainRoutes.length > 0) {
    result.push({
      path: "/",
      element: <MainLayout />,
      children: mainRoutes.map(config => ({
        path: config.path.startsWith("/") ? config.path.substring(1) : config.path,
        element: wrapWithGuards(config.element, config.requireAuth, config.roles),
      })),
    });
  }

  // Management layout routes
  if (managementRoutes.length > 0) {
    result.push({
      path: "/management",
      element: <RoleGuard requiredRoles={["Admin", "Staff","Recruiter"]}><ManagementLayout /></RoleGuard>,
      children: managementRoutes.map(config => ({
        path: config.path.replace("/management/", ""),
        element: wrapWithGuards(config.element, config.requireAuth, config.roles),
      })),
    });
  }

  return result;
};

/**
 * Management Dashboard Routes (Admin & Staff)
 * Sử dụng routes từ config file
 */


/**
 * ============================================
 * FINAL ROUTE EXPORT
 * ============================================
 */
export const appRoutes: RouteObject[] = [
  // Build routes từ config (auto group theo layout)
  ...buildRoutes(routeConfigs),
];

export default appRoutes;
