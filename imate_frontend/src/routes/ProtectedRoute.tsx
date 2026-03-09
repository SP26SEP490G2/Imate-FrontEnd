import { useAuth } from "@/store/AuthContext";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ImateLoading from "@/components/custom/imateLoading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "Staff" | "Mentor" | "Candidate" | "Recruiter";
}

const SKIP_AUTH_FOR_TEST = true;
const MANAGEMENT_ROUTES = ["/management-dashboard"];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <ImateLoading type="screen" />;
  }
  if (!SKIP_AUTH_FOR_TEST && !isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Helper function để check role pending và redirect
  const redirectPending = () => {
    // Nếu trạng thái là PendingVerification, auto redirect về trang tương ứng
    if (user?.accountStatus === "PendingVerification") {
      if (user?.role === "Mentor") {
        return <Navigate to="/pending-application" replace />;
      }
      if (user?.role === "Recruiter") {
        return <Navigate to="/recruiter-pending-application" replace />;
      }
    }
    return null;
  };

  if (!SKIP_AUTH_FOR_TEST && requiredRole) {
    // Admin có thể truy cập route của Staff
    if (requiredRole === "Staff" && user?.role === "Admin") {
      // Cho phép admin truy cập staff routes
    }
    // Nếu role không khớp và không phải admin truy cập staff route
    else if (user?.role !== requiredRole) {
      // Xử lý đặc biệt cho mentor/recruiter pending truy cập candidate routes
      if (requiredRole === "Candidate" && (user?.role === "Mentor" || user?.role === "Recruiter")) {
        const redirect = redirectPending();
        if (redirect) return redirect;
      }
      // Tất cả các trường hợp khác: chặn truy cập
      return <Navigate to="/unauthorized" replace />;
    }
  }

  const isManagementRoute = MANAGEMENT_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  if (!SKIP_AUTH_FOR_TEST && isManagementRoute) {
    if (user?.role !== "Admin" && user?.role !== "Staff") {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (!SKIP_AUTH_FOR_TEST && !requiredRole && user?.role) {
    const candidateOnlyRoutes = ["/save-question", "/cv-management", "/practice-with-AI", "/setup-ai-interview", "/interview-schedule", "/mentor-practice-history", "/view-application"];

    const mentorOnlyRoutes = ["/mentor/interview-schedule", "/mentor/income", "/mentor/interview-history", "/mentor/candidate-ratings", "/mentor/recurring-slots", "/mentor/view-application", "/mentor/my-contributed-questions"];

    const recruiterOnlyRoutes = ["/recruiter/dashboard", "/recruiter/manage-jobs", "/recruiter/candidate-pool"];

    const staffOnlyRoutes = ["/staff/manage-question", "/staff/manage-category", "/staff/manage-application", "/staff/manage-report", "/staff/manage-community", "/staff/manage-transaction", "/staff/view-profile"];

    const adminOnlyRoutes = ["/admin/manage-user", "/admin/manage-subscription", "/admin/manage-question", "/admin/manage-category", "/admin/manage-application", "/admin/manage-community", "/admin/manage-report", "/admin/manage-transaction", "/admin/view-profile"];

    // Chặn mentor (kể cả pending) truy cập candidate routes
    if (user.role === "Mentor") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));

      if (isCandidateRoute) {
        const redirect = redirectPending();
        if (redirect) return redirect;
      }

      // Chặn mentor truy cập staff/admin routes
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isStaffRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn recruiter (kể cả pending) truy cập candidate routes
    if (user.role === "Recruiter") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));

      if (isCandidateRoute) {
        const redirect = redirectPending();
        if (redirect) return redirect;
      }

      // Chặn recruiter truy cập staff/admin/mentor routes
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isStaffRoute || isAdminRoute || isMentorRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn candidate truy cập mentor/staff/admin routes
    if (user.role === "Candidate") {
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isRecruiterRoute = recruiterOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isMentorRoute || isRecruiterRoute || isStaffRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn staff truy cập candidate/mentor/admin routes
    if (user.role === "Staff") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isCandidateRoute || isMentorRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn admin truy cập candidate/mentor routes (nhưng cho phép staff routes)
    if (user.role === "Admin") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isCandidateRoute || isMentorRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
      // Admin có thể truy cập staff routes (không chặn ở đây)
    }
  }

  // Kiểm tra AccountStatus cho Mentor/Recruiter
  if ((requiredRole === "Mentor" || requiredRole === "Recruiter") && user?.accountStatus === "PendingVerification") {
      const redirect = redirectPending();
      if (redirect && location.pathname !== "/pending-application" && location.pathname !== "/recruiter-pending-application") {
          return redirect;
      }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
