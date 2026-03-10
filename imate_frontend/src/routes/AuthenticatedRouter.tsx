import ProtectedRoute from "./ProtectedRoute";
import type { RouteObject } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import ViewProfile from "@/pages/candidate/ViewProfile";
import SubmitMentorApplication from "@/pages/mentor/SubmitMentorApplication";
import PendingApplication from "@/pages/mentor/PendingApplication";
import SubmitRecruiterApplication from "@/pages/recruiter/SubmitRecruiterApplication";
import RecruiterPendingApplication from "@/pages/recruiter/PendingApplication";

const AuthenticatedRouter: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "profile", element: <ViewProfile /> },

      // { path: "/save-question", element: <ViewSaveQuestion /> },
      // { path: "/transactions", element: <TransactionHistoryPage /> },
      // { path: "/wallet", element: <WalletSummary /> },
      // { path: "/payment-success", element: <PaymentSuccessPage /> },
      // { path: "/payment-cancel", element: <PaymentCancelPage /> },
      // { path: "/cv-management", element: <CvManagementPage /> },

      { path: "submit-mentor-application", element: <SubmitMentorApplication /> },
      { path: "pending-application", element: <PendingApplication /> },

      { path: "submit-recruiter-application", element: <SubmitRecruiterApplication /> },
      { path: "recruiter-pending-application", element: <RecruiterPendingApplication /> },
    ],
  },
];

export default AuthenticatedRouter;
