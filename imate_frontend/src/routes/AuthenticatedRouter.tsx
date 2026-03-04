import ProtectedRoute from "./ProtectedRoute";
import type { RouteObject } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import ViewProfile from "@/pages/candidate/ViewProfile"; // Bạn có thể chuyển file này ra thư mục chung
import ViewSaveQuestion from "@/pages/candidate/ViewSaveQuestion";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import WalletSummary from "@/pages/mentor/WalletSummary";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";
import CvManagementPage from "@/pages/candidate/CvManagementPage";

const AuthenticatedRouter: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/profile", element: <ViewProfile /> },
      { path: "/save-question", element: <ViewSaveQuestion /> },
      { path: "/transactions", element: <TransactionHistoryPage /> },
      { path: "/wallet", element: <WalletSummary /> },
      { path: "/payment-success", element: <PaymentSuccessPage /> },
      { path: "/payment-cancel", element: <PaymentCancelPage /> },
      { path: "/cv-management", element: <CvManagementPage /> },
    ],
  },
];

export default AuthenticatedRouter;
