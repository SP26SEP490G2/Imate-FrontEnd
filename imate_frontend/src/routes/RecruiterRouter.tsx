import { Navigate } from "react-router-dom";

import { recruiterManagementRoutes } from "@/config/managementRoutes";
import ManagementLayout from "@/layout/ManagementLayout";

import type { RouteObject } from "react-router-dom";

const RecruiterRouter: RouteObject[] = [
    {
        path: "/recruiter-dashboard",
        element: <ManagementLayout />,
        children: [
            {
                index: true,
                element: <Navigate to={recruiterManagementRoutes[0].path} replace />,
            },

            ...recruiterManagementRoutes.map((route) => ({
                path: route.path,
                element: route.element,
            })),
        ],
    },

];

export default RecruiterRouter;
