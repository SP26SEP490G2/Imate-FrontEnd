import { useAuth } from "@/store/AuthContext";
import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PeppoLoading from "@/components/custom/imateLoading";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "Staff" | "Mentor" | "Candidate";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <PeppoLoading type="screen" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Helper function để check mentor pending và redirect
  const redirectMentorPending = () => {
    if (user?.role === "Mentor" && user?.accountStatus === "PendingVerification") {
      const hasMentorProfile = !!(user.bio || user.phone || user.yoe !== undefined || user.pricePerSession !== undefined || user.bankAccountNumber || user.bankCode);

      if (hasMentorProfile) {
        return <Navigate to="/pending-application" replace />;
      } else {
        return <Navigate to="/submit-mentor-application" replace />;
      }
    }
    return null;
  };

  // Kiểm tra role matching với requiredRole
  if (requiredRole) {
    // Admin có thể truy cập route của Staff
    if (requiredRole === "Staff" && user?.role === "Admin") {
      // Cho phép admin truy cập staff routes
    }
    // Nếu role không khớp và không phải admin truy cập staff route
    else if (user?.role !== requiredRole) {
      // Xử lý đặc biệt cho mentor pending truy cập candidate routes
      if (requiredRole === "Candidate" && user?.role === "Mentor") {
        const redirect = redirectMentorPending();
        if (redirect) return redirect;
      }
      // Tất cả các trường hợp khác: chặn truy cập
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Chặn các role truy cập route không phải của mình trong AuthenticatedRouter
  // (khi không có requiredRole, nhưng pathname là route của role khác)
  if (!requiredRole && user?.role) {
    const candidateOnlyRoutes = ["/save-question", "/cv-management", "/practice-with-AI", "/setup-ai-interview", "/interview-schedule", "/mentor-practice-history", "/view-application"];

    const mentorOnlyRoutes = ["/mentor/interview-schedule", "/mentor/income", "/mentor/interview-history", "/mentor/candidate-ratings", "/mentor/recurring-slots", "/mentor/view-application", "/mentor/my-contributed-questions"];

    const staffOnlyRoutes = ["/staff/manage-question", "/staff/manage-category", "/staff/manage-application", "/staff/manage-report", "/staff/manage-community", "/staff/manage-transaction", "/staff/view-profile"];

    const adminOnlyRoutes = ["/admin/manage-user", "/admin/manage-subscription", "/admin/manage-question", "/admin/manage-category", "/admin/manage-application", "/admin/manage-community", "/admin/manage-report", "/admin/manage-transaction", "/admin/view-profile"];

    // Chặn mentor (kể cả pending) truy cập candidate routes
    if (user.role === "Mentor") {
      const isCandidateRoute = candidateOnlyRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"));

      if (isCandidateRoute) {
        const redirect = redirectMentorPending();
        if (redirect) return redirect;
      }

      // Chặn mentor truy cập staff/admin routes
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isStaffRoute || isAdminRoute) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Chặn candidate truy cập mentor/staff/admin routes
    if (user.role === "Candidate") {
      const isMentorRoute = mentorOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isStaffRoute = staffOnlyRoutes.some((route) => location.pathname.startsWith(route));
      const isAdminRoute = adminOnlyRoutes.some((route) => location.pathname.startsWith(route));

      if (isMentorRoute || isStaffRoute || isAdminRoute) {
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

  // Kiểm tra AccountStatus cho Mentor:
  // - Nếu Active → cho phép truy cập
  // - Nếu PendingVerification + đã có mentor profile (có bio, phone, yoe, cvUrl, etc.) → redirect đến pending-application
  // - Nếu PendingVerification + chưa có mentor profile → redirect đến submit-mentor-application
  // - Ngoại lệ: Cho phép mentor pending truy cập trang "Câu hỏi đã đăng"
  if (requiredRole === "Mentor" && user?.accountStatus === "PendingVerification") {
    // Cho phép mentor pending truy cập trang câu hỏi đã đăng
    if (location.pathname === "/mentor/my-contributed-questions" || location.pathname === "/mentor/interview-schedule" || location.pathname === "/mentor/income" || location.pathname === "/mentor/interview-history" || location.pathname === "/mentor/contributed-question-bank") {
      if (!toast.isActive("pending-warning")) {
        toast.warning("Vui lòng chờ được duyệt để sử dụng chức năng này.", {
          toastId: "pending-warning",
        });
      }
      navigate("/pending-application");
    }

    // Kiểm tra xem đã có mentor profile chưa bằng cách check nhiều field đặc trưng của mentor
    // Nếu có bất kỳ field nào sau đây → đã submit form
    const hasMentorProfile = !!(user.bio || user.phone || user.yoe !== undefined || user.pricePerSession !== undefined || user.bankAccountNumber || user.bankCode);

    if (hasMentorProfile) {
      // Đã submit form, đang chờ duyệt
      return <Navigate to="/pending-application" replace />;
    } else {
      // Chưa submit form
      return <Navigate to="/submit-mentor-application" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
