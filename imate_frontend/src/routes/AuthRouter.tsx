import SignUp from "../pages/auth/SignUp";

import type { RouteObject } from "react-router-dom";

const AuthRouter: RouteObject[] = [
  { path: "/sign-up", element: <SignUp /> },
];

export default AuthRouter;
