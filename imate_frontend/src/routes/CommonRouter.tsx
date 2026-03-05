import HomePage from "../pages/guest/HomePage";
import SystemQuestionBank from "../pages/guest/SystemQuestionBank";

import type { RouteObject } from "react-router-dom";

const CommonRouter: RouteObject[] = [
  { path: "/Trang-chu", element: <HomePage /> },
  { path: "/Ngan-hang-cau-hoi-he-thong", element: <SystemQuestionBank /> },
];

export default CommonRouter;
