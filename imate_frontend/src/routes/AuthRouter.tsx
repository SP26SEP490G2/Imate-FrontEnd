import VerifyEmail from "@/pages/auth/VerifyEmail";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import type { RouteObject } from "react-router-dom";

const AuthRouter: RouteObject[] = [
  { path: "/sign-in", element: <SignIn /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/verify-email", element: <VerifyEmail /> },

];

export default AuthRouter;
